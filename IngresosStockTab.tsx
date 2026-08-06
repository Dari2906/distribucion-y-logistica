import React, { useState, useEffect } from 'react';
import './index.css';
import { Cliente, Producto, Proveedor, Remito, DatosEmpresa, ItemRemito } from './types';
import { INITIAL_CLIENTES, INITIAL_PRODUCTOS, INITIAL_PROVEEDORES, INITIAL_REMITOS, INITIAL_DATOS_EMPRESA } from './mockData';
import ClientesTab from './ClientesTab';
import ProductosTab from './ProductosTab';
import ProveedoresTab from './ProveedoresTab';
import RemitosTab from './RemitosTab';
import DepositoModule from './DepositoModule';
import MiEmpresaTab from './MiEmpresaTab';
import IngresosStockTab from './IngresosStockTab';
import RemitoPrintView from './RemitoPrintView';

type Tab = 'remitos' | 'productos' | 'clientes' | 'proveedores' | 'deposito' | 'ingresos' | 'empresa';

const LOCAL_STORAGE_KEY = 'distribucion-logistica-data-v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('remitos');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [remitos, setRemitos] = useState<Remito[]>([]);
  const [datosEmpresa, setDatosEmpresa] = useState<DatosEmpresa>(INITIAL_DATOS_EMPRESA);
  const [remitoAImprimir, setRemitoAImprimir] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos de localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const data = JSON.parse(savedData);
      setClientes(data.clientes || INITIAL_CLIENTES);
      setProductos(data.productos || INITIAL_PRODUCTOS);
      setProveedores(data.proveedores || INITIAL_PROVEEDORES);
      setRemitos(data.remitos || INITIAL_REMITOS);
      setDatosEmpresa(data.datosEmpresa || INITIAL_DATOS_EMPRESA);
    } else {
      setClientes(INITIAL_CLIENTES);
      setProductos(INITIAL_PRODUCTOS);
      setProveedores(INITIAL_PROVEEDORES);
      setRemitos(INITIAL_REMITOS);
      setDatosEmpresa(INITIAL_DATOS_EMPRESA);
    }
    setLoading(false);
  }, []);

  // Guardar datos en localStorage
  useEffect(() => {
    if (!loading) {
      const data = { clientes, productos, proveedores, remitos, datosEmpresa };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  }, [clientes, productos, proveedores, remitos, datosEmpresa, loading]);

  const handlePrintRemito = (remito: Remito) => {
    setRemitoAImprimir(remito);
  };

  const clienteDelRemito = clientes.find(c => c.id === remitoAImprimir?.clienteId);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold">{datosEmpresa.nombre}</h1>
            <nav className="flex gap-2 overflow-x-auto">
              <button onClick={() => setActiveTab('remitos')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'remitos' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>Remitos</button>
              <button onClick={() => setActiveTab('productos')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'productos' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>Productos</button>
              <button onClick={() => setActiveTab('clientes')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'clientes' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>Clientes</button>
              <button onClick={() => setActiveTab('proveedores')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'proveedores' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>Proveedores</button>
              <button onClick={() => setActiveTab('ingresos')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'ingresos' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>Ingresos</button>
              <button onClick={() => setActiveTab('deposito')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'deposito' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>Depósito</button>
              <button onClick={() => setActiveTab('empresa')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'empresa' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>Empresa</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'remitos' && <RemitosTab remitos={remitos} setRemitos={setRemitos} clientes={clientes} productos={productos} onPrint={handlePrintRemito} />}
        {activeTab === 'productos' && <ProductosTab productos={productos} setProductos={setProductos} />}
        {activeTab === 'clientes' && <ClientesTab clientes={clientes} setClientes={setClientes} />}
        {activeTab === 'proveedores' && <ProveedoresTab proveedores={proveedores} setProveedores={setProveedores} />}
        {activeTab === 'ingresos' && <IngresosStockTab productos={productos} setProductos={setProductos} />}
        {activeTab === 'deposito' && <DepositoModule productos={productos} />}
        {activeTab === 'empresa' && <MiEmpresaTab datosEmpresa={datosEmpresa} setDatosEmpresa={setDatosEmpresa} />}
      </main>

      {/* Modal de impresión */}
      {remitoAImprimir && clienteDelRemito && (
        <RemitoPrintView
          remito={remitoAImprimir}
          cliente={clienteDelRemito}
          productos={productos}
          datosEmpresa={datosEmpresa}
          onClose={() => setRemitoAImprimir(null)}
        />
      )}
    </div>
  );
}
