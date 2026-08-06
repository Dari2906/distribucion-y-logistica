import { Cliente, Producto, Proveedor, Remito, DatosEmpresa } from './types';

export const INITIAL_CLIENTES: Cliente[] = [
  { id: '1', nombre: 'Cliente Demo SA', cuitDni: '20-12345678-9', direccion: 'Av. Siempre Viva 742', ciudad: 'Merlo', telefono: '11-5555-5555', email: 'demo@cliente.com' }
];

export const INITIAL_PRODUCTOS: Producto[] = [
  { id: '1', nombre: 'Producto Demo', descripcion: 'Descripción demo', codigo: 'P001', codigoInterno: 'INT-001', precio: 1500, precioUnitario: 1500, stock: 100, categoria: 'General' }
];

export const INITIAL_PROVEEDORES: Proveedor[] = [
  { id: '1', nombre: 'Proveedor Demo', contacto: 'Juan Perez', telefono: '11-6666-6666', cuit: '30-98765432-1', direccion: 'Calle Falsa 123', email: 'demo@proveedor.com' }
];

export const INITIAL_REMITOS: Remito[] = [];

export const INITIAL_DATOS_EMPRESA: DatosEmpresa = {
  nombre: 'Mi Empresa SRL', subtitulo: 'Distribución y Logística', cuit: '30-11111-2', iibb: '123-456789', inicioActividades: '01/01/2020',
  direccion: 'Ruta 21 Km 25, Merlo', telefono: '11-7777-7777', email: 'info@miempresa.com', web: 'www.miempresa.com', logo: ''
};
