import { Proveedor, Producto, Cliente, Remito, DatosEmpresa, IngresoStock } from './types';

export const INITIAL_PROVEEDORES: Proveedor[] = [
  {
    id: 'prov-1',
    nombre: 'Distribuidora Mayorista S.A.',
    cuit: '30-12345678-9',
    telefono: '011-4567-8901',
    email: 'contacto@distmayorista.com.ar',
    direccion: 'Av. Corrientes 4500',
    ciudad: 'CABA',
    contacto: 'Ing. Roberto Gómez (Gerente de Cuenta)'
  },
  {
    id: 'prov-2',
    nombre: 'TecnoAr Componentes',
    cuit: '30-87654321-2',
    telefono: '0341-4123456',
    email: 'ventas@tecnoar.com.ar',
    direccion: 'Pellegrini 1200',
    ciudad: 'Rosario',
    contacto: 'Lic. Valeria Rossi (Ventas Corp)'
  },
  {
    id: 'prov-3',
    nombre: 'Plásticos del Sur SRL',
    cuit: '30-11223344-5',
    telefono: '0223-4987654',
    email: 'info@plasticosdelsur.com',
    direccion: 'Ruta 2 Km 398',
    ciudad: 'Mar del Plata',
    contacto: 'Esteban Pereyra (Despachos)'
  }
];

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Supermercado El Sol',
    cuitDni: '30-55566677-8',
    telefono: '011-5432-1098',
    email: 'compras@elsolsuper.com',
    direccion: 'Rivadavia 10250',
    ciudad: 'Morón',
    contacto: 'Lic. Mario Santander (Jefe de Compras)',
    ultimoContacto: '2026-08-01',
    frecuenciaContactoDias: 15,
    notasContacto: 'Revisión periódica de pedidos quinzenales.'
  },
  {
    id: 'cli-2',
    nombre: 'Juan Carlos Pérez',
    cuitDni: '20-33445566-7',
    telefono: '11-3456-7890',
    email: 'juanperez90@gmail.com',
    direccion: 'Sarmiento 450 3°B',
    ciudad: 'CABA',
    contacto: 'Juan Carlos Pérez',
    ultimoContacto: '2026-06-15',
    frecuenciaContactoDias: 30,
    notasContacto: 'Pendiente confirmar reposición de materiales eléctricos.'
  },
  {
    id: 'cli-3',
    nombre: 'Ferretería Industrial Warnes',
    cuitDni: '30-99988877-6',
    telefono: '011-4855-1234',
    email: 'warnes_industrial@speedy.com.ar',
    direccion: 'Av. Warnes 1530',
    ciudad: 'CABA',
    contacto: 'Ing. Héctor Varela (Encargado de Depósito)',
    ultimoContacto: '2026-07-28',
    frecuenciaContactoDias: 30,
    notasContacto: 'Se envió catálogo actualizado de conectores.'
  }
];

export const INITIAL_PRODUCTOS: Producto[] = [
  {
    id: 'prod-1',
    codigoInterno: 'INT-001',
    codigoProveedor: 'PROV-UTP-305',
    codigo: 'INT-001',
    nombre: 'Bobina Cable UTP Cat6 305m',
    descripcion: 'Cable de red categoría 6, 100% cobre, apto exterior (ElectroSur).',
    costo: 50000,
    porcentajeGanancia: 50,
    precio: 75000,
    stock: 8,
    stockMinimo: 15,
    proveedorId: 'prov-2'
  },
  {
    id: 'prod-1b',
    codigoInterno: 'INT-001',
    codigoProveedor: 'FMB-UTP-CAT6',
    codigo: 'INT-001',
    nombre: 'Bobina Cable UTP Cat6 305m',
    descripcion: 'Cable de red categoría 6 exterior (Ferretería Industrial - Precio Especial).',
    costo: 46000,
    porcentajeGanancia: 50,
    precio: 69000,
    stock: 12,
    stockMinimo: 15,
    proveedorId: 'prov-1'
  },
  {
    id: 'prod-2',
    codigoInterno: 'INT-002',
    codigoProveedor: 'PDS-10105-EST',
    codigo: 'INT-002',
    nombre: 'Caja de Paso Estanca 10x10x5',
    descripcion: 'Caja plástica de paso para intemperie IP65 (Distribuidora del Sur).',
    costo: 1840,
    porcentajeGanancia: 25,
    precio: 2300,
    stock: 120,
    stockMinimo: 20,
    proveedorId: 'prov-3'
  },
  {
    id: 'prod-2b',
    codigoInterno: 'INT-002',
    codigoProveedor: 'ELS-CP-1010',
    codigo: 'INT-002',
    nombre: 'Caja de Paso Estanca 10x10x5',
    descripcion: 'Caja plástica IP65 reforzada (ElectroSur).',
    costo: 2100,
    porcentajeGanancia: 25,
    precio: 2625,
    stock: 40,
    stockMinimo: 20,
    proveedorId: 'prov-2'
  },
  {
    id: 'prod-3',
    codigoInterno: 'INT-003',
    codigoProveedor: 'PROV-RJ45-C6',
    codigo: 'INT-003',
    nombre: 'Fichas RJ45 Cat6 (Bolsa x100)',
    descripcion: 'Conectores RJ45 con guías metálicas para cable rígido.',
    costo: 10000,
    porcentajeGanancia: 45,
    precio: 14500,
    stock: 45,
    stockMinimo: 10,
    proveedorId: 'prov-2'
  },
  {
    id: 'prod-4',
    codigoInterno: 'INT-004',
    codigoProveedor: 'FMB-PALA-PTA',
    codigo: 'INT-004',
    nombre: 'Pala de Punta Acero Forjado',
    descripcion: 'Pala de punta con mango de madera de alta resistencia.',
    costo: 20000,
    porcentajeGanancia: 90,
    precio: 38000,
    stock: 3,
    stockMinimo: 10,
    proveedorId: 'prov-1'
  }
];

