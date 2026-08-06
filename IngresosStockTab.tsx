export interface Proveedor {
  id: string;
  nombre: string;
  cuit: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  contacto?: string; // Nombre de persona de contacto / representante
}

export interface Producto {
  id: string;
  codigoInterno: string; // Código asignado por la empresa (SKU interno)
  codigoProveedor?: string; // Código asignado por el proveedor
  codigo: string; // Mantenido para compatibilidad
  nombre: string;
  descripcion: string;
  costo: number; // Costo de compra/producción
  porcentajeGanancia: number; // Porcentaje de ganancia a aplicar (%)
  precio: number; // Precio de venta (calculado)
  stock: number;
  stockMinimo?: number; // Umbral de alerta de bajo stock
  proveedorId: string; // Relacionado con Proveedor
}

export interface Cliente {
  id: string;
  nombre: string;
  cuitDni: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  contacto?: string; // Nombre de la persona de contacto
  ultimoContacto?: string; // Fecha del último contacto (YYYY-MM-DD)
  frecuenciaContactoDias?: number; // Frecuencia deseada de contacto en días (ej. 15, 30, 60)
  notasContacto?: string; // Observaciones o detalle de última llamada/reunión
}

export interface RemitoItem {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  preparado?: boolean;
}

export interface Remito {
  id: string;
  numero: string; // Formato: R-0001-00000001
  fecha: string;
  clienteId: string;
  items: RemitoItem[];
  observaciones: string;
  estado: 'Borrador' | 'En Preparación' | 'Listo para Entrega' | 'Entregado' | 'Cancelado';
}

export interface IngresoStockItem {
  id: string;
  productoId: string;
  cantidad: number;
  costoUnitario?: number;
}

export interface IngresoStock {
  id: string;
  fecha: string; // YYYY-MM-DD
  proveedorId: string;
  comprobante?: string; // Ej: Factura A-0001-12345678, Remito Proveedor #456
  observaciones?: string;
  items: IngresoStockItem[];
}

export interface DatosEmpresa {
  nombre: string;
  subtitulo: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  cuit: string;
  iibb: string;
  inicioActividades: string;
}

export interface ModuleSecurityConfig {
  adminPass: string;
  depositoPass: string;
  requireAdminPass: boolean;
  requireDepositoPass: boolean;
}


