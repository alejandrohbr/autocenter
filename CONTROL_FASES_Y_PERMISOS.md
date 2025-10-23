# Sistema de Control de Fases y Permisos por Rol

## Descripción General

Se ha implementado un sistema completo de control de permisos basado en roles que regula qué usuarios pueden avanzar en cada fase del proceso de órdenes. Este sistema asegura que solo los usuarios autorizados puedan realizar acciones críticas en cada etapa del flujo de trabajo.

## Roles del Sistema

1. **super_admin** - Acceso completo a todas las fases
2. **admin_corporativo** - Gestión corporativa y aprobaciones
3. **gerente** - Gestión de tienda y aprobaciones
4. **asesor_tecnico** - Asesor técnico con acceso a fases operativas
5. **tecnico** (Vendedor) - Acceso limitado a fases iniciales y finales

## Flujo de Fases y Permisos

### FASE 1: Diagnóstico
**Estado:** `Nuevo`, `En Diagnóstico`
**Roles permitidos:** Todos los roles pueden crear y trabajar en diagnósticos
- super_admin
- admin_corporativo
- gerente
- asesor_tecnico
- tecnico

### FASE 2: Autorización Cliente
**Estado:** `Presupuesto Generado`, `Autorización Enviada`, `Autorizado`
**Roles permitidos:** Todos los roles pueden gestionar autorizaciones
- super_admin
- admin_corporativo
- gerente
- asesor_tecnico
- tecnico

### FASE 3: Cargar XML
**Estado:** `Autorizado` → `XML Cargado`
**Roles permitidos:** Solo roles técnicos y superiores
- super_admin
- admin_corporativo
- gerente
- asesor_tecnico

**Acción:** Cargar archivos XML de facturas de proveedores

### FASE 4: Clasificar Productos
**Estado:** `XML Cargado` → `Productos Clasificados`
**Roles permitidos:** Solo roles técnicos y superiores
- super_admin
- admin_corporativo
- gerente
- asesor_tecnico

**Acción:** Clasificar productos del XML en divisiones, líneas, clases y subclases

### FASE 5: Validar Productos
**Estado:** `Productos Clasificados` → `Productos Validados`
**Roles permitidos:** Solo gerencia y administración
- super_admin
- admin_corporativo
- gerente

**Acción:** Validar que la clasificación de productos sea correcta
**Resultado:** `admin_validation_status` → 'pending'

### FASE 5.5: Validación Admin (Obligatoria)
**Estado:** `Productos Validados` (con `admin_validation_status` = 'pending')
**Roles permitidos:** Solo gerencia y administración
- super_admin
- admin_corporativo
- gerente

**Acciones posibles:**
- ✅ **Aprobar:** `admin_validation_status` → 'approved', permite continuar
- ❌ **Rechazar:** `admin_validation_status` → 'rejected', status → 'Rechazado por Admin'

**Ubicación:** Pestaña especial "Validación Admin" en el dashboard

### FASE 6: Procesar Productos
**Estado:** `Aprobado por Admin` → `Productos Procesados`
**Roles permitidos:** Solo administración
- super_admin
- admin_corporativo
- gerente

**Requisitos:**
- `admin_validation_status` debe ser 'approved'

**Acción:** Generar SKUs para todos los productos
**Resultado:** `pre_oc_validation_status` → 'pending'

### FASE 6.5: Validación Pre-OC (Doble Chequeo)
**Estado:** `Productos Procesados` (con `pre_oc_validation_status` = 'pending')
**Roles permitidos:** Solo administración
- super_admin
- admin_corporativo
- gerente

**Acciones posibles:**
- ✅ **Aprobar:** `pre_oc_validation_status` → 'approved', status → 'Pre-OC Validado'
- ❌ **Rechazar:** `pre_oc_validation_status` → 'rejected', status → 'Pre-OC Rechazado'

**Propósito:** Doble chequeo de la información antes de generar la orden de compra

**Información mostrada:**
- Resumen de productos por proveedor
- SKUs generados
- Montos totales
- Detalles de cada producto

### FASE 7: Generar OC (Orden de Compra)
**Estado:** `Pre-OC Validado` → `OC Generada`
**Roles permitidos:** Solo administración
- super_admin
- admin_corporativo
- gerente

**Requisitos:**
- `pre_oc_validation_status` debe ser 'approved'

**Acción:** Generar orden de compra oficial con folio único

### FASE 8: Entregar
**Estado:** `OC Generada` → `Entregado`
**Roles permitidos:** Todos los roles pueden marcar como entregado
- super_admin
- admin_corporativo
- gerente
- asesor_tecnico
- tecnico

**Acción:** Marcar la orden como entregada al cliente

## Validaciones Obligatorias

### Validación Admin (Fase 5.5)
- **Obligatoria:** Sí
- **Bloquea avance:** Sí
- **Aparece en:** Pestaña "Validación Admin" (solo visible para admin_corporativo, gerente, super_admin)
- **Acción requerida:** Aprobar o rechazar explícitamente

