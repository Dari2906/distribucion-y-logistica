import React, { useState } from 'react';
import { Proveedor } from '../types';
import { Plus, Search, Edit2, Trash2, X, Eye, MapPin, Phone, Mail, FileText, User } from 'lucide-react';

interface ProveedoresTabProps {
  proveedores: Proveedor[];
  onAddProveedor: (p: Omit<Proveedor, 'id'>) => void;
  onUpdateProveedor: (p: Proveedor) => void;
  onDeleteProveedor: (id: string) => void;
}

export default function ProveedoresTab({
  proveedores,
  onAddProveedor,
  onUpdateProveedor,
  onDeleteProveedor,
}: ProveedoresTabProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [cuit, setCuit] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');

  const openAddModal = () => {
    setEditingProveedor(null);
    setNombre('');
    setCuit('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setDireccion('');
    setCiudad('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Proveedor) => {
    setEditingProveedor(p);
    setNombre(p.nombre);
    setCuit(p.cuit);
    setContacto(p.contacto || '');
    setTelefono(p.telefono);
    setEmail(p.email);
    setDireccion(p.direccion);
    setCiudad(p.ciudad);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !cuit.trim()) {
      alert('Nombre y CUIT son obligatorios');
      return;
    }

    if (editingProveedor) {
      onUpdateProveedor({
        id: editingProveedor.id,
        nombre,
        cuit,
        contacto,
        telefono,
        email,
        direccion,
        ciudad,
      });
    } else {
      onAddProveedor({
        nombre,
        cuit,
        contacto,
        telefono,
        email,
        direccion,
        ciudad,
      });
    }
    setIsModalOpen(false);
  };

  const filtered = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.cuit.includes(search) ||
    p.ciudad.toLowerCase().includes(search.toLowerCase()) ||
    (p.contacto && p.contacto.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6" id="proveedores-tab">
      {/* Header section inside tab */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Proveedores</h2>
          <p className="text-sm text-slate-500">Administra el listado de tus proveedores y fabricantes</p>
        </div>
        <button
          id="btn-add-proveedor"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          id="search-proveedor"
          type="text"
          placeholder="Buscar por nombre, CUIT o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No se encontraron proveedores.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre / Razón Social</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">CUIT</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ubicación</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{p.nombre}</div>
                      {p.contacto && (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium mt-0.5">
                          <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{p.contacto}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {p.cuit}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {p.email ? (
                        <a
                          href={`mailto:${p.email}`}
                          title={`Enviar correo a ${p.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-semibold transition-colors group cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform shrink-0" />
                          <span>{p.email}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sin correo</span>
                      )}
                      {p.telefono && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.telefono}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.direccion && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{p.direccion}, {p.ciudad}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.email && (
                          <a
                            href={`mailto:${p.email}`}
                            title={`Enviar correo electrónico a ${p.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 rounded-md transition-colors cursor-pointer"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Seguro que deseas eliminar el proveedor "${p.nombre}"?`)) {
                              onDeleteProveedor(p.id);
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
                ))}
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
                {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-600">Nombre / Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Distribuidora Mayorista S.A."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-600">Nombre de Contacto / Persona de Referencia</label>
                  <input
                    type="text"
                    placeholder="Ej. Ing. Roberto Gómez (Gerente de Cuenta)"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">CUIT *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 30-12345678-9"
                    value={cuit}
                    onChange={(e) => setCuit(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Teléfono</label>
                  <input
                    type="text"
                    placeholder="Ej. 011-4567-8901"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-600">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="Ej. contacto@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Dirección</label>
                  <input
                    type="text"
                    placeholder="Ej. Av. Rivadavia 1234"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Ej. Buenos Aires"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 focus:bg-white transition-colors"
                  />
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
                  {editingProveedor ? 'Guardar Cambios' : 'Crear Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
