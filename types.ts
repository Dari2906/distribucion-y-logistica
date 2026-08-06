export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  proveedorId?: string;
  codigoInterno?: string;
  codigo?: string;
  descripcion?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  direccion: string;
  ciudad?: string;
  telefono?: string;
  cuitDni?: string;
  ultimoContacto?: string;
  frecuenciaContactoDias?: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
}

export interface ItemRemito {
  productoId: number;
  cantidad: number;
  producto?: string;
  preparado?: boolean;
}

export interface Remito {
  id: string;
  numero: string;
  cliente: string;
  clienteId?: string;
  fecha: string;
  estado: 'Pendiente' | 'En Ruta' | 'Entregado' | 'Borrador' | 'En Preparación' | 'Listo para Entrega' | 'Cancelado';
  items: ItemRemito[];
  observaciones?: string;
}

export interface IngresoStock {
  id: string;
  productoId: string;
  cantidad: number;
  fecha: string;
}

export interface DatosEmpresa {
  nombre: string;
  cuitDni: string;
  direccion: string;
  telefono: string;
  subtitulo?: string;
}

export interface EmpresaData extends DatosEmpresa {}
export interface AppData {}
export type ActiveView = 'dashboard' | 'remitos' | 'clientes' | 'rutas' | 'productos' | 'proveedores';
export interface ModuleSecurityConfig {}
