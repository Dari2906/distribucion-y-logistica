import React, { useState, useEffect, useMemo } from 'react';
import { ClientesTab } from './ClientesTab';
import { ProductosTab } from './ProductosTab';
import { ProveedoresTab } from './ProveedoresTab';
import { RemitosTab } from './RemitosTab';
import { IngresosStockTab } from './IngresosStockTab';
import { DepositoModule } from './DepositoModule';
import { MiEmpresaTab } from './MiEmpresaTab';
import { RemitoPrintView } from './RemitoPrintView';
import { Truck, Box, Users, FileText, ArrowDownToLine, Warehouse, Building, type LucideIcon } from 'lucide-react';
import { initialMockData } from './mockData';
import type { AppData, ActiveView, Cliente, Producto, Proveedor, Remito, IngresoStock, EmpresaData } from './types';

type NavItem = { id: ActiveView; label: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { id: 'mi-empresa', label: 'Mi Empresa', icon: Building },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'productos', label: 'Productos', icon: Box },
  { id: 'proveedores', label: 'Proveedores', icon: Truck },
  { id: 'ingresos-stock', label: 'Ingresos Stock', icon: ArrowDownToLine },
  { id: 'remitos', label: 'Remitos', icon: FileText },
  { id: 'deposito', label: 'Depósito', icon: Warehouse },
];

export default function App() {
  const [data, setData] = useState<AppData>(initialMockData);
  const [activeView, setActiveView] = useState<ActiveView>('mi-empresa');
  const [remitoToPrint, setRemitoToPrint] = useState<Remito | null>(null);

  useEffect(() => {
    const body = document.body;
    if (remitoToPrint) {
      body.classList.add('printing-remito');
      setTimeout(() => window.print(), 100);
    } else {
      body.classList.remove('printing-remito');
    }
  }, [remitoToPrint]);

  const handlePrintRemito = (remito: Remito) => {
    setRemitoToPrint(remito);
  };
  
  const handleAfterPrint = () => {
    setRemitoToPrint(null);
  };

  useEffect(() => {
    const handleAfterPrintEvent = () => handleAfterPrint();
    window.addEventListener('afterprint', handleAfterPrintEvent);
    return () => window.removeEventListener('afterprint', handleAfterPrintEvent);
  }, []);

  const stockPorProducto = useMemo(() => {
    const stock: { [key: number]: number } = {};
    data.productos.forEach(p => stock[p.id] = 0);
    data.ingresosStock.forEach(i => stock[i.productoId] = (stock[i.productoId] || 0) + i.cantidad);
    data.remitos.forEach(r => r.items.forEach(i => stock[i.productoId] = (stock[i.productoId] || 0) - i.cantidad));
    return stock;
  }, [data]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'mi-empresa': return <MiEmpresaTab empresaData={data.empresa} setEmpresaData={(empresa) => setData(d => ({...d, empresa }))} />;
      case 'clientes': return <ClientesTab clientes={data.clientes} setClientes={(clientes) => setData(d => ({...d, clientes }))} />;
      case 'productos': return <ProductosTab productos={data.productos} setProductos={(productos) => setData(d => ({...d, productos }))} />;
      case 'proveedores': return <ProveedoresTab proveedores={data.proveedores} setProveedores={(proveedores) => setData(d => ({...d, proveedores }))} />;
      case 'ingresos-stock': return <IngresosStockTab ingresos={data.ingresosStock} setIngresos={(ingresosStock) => setData(d => ({...d, ingresosStock }))} productos={data.productos} proveedores={data.proveedores} />;
      case 'remitos': return <RemitosTab remitos={data.remitos} setRemitos={(remitos) => setData(d => ({...d, remitos }))} clientes={data.clientes} productos={data.productos} stock={stockPorProducto} onPrint={handlePrintRemito} empresaData={data.empresa} />;
      case 'deposito': return <DepositoModule productos={data.productos} stock={stockPorProducto} />;
      default: return null;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
        <aside className="w-64 bg-white shadow-md flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-slate-900">Distribución</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${activeView === item.id? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
      {remitoToPrint && <RemitoPrintView remito={remitoToPrint} productos={data.productos} clientes={data.clientes} empresaData={data.empresa} />}
    </>
  );
}
