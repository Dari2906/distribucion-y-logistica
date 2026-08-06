import React, { useState, useEffect } from 'react';
import { Proveedor, Producto, Cliente, Remito, DatosEmpresa, IngresoStock, ModuleSecurityConfig } from './types';
import { 
  INITIAL_PROVEEDORES, 
  INITIAL_CLIENTES, 
  INITIAL_PRODUCTOS, 
  INITIAL_REMITOS,
  DEFAULT_DATOS_EMPRESA,
  INITIAL_INGRESOS_STOCK
} from './mockData';

// Tabs
import ProveedoresTab from './components/ProveedoresTab';
import ClientesTab from './components/ClientesTab';
import ProductosTab from './components/ProductosTab';
import RemitosTab from './components/RemitosTab';
import RemitoPrintView from './components/RemitoPrintView';
import MiEmpresaTab from './components/MiEmpresaTab';
import IngresosStockTab from './components/IngresosStockTab';
import { DepositoModule } from './components/DepositoModule';
import { PasswordModal } from './components/PasswordModal';

// Icons
import { 
  Truck, 
  Users, 
  Box, 
  FileText, 
  LayoutDashboard, 
  Download, 
  Upload, 
  Database,
  ArrowRight,
  Plus,
  TrendingUp,
  PackageCheck,
  LogIn,
  LogOut,
  ShieldCheck,
  Clock,
  ExternalLink,
  Building2,
  Tag,
  CheckCircle2,
  PhoneCall,
  PackagePlus,
  AlertTriangle,
  Award,
  Boxes,
  Shield
} from 'lucide-react';
import { getBestPricesPerProduct } from './utils/productUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'remitos' | 'clientes' | 'productos' | 'ingresos-stock' | 'proveedores' | 'mi-empresa'>('dashboard');
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  // Module state: 'admin' (full access) vs 'deposito' (warehouse operational without prices)
  const [currentModule, setCurrentModule] = useState<'admin' | 'deposito'>(() => {
    try {
      const saved = localStorage.getItem('gpc_current_module');
      return saved === 'deposito' ? 'deposito' : 'admin';
    } catch {
      return 'admin';
    }
  });

  // Module security passwords configuration
  const [securityConfig, setSecurityConfig] = useState<ModuleSecurityConfig>(() => {
    try {
      const saved = localStorage.getItem('gpc_security_config');
      return saved ? JSON.parse(saved) : {
        adminPass: 'admin123',
        depositoPass: 'deposito123',
        requireAdminPass: true,
        requireDepositoPass: true,
      };
    } catch {
      return {
        adminPass: 'admin123',
        depositoPass: 'deposito123',
        requireAdminPass: true,
        requireDepositoPass: true,
      };
    }
  });

  const [pendingModuleTarget, setPendingModuleTarget] = useState<'admin' | 'deposito' | null>(null);

  useEffect(() => {
    localStorage.setItem('gpc_security_config', JSON.stringify(securityConfig));
  }, [securityConfig]);

  useEffect(() => {
    localStorage.setItem('gpc_current_module', currentModule);
  }, [currentModule]);

  // Handler to request access to a module
  // Direct entry ONLY allowed when switching from Administrador -> Depósito
  const requestModuleAccess = (targetModule: 'admin' | 'deposito') => {
    if (hasEntered && currentModule === 'admin' && targetModule === 'deposito') {
      setCurrentModule('deposito');
      return;
    }

    const isRequired = targetModule === 'admin' 
      ? securityConfig.requireAdminPass 
      : securityConfig.requireDepositoPass;

    if (isRequired) {
      setPendingModuleTarget(targetModule);
    } else {
      setCurrentModule(targetModule);
      setHasEntered(true);
    }
  };

  const handlePasswordSuccess = () => {
    if (pendingModuleTarget) {
      setCurrentModule(pendingModuleTarget);
      setHasEntered(true);
      setPendingModuleTarget(null);
    }
  };
  
  // App States with lazy synchronous loading from localStorage
  const [proveedores, setProveedores] = useState<Proveedor[]>(() => {
    try {
      const saved = localStorage.getItem('gpc_proveedores');
      return saved ? JSON.parse(saved) : INITIAL_PROVEEDORES;
    } catch {
      return INITIAL_PROVEEDORES;
    }
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    try {
      const saved = localStorage.getItem('gpc_clientes');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
    } catch {
      return INITIAL_CLIENTES;
    }
  });

  const [productos, setProductos] = useState<Producto[]>(() => {
    try {
      const saved = localStorage.getItem('gpc_productos');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTOS;
    } catch {
      return INITIAL_PRODUCTOS;
    }
  });

  const [remitos, setRemitos] = useState<Remito[]>(() => {
    try {
      const saved = localStorage.getItem('gpc_remitos');
      return saved ? JSON.parse(saved) : INITIAL_REMITOS;
    } catch {
      return INITIAL_REMITOS;
    }
  });

  const [datosEmpresa, setDatosEmpresa] = useState<DatosEmpresa>(() => {
    try {
      const saved = localStorage.getItem('gpc_datos_empresa');
      return saved ? JSON.parse(saved) : DEFAULT_DATOS_EMPRESA;
    } catch {
      return DEFAULT_DATOS_EMPRESA;
    }
  });

  const [ingresosStock, setIngresosStock] = useState<IngresoStock[]>(() => {
    try {
      const saved = localStorage.getItem('gpc_ingresos_stock');
      return saved ? JSON.parse(saved) : INITIAL_INGRESOS_STOCK;
    } catch {
      return INITIAL_INGRESOS_STOCK;
    }
  });

  // Printing state
  const [printingRemito, setPrintingRemito] = useState<Remito | null>(null);

  // Auto-sync to localStorage on state updates
  useEffect(() => {
    localStorage.setItem('gpc_proveedores', JSON.stringify(proveedores));
  }, [proveedores]);

  useEffect(() => {
    localStorage.setItem('gpc_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('gpc_productos', JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem('gpc_remitos', JSON.stringify(remitos));
  }, [remitos]);

  useEffect(() => {
    localStorage.setItem('gpc_datos_empresa', JSON.stringify(datosEmpresa));
  }, [datosEmpresa]);

  useEffect(() => {
    localStorage.setItem('gpc_ingresos_stock', JSON.stringify(ingresosStock));
  }, [ingresosStock]);

  // Save changes to localStorage helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleUpdateDatosEmpresa = (nuevosDatos: DatosEmpresa) => {
    setDatosEmpresa(nuevosDatos);
    saveState('gpc_datos_empresa', nuevosDatos);
  };

  // --- CRUD INGRESOS DE STOCK ---
  const handleAddIngresoStock = (nuevoIngreso: Omit<IngresoStock, 'id'>) => {
    const ing: IngresoStock = {
      ...nuevoIngreso,
      id: `ing-${Date.now()}`
    };
    
    // Add stock inflow record
    const updatedIngresos = [ing, ...ingresosStock];
    setIngresosStock(updatedIngresos);
    saveState('gpc_ingresos_stock', updatedIngresos);

    // Build map of quantity additions and costs per product
    const itemsList = ing.items || [];
    const productUpdatesMap = new Map<string, { totalQty: number; latestCosto?: number }>();
    
    itemsList.forEach(item => {
      const current = productUpdatesMap.get(item.productoId) || { totalQty: 0 };
      current.totalQty += item.cantidad;
      if (item.costoUnitario !== undefined && item.costoUnitario > 0) {
        current.latestCosto = item.costoUnitario;
      }
      productUpdatesMap.set(item.productoId, current);
    });

    // Increment product stock balance
    const updatedProductos = productos.map(p => {
      if (productUpdatesMap.has(p.id)) {
        const updateInfo = productUpdatesMap.get(p.id)!;
        const nuevoStock = p.stock + updateInfo.totalQty;
        const nuevoCosto = updateInfo.latestCosto !== undefined ? updateInfo.latestCosto : p.costo;
        const nuevoPrecio = Math.round(nuevoCosto * (1 + p.porcentajeGanancia / 100));
        
        return {
          ...p,
          stock: nuevoStock,
          costo: nuevoCosto,
          precio: nuevoPrecio,
        };
      }
      return p;
    });

    setProductos(updatedProductos);
    saveState('gpc_productos', updatedProductos);
  };

  const handleDeleteIngresoStock = (id: string) => {
    const targetIng = ingresosStock.find(i => i.id === id);
    if (!targetIng) return;

    // Normalization for legacy single-item vs multi-item
    const itemsList: { productoId: string; cantidad: number }[] = targetIng.items 
      ? targetIng.items 
      : (targetIng as any).productoId 
        ? [{ productoId: (targetIng as any).productoId, cantidad: (targetIng as any).cantidad || 0 }] 
        : [];

    const productDeductionsMap = new Map<string, number>();
    itemsList.forEach(item => {
      const prev = productDeductionsMap.get(item.productoId) || 0;
      productDeductionsMap.set(item.productoId, prev + item.cantidad);
    });

    // Deduct quantity from product stock
    const updatedProductos = productos.map(p => {
      if (productDeductionsMap.has(p.id)) {
        const qtyToDeduct = productDeductionsMap.get(p.id)!;
        return {
          ...p,
          stock: Math.max(0, p.stock - qtyToDeduct),
        };
      }
      return p;
    });
    setProductos(updatedProductos);
    saveState('gpc_productos', updatedProductos);

    // Remove entry
    const updatedIngresos = ingresosStock.filter(i => i.id !== id);
    setIngresosStock(updatedIngresos);
    saveState('gpc_ingresos_stock', updatedIngresos);
  };

  // --- CRUD PROVEEDORES ---
  const handleAddProveedor = (newProv: Omit<Proveedor, 'id'>) => {
    const prov: Proveedor = {
      ...newProv,
      id: `prov-${Date.now()}`
    };
    const updated = [...proveedores, prov];
    setProveedores(updated);
    saveState('gpc_proveedores', updated);
  };

  const handleUpdateProveedor = (updatedProv: Proveedor) => {
    const updated = proveedores.map(p => p.id === updatedProv.id ? updatedProv : p);
    setProveedores(updated);
    saveState('gpc_proveedores', updated);
  };

  const handleDeleteProveedor = (id: string) => {
    const updated = proveedores.filter(p => p.id !== id);
    setProveedores(updated);
    saveState('gpc_proveedores', updated);
  };

  // --- CRUD CLIENTES ---
  const handleAddCliente = (newCli: Omit<Cliente, 'id'>) => {
    const cli: Cliente = {
      ...newCli,
      id: `cli-${Date.now()}`
    };
    const updated = [...clientes, cli];
    setClientes(updated);
    saveState('gpc_clientes', updated);
  };

  const handleUpdateCliente = (updatedCli: Cliente) => {
    const updated = clientes.map(c => c.id === updatedCli.id ? updatedCli : c);
    setClientes(updated);
    saveState('gpc_clientes', updated);
  };

  const handleDeleteCliente = (id: string) => {
    const updated = clientes.filter(c => c.id !== id);
    setClientes(updated);
    saveState('gpc_clientes', updated);
  };

  // --- CRUD PRODUCTOS ---
  const handleAddProducto = (newProd: Omit<Producto, 'id'>) => {
    const prod: Producto = {
      ...newProd,
      id: `prod-${Date.now()}`
    };
    const updated = [...productos, prod];
    setProductos(updated);
    saveState('gpc_productos', updated);
  };

  const handleUpdateProducto = (updatedProd: Producto) => {
    const updated = productos.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProductos(updated);
    saveState('gpc_productos', updated);
  };

  const handleDeleteProducto = (id: string) => {
    const updated = productos.filter(p => p.id !== id);
    setProductos(updated);
    saveState('gpc_productos', updated);
  };

  // --- CRUD REMITOS (With Auto Numbering & Inventory Deduction) ---
  const generateNextRemitoNumber = () => {
    if (remitos.length === 0) return 'R-0001-00000001';
    
    // Extract numerical suffix from formatted strings: R-0001-XXXXXXXX
    const numbers = remitos.map(r => {
      const parts = r.numero.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    });
    
    const maxNum = Math.max(...numbers, 0);
    const nextNum = maxNum + 1;
    return `R-0001-${String(nextNum).padStart(8, '0')}`;
  };

  const handleAddRemito = (newRemito: Omit<Remito, 'id' | 'numero'>) => {
    const nextNumber = generateNextRemitoNumber();
    const remito: Remito = {
      ...newRemito,
      id: `rem-${Date.now()}`,
      numero: nextNumber
    };

    // Deduct stock if marked as Delivered immediately
    if (remito.estado === 'Entregado') {
      const updatedProds = productos.map(p => {
        const item = remito.items.find(it => it.productoId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.cantidad) };
        }
        return p;
      });
      setProductos(updatedProds);
      saveState('gpc_productos', updatedProds);
    }

    const updatedRemitos = [...remitos, remito];
    setRemitos(updatedRemitos);
    saveState('gpc_remitos', updatedRemitos);
  };

  const handleUpdateRemito = (updatedRemito: Remito) => {
    const originalRemito = remitos.find(r => r.id === updatedRemito.id);
    if (!originalRemito) return;

    // Handle inventory logic for transitions
    let updatedProds = [...productos];

    // Transition: non-Entregado -> Entregado (Deduct stock)
    if (updatedRemito.estado === 'Entregado' && originalRemito.estado !== 'Entregado') {
      updatedProds = productos.map(p => {
        const item = updatedRemito.items.find(it => it.productoId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.cantidad) };
        }
        return p;
      });
    }
    // Transition: Entregado -> non-Entregado (Restore stock)
    else if (updatedRemito.estado !== 'Entregado' && originalRemito.estado === 'Entregado') {
      updatedProds = productos.map(p => {
        const item = originalRemito.items.find(it => it.productoId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.cantidad };
        }
        return p;
      });
    }

    // Save product state if changed
    if (JSON.stringify(updatedProds) !== JSON.stringify(productos)) {
      setProductos(updatedProds);
      saveState('gpc_productos', updatedProds);
    }

    const updatedRemitos = remitos.map(r => r.id === updatedRemito.id ? updatedRemito : r);
    setRemitos(updatedRemitos);
    saveState('gpc_remitos', updatedRemitos);
  };

  const handleDeleteRemito = (id: string) => {
    const originalRemito = remitos.find(r => r.id === id);
    if (!originalRemito) return;

    // If an delivered remito is deleted, we could restore the stock, let's keep it safe.
    if (originalRemito.estado === 'Entregado') {
      const updatedProds = productos.map(p => {
        const item = originalRemito.items.find(it => it.productoId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.cantidad };
        }
        return p;
      });
      setProductos(updatedProds);
      saveState('gpc_productos', updatedProds);
    }

    const updatedRemitos = remitos.filter(r => r.id !== id);
    setRemitos(updatedRemitos);
    saveState('gpc_remitos', updatedRemitos);
  };

  // --- DATA IMPORT / EXPORT (Backup Safety) ---
  const exportAllData = () => {
    const dataStr = JSON.stringify({ proveedores, clientes, productos, remitos, datosEmpresa }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `backup_gestion_remitos_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = event => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') return;
        
        const parsedData = JSON.parse(result);
        
        if (parsedData.proveedores) {
          setProveedores(parsedData.proveedores);
          saveState('gpc_proveedores', parsedData.proveedores);
        }
        if (parsedData.clientes) {
          setClientes(parsedData.clientes);
          saveState('gpc_clientes', parsedData.clientes);
        }
        if (parsedData.productos) {
          setProductos(parsedData.productos);
          saveState('gpc_productos', parsedData.productos);
        }
        if (parsedData.remitos) {
          setRemitos(parsedData.remitos);
          saveState('gpc_remitos', parsedData.remitos);
        }
        if (parsedData.datosEmpresa) {
          setDatosEmpresa(parsedData.datosEmpresa);
          saveState('gpc_datos_empresa', parsedData.datosEmpresa);
        }
        alert('Datos importados con éxito.');
      } catch (err) {
        alert('Error al importar archivo. Asegúrate de usar un archivo de backup compatible.');
      }
    };
    fileReader.readAsText(files[0]);
  };

  // Dashboard calculations
  const totalStockVal = productos.reduce((acc, p) => acc + (p.stock * p.precio), 0);
  const totalBorradores = remitos.filter(r => r.estado === 'Borrador').length;
  const totalEntregas = remitos.filter(r => r.estado === 'Entregado').length;
  const productBestPriceGroups = getBestPricesPerProduct(productos);

  const productosBajoStock = productos.filter(p => p.stock <= (p.stockMinimo ?? 10));

  const clientesRequierenContactoCount = clientes.filter(c => {
    const limite = c.frecuenciaContactoDias || 30;
    if (!c.ultimoContacto) return true;
    const dias = Math.floor((new Date().getTime() - new Date(c.ultimoContacto).getTime()) / (1000 * 60 * 60 * 24));
    return dias > limite;
  }).length;

  const remitosPendientesEntregaCount = remitos.filter(r => {
    if (r.estado !== 'Borrador') return false;
    if (!r.fecha) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = r.fecha.split('-').map(Number);
    if (parts.length !== 3) return false;
    const deliveryDate = new Date(parts[0], parts[1] - 1, parts[2]);
    deliveryDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  if (!hasEntered) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white" id="presentation-screen">
        {/* Subtle grid patterns and glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header bar */}
        <header className="border-b border-slate-800 bg-slate-950/30 backdrop-blur-md relative z-10">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-black rounded-xl flex items-center justify-center text-xl shadow-lg ring-4 ring-indigo-500/15">
                {datosEmpresa.nombre.charAt(0).toUpperCase() || 'L'}
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-wide">{datosEmpresa.nombre}</h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{datosEmpresa.subtitulo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/60 border border-slate-700/50 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Terminal Online
              </span>
            </div>
          </div>
        </header>

        {/* Hero & Features Grid */}
        <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 relative z-10 flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Welcome & Tagline */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20 text-xs font-semibold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Control de Inventario y Despachos Homologado</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                Sistema Integral de Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">Distribución y Remitos</span>
              </h2>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl">
                Optimiza y despacha bultos con control automático de inventario, márgenes de ganancia calculados y previsualizaciones de impresión instantáneas listas para logística física.
              </p>

              {/* Enter Buttons with Module choice */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  id="btn-enter-admin"
                  onClick={() => requestModuleAccess('admin')}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Shield className="w-4.5 h-4.5" />
                  <span>Módulo Administrador</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-enter-deposito"
                  onClick={() => requestModuleAccess('deposito')}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-amber-400/30"
                >
                  <Boxes className="w-4.5 h-4.5" />
                  <span>Módulo Depósito (Sin Precios)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column: Features Bento List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-950/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-all duration-200 group">
                <div className="flex gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Emisión Automatizada</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Numeración secuencial única para cada remito con cambio de estado en vivo para rebajar stock de góndolas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-all duration-200 group">
                <div className="flex gap-4">
                  <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Escáner de Código SKU</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Soporte de lectura de código de barras físico con validación instantánea de disponibilidad y alertas acústicas integradas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-all duration-200 group">
                <div className="flex gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Base de Datos Protegida</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Mecanismos integrados para exportar e importar copias de seguridad en formato JSON de manera directa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 bg-slate-950/10 py-6 relative z-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 {datosEmpresa.nombre} — Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                v2.4.0-Estable
              </span>
              <span>•</span>
              <span>{datosEmpresa.subtitulo}</span>
            </div>
          </div>
        </footer>

        {/* Password Modal if password is required on initial enter */}
        {pendingModuleTarget && (
          <PasswordModal
            moduleTarget={pendingModuleTarget}
            expectedPassword={
              pendingModuleTarget === 'admin'
                ? securityConfig.adminPass
                : securityConfig.depositoPass
            }
            onSuccess={handlePasswordSuccess}
            onCancel={() => setPendingModuleTarget(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans print:bg-white print:min-h-0 print:block">
      
      {/* Sidebar Navigation - Hidden on Print */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 print:hidden">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-sky-400 text-white font-black rounded-xl flex items-center justify-center text-xl shadow-lg ring-2 ring-indigo-500/30">
                {datosEmpresa.nombre.charAt(0).toUpperCase() || 'L'}
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-wide">{datosEmpresa.nombre}</h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">{datosEmpresa.subtitulo}</p>
              </div>
            </div>
          </div>

          {/* Module Switcher Control in Sidebar */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Módulo del Portal</span>
              <span className={`px-1.5 py-0.5 text-[9px] rounded font-mono font-bold ${
                currentModule === 'admin' ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {currentModule === 'admin' ? 'ADMIN' : 'DEPÓSITO'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => requestModuleAccess('admin')}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentModule === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => requestModuleAccess('deposito')}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentModule === 'deposito'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Depósito</span>
              </button>
            </div>
          </div>

          {/* Nav List - Conditional based on Module */}
          {currentModule === 'admin' ? (
            <nav className="p-4 space-y-1">
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                <span>Resumen Principal</span>
              </button>
              <button
                id="tab-remitos"
                onClick={() => setActiveTab('remitos')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'remitos' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 shrink-0" />
                  <span>Remitos de Entrega</span>
                </div>
                {remitosPendientesEntregaCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full border border-indigo-400/50 shadow-2xs animate-pulse">
                    {remitosPendientesEntregaCount}
                  </span>
                )}
              </button>
              <button
                id="tab-clientes"
                onClick={() => setActiveTab('clientes')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'clientes' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 shrink-0" />
                  <span>Clientes</span>
                </div>
                {clientesRequierenContactoCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full border border-rose-400/50 shadow-2xs animate-pulse">
                    {clientesRequierenContactoCount}
                  </span>
                )}
              </button>
              <button
                id="tab-productos"
                onClick={() => setActiveTab('productos')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'productos' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <Box className="w-5 h-5 shrink-0" />
                  <span>Productos / Stock</span>
                </div>
                {productosBajoStock.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-red-600 text-white rounded-full border border-red-400/50 shadow-2xs animate-pulse">
                    {productosBajoStock.length}
                  </span>
                )}
              </button>
              <button
                id="tab-ingresos-stock"
                onClick={() => setActiveTab('ingresos-stock')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ingresos-stock' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <PackagePlus className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>Ingresos de Stock</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  {ingresosStock.length}
                </span>
              </button>
              <button
                id="tab-proveedores"
                onClick={() => setActiveTab('proveedores')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'proveedores' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
              >
                <Truck className="w-5 h-5 shrink-0" />
                <span>Proveedores</span>
              </button>
              <button
                id="tab-mi-empresa"
                onClick={() => setActiveTab('mi-empresa')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mi-empresa' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-slate-100'}`}
              >
                <Building2 className="w-5 h-5 shrink-0" />
                <span>Mi Empresa / Remitente</span>
              </button>
            </nav>
          ) : (
            <div className="p-4 space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl space-y-1.5">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                  MÓDULO DEPÓSITO ACTIVO
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Estás operando en la terminal de armado y recepción sin visibilidad de precios ni valores monetarios.
                </p>
              </div>

              <div className="p-2 space-y-1 text-slate-400 text-[11px]">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Preparación de Pedidos (Picking)
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Recepción de Mercadería a Stock
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Control de Productos y Conteos
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Import/Export Backup Actions in Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="text-slate-500 font-semibold tracking-wider uppercase px-2 mb-1 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Base de Datos Local</span>
          </div>
          
          <button
            onClick={exportAllData}
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Exportar Copia (.json)</span>
          </button>
          
          <label className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer">
            <Upload className="w-4 h-4 shrink-0" />
            <span>Importar Copia</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={importAllData} 
              className="hidden" 
            />
          </label>

          <button
            id="btn-logout"
            onClick={() => {
              setHasEntered(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 rounded-md transition-all mt-4 font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Cerrar Sesión / Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full print:p-0 print:max-w-none">
        
        {/* Topbar navigation inside main */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            {currentModule === 'admin' ? (
              <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Módulo Administrador</span>
              </span>
            ) : (
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <Boxes className="w-3.5 h-3.5 text-amber-700" />
                <span>Módulo Depósito (Sin Precios/Costos)</span>
              </span>
            )}
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-mono font-medium">{datosEmpresa.nombre}</span>
          </div>

          {/* Module switch quick button & Active status indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {currentModule === 'deposito' ? (
              <button
                onClick={() => requestModuleAccess('admin')}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Cambiar a Admin</span>
              </button>
            ) : (
              <button
                onClick={() => requestModuleAccess('deposito')}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Ir a Módulo Depósito</span>
              </button>
            )}

            <span className="text-slate-200 hidden sm:inline">|</span>

            <span className="hidden sm:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sincronizado Local</span>
            </span>
          </div>
        </div>

        {/* Active view renderer based on Module */}
        {currentModule === 'deposito' ? (
          <DepositoModule
            productos={productos}
            setProductos={setProductos}
            remitos={remitos}
            setRemitos={setRemitos}
            clientes={clientes}
            proveedores={proveedores}
            ingresosStock={ingresosStock}
            setIngresosStock={setIngresosStock}
            datosEmpresa={datosEmpresa}
            onPrintRemito={(remito) => setPrintingRemito(remito)}
            onSwitchToAdmin={() => requestModuleAccess('admin')}
          />
        ) : (
          <div className="print:hidden">
            {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-200" id="view-dashboard">
              {/* Welcome banner */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel de Control General</h1>
                <p className="text-slate-500 text-sm">Resumen de inventarios, despachos activos y clientes registrados.</p>
              </div>

              {/* Alert: Clientes pendientes de contacto */}
              {clientesRequierenContactoCount > 0 && (
                <div className="bg-gradient-to-r from-rose-50 via-rose-50/80 to-pink-50 border border-rose-200/80 rounded-xl p-4.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-rose-600 text-white rounded-xl shadow-xs shrink-0">
                      <PhoneCall className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-200/70 px-2 py-0.5 rounded">
                          Alerta de Seguimiento
                        </span>
                        <span className="text-xs text-rose-800 font-semibold">
                          CRM & Gestión Comercial
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {clientesRequierenContactoCount} cliente{clientesRequierenContactoCount > 1 ? 's requieren' : ' requiere'} contacto de seguimiento
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Has superado el tiempo límite configurado para realizar el contacto periódico.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('clientes')}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-center"
                  >
                    <span>Ver Clientes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Alert: Remitos con entrega próxima o atrasada */}
              {remitosPendientesEntregaCount > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 via-indigo-50/80 to-sky-50 border border-indigo-200/80 rounded-xl p-4.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                      <Truck className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-200/70 px-2 py-0.5 rounded">
                          Alerta de Despacho & Logística
                        </span>
                        <span className="text-xs text-indigo-800 font-semibold">
                          Remitos de Entrega Próxima
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {remitosPendientesEntregaCount} remito{remitosPendientesEntregaCount > 1 ? 's' : ''} con fecha de entrega inmediata o cercana
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Se mantiene la alerta para los remitos programados para entregarse en los próximos días o con entrega atrasada.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('remitos')}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 self-end sm:self-center"
                  >
                    <span>Ver Remitos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Alert: Productos con Bajo Stock / Reposición Urgente */}
              {productosBajoStock.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 via-rose-50/90 to-amber-50 border border-red-300 rounded-xl p-4.5 shadow-2xs space-y-3.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-red-600 text-white rounded-xl shadow-xs shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-red-900 bg-red-200/90 px-2 py-0.5 rounded">
                            Alerta de Reposición Urgente
                          </span>
                          <span className="text-xs text-red-800 font-bold">
                            Stock Crítico de Productos
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                          {productosBajoStock.length} producto{productosBajoStock.length > 1 ? 's' : ''} en nivel crítico (stock ≤ límite mínimo)
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Atención: Genera una orden de compra o registra un ingreso de stock para reponer mercadería.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setActiveTab('ingresos-stock')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>Cargar Ingreso</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('productos')}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Ver Catálogo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Low stock items chips list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-red-200/70">
                    {productosBajoStock.map((p) => {
                      const prov = proveedores.find(pr => pr.id === p.proveedorId);
                      const codInt = p.codigoInterno || p.codigo;
                      const minStock = p.stockMinimo ?? 10;
                      return (
                        <div key={p.id} className="bg-white/95 p-2.5 rounded-lg border border-red-200/90 shadow-2xs flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <div className="font-bold text-xs text-slate-900 truncate" title={p.nombre}>
                              {p.nombre}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              INT: {codInt} • {prov?.nombre || 'Sin Prov.'}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-red-600 font-mono bg-red-100 border border-red-200 px-1.5 py-0.5 rounded block">
                              {p.stock} u.
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                              (mín {minStock})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mejores Precios por Producto (Boton Acceso Directo) */}
              {productBestPriceGroups.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/90 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-200/80 px-2 py-0.5 rounded">
                          Precios Mínimos por Producto
                        </span>
                        <span className="text-xs text-emerald-800 font-bold">
                          {productBestPriceGroups.length} artículos en catálogo
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                        Filtro de Opciones Más Económicas por Proveedor
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('productos')}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Ver Opciones Más Económicas</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              )}

              {/* Status Stats Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Stat 1 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Remitos</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">{remitos.length}</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">En Preparación (Depósito)</span>
                    <span className="text-2xl font-black text-sky-700 font-mono">
                      {remitos.filter(r => r.estado === 'En Preparación').length}
                    </span>
                  </div>
                  <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
                    <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Listos para Entrega</span>
                    <span className="text-2xl font-black text-emerald-700 font-mono">
                      {remitos.filter(r => r.estado === 'Listo para Entrega').length}
                    </span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
                    <Truck className="w-5 h-5 animate-bounce" />
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Entregados</span>
                    <span className="text-2xl font-extrabold text-emerald-600 font-mono">{totalEntregas}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                </div>

                {/* Stat 5 */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valor Inventario</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      ${totalStockVal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
                    <Box className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Grid with recent items and statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recent Remitos Card (Left) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">Seguimiento de Pedidos y Remitos en Tiempo Real</h3>
                      <p className="text-xs text-slate-500">Estado de preparación en Depósito y despachos recientes</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('remitos')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      Ver gestión completa
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {remitos.slice(-5).reverse().map((r) => {
                      const client = clientes.find(c => c.id === r.clienteId);
                      const countPrepared = r.items.filter(i => i.preparado).length;
                      const totalItems = r.items.length;
                      const prepPct = totalItems > 0 ? Math.round((countPrepared / totalItems) * 100) : 0;

                      return (
                        <div key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 px-2.5 rounded-lg transition-colors">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-slate-900">{r.numero}</span>
                              <span className="text-xs text-slate-600 font-medium">— {client?.nombre || 'Desconocido'}</span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <span>Fecha: <strong>{r.fecha.split('-').reverse().join('/')}</strong></span>
                              <span>•</span>
                              <span>{totalItems} artículos ({r.items.reduce((a, b) => a + b.cantidad, 0)} bultos)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {/* Picking status badge */}
                            <div className="text-right">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                r.estado === 'En Preparación'
                                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                                  : r.estado === 'Listo para Entrega'
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black'
                                  : r.estado === 'Entregado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : r.estado === 'Cancelado'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {r.estado}
                              </span>
                              {totalItems > 0 && r.estado !== 'Entregado' && r.estado !== 'Cancelado' && (
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  Armado: {countPrepared}/{totalItems} ({prepPct}%)
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => setPrintingRemito(r)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 cursor-pointer"
                              title="Ver / Imprimir Remito"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {remitos.length === 0 && (
                      <p className="text-center py-6 text-xs text-slate-400">No hay remitos generados aún.</p>
                    )}
                  </div>
                </div>

                {/* Quick Shortcuts / Metrics (Right) */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 lg:col-span-4 space-y-5">
                  <h3 className="font-semibold text-slate-900">Registros y Atajos</h3>
                  
                  <div className="space-y-3 text-xs">
                    {/* Clientes */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-800">Clientes</p>
                          <p className="text-[10px] text-slate-400">Registrados activos</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-900">{clientes.length}</span>
                    </div>

                    {/* Productos */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Box className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-800">Productos</p>
                          <p className="text-[10px] text-slate-400">Items en catálogo</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-900">{productos.length}</span>
                    </div>

                    {/* Ingresos de Stock */}
                    <div 
                      onClick={() => setActiveTab('ingresos-stock')}
                      className="flex items-center justify-between p-3 bg-emerald-50/50 hover:bg-emerald-100/50 rounded-lg border border-emerald-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <PackagePlus className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-medium text-slate-800">Ingresos de Stock</p>
                          <p className="text-[10px] text-slate-500">Recepciones registradas</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded">
                        {ingresosStock.length}
                      </span>
                    </div>

                    {/* Proveedores */}
                    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-medium text-slate-800">Proveedores</p>
                          <p className="text-[10px] text-slate-400">Contactos asociados</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-900">{proveedores.length}</span>
                    </div>
                  </div>

                  {/* Creator quick triggers */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setActiveTab('remitos');
                        setTimeout(() => {
                          const btn = document.getElementById('btn-add-remito');
                          if (btn) btn.click();
                        }, 100);
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Emitir Remito Rápido
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('ingresos-stock');
                        setTimeout(() => {
                          const btn = document.getElementById('btn-add-ingreso-stock');
                          if (btn) btn.click();
                        }, 100);
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      Registrar Ingreso de Stock
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'remitos' && (
            <RemitosTab
              remitos={remitos}
              clientes={clientes}
              productos={productos}
              onAddRemito={handleAddRemito}
              onUpdateRemito={handleUpdateRemito}
              onDeleteRemito={handleDeleteRemito}
              onPrintRemito={(r) => setPrintingRemito(r)}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientesTab
              clientes={clientes}
              onAddCliente={handleAddCliente}
              onUpdateCliente={handleUpdateCliente}
              onDeleteCliente={handleDeleteCliente}
            />
          )}

          {activeTab === 'productos' && (
            <ProductosTab
              productos={productos}
              proveedores={proveedores}
              onAddProducto={handleAddProducto}
              onUpdateProducto={handleUpdateProducto}
              onDeleteProducto={handleDeleteProducto}
              onNavigateToIngresosStock={() => setActiveTab('ingresos-stock')}
            />
          )}

          {activeTab === 'ingresos-stock' && (
            <IngresosStockTab
              ingresos={ingresosStock}
              productos={productos}
              proveedores={proveedores}
              onAddIngreso={handleAddIngresoStock}
              onDeleteIngreso={handleDeleteIngresoStock}
            />
          )}

          {activeTab === 'proveedores' && (
            <ProveedoresTab
              proveedores={proveedores}
              onAddProveedor={handleAddProveedor}
              onUpdateProveedor={handleUpdateProveedor}
              onDeleteProveedor={handleDeleteProveedor}
            />
          )}

          {activeTab === 'mi-empresa' && (
            <MiEmpresaTab
              datosEmpresa={datosEmpresa}
              onUpdateDatosEmpresa={handleUpdateDatosEmpresa}
              securityConfig={securityConfig}
              onUpdateSecurityConfig={setSecurityConfig}
            />
          )}
        </div>
        )}
      </main>

      {/* Module Access Password Verification Modal */}
      {pendingModuleTarget && (
        <PasswordModal
          moduleTarget={pendingModuleTarget}
          expectedPassword={
            pendingModuleTarget === 'admin'
              ? securityConfig.adminPass
              : securityConfig.depositoPass
          }
          onSuccess={handlePasswordSuccess}
          onCancel={() => setPendingModuleTarget(null)}
        />
      )}

      {/* Printable Section Area (Only active/visible when printed or when printingRemito state is set) */}
      {printingRemito && (
        <RemitoPrintView
          remito={printingRemito}
          cliente={clientes.find(c => c.id === printingRemito.clienteId)}
          productos={productos}
          datosEmpresa={datosEmpresa}
          onClose={() => setPrintingRemito(null)}
        />
      )}
    </div>
  );
}