export const INITIAL_REMITOS: Remito[] = [
  {
    id: 'rem-1',
    numero: 'R-0001-00000001',
    fecha: '2026-06-20',
    clienteId: 'cli-1',
    items: [
      { productoId: 'prod-1', cantidad: 2, precioUnitario: 75000 },
      { productoId: 'prod-2', cantidad: 10, precioUnitario: 2300 },
      { productoId: 'prod-3', cantidad: 1, precioUnitario: 14500 }
    ],
    observaciones: 'Entregar por puerta de carga trasera por la mañana.',
    estado: 'Entregado'
  },
  {
    id: 'rem-2',
    numero: 'R-0001-00000002',
    fecha: '2026-06-24',
    clienteId: 'cli-3',
    items: [
      { productoId: 'prod-4', cantidad: 3, precioUnitario: 38000 },
      { productoId: 'prod-2', cantidad: 5, precioUnitario: 2300 }
    ],
    observaciones: 'Cliente retira de sucursal.',
    estado: 'Borrador'
  }
];

export const DEFAULT_DATOS_EMPRESA: DatosEmpresa = {
  nombre: 'Logistica_Dist.',
  subtitulo: 'Distribución e Ingeniería',
  direccion: 'Av. de Mayo 1370, CABA',
  telefono: '+54 (11) 5219-8000',
  email: 'despachos@logistica-dist.com.ar',
  web: 'www.logistica-dist.com.ar',
  cuit: '30-71234567-8',
  iibb: '30-71234567-8',
  inicioActividades: '01/10/2012'
};

export const INITIAL_INGRESOS_STOCK: IngresoStock[] = [
  {
    id: 'ing-1',
    fecha: '2026-07-10',
    proveedorId: 'prov-2',
    comprobante: 'Factura A-0002-00014820',
    observaciones: 'Ingreso lote mensual de materiales.',
    items: [
      {
        id: 'item-101',
        productoId: 'prod-1',
        cantidad: 10,
        costoUnitario: 50000
      },
      {
        id: 'item-102',
        productoId: 'prod-3',
        cantidad: 20,
        costoUnitario: 9500
      }
    ]
  },
  {
    id: 'ing-2',
    fecha: '2026-07-22',
    proveedorId: 'prov-3',
    comprobante: 'Remito Prov #3301',
    observaciones: 'Recepción bultos cajas de paso estanca.',
    items: [
      {
        id: 'item-201',
        productoId: 'prod-2',
        cantidad: 100,
        costoUnitario: 1840
      }
    ]
  },
  {
    id: 'ing-3',
    fecha: '2026-08-01',
    proveedorId: 'prov-2',
    comprobante: 'Factura A-0002-00015002',
    observaciones: 'Fichas RJ45 y conectores adicionales.',
    items: [
      {
        id: 'item-301',
        productoId: 'prod-3',
        cantidad: 30,
        costoUnitario: 10000
      }
    ]
  },
  {
    id: 'ing-4',
    fecha: '2026-08-03',
    proveedorId: 'prov-1',
    comprobante: 'Factura B-0001-00008412',
    observaciones: 'Recepción stock bobinas de cable y palas.',
    items: [
      {
        id: 'item-401',
        productoId: 'prod-1b',
        cantidad: 5,
        costoUnitario: 46000
      },
      {
        id: 'item-402',
        productoId: 'prod-4',
        cantidad: 10,
        costoUnitario: 20000
      }
    ]
  }
];


