export interface Remito {
  id: string;
  numero: string;
  cliente: string;
  fecha: string;
  estado: 'Pendiente' | 'En Ruta' | 'Entregado';
  items: { producto: string; cantidad: number }[];
}

export interface Cliente {
  id: string;
  nombre: string;
  direccion: string;
}

export type Tab = 'dashboard' | 'remitos' | 'clientes' | 'rutas';
