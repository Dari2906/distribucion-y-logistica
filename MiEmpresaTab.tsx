import React, { useState } from 'react';
import { Cliente } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  BellRing, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  Sliders,
  Sparkles,
  PhoneCall
} from 'lucide-react';

interface ClientesTabProps {
  clientes: Cliente[];
  onAddCliente: (c: Omit<Cliente, 'id'>) => void;
  onUpdateCliente: (c: Cliente) => void;
  onDeleteCliente: (id: string) => void;
}

export default function ClientesTab({
  clientes,
  onAddCliente,
  onUpdateCliente,
  onDeleteCliente,
}: ClientesTabProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Global configurable alert threshold
  const [diasAlertaGlobal, setDiasAlertaGlobal] = useState<number>(30);
  const [filtroAlerta, setFiltroAlerta] = useState<'todos' | 'pendientes' | 'aldia'>('todos');

  // Quick contact log modal
  const [quickContactCliente, setQuickContactCliente] = useState<Cliente | null>(null);
  const [quickContactFecha, setQuickContactFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [quickContactNota, setQuickContactNota] = useState<string>('');

  // Form states for full add/edit
  const [nombre, setNombre] = useState('');
  const [cuitDni, setCuitDni] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [ultimoContacto, setUltimoContacto] = useState('');
  const [frecuenciaContactoDias, setFrecuenciaContactoDias] = useState<number>(30);
  const [notasContacto, setNotasContacto] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const getDaysSinceContact = (ultimoContactoDateStr?: string) => {
    if (!ultimoContactoDateStr) return Infinity;
    const last = new Date(ultimoContactoDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const clienteRequiereContacto = (c: Cliente) => {
    const limiteDias = c.frecuenciaContactoDias || diasAlertaGlobal;
    const dias = getDaysSinceContact(c.ultimoContacto);
    return dias > limiteDias;
  };

  const openAddModal = () => {
    setEditingCliente(null);
    setNombre('');
    setCuitDni('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setDireccion('');
    setCiudad('');
    setUltimoContacto(todayStr);
    setFrecuenciaContactoDias(diasAlertaGlobal);
    setNotasContacto('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Cliente) => {
    setEditingCliente(c);
    setNombre(c.nombre);
    setCuitDni(c.cuitDni);
    setContacto(c.contacto || '');
    setTelefono(c.telefono);
    setEmail(c.email);
    setDireccion(c.direccion);
    setCiudad(c.ciudad);
    setUltimoContacto(c.ultimoContacto || todayStr);
    setFrecuenciaContactoDias(c.frecuenciaContactoDias || diasAlertaGlobal);
    setNotasContacto(c.notasContacto || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !cuitDni.trim()) {
      alert('Nombre y CUIT/DNI son obligatorios');
      return;
    }

    if (editingCliente) {
      onUpdateCliente({
        id: editingCliente.id,
        nombre,
        cuitDni,
        contacto,
        telefono,
        email,
        direccion,
        ciudad,
        ultimoContacto,
        frecuenciaContactoDias,
        notasContacto,
      });
    } else {
      onAddCliente({
        nombre,
        cuitDni,
        contacto,
        telefono,
        email,
        direccion,
        ciudad,
        ultimoContacto,
        frecuenciaContactoDias,
        notasContacto,
      });
    }
    setIsModalOpen(false);
  };

  const openQuickContactModal = (c: Cliente) => {
    setQuickContactCliente(c);
    setQuickContactFecha(todayStr);
    setQuickContactNota(c.notasContacto || '');
  };

  const handleSaveQuickContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickContactCliente) return;

    onUpdateCliente({
      ...quickContactCliente,
      ultimoContacto: quickContactFecha,
      notasContacto: quickContactNota
    });

    setQuickContactCliente(null);
  };

  // Filter clients
  const clientesPendientes = clientes.filter(clienteRequiereContacto);
  const clientesAlDia = clientes.filter(c => !clienteRequiereContacto(c));

  const filtered = clientes.filter(c => {
    const matchesSearch = 
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.cuitDni.includes(search) ||
      c.ciudad.toLowerCase().includes(search.toLowerCase()) ||
      (c.contacto && c.contacto.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filtroAlerta === 'pendientes') {
      return clienteRequiereContacto(c);
    }
    if (filtroAlerta === 'aldia') {
      return !clienteRequiereContacto(c);
    }
    return true;
  });

  return (
    <div className="space-y-6" id="clientes-tab">
      {/* Header section inside tab */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center gap-2">
            <span>Clientes</span>
            {clientesPendientes.length > 0 && (
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full border border-rose-200">
                {clientesPendientes.length} por contactar
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500">Administra tus clientes y programa alertas de seguimiento comercial</p>
        </div>
        <button
          id="btn-add-cliente"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      </div>

      {/* Alert Banner / Contact Control Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl shrink-0 ${clientesPendientes.length > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/10 rounded text-slate-200">
                  Control de Relación comercial
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  Configuración de Alertas
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {clientesPendientes.length === 0 ? (
                  <span className="text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> ¡Excelente! Todos tus clientes están al día con el contacto.
                  </span>
                ) : (
                  <span className="text-rose-300">
                    Tienes {clientesPendientes.length} cliente{clientesPendientes.length > 1 ? 's' : ''} que requiere{clientesPendientes.length === 1 ? 'n' : ''} seguimiento
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Configurable Alert Threshold Selector */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs self-stretch md:self-auto justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sliders className="w-4 h-4 text-indigo-300" />
              <span>Alerta Global:</span>
            </div>
            <select
              value={diasAlertaGlobal}
              onChange={(e) => setDiasAlertaGlobal(Number(e.target.value))}
              className="bg-slate-800 text-white font-bold rounded px-2.5 py-1 text-xs border border-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value={7}>Cada 7 días (Semanal)</option>
              <option value={15}>Cada 15 días (Quincenal)</option>
              <option value={30}>Cada 30 días (Mensual)</option>
              <option value={60}>Cada 60 días (Bimensual)</option>
              <option value={90}>Cada 90 días (Trimestral)</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFiltroAlerta('todos')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${filtroAlerta === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Todos ({clientes.length})
            </button>
            <button
              onClick={() => setFiltroAlerta('pendientes')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${filtroAlerta === 'pendientes' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-300 hover:text-rose-200'}`}
            >
              <span>⚠️ Contacto Pendiente</span>
              <span className="bg-rose-950/50 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {clientesPendientes.length}
              </span>
            </button>
            <button
              onClick={() => setFiltroAlerta('aldia')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${filtroAlerta === 'aldia' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-300 hover:text-emerald-200'}`}
            >
              <span>✓ Al Día</span>
              <span className="bg-emerald-950/50 px-1.5 py-0.2 rounded text-[10px] font-mono">
                {clientesAlDia.length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-cliente"
              type="text"
              placeholder="Buscar por cliente, contacto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 text-xs text-white placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-white/10 focus:outline-hidden focus:bg-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Client List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-slate-500 font-medium text-sm">No se encontraron clientes para este filtro.</p>
            {filtroAlerta !== 'todos' && (
              <button
                onClick={() => setFiltroAlerta('todos')}
                className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Ver todos los clientes
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente / CUIT</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Persona de Contacto</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Último Contacto & Estado</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notas de Gestión</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const dias = getDaysSinceContact(c.ultimoContacto);
                  const requiereContacto = clienteRequiereContacto(c);
                  const limiteEfectivo = c.frecuenciaContactoDias || diasAlertaGlobal;

                  return (
                    <tr 
                      key={c.id} 
                      className={`transition-colors ${requiereContacto ? 'bg-rose-50/30 hover:bg-rose-50/60' : 'hover:bg-slate-50/50'}`}
                    >
                      {/* Cliente & CUIT */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{c.nombre}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                            {c.cuitDni}
                          </span>
                          {c.ciudad && (
                            <span className="text-xs text-slate-500">
                              {c.ciudad}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact Person & Phone */}
                      <td className="px-6 py-4 space-y-1">
                        {c.contacto ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900">
                            <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{c.contacto}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin persona asignada</span>
                        )}

                        <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                          {c.telefono && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{c.telefono}</span>
                            </div>
                          )}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}`}
                              title={`Enviar correo electrónico a ${c.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors group cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform shrink-0" />
                              <span className="truncate max-w-[180px]">{c.email}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Last Contact & Status Alert Badge */}
                      <td className="px-6 py-4 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">
                            {c.ultimoContacto ? c.ultimoContacto : 'Sin registrar'}
                          </span>
                        </div>

                        {/* Status Alert Badge */}
                        {requiereContacto ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-full shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                            <span>Contacto Vencido ({dias === Infinity ? 'Sin fecha' : `hace ${dias}d`})</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-full shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Al día (hace {dias}d / meta: {limiteEfectivo}d)</span>
                          </div>
                        )}
                      </td>

                      {/* Last Contact Notes */}
                      <td className="px-6 py-4">
                        {c.notasContacto ? (
                          <div className="flex items-start gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-[220px]">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2" title={c.notasContacto}>
                              {c.notasContacto}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sin notas</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Contact Button */}
                          {c.email && (
                            <a
                              href={`mailto:${c.email}?subject=Contacto%20Comercial%20-%20Seguimiento`}
                              title={`Enviar correo electrónico a ${c.email}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded-md transition-colors cursor-pointer"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            onClick={() => openQuickContactModal(c)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Registrar contacto de hoy"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Contactado</span>
                          </button>

                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition-colors cursor-pointer"
                            title="Editar Cliente"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Seguro que deseas eliminar el cliente "${c.nombre}"?`)) {
                                onDeleteCliente(c.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                            title="Eliminar Cliente"
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

      {/* Quick Contact Modal */}
      {quickContactCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Registrar Contacto</h3>
              </div>
              <button
                onClick={() => setQuickContactCliente(null)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickContact} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500">Cliente:</p>
                <h4 className="text-base font-bold text-slate-900">{quickContactCliente.nombre}</h4>
                {quickContactCliente.contacto && (
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    Persona: {quickContactCliente.contacto}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Fecha de Contacto</label>
                <input
                  type="date"
                  required
                  value={quickContactFecha}
                  onChange={(e) => setQuickContactFecha(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Notas de la conversación / gestión</label>
                <textarea
                  rows={3}
                  placeholder="Ej. Se conversó sobre la nueva lista de precios, interesado en pedir 50 unidades la próxima semana..."
                  value={quickContactNota}
                  onChange={(e) => setQuickContactNota(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickContactCliente(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Full Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-600">Nombre / Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Supermercado El Sol"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-600">Persona de Contacto / Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej. Lic. Mario Santander (Jefe de Compras)"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">CUIT / DNI *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 30-55566677-8"
                    value={cuitDni}
                    onChange={(e) => setCuitDni(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 11-3456-7890"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-600">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="Ej. compras@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Dirección</label>
                  <input
                    type="text"
                    placeholder="Ej. Av. Rivadavia 10250"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej. Morón"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                {/* Configuración de Alerta de Contacto */}
                <div className="sm:col-span-2 border-t border-slate-100 pt-3 mt-1 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Configuración de Alertas de Seguimiento</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Fecha de Último Contacto</label>
                      <input
                        type="date"
                        value={ultimoContacto}
                        onChange={(e) => setUltimoContacto(e.target.value)}
                        className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600">Frecuencia de Alerta (Días)</label>
                      <select
                        value={frecuenciaContactoDias}
                        onChange={(e) => setFrecuenciaContactoDias(Number(e.target.value))}
                        className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors cursor-pointer"
                      >
                        <option value={7}>Cada 7 días (1 semana)</option>
                        <option value={15}>Cada 15 días (2 semanas)</option>
                        <option value={30}>Cada 30 días (1 mes)</option>
                        <option value={60}>Cada 60 días (2 meses)</option>
                        <option value={90}>Cada 90 días (3 meses)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Observaciones del Último Contacto</label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Se acordó llamarlo a fin de mes para enviar catálogo..."
                      value={notasContacto}
                      onChange={(e) => setNotasContacto(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {editingCliente ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
