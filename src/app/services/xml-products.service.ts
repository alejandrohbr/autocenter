import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Order, OrderInvoice, XmlProduct, ProductosPorProveedor } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class XmlProductsService {
  constructor(private supabase: SupabaseService) {}

  async saveInvoices(orderId: string, invoices: OrderInvoice[]): Promise<void> {
    try {
      for (const invoice of invoices) {
        const { data: invoiceData, error: invoiceError } = await this.supabase.client
          .from('order_invoices')
          .insert({
            order_id: orderId,
            invoice_folio: invoice.invoice_folio,
            xml_content: invoice.xml_content,
            total_amount: invoice.total_amount,
            proveedor_nombre: invoice.proveedor,
            rfc_proveedor: invoice.rfc_proveedor,
            validados: invoice.validados || 0,
            nuevos: invoice.nuevos || 0
          })
          .select()
          .maybeSingle();

        if (invoiceError) {
          console.error('Error insertando factura:', invoiceError);
          throw new Error(`Error al guardar factura ${invoice.invoice_folio}: ${invoiceError.message}`);
        }

        if (!invoiceData) {
          throw new Error(`No se pudo crear la factura ${invoice.invoice_folio}`);
        }

        if (invoice.xml_products && invoice.xml_products.length > 0) {
          const productsToInsert = invoice.xml_products.map(product => ({
            invoice_id: invoiceData.id,
            order_id: orderId,
            descripcion: product.descripcion || 'Sin descripción',
            cantidad: product.cantidad || 0,
            precio: product.precio || 0,
            total: product.total || 0,
            clave_prod_serv: product.claveProdServ || null,
            clave_unidad: product.claveUnidad || null,
            unidad: product.unidad || 'PZ',
            is_validated: false,
            is_new: true,
            proveedor: product.proveedor || invoice.proveedor
          }));

          const { error: productsError } = await this.supabase.client
            .from('xml_products')
            .insert(productsToInsert);

          if (productsError) {
            console.error('Error insertando productos:', productsError);
            throw new Error(`Error al guardar productos: ${productsError.message}`);
          }
        }
      }
    } catch (error: any) {
      console.error('Error en saveInvoices:', error);
      throw error;
    }
  }

  async getOrderInvoices(orderId: string): Promise<OrderInvoice[]> {
    const { data, error } = await this.supabase.client
      .from('order_invoices')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data || [];
  }

  async getInvoiceProducts(invoiceId: string): Promise<XmlProduct[]> {
    const { data, error } = await this.supabase.client
      .from('xml_products')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (error) throw error;
    return data || [];
  }

  async getOrderXmlProducts(orderId: string): Promise<XmlProduct[]> {
    const { data, error } = await this.supabase.client
      .from('xml_products')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw error;
    return data || [];
  }

  async classifyProduct(productId: string, classification: any): Promise<void> {
    const { error } = await this.supabase.client
      .from('xml_products')
      .update({
        division: classification.division,
        linea: classification.linea,
        clase: classification.clase,
        subclase: classification.subclase,
        margen: classification.margen,
        precio_venta: classification.precioVenta,
        is_validated: true,
        is_new: false
      })
      .eq('id', productId);

    if (error) throw error;
  }

  async validateExistingProduct(productId: string, sku: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('xml_products')
      .update({
        sku: sku,
        is_validated: true,
        is_new: false
      })
      .eq('id', productId);

    if (error) throw error;
  }

  async updateProductSku(productId: string, skuOriginal: string, skuFinal: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('xml_products')
      .update({
        sku_original: skuOriginal,
        sku_final: skuFinal,
        is_processed: true
      })
      .eq('id', productId);

    if (error) throw error;
  }

  async updateOrderStatus(orderId: string, status: string, additionalData?: any): Promise<void> {
    const updateData: any = { status };

    if (additionalData) {
      Object.assign(updateData, additionalData);
    }

    const { error } = await this.supabase.client
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;
  }

  async deleteInvoice(invoiceId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('order_invoices')
      .delete()
      .eq('id', invoiceId);

    if (error) throw error;
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('xml_products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  }

  groupProductsByProvider(products: XmlProduct[], invoices?: OrderInvoice[]): ProductosPorProveedor[] {
    const grouped = products.reduce((acc, product) => {
      if (!acc[product.proveedor]) {
        const invoice = invoices?.find(inv => inv.proveedor === product.proveedor);
        acc[product.proveedor] = {
          proveedor: product.proveedor,
          rfc: invoice?.rfc_proveedor,
          productos: [],
          totalValidados: 0,
          totalNuevos: 0,
          montoTotal: 0
        };
      }

      acc[product.proveedor].productos.push(product);
      acc[product.proveedor].montoTotal += product.total;

      if (product.isValidated) {
        acc[product.proveedor].totalValidados++;
      }
      if (product.isNew) {
        acc[product.proveedor].totalNuevos++;
      }

      return acc;
    }, {} as { [key: string]: ProductosPorProveedor });

    return Object.values(grouped);
  }

  async simulateValidateProducts(orderId: string): Promise<{ validados: number; nuevos: number }> {
    try {
      const products = await this.getOrderXmlProducts(orderId);

      if (products.length === 0) {
        return { validados: 0, nuevos: 0 };
      }

      const productosAValidar = products.length > 2 ? products.length - 2 : 0;
      const nuevos = products.length > 2 ? 2 : products.length;

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (product.id && i < productosAValidar) {
          await this.validateExistingProduct(product.id, `SKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
        }
      }

      return { validados: productosAValidar, nuevos };
    } catch (error: any) {
      console.error('Error en simulateValidateProducts:', error);
      throw error;
    }
  }

  generateSKU(clase: string, index: number): { original: string; final: string } {
    const year = new Date().getFullYear();
    const prefix = clase.substring(0, 3).toUpperCase();
    const sequential = String(index).padStart(3, '0');

    return {
      original: `${prefix}${sequential}`,
      final: `${prefix}-${sequential}-${year}`
    };
  }
}
