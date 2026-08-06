import React, { useState, useEffect } from 'react';
import { Cliente, Producto, Proveedor, Remito, DatosEmpresa } from './types';
import { INITIAL_CLIENTES, INITIAL_PRODUCTOS, INITIAL_PROVEEDORES, INITIAL_REMITOS, INITIAL_DATOS_EMPRESA } from './mockData';
import ClientesTab from './ClientesTab';
import ProductosTab from './ProductosTab';
import ProveedoresTab from './ProveedoresTab';
import RemitosTab from './RemitosTab';
import DepositoModule from './DepositoModule';
import MiEmpresaTab from './MiEmpresaTab';
import IngresosStockTab from './IngresosStockTab';
import PasswordModal from './PasswordModal';
import RemitoPrintView from './RemitoPrintView';

// ... ACA VA TODO EL RESTO DE TU CODIGO DE LA APP ...
