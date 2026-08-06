export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  direccion: string;
  telefono?: string;
  cuitDni?: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  telefono?: string;
}

export interface ItemRemito {
  productoId: number;
  cantidad: number;
  producto?: string;
}

export interface Remito {
  id: string;
  numero: string;
  cliente: string;
  clienteId?: string;
  fecha: string;
  estado: 'Pendiente' | 'En Ruta' | 'Entregado';
  items: ItemRemito[];
  observaciones?: string;
}

export interface EmpresaData {
  nombre: string;
  cuitDni: string;
  direccion: string;
  telefono: string;
}

export interface DatosEmpresa extends EmpresaData {}

export type Tab = 'dashboard' | 'remitos' | 'clientes' | 'rutas' | 'productos' | 'proveedores';
