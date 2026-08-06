import React, { useState, useEffect } from 'react';
import { Remito, Cliente, Producto, DatosEmpresa } from '../types';
import { Printer, X } from 'lucide-react';

interface RemitoPrintViewProps {
  remito: Remito;
  cliente: Cliente | undefined;
  productos: Producto[];
  datosEmpresa: DatosEmpresa;
  onClose: () => void;
}

export default function RemitoPrintView({
  remito,
  cliente,
  productos,
  datosEmpresa,
  onClose,
}: RemitoPrintViewProps) {
  const [showPrices, setShowPrices] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getProductInfo = (prodId: string) => {
    return productos.find((p) => p.id === prodId);
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateTotal = () => {
    return remito.items.reduce((acc, item) => {
      return acc + item.cantidad * item.precioUnitario;
    }, 0);
  };

  const calculateTotalBultos = () => {
    return remito.items.reduce((acc, item) => acc + item.cantidad, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 md:p-6 overflow-y-auto print:static print:bg-white print:p-0 print:overflow-visible">
      {/* Container holding the slip and actions */}
      <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-4xl p-4 sm:p-6 relative flex flex-col my-auto max-h-[96vh] print:max-h-none print:bg-white print:p-0 print:shadow-none print:my-0 print:w-full">
        
        {/* Actions panel (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 shrink-0 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Vista previa del Remito N° {remito.numero}</span>
              <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-700 font-mono font-semibold rounded">
                {remito.items.length} artículos
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Usa el botón para imprimir o guardar en PDF. Presiona ESC o el botón para cerrar.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs cursor-pointer select-none hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={showPrices}
                onChange={(e) => setShowPrices(e.target.checked)}
                className="rounded-sm border-slate-300 focus:ring-slate-500 text-slate-900"
              />
              <span>Mostrar Precios e Importes</span>
            </label>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable area for full document preview on screen */}
        <div className="overflow-y-auto max-h-[82vh] pr-1 py-4 print:overflow-visible print:p-0 print:max-h-none">
          {/* Printable Paper Slip (Standard A4 ratio style) */}
          <div
            id="remito-print-area"
            className="bg-white p-6 sm:p-8 border border-slate-300 rounded-lg max-w-3xl mx-auto shadow-sm w-full font-sans text-slate-950 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full"
          >
            {/* Header Grid */}
            <div className="grid grid-cols-12 border-2 border-slate-950">
              {/* Left side: Issuer Info */}
              <div className="col-span-5 p-4 border-r-2 border-slate-950 flex flex-col justify-between">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{datosEmpresa.nombre}</h1>
                  <p className="text-xs text-slate-500 font-medium">{datosEmpresa.subtitulo}</p>
                </div>
                <div className="text-[11px] sm:text-xs space-y-0.5 pt-3">
                  <p><strong>Dirección:</strong> {datosEmpresa.direccion}</p>
                  <p><strong>Teléfono:</strong> {datosEmpresa.telefono}</p>
                  <p><strong>Email:</strong> {datosEmpresa.email}</p>
                  <p><strong>Web:</strong> {datosEmpresa.web}</p>
                </div>
              </div>

              {/* Middle: Standard Argentine 'R' Document Identifier */}
              <div className="col-span-2 flex flex-col items-center justify-center relative bg-slate-50/50">
                <div className="border-2 border-slate-950 w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center bg-white text-2xl sm:text-3xl font-black z-10 shadow-2xs">
                  R
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-slate-950 -z-0"></div>
                <span className="text-[8px] sm:text-[9px] font-bold text-center mt-1 uppercase tracking-tight max-w-[80px] leading-tight text-slate-800">
                  Documento no válido como factura
                </span>
              </div>

              {/* Right side: Remito details */}
              <div className="col-span-5 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">REMITO</h2>
                  <div className="text-xs sm:text-sm font-mono font-bold mt-1 text-slate-800">
                    N° {remito.numero}
                  </div>
                </div>
                <div className="text-[11px] sm:text-xs space-y-1">
                  <p><strong>Fecha:</strong> {remito.fecha.split('-').reverse().join('/')}</p>
                  <p><strong>C.U.I.T.:</strong> {datosEmpresa.cuit}</p>
                  <p><strong>Ingresos Brutos:</strong> {datosEmpresa.iibb}</p>
                  <p><strong>Inicio de Act.:</strong> {datosEmpresa.inicioActividades}</p>
                </div>
              </div>
            </div>

            {/* Customer / Client info section */}
            <div className="mt-4 border-2 border-slate-950 p-3.5 space-y-1.5 rounded-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 pb-1">
                Destinatario / Cliente
              </h3>
              {cliente ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4 text-xs">
                  <p><strong>Señor(es):</strong> {cliente.nombre}</p>
                  <p><strong>CUIT / DNI:</strong> <span className="font-mono">{cliente.cuitDni}</span></p>
                  <p><strong>Domicilio:</strong> {cliente.direccion || 'No especificado'}</p>
                  <p><strong>Localidad:</strong> {cliente.ciudad || 'No especificado'}</p>
                  <p><strong>Teléfono:</strong> {cliente.telefono || 'No especificado'}</p>
                  <p><strong>Email:</strong> {cliente.email || 'No especificado'}</p>
                </div>
              ) : (
                <p className="text-xs text-red-500 italic">Cliente no asignado o eliminado del sistema.</p>
              )}
            </div>

            {/* Delivery Items Table */}
            <div className="mt-4 border-2 border-slate-950 rounded-xs overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-950 font-bold">
                    <th className="px-3 py-2 border-r border-slate-950 w-16 text-center">Cant.</th>
                    <th className="px-3 py-2 border-r border-slate-950 w-28">Código</th>
                    <th className="px-3 py-2 border-r border-slate-950">Descripción / Detalle</th>
                    {showPrices && (
                      <>
                        <th className="px-3 py-2 border-r border-slate-950 w-24 text-right">Unitario</th>
                        <th className="px-3 py-2 w-28 text-right">Subtotal</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300">
                  {remito.items.map((item, index) => {
                    const prod = getProductInfo(item.productoId);
                    return (
                      <tr key={index} className="align-top">
                        <td className="px-3 py-2 border-r border-slate-950 text-center font-mono font-bold text-slate-900">
                          {item.cantidad}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-950 font-mono text-slate-800">
                          {prod?.codigoInterno || prod?.codigo || 'S/C'}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-950">
                          <div className="font-bold text-slate-900">{prod?.nombre || 'Producto no identificado'}</div>
                          {prod?.descripcion && (
                            <div className="text-[10px] text-slate-600 mt-0.5">
                              {prod.descripcion}
                            </div>
                          )}
                        </td>
                        {showPrices && (
                          <>
                            <td className="px-3 py-2 border-r border-slate-950 text-right font-mono">
                              ${item.precioUnitario.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold">
                              ${(item.cantidad * item.precioUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                  {/* Pad table with empty lines to give standard slip height */}
                  {Array.from({ length: Math.max(0, 5 - remito.items.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-7">
                      <td className="border-r border-slate-950"></td>
                      <td className="border-r border-slate-950"></td>
                      <td className="border-r border-slate-950"></td>
                      {showPrices && (
                        <>
                          <td className="border-r border-slate-950"></td>
                          <td></td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-950 bg-slate-50 font-bold">
                    <td className="px-3 py-2 text-center border-r border-slate-950 font-mono text-xs">
                      {calculateTotalBultos()} u.
                    </td>
                    <td colSpan={showPrices ? 3 : 2} className="px-3 py-2 text-right border-r border-slate-950 text-xs uppercase">
                      {showPrices ? 'Total Estimado' : 'Total Bultos / Unidades'}
                    </td>
                    {showPrices ? (
                      <td className="px-3 py-2 text-right font-mono text-sm font-black">
                        ${calculateTotal().toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                    ) : null}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observations section */}
            <div className="mt-4 border-2 border-slate-950 p-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-600 mb-1">
                Observaciones del Envío / Lugar de Entrega
              </h4>
              <p className="italic text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 min-h-[36px] whitespace-pre-line">
                {remito.observaciones || 'Sin observaciones particulares.'}
              </p>
            </div>

            {/* Disclaimers & Signatures */}
            <div className="mt-8 grid grid-cols-2 gap-6 pt-8">
              {/* Signature Left */}
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-dashed border-slate-950 h-8"></div>
                <p className="text-[10px] uppercase font-bold text-slate-600 mt-2">
                  Firma del Transportista
                </p>
                <p className="text-[9px] text-slate-400">
                  Aclaración / DNI
                </p>
              </div>

              {/* Signature Right */}
              <div className="flex flex-col items-center">
                <div className="w-48 border-b border-dashed border-slate-950 h-8"></div>
                <p className="text-[10px] uppercase font-bold text-slate-600 mt-2">
                  Recibido Conforme (Destinatario)
                </p>
                <p className="text-[9px] text-slate-400">
                  Fecha / Hora / Firma / Aclaración / DNI
                </p>
              </div>
            </div>

            {/* Bottom small print warning */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[9px] text-slate-400">
              Remito confeccionado mediante Sistema de Gestión Interno {datosEmpresa.nombre}. Documento de control de stock y entrega de mercadería. No válido como factura.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
