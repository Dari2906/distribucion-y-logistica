import React, { useState } from 'react';
import { Producto, Proveedor } from '../types';
import { Plus, Search, Edit2, Trash2, X, AlertTriangle, BadgePercent, DollarSign, Tag, TrendingDown, PackagePlus, Award, Check } from 'lucide-react';
import { getBestPricesPerProduct } from '../utils/productUtils';

interface ProductosTabProps {
  productos: Producto[];
  proveedores: Proveedor[];
  onAddProducto: (p: Omit<Producto, 'id'>) => void;
  onUpdateProducto: (p: Producto) => void;
  onDeleteProducto: (id: string) => void;
  onNavigateToIngresosStock?: () => void;
}

export default function ProductosTab({
  productos,
  proveedores,
  onAddProducto,
  onUpdateProducto,
  onDeleteProducto,
  onNavigateToIngresosStock,
}: ProductosTabProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  // Form states
  const [codigoInterno, setCodigoInterno] = useState('');
  const [codigoProveedor, setCodigoProveedor] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [costo, setCosto] = useState(0);
  const [porcentajeGanancia, setPorcentajeGanancia] = useState(0);
  const [stock, setStock] = useState(0);
  const [stockMinimo, setStockMinimo] = useState(10);
  const [proveedorId, setProveedorId] = useState('');

  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [filterBestPricesOnly, setFilterBestPricesOnly] = useState(false);

  const openAddModal = () => {
    setEditingProducto(null);
    setCodigoInterno('');
    setCodigoProveedor('');
    setNombre('');
    setDescripcion('');
    setCosto(0);
    setPorcentajeGanancia(0);
    setStock(0);
    setStockMinimo(10);
    setProveedorId(proveedores[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Producto) => {
    setEditingProducto(p);
    setCodigoInterno(p.codigoInterno || p.codigo || '');
    setCodigoProveedor(p.codigoProveedor || '');
    setNombre(p.nombre);
    setDescripcion(p.descripcion);
    setCosto(p.costo || 0);
    setPorcentajeGanancia(p.porcentajeGanancia || 0);
    setStock(p.stock);
    setStockMinimo(p.stockMinimo ?? 10);
    setProveedorId(p.proveedorId);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoInterno.trim() || !nombre.trim() || !proveedorId) {
      alert('El Código Interno, Nombre y Proveedor son obligatorios.');
      return;
    }

    const calculatedPrecio = Number(costo) * (1 + Number(porcentajeGanancia) / 100);
    const finalCodInterno = codigoInterno.trim();
    const finalCodProv = codigoProveedor.trim() || undefined;

    if (editingProducto) {
      onUpdateProducto({
        id: editingProducto.id,
        codigoInterno: finalCodInterno,
        codigoProveedor: finalCodProv,
        codigo: finalCodInterno,
        nombre,
        descripcion,
        costo: Number(costo),
        porcentajeGanancia: Number(porcentajeGanancia),
        precio: calculatedPrecio,
        stock: Number(stock),
        stockMinimo: Number(stockMinimo),
        proveedorId,
      });
    } else {
      onAddProducto({
        codigoInterno: finalCodInterno,
        codigoProveedor: finalCodProv,
        codigo: finalCodInterno,
        nombre,
        descripcion,
        costo: Number(costo),
        porcentajeGanancia: Number(porcentajeGanancia),
        precio: calculatedPrecio,
        stock: Number(stock),
        stockMinimo: Number(stockMinimo),
        proveedorId,
      });
    }
    setIsModalOpen(false);
  };

  const getProveedorName = (id: string) => {
    const prov = proveedores.find(p => p.id === id);
    return prov ? prov.nombre : 'Proveedor no encontrado';
  };

  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'stock_asc' | 'best_price_group'>('default');

  const lowStockProducts = productos.filter(p => p.stock <= (p.stockMinimo ?? 10));

  // Compute best prices per product (grouped by SKU/Internal Code or Name)
  const productBestPriceGroups = getBestPricesPerProduct(productos);
  const groupMap = new Map<string, typeof productBestPriceGroups[0]>();
  productBestPriceGroups.forEach(g => {
    groupMap.set(g.key, g);
  });

  let filtered = productos.filter(p => {
    const isLowStock = p.stock <= (p.stockMinimo ?? 10);
    if (filterLowStockOnly && !isLowStock) return false;

    const rawKey = (p.codigoInterno || p.codigo || p.nombre).trim().toUpperCase();
    const group = groupMap.get(rawKey);
    const isBestInGroup = group ? group.bestPriceItem.id === p.id : true;

    if (filterBestPricesOnly && !isBestInGroup) return false;

    const searchLower = search.toLowerCase();
    const codInt = (p.codigoInterno || p.codigo || '').toLowerCase();
    const codProv = (p.codigoProveedor || '').toLowerCase();
    const name = p.nombre.toLowerCase();
    const provName = getProveedorName(p.proveedorId).toLowerCase();

    return (
      name.includes(searchLower) ||
      codInt.includes(searchLower) ||
      codProv.includes(searchLower) ||
      provName.includes(searchLower)
    );
  });

  if (sortBy === 'price_asc') {
    filtered = [...filtered].sort((a, b) => a.precio - b.precio);
  } else if (sortBy === 'price_desc') {
    filtered = [...filtered].sort((a, b) => b.precio - a.precio);
  } else if (sortBy === 'stock_asc') {
    filtered = [...filtered].sort((a, b) => a.stock - b.stock);
  } else if (sortBy === 'best_price_group') {
    filtered = [...filtered].sort((a, b) => {
      const keyA = (a.codigoInterno || a.codigo || a.nombre).trim().toUpperCase();
      const keyB = (b.codigoInterno || b.codigo || b.nombre).trim().toUpperCase();
      const groupA = groupMap.get(keyA);
      const groupB = groupMap.get(keyB);
      const isBestA = groupA?.bestPriceItem.id === a.id ? 0 : 1;
      const isBestB = groupB?.bestPriceItem.id === b.id ? 0 : 1;
      if (isBestA !== isBestB) return isBestA - isBestB;
      return a.precio - b.precio;
    });
  }

  return (
    <div className="space-y-6" id="productos-tab">
      {/* Header section inside tab */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Catálogo de Productos</h2>
          <p className="text-sm text-slate-500">Gestiona los artículos de inventario, costos, margen de ganancias y stock disponible</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToIngresosStock && (
            <button
              onClick={onNavigateToIngresosStock}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-sm font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <PackagePlus className="w-4 h-4 text-emerald-600" />
              <span>Registrar / Ver Ingresos de Stock</span>
            </button>
          )}
          <button
            id="btn-add-producto"
            onClick={openAddModal}
            disabled={proveedores.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {proveedores.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Debes cargar al menos un <strong>Proveedor</strong> antes de poder cargar productos en el catálogo.</span>
        </div>
      )}

      {/* Notice Banner when filtering best prices */}
      {filterBestPricesOnly && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-wrap items-center justify-between gap-3 text-emerald-950 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 font-semibold">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Filtrado activo: Mostrando <strong>únicamente la opción con el mejor precio proveedor</strong> para cada producto ({filtered.length} ítems económicos).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterBestPricesOnly(false)}
            className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold rounded-lg text-xs cursor-pointer shadow-2xs transition-colors"
          >
            Ver Todos los Proveedores
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            id="search-producto"
            type="text"
            placeholder="Buscar por nombre, código SKU o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setFilterBestPricesOnly(!filterBestPricesOnly)}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
              filterBestPricesOnly
                ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-400/40'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Award className={`w-3.5 h-3.5 ${filterBestPricesOnly ? 'text-white' : 'text-emerald-700'}`} />
            <span>{filterBestPricesOnly ? '✓ Mostrando Opciones Más Económicas' : 'Ver Opciones Más Económicas'}</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ${
              filterLowStockOnly
                ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                : lowStockProducts.length > 0
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filterLowStockOnly ? 'text-white' : lowStockProducts.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>
              {filterLowStockOnly ? 'Mostrando Bajo Stock' : 'Ver Bajo Stock'} ({lowStockProducts.length})
            </span>
          </button>

          <span className="text-xs text-slate-500 font-medium shrink-0">Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-800 font-semibold text-xs rounded-lg px-3 py-2 focus:outline-hidden cursor-pointer shadow-2xs"
          >
            <option value="default">Por Defecto</option>
            <option value="best_price_group">🏆 Destacar Mejores Precios por Producto</option>
            <option value="price_asc">🏷️ Precio: Menor a Mayor</option>
            <option value="price_desc">💵 Precio: Mayor a Menor</option>
            <option value="stock_asc">📦 Stock: Menor a Mayor</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No se encontraron productos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Códigos (Interno / Proveedor)</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre del Producto</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo Base</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ganancia %</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">P. Venta</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const rawKey = (p.codigoInterno || p.codigo || p.nombre).trim().toUpperCase();
                  const group = groupMap.get(rawKey);
                  const isBestPriceInGroup = group ? group.bestPriceItem.id === p.id : true;
                  const hasMultipleSuppliers = group ? group.hasMultipleSuppliers : false;
                  const diffVsBest = group ? p.precio - group.minPrecio : 0;

                  const codInt = p.codigoInterno || p.codigo;
                  const codProv = p.codigoProveedor;
                  const minStock = p.stockMinimo ?? 10;
                  const isLowStock = p.stock <= minStock;

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isLowStock
                          ? 'bg-red-50/60 hover:bg-red-50/90'
                          : isBestPriceInGroup
                          ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded shrink-0">
                              INT:
                            </span>
                            <span className="font-mono text-xs bg-slate-900 text-white px-2 py-0.5 rounded font-bold shadow-2xs">
                              {codInt}
                            </span>
                          </div>
                          {codProv ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded shrink-0">
                                PROV:
                              </span>
                              <span className="font-mono text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-200/80 px-2 py-0.5 rounded font-semibold">
                                {codProv}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic block">Sin cod. proveedor</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-900 flex items-center gap-1.5 flex-wrap">
                            <span>{p.nombre}</span>
                            {isLowStock && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-md shadow-2xs uppercase tracking-wider animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> Reposición Urgente
                              </span>
                            )}
                            {isBestPriceInGroup && !isLowStock && (
                              hasMultipleSuppliers ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full shadow-2xs uppercase tracking-wider">
                                  <Award className="w-3 h-3" /> MEJOR PRECIO PROVEEDOR
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded-md">
                                  <Check className="w-2.5 h-2.5 text-emerald-400" /> PRECIO MÍNIMO
                                </span>
                              )
                            )}
                            {!isBestPriceInGroup && !isLowStock && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold rounded-md">
                                +${diffVsBest.toLocaleString('es-AR')} vs {getProveedorName(group?.bestPriceItem.proveedorId || '')} (${group?.minPrecio.toLocaleString('es-AR')})
                              </span>
                            )}
                          </div>
                          {p.descripcion && (
                            <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate" title={p.descripcion}>
                              {p.descripcion}
                            </div>
                          )}
                        </div>
                      </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 font-medium">
                        {getProveedorName(p.proveedorId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-500">
                        ${(p.costo || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        +{p.porcentajeGanancia || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-900 font-bold">
                        ${p.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-900 border border-red-300 rounded-lg text-xs font-black shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>{p.stock} u.</span>
                          </div>
                          <span className="text-[10px] text-red-700 font-extrabold block">
                            Mínimo: {minStock} u.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${p.stock > minStock * 2 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span className="font-mono text-sm text-slate-800 font-medium">
                            {p.stock} u.
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            (mín {minStock})
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Seguro que deseas eliminar el producto "${p.nombre}"?`)) {
                              onDeleteProducto(p.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                          title="Eliminar"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>Código Interno (SKU Empresa) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. INT-001"
                    value={codigoInterno}
                    onChange={(e) => setCodigoInterno(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block">Código propio para control interno</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <span>Código de Proveedor</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. PROV-UTP-305"
                    value={codigoProveedor}
                    onChange={(e) => setCodigoProveedor(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block">SKU/código según factura del proveedor</span>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Proveedor Habitual *</label>
                  <select
                    required
                    value={proveedorId}
                    onChange={(e) => setProveedorId(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors font-medium"
                  >
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.ciudad || 'Proveedor'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bobina Cable UTP Cat6 305m"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Descripción</label>
                  <textarea
                    placeholder="Escribe detalles adicionales..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={2}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Costo Base ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={costo || ''}
                    onChange={(e) => setCosto(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Porcentaje de Ganancia (%) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    placeholder="Ej. 30"
                    value={porcentajeGanancia || ''}
                    onChange={(e) => setPorcentajeGanancia(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors font-mono"
                  />
                </div>

                {/* Selling Price Calculation display */}
                <div className="sm:col-span-2 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                    <span>Precio de Venta Calculado</span>
                    <span className="text-emerald-600 font-mono font-bold">
                      Ganancia: +${(Number(costo) * Number(porcentajeGanancia) / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono mt-1">
                    ${(Number(costo) * (1 + Number(porcentajeGanancia) / 100)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-400">Se actualiza de forma automática según el Costo y la Ganancia ingresados.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Stock Actual *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={stock || ''}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Stock Mínimo (Alerta) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="10"
                    value={stockMinimo || ''}
                    onChange={(e) => setStockMinimo(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 bg-amber-50/50 border border-amber-200 rounded-lg focus:outline-hidden focus:border-amber-600 focus:bg-white transition-colors font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block">Genera alerta cuando stock ≤ este valor</span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {editingProducto ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
