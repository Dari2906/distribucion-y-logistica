import React, { useState, useEffect, useRef } from 'react';
import { Remito, Cliente, Producto, RemitoItem } from '../types';
import { Plus, Search, Eye, CheckCircle2, AlertCircle, Trash2, X, PlusCircle, FileText, Ban, Scan, ListFilter, AlertTriangle, Edit2, Truck, Calendar, Clock, Sliders } from 'lucide-react';

interface RemitosTabProps {
  remitos: Remito[];
  clientes: Cliente[];
  productos: Producto[];
  onAddRemito: (r: Omit<Remito, 'id' | 'numero'>) => void;
  onUpdateRemito: (r: Remito) => void;
  onDeleteRemito: (id: string) => void;
  onPrintRemito: (r: Remito) => void;
}

export default function RemitosTab({
  remitos,
  clientes,
  productos,
  onAddRemito,
  onUpdateRemito,
  onDeleteRemito,
  onPrintRemito,
}: RemitosTabProps) {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRemito, setEditingRemito] = useState<Remito | null>(null);

  // Form states
  const [clienteId, setClienteId] = useState('');
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<RemitoItem[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [estado, setEstado] = useState<'Borrador' | 'Entregado'>('Borrador');

  // Input modes for adding products
  const [addMethod, setAddMethod] = useState<'scan' | 'manual'>('scan');

  // Barcode / SKU scanning state
  const [skuInput, setSkuInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Sub-form state for manual product adding
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantityInput, setQuantityInput] = useState<number>(1);

  // Ref to automatically focus the barcode input
  const scanInputRef = useRef<HTMLInputElement>(null);

  const getClienteName = (id: string) => {
    const cli = clientes.find((c) => c.id === id);
    return cli ? cli.nombre : 'Cliente Desconocido';
  };

  const getProductInfo = (id: string) => {
    return productos.find((p) => p.id === id);
  };

  const openAddForm = () => {
    setEditingRemito(null);
    setClienteId(clientes[0]?.id || '');
    setFecha(new Date().toISOString().split('T')[0]);
    setItems([]);
    setObservaciones('');
    setEstado('Borrador');
    setSelectedProductId(productos[0]?.id || '');
    setQuantityInput(1);
    setSkuInput('');
    setScanMessage(null);
    setAddMethod('scan');
    setIsFormOpen(true);
  };

  const openEditForm = (remito: Remito) => {
    setEditingRemito(remito);
    setClienteId(remito.clienteId);
    setFecha(remito.fecha);
    setItems(remito.items);
    setObservaciones(remito.observaciones || '');
    setEstado(remito.estado as 'Borrador' | 'Entregado');
    setSelectedProductId(productos[0]?.id || '');
    setQuantityInput(1);
    setSkuInput('');
    setScanMessage(null);
    setAddMethod('scan');
    setIsFormOpen(true);
  };

  // Focus scanning input when form opens or when tab changes to 'scan'
  useEffect(() => {
    if (isFormOpen && addMethod === 'scan') {
      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 150);
    }
  }, [isFormOpen, addMethod]);

  // Handle SKU Scanning or typing
  const handleSkuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSku = skuInput.trim().toUpperCase();
    if (!cleanSku) return;

    // Find the product by exact internal code or supplier code
    const foundProduct = productos.find(
      (p) =>
        (p.codigoInterno && p.codigoInterno.trim().toUpperCase() === cleanSku) ||
        (p.codigoProveedor && p.codigoProveedor.trim().toUpperCase() === cleanSku) ||
        p.codigo.trim().toUpperCase() === cleanSku
    );

    if (!foundProduct) {
      setScanMessage({
        text: `❌ Código "${cleanSku}" no encontrado en el catálogo.`,
        isError: true,
      });
      // Play a quick buzzer sound for scanners if desired (using Web Audio API for feedback)
      playAudioBeep(false);
      return;
    }

    if (quantityInput <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    // Check if item is already in the list
    const existingIndex = items.findIndex((item) => item.productoId === foundProduct.id);
    if (existingIndex > -1) {
      const updatedItems = [...items];
      const newQty = updatedItems[existingIndex].cantidad + quantityInput;

      // Validate stock
      if (newQty > foundProduct.stock) {
        setScanMessage({
          text: `⚠️ Stock insuficiente para "${foundProduct.nombre}". Disponible: ${foundProduct.stock} u.`,
          isError: true,
        });
        playAudioBeep(false);
        return;
      }
      updatedItems[existingIndex].cantidad = newQty;
      setItems(updatedItems);
    } else {
      // Validate stock for new item
      if (quantityInput > foundProduct.stock) {
        setScanMessage({
          text: `⚠️ Stock insuficiente para "${foundProduct.nombre}". Disponible: ${foundProduct.stock} u.`,
          isError: true,
        });
        playAudioBeep(false);
        return;
      }
      setItems([
        ...items,
        {
          productoId: foundProduct.id,
          cantidad: quantityInput,
          precioUnitario: foundProduct.precio,
        },
      ]);
    }

    // Successful scan feedback
    setScanMessage({
      text: `✅ ${foundProduct.nombre} (Cod: ${foundProduct.codigo}) agregado con éxito.`,
      isError: false,
    });
    playAudioBeep(true);

    // Clear input & reset quantity to 1 for the next scan
    setSkuInput('');
    setQuantityInput(1);

    // Refocus the scanning field
    scanInputRef.current?.focus();
  };

  // Simple browser sound feedback using Web Audio API for warehouse feel
  const playAudioBeep = (isSuccess: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // AudioContext could be blocked by browser policy, ignore
    }
  };

  // Manual Dropdown product addition
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const prod = getProductInfo(selectedProductId);
    if (!prod) return;

    if (quantityInput <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    const existingIndex = items.findIndex((item) => item.productoId === selectedProductId);
    if (existingIndex > -1) {
      const updatedItems = [...items];
      const newQty = updatedItems[existingIndex].cantidad + quantityInput;

      if (newQty > prod.stock) {
        alert(`No hay suficiente stock disponible. Stock máximo: ${prod.stock}`);
        return;
      }
      updatedItems[existingIndex].cantidad = newQty;
      setItems(updatedItems);
    } else {
      if (quantityInput > prod.stock) {
        alert(`No hay suficiente stock disponible. Stock máximo: ${prod.stock}`);
        return;
      }
      setItems([
        ...items,
        {
          productoId: selectedProductId,
          cantidad: quantityInput,
          precioUnitario: prod.precio,
        },
      ]);
    }

    // Reset inputs
    setQuantityInput(1);
    setScanMessage({
      text: `✅ ${prod.nombre} agregado manualmente.`,
      isError: false,
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveRemito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      alert('Debes seleccionar un cliente');
      return;
    }
    if (items.length === 0) {
      alert('Debes agregar al menos un producto al remito');
      return;
    }

    if (editingRemito) {
      onUpdateRemito({
        ...editingRemito,
        fecha,
        clienteId,
        items,
        observaciones,
        estado,
      });
    } else {
      onAddRemito({
        fecha,
        clienteId,
        items,
        observaciones,
        estado,
      });
    }

    setIsFormOpen(false);
  };

  const handleMarkAsEntregado = (remito: Remito) => {
    // Validate stock constraints first
    let stockValid = true;
    for (const item of remito.items) {
      const prod = getProductInfo(item.productoId);
      if (prod && prod.stock < item.cantidad) {
        alert(`No se puede entregar. El producto "${prod.nombre}" tiene stock insuficiente (${prod.stock} disponible, se solicitan ${item.cantidad}).`);
        stockValid = false;
        break;
      }
    }

    if (!stockValid) return;

    onUpdateRemito({
      ...remito,
      estado: 'Entregado',
    });
  };

  const handleCancelRemito = (remito: Remito) => {
    if (confirm(`¿Seguro que deseas anular el remito ${remito.numero}?`)) {
      onUpdateRemito({
        ...remito,
        estado: 'Cancelado',
      });
    }
  };

  // Delivery alert configuration
  const [diasAlertaEntrega, setDiasAlertaEntrega] = useState<number>(3);
  const [filtroFase, setFiltroFase] = useState<'todos' | 'proximos' | 'borrador' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'>('todos');

  const getDaysUntilDelivery = (fechaStr: string) => {
    if (!fechaStr) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = fechaStr.split('-').map(Number);
    if (parts.length !== 3) return 999;
    const deliveryDate = new Date(parts[0], parts[1] - 1, parts[2]);
    deliveryDate.setHours(0, 0, 0, 0);
    const diffTime = deliveryDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const isRemitoProximo = (r: Remito) => {
    if (r.estado === 'Entregado' || r.estado === 'Cancelado') return false;
    const diff = getDaysUntilDelivery(r.fecha);
    return diff <= diasAlertaEntrega;
  };

  const remitosProximos = remitos.filter(isRemitoProximo);

  const filtered = remitos.filter((r) => {
    const cliName = getClienteName(r.clienteId).toLowerCase();
    const searchLower = search.toLowerCase();
    const matchesSearch = r.numero.toLowerCase().includes(searchLower) || cliName.includes(searchLower);

    if (!matchesSearch) return false;

    if (filtroFase === 'proximos') return isRemitoProximo(r);
    if (filtroFase === 'borrador') return r.estado === 'Borrador';
    if (filtroFase === 'en_preparacion') return r.estado === 'En Preparación';
    if (filtroFase === 'listo') return r.estado === 'Listo para Entrega';
    if (filtroFase === 'entregado') return r.estado === 'Entregado';
    if (filtroFase === 'cancelado') return r.estado === 'Cancelado';
    return true;
  });

  const getStatusBadge = (status: Remito['estado']) => {
    switch (status) {
      case 'En Preparación':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-sky-600 animate-spin" style={{ animationDuration: '3s' }} />
            En Preparación (Depósito)
          </span>
        );
      case 'Listo para Entrega':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-400 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-emerald-700 animate-bounce" />
            Listo para Entrega
          </span>
        );
      case 'Entregado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Entregado
          </span>
        );
      case 'Borrador':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            Borrador
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3.5 h-3.5 text-rose-500" />
            Anulado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const activeProduct = getProductInfo(selectedProductId);

  return (
    <div className="space-y-6" id="remitos-tab">
      {/* Header section inside tab */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Remitos de Entrega</span>
            {remitosProximos.length > 0 && (
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full border border-indigo-200 animate-pulse">
                {remitosProximos.length} ent. pendientes
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500">Crea, consulta y despacha remitos con previsualización para impresión rápida y alertas previas de entrega</p>
        </div>
        <button
          id="btn-add-remito"
          onClick={openAddForm}
          disabled={clientes.length === 0 || productos.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Remito
        </button>
      </div>

      {/* Delivery Alert Panel & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl shrink-0 ${remitosProximos.length > 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/10 rounded text-slate-200">
                  Control de Despachos & Logística
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  Alertas de Fecha de Entrega
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {remitosProximos.length === 0 ? (
                  <span className="text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> No hay entregas pendientes para los próximos días.
                  </span>
                ) : (
                  <span className="text-amber-300">
                    Tienes {remitosProximos.length} remito{remitosProximos.length > 1 ? 's' : ''} con fecha de entrega próxima o pendiente
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Configurable Alert Threshold Dropdown */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs self-stretch md:self-auto justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sliders className="w-4 h-4 text-indigo-300" />
              <span>Avisar con anticipación:</span>
            </div>
            <select
              value={diasAlertaEntrega}
              onChange={(e) => setDiasAlertaEntrega(Number(e.target.value))}
              className="bg-slate-800 text-white font-bold rounded px-2.5 py-1 text-xs border border-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value={1}>1 día antes (Mañana/Hoy)</option>
              <option value={2}>2 días antes</option>
              <option value={3}>3 días antes (Predeterminado)</option>
              <option value={5}>5 días antes</option>
              <option value={7}>7 días antes (1 semana)</option>
            </select>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl w-full lg:w-auto">
            <button
              onClick={() => setFiltroFase('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filtroFase === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Todos ({remitos.length})
            </button>
            <button
              onClick={() => setFiltroFase('proximos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${filtroFase === 'proximos' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-300 hover:text-indigo-200'}`}
            >
              <span>⏰ Alertas</span>
              <span className="bg-indigo-950/50 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {remitosProximos.length}
              </span>
            </button>
            <button
              onClick={() => setFiltroFase('borrador')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filtroFase === 'borrador' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Borradores ({remitos.filter(r => r.estado === 'Borrador').length})
            </button>
            <button
              onClick={() => setFiltroFase('en_preparacion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${filtroFase === 'en_preparacion' ? 'bg-sky-600 text-white shadow-xs' : 'text-sky-300 hover:text-sky-200'}`}
            >
              <span>En Preparación ({remitos.filter(r => r.estado === 'En Preparación').length})</span>
            </button>
            <button
              onClick={() => setFiltroFase('listo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${filtroFase === 'listo' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-300 hover:text-emerald-200'}`}
            >
              <span>Listo p/ Entrega ({remitos.filter(r => r.estado === 'Listo para Entrega').length})</span>
            </button>
            <button
              onClick={() => setFiltroFase('entregado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filtroFase === 'entregado' ? 'bg-emerald-800 text-white shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Entregados ({remitos.filter(r => r.estado === 'Entregado').length})
            </button>
            <button
              onClick={() => setFiltroFase('cancelado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filtroFase === 'cancelado' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Anulados ({remitos.filter(r => r.estado === 'Cancelado').length})
            </button>
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-remito"
              type="text"
              placeholder="Buscar remito o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 text-xs text-white placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:outline-hidden focus:bg-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {clientes.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Debes cargar al menos un <strong>Cliente</strong> antes de poder generar remitos.</span>
        </div>
      )}

      {/* Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No se encontraron remitos cargados para este filtro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Remito N°</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bultos / Items</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado Depósito</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones / Cambio Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => {
                  const diff = getDaysUntilDelivery(r.fecha);
                  const isPendingAlert = r.estado !== 'Entregado' && r.estado !== 'Cancelado' && diff <= diasAlertaEntrega;
                  const countPrepared = r.items.filter(i => i.preparado).length;
                  const totalItems = r.items.length;
                  const prepPct = totalItems > 0 ? Math.round((countPrepared / totalItems) * 100) : 0;

                  return (
                    <tr 
                      key={r.id} 
                      className={`transition-colors ${isPendingAlert ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-sm font-semibold text-slate-900">
                            {r.numero}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900 font-medium">
                          {r.fecha.split('-').reverse().join('/')}
                        </div>
                        {r.estado !== 'Entregado' && r.estado !== 'Cancelado' && (
                          <div className="mt-0.5">
                            {diff < 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold rounded-full">
                                <Clock className="w-3 h-3 text-rose-600 animate-pulse" /> Atrasado ({Math.abs(diff)}d)
                              </span>
                            )}
                            {diff === 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold rounded-full shadow-2xs">
                                <Truck className="w-3 h-3 text-amber-700 animate-bounce" /> ¡ENTREGA HOY!
                              </span>
                            )}
                            {diff > 0 && diff <= diasAlertaEntrega && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold rounded-full">
                                <Calendar className="w-3 h-3 text-indigo-600" /> Entrega en {diff}d
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{getClienteName(r.clienteId)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-slate-700 font-medium">
                          {r.items.reduce((acc, item) => acc + item.cantidad, 0)} bultos ({r.items.length} art.)
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {getStatusBadge(r.estado)}
                          {r.items.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                              <span>Armado: {countPrepared}/{totalItems}</span>
                              <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200 inline-block">
                                <div
                                  className={`h-full transition-all ${
                                    prepPct === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                                  }`}
                                  style={{ width: `${prepPct}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick state selector dropdown */}
                        <select
                          value={r.estado}
                          onChange={(e) => {
                            const newSt = e.target.value as Remito['estado'];
                            if (newSt === 'Entregado') {
                              handleMarkAsEntregado(r);
                            } else {
                              onUpdateRemito({ ...r, estado: newSt });
                            }
                          }}
                          className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 py-1.5 px-2 rounded-lg focus:outline-none cursor-pointer"
                          title="Cambiar estado del pedido"
                        >
                          <option value="Borrador">Borrador</option>
                          <option value="En Preparación">En Preparación</option>
                          <option value="Listo para Entrega">Listo para Entrega</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Anulado</option>
                        </select>

                        <button
                          onClick={() => onPrintRemito(r)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Ver e Imprimir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditForm(r)}
                          className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                          title="Editar Remito"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Seguro que deseas eliminar el registro del remito ${r.numero}?`)) {
                              onDeleteRemito(r.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Wizard / Panel Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingRemito ? `Editar Remito ${editingRemito.numero}` : 'Generar Nuevo Remito'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <form onSubmit={handleSaveRemito} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {/* Core Remito Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Cliente *</label>
                  <select
                    required
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  >
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} (CUIT/DNI: {c.cuitDni})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Fecha de Emisión *</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Added Items Section Switcher */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Agregar Artículos al Remito
                  </h4>
                  {/* Selector for input method */}
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => setAddMethod('scan')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${addMethod === 'scan' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Scan className="w-3.5 h-3.5" />
                      Lector / Código (SKU)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMethod('manual')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${addMethod === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <ListFilter className="w-3.5 h-3.5" />
                      Catálogo Manual
                    </button>
                  </div>
                </div>

                {/* MODE A: Barcode scanner / SKU type-in */}
                {addMethod === 'scan' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-6 space-y-1">
                        <label className="text-xs font-medium text-slate-600">
                          Código de Barras / SKU del Artículo
                        </label>
                        <input
                          id="sku-scan-input"
                          ref={scanInputRef}
                          type="text"
                          placeholder="Escanea o escribe código SKU y presiona Enter..."
                          value={skuInput}
                          onChange={(e) => setSkuInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSkuSubmit(e);
                            }
                          }}
                          className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 font-mono transition-all placeholder-slate-400"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-xs font-medium text-slate-600">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={quantityInput || ''}
                          onChange={(e) => setQuantityInput(Math.max(1, Number(e.target.value)))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSkuSubmit(e);
                            }
                          }}
                          className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-slate-950 font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          onClick={handleSkuSubmit}
                          disabled={!skuInput.trim()}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Scan className="w-4 h-4" />
                          Escanear / Cargar
                        </button>
                      </div>
                    </div>

                    {/* Quick feedback message */}
                    {scanMessage && (
                      <div className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 animate-in fade-in duration-100 ${scanMessage.isError ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                        {scanMessage.isError ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        <span>{scanMessage.text}</span>
                      </div>
                    )}

                    {/* Quick list of SKUs for testing / operator convenience */}
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SKUs Disponibles en Catálogo (Click para autocompletar):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {productos.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSkuInput(p.codigo);
                              setScanMessage(null);
                              setTimeout(() => scanInputRef.current?.focus(), 50);
                            }}
                            className="text-[10px] font-mono font-medium px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-200 hover:text-slate-900 transition-colors"
                          >
                            {p.codigo} ({p.stock}u.)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MODE B: Manual Product Select Dropdown */
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-xs font-medium text-slate-600">Seleccionar Producto</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => {
                          setSelectedProductId(e.target.value);
                          setQuantityInput(1);
                        }}
                        className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 transition-colors"
                      >
                        <option value="">-- Seleccionar Artículo --</option>
                        {productos.map((p) => {
                          const codInt = p.codigoInterno || p.codigo;
                          const codProvStr = p.codigoProveedor ? ` | Prov: ${p.codigoProveedor}` : '';
                          return (
                            <option key={p.id} value={p.id}>
                              [Int: {codInt}{codProvStr}] {p.nombre} (${p.precio.toLocaleString('es-AR')})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-slate-600">Cantidad</label>
                        {activeProduct && (
                          <span className="text-[10px] text-slate-500 font-semibold font-mono">
                            Stock: {activeProduct.stock}
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max={activeProduct?.stock || 99999}
                        value={quantityInput || ''}
                        onChange={(e) => setQuantityInput(Math.max(1, Number(e.target.value)))}
                        className="w-full text-sm px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 transition-colors font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        onClick={handleAddManualItem}
                        disabled={!selectedProductId}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Added Items List */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Detalle del Remito ({items.length} productos)
                </label>

                {items.length === 0 ? (
                  <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs text-slate-400">Ningún producto agregado aún. Utiliza el lector de código superior o la selección de catálogo.</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-2 font-semibold text-slate-600">Producto / Código</th>
                          <th className="px-4 py-2 font-semibold text-slate-600 text-center">Cantidad</th>
                          <th className="px-4 py-2 font-semibold text-slate-600 text-right">Precio Unit.</th>
                          <th className="px-4 py-2 font-semibold text-slate-600 text-right">Subtotal</th>
                          <th className="px-4 py-2 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => {
                          const prod = getProductInfo(item.productoId);
                          return (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">{prod?.nombre}</div>
                                <div className="text-[10px] font-mono text-slate-500">{prod?.codigo}</div>
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                                {item.cantidad}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-slate-600">
                                ${item.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                                ${(item.cantidad * item.precioUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-bold border-t border-slate-200">
                          <td colSpan={3} className="px-4 py-3 text-right text-slate-700">TOTAL ESTIMADO</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-900 text-sm">
                            ${items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Observations */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Observaciones / Dirección de Entrega</label>
                <textarea
                  placeholder="Ej. Entregar por la rampa de carga trasera de 8:00 a 12:00 hs."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Status / State selection */}
              <div className="space-y-2 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <label className="text-xs font-semibold text-slate-700 block">Estado del Remito / Pedido</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-2 ${estado === 'Borrador' ? 'bg-amber-50 border-amber-300 font-bold text-amber-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                    <input
                      type="radio"
                      name="estado"
                      checked={estado === 'Borrador'}
                      onChange={() => setEstado('Borrador')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Borrador</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-2 ${estado === 'En Preparación' ? 'bg-sky-50 border-sky-300 font-bold text-sky-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                    <input
                      type="radio"
                      name="estado"
                      checked={estado === 'En Preparación'}
                      onChange={() => setEstado('En Preparación')}
                      className="text-sky-600 focus:ring-sky-500"
                    />
                    <span>En Preparación (Depósito)</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-2 ${estado === 'Listo para Entrega' ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                    <input
                      type="radio"
                      name="estado"
                      checked={estado === 'Listo para Entrega'}
                      onChange={() => setEstado('Listo para Entrega')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Listo para Entrega</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-2 ${estado === 'Entregado' ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-950' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                    <input
                      type="radio"
                      name="estado"
                      checked={estado === 'Entregado'}
                      onChange={() => setEstado('Entregado')}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span>Entregado (Descuenta Stock)</span>
                  </label>

                  <label className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-2 ${estado === 'Cancelado' ? 'bg-rose-50 border-rose-300 font-bold text-rose-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                    <input
                      type="radio"
                      name="estado"
                      checked={estado === 'Cancelado'}
                      onChange={() => setEstado('Cancelado')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Anulado</span>
                  </label>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Confirmar y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
