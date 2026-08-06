import React, { useState } from 'react';
import { Plus, Printer, Trash2 } from 'lucide-react';
import type { Remito, Cliente, Producto, EmpresaData } from './types';

interface RemitosTabProps {
  remitos: Remito[];
  setRemitos: React.Dispatch<React.SetStateAction<Remito[]>>;
  clientes: Cliente[];
  productos: Producto[];
  stock: { [key: number]: number };
  onPrint: (remito: Remito) => void;
  empresaData: EmpresaData;
}

export const RemitosTab: React.FC<RemitosTabProps> = ({ remitos, setRemitos, clientes, productos, stock, onPrint }) => {
  const [showForm, setShowForm] = useState(false);
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [items, setItems] = useState<{ productoId: number; cantidad: number }[]>([{ productoId: productos[0]?.id, cantidad: 1 }]);

  const handleAddItem = () => {
    setItems([...items, { productoId: productos[0]?.id, cantidad: 1 }]);
  };

  const handleItemChange = (index: number, field: 'productoId' | 'cantidad', value: number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i!== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) return;

    const newRemito: Remito = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      clienteId: Number(clienteId),
      items: items.map(i => ({...i }))
    };
    setRemitos([newRemito,...remitos]);
    setShowForm(false);
    setClienteId('');
    setItems([{ productoId: productos[0]?.id, cantidad: 1 }]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Remitos</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Nuevo Remito
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-bold mb-4">Crear Remito</h3>
          <select value={clienteId} onChange={e => setClienteId(Number(e.target.value))} className="w-full p-2 border rounded mb-4" required>
            <option value="">Seleccionar Cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <select value={item.productoId} onChange={e => handleItemChange(index, 'productoId', Number(e.target.value))} className="flex-1 p-2 border rounded">
                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} - Stock: {stock[p.id] || 0}</option>)}
              </select>
              <input type="number" value={item.cantidad} onChange={e => handleItemChange(index, 'cantidad', Number(e.target.value))} className="w-24 p-2 border rounded" min="1"/>
              <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500"><Trash2/></button>
            </div>
          ))}
          <button type="button" onClick={handleAddItem} className="text-blue-600 mb-4">+ Agregar Producto</button>

          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md">
        {remitos.map(r => (
          <div key={r.id} className="p-4 border-b flex justify-between items-center">
            <div>
              <p className="font-bold">Remito N° {r.id}</p>
              <p>Cliente: {clientes.find(c => c.id === r.clienteId)?.nombre}</p>
              <p className="text-sm text-gray-500">{new Date(r.fecha).toLocaleDateString()}</p>
            </div>
            <button onClick={() => onPrint(r)} className="bg-gray-200 p-2 rounded hover:bg-gray-300"><Printer/></button>
          </div>
        ))}
      </div>
    </div>
  );
};
