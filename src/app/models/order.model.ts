import { DiagnosticItem, DiagnosticSeverity, VehicleDiagnostic } from './diagnostic.model';

export { DiagnosticItem, DiagnosticSeverity, VehicleDiagnostic };

export interface Product {
  descripcion: string;
  precio: number;
  cantidad: number;
  isXmlProduct?: boolean;
  costo?: number;
  costoConIva?: number;
  precioVentaPublico?: number;
  margen?: number;
  porcentaje?: number;
  porcentajeMargen?: number;
  tipoMargen?: number;
  sku?: string;
  skuOriginal?: string;
  skuFinal?: string;
  proveedor?: string;
  division?: string;
  linea?: string;
  clase?: string;
  subclase?: string;
  isValidated?: boolean;
  isProcessed?: boolean;
}

export interface Service {
  sku: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
}

export interface DiagnosticItemAuthorization {
  id?: string;
  order_id?: string;
  diagnostic_item_id: string;
  item_name: string;
  category: string;
  description: string;
  severity: DiagnosticSeverity;
  estimated_cost: number;
  is_authorized: boolean;
  authorization_date?: Date;
  rejection_reason?: string;
  notes?: string;
}

export interface Proveedor {
  id?: string;
  nombre: string;
  rfc: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface XmlProduct {
  id?: string;
  invoice_id?: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  total: number;
  claveProdServ?: string;
  claveUnidad?: string;
  unidad?: string;
  sku?: string;
  division?: string;
  linea?: string;
  clase?: string;
  subclase?: string;
  margen?: number;
  precioVenta?: number;
  isValidated: boolean;
  isNew: boolean;
  isProcessed?: boolean;
  proveedor: string;
}

export interface OrderInvoice {
  id?: string;
  order_id?: string;
  invoice_folio: string;
  xml_content?: string;
  xml_data?: any;
  total_amount: number;
  items: any[];
  upload_date?: Date;
  proveedor: string;
  rfc_proveedor?: string;
  xml_products?: XmlProduct[];
  validados?: number;
  nuevos?: number;
}

export interface ProductosPorProveedor {
  proveedor: string;
  rfc?: string;
  productos: XmlProduct[];
  totalValidados: number;
  totalNuevos: number;
  montoTotal: number;
}

export interface Order {
  id?: string;
  folio: string;
  cliente: string;
  customer_id?: string;
  vehicle_id?: string;
  vehiculo?: {
    placas?: string;
    marca?: string;
    modelo?: string;
    anio?: string;
    color?: string;
    numero_serie?: string;
  };
  tienda: string;
  division: string;
  productos: Product[];
  servicios?: Service[];
  presupuesto: number;
  fecha: Date;
  status: string;
  estado?: string;
  diagnostic?: VehicleDiagnostic;
  promotion?: string;
  purchaseOrderFolio?: string;
  processedProducts?: any[];
  xmlProducts?: XmlProduct[];
  productosPorProveedor?: ProductosPorProveedor[];
  authorization_status?: 'pending' | 'sent' | 'completed' | 'partial';
  authorization_sent_at?: Date;
  authorization_completed_at?: Date;
  total_authorized_amount?: number;
  total_rejected_amount?: number;
  diagnostic_authorizations?: DiagnosticItemAuthorization[];
  invoices?: OrderInvoice[];
  technician_name?: string;
  technician_number?: string;
  purchase_order_number?: string;
  created_at?: Date;
  updated_at?: Date;
  isProcessingXml?: boolean;
  isValidatingProducts?: boolean;
  isProcessingProducts?: boolean;
  isGeneratingPurchaseOrder?: boolean;
  admin_validation_status?: 'pending' | 'approved' | 'rejected';
  admin_validation_notes?: string;
  admin_validated_by?: string;
  admin_validated_at?: Date;
  pre_oc_validation_status?: 'pending' | 'approved' | 'rejected';
  pre_oc_validated_by?: string;
  pre_oc_validated_at?: Date;
  pre_oc_validation_notes?: string;
}