### Validación Pre-OC (Fase 6.5)
- **Obligatoria:** Sí
- **Bloquea avance:** Sí
- **Aparece en:** Pestaña "Validación Pre-OC" (solo visible para admin_corporativo, gerente, super_admin)
- **Acción requerida:** Aprobar o rechazar explícitamente
- **Propósito:** Doble chequeo antes de comprometer recursos en una OC

## Servicios Implementados

### OrderPermissionsService
**Ubicación:** `src/app/services/order-permissions.service.ts`

**Métodos principales:**
- `getPhasePermissions(phase)`: Obtiene permisos para una fase específica
- `canAdvanceToNextPhase(phase, status, adminStatus)`: Verifica si se puede avanzar
- `getPhaseFromStatus(status)`: Mapea status a fase
- `canPerformAction(phase, action)`: Verifica permisos para una acción
- `getPermissionDeniedMessage(phase, action)`: Obtiene mensaje de error

## Componentes Implementados

### PreOcValidationComponent
**Ubicación:** `src/app/components/pre-oc-validation.component.ts`

**Funcionalidad:**
- Muestra resumen completo de la orden
- Lista productos por proveedor
- Permite agregar notas de validación
- Botones de aprobar/rechazar
- Solo accesible para roles autorizados

## Cambios en Base de Datos

### Nueva Tabla: orders (campos agregados)
```sql
pre_oc_validation_status text DEFAULT 'pending'
pre_oc_validated_by uuid
pre_oc_validated_at timestamptz
pre_oc_validation_notes text
```

**Migración:** `20251023210000_add_pre_oc_validation.sql`

## Flujo Completo con Roles

```
FASE 1: Diagnóstico
├─ Roles: Todos
└─ Crea orden inicial

FASE 2: Autorización Cliente
├─ Roles: Todos
└─ Cliente autoriza presupuesto

FASE 3-4: XML y Clasificación
├─ Roles: Asesor Técnico, Gerente, Admin Corporativo, Super Admin
└─ Carga y clasifica productos

FASE 5: Validar Productos
├─ Roles: Gerente, Admin Corporativo, Super Admin
└─ Status: "Productos Validados" + admin_validation_status: "pending"

⭐ FASE 5.5: Validación Admin (OBLIGATORIA)
├─ Roles: Gerente, Admin Corporativo, Super Admin
├─ Aparece en pestaña especial
└─ DEBE APROBAR para continuar

FASE 6: Procesar Productos
├─ Roles: Gerente, Admin Corporativo, Super Admin
├─ Requiere: admin_validation_status = "approved"
└─ Genera SKUs + Status: "Productos Procesados" + pre_oc_validation_status: "pending"

⭐ FASE 6.5: Validación Pre-OC (DOBLE CHEQUEO OBLIGATORIO)
├─ Roles: Gerente, Admin Corporativo, Super Admin
├─ Aparece en pestaña especial
├─ Muestra resumen completo de productos y proveedores
└─ DEBE APROBAR para generar OC

FASE 7: Generar OC
├─ Roles: Gerente, Admin Corporativo, Super Admin
├─ Requiere: pre_oc_validation_status = "approved"
└─ Genera orden de compra oficial

FASE 8: Entregar
├─ Roles: Todos
└─ Marca como entregado al cliente
```

## Mensajes de Error

Si un usuario intenta avanzar sin permisos, el sistema muestra:
```
"No tienes permisos para avanzar esta fase. Roles permitidos: [lista de roles]"
```

Si intenta avanzar sin cumplir requisitos:
```
"Este pedido requiere validación [admin/pre-OC] antes de continuar."
```

## Beneficios del Sistema

1. **Seguridad:** Solo usuarios autorizados pueden realizar acciones críticas
2. **Trazabilidad:** Cada aprobación queda registrada con usuario, fecha y notas
3. **Control de calidad:** Dos validaciones obligatorias aseguran exactitud
4. **Flexibilidad:** Diferentes roles para diferentes niveles de responsabilidad
5. **Auditoría:** Sistema completo de logs para todas las acciones importantes

## Uso en Código

### Verificar permisos
```typescript
if (!this.canPerformAction(order, 'advance')) {
  alert(this.getPermissionMessage(order, 'advance'));
  return;
}
```

### Verificar requisitos de fase
```typescript
if (order.admin_validation_status !== 'approved') {
  alert('Requiere aprobación administrativa.');
  return;
}
```

## Notas Importantes

- Las validaciones admin y pre-OC son **obligatorias** y **bloqueantes**
- No se puede saltar fases sin cumplir los requisitos
- Los roles de menor jerarquía solo ven las fases que les corresponden
- Super Admin tiene acceso completo a todas las funcionalidades
- Cada acción importante queda registrada en audit_logs
