import React from 'react';
import type { Remito, Producto, Cliente, EmpresaData } from './types';

interface Props { remito: Remito; productos: Producto[]; clientes: Cliente[]; empresaData: EmpresaData; }

export const RemitoPrintView: React.FC<Props> = ({ remito, productos, clientes, empresaData }) => {
  const cliente = clientes.find(c => c.id === remito.clienteId);
  const total = remito.items.reduce((acc, item) => acc + (productos.find(p => p.id === item.productoId)?.precio || 0) * item.cantidad, 0);

  return (
    <div id="remito-print-view" className="p-8 bg-white text-black" style={{ width: '210mm' }}>
      <h1 className="text-2xl font-bold">{empresaData.nombre}</h1>
      <h2 className="text-xl">REMITO N° {remito.id}</h2>
      <p>Cliente: {cliente?.nombre}</p>
      <table className="w-full mt-4">
        <thead><tr><td>Cant</td><td>Producto</td><td>Precio</td></tr></thead>
        <tbody>{remito.items.map(i => <tr key={i.productoId}><td>{i.cantidad}</td><td>{productos.find(p => p.id === i.productoId)?.nombre}</td><td>${(productos.find(p => p.id === i.productoId)?.precio || 0) * i.cantidad}</td></tr>)}</tbody>
      </table>
      <p className="text-right font-bold mt-4">TOTAL: ${total}</p>
    </div>
  );
};
