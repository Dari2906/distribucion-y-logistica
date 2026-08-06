import React, { useState } from 'react';
import { DatosEmpresa, ModuleSecurityConfig } from '../types';
import { Building2, Save, CheckCircle2, ShieldAlert, KeyRound, Lock, Eye, EyeOff, Shield, Boxes, Check, RotateCcw } from 'lucide-react';

interface MiEmpresaTabProps {
  datosEmpresa: DatosEmpresa;
  onUpdateDatosEmpresa: (nuevosDatos: DatosEmpresa) => void;
  securityConfig: ModuleSecurityConfig;
  onUpdateSecurityConfig: (config: ModuleSecurityConfig) => void;
}

export default function MiEmpresaTab({ 
  datosEmpresa, 
  onUpdateDatosEmpresa,
  securityConfig,
  onUpdateSecurityConfig
}: MiEmpresaTabProps) {
  const [nombre, setNombre] = useState(datosEmpresa.nombre);
  const [subtitulo, setSubtitulo] = useState(datosEmpresa.subtitulo);
  const [direccion, setDireccion] = useState(datosEmpresa.direccion);
  const [telefono, setTelefono] = useState(datosEmpresa.telefono);
  const [email, setEmail] = useState(datosEmpresa.email);
  const [web, setWeb] = useState(datosEmpresa.web);
  const [cuit, setCuit] = useState(datosEmpresa.cuit);
  const [iibb, setIibb] = useState(datosEmpresa.iibb);
  const [inicioActividades, setInicioActividades] = useState(datosEmpresa.inicioActividades);

  // Security Passwords state
  const [adminPass, setAdminPass] = useState(securityConfig.adminPass || 'admin123');
  const [depositoPass, setDepositoPass] = useState(securityConfig.depositoPass || 'deposito123');
  const [requireAdminPass, setRequireAdminPass] = useState(securityConfig.requireAdminPass);
  const [requireDepositoPass, setRequireDepositoPass] = useState(securityConfig.requireDepositoPass);

  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showDepositoPass, setShowDepositoPass] = useState(false);

  const [savedStatus, setSavedStatus] = useState<boolean | null>(null);
  const [savedSecurityStatus, setSavedSecurityStatus] = useState<boolean | null>(null);

  const handleSubmitCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('El nombre de la empresa es obligatorio.');
      return;
    }
    
    onUpdateDatosEmpresa({
      nombre,
      subtitulo,
      direccion,
      telefono,
      email,
      web,
      cuit,
      iibb,
      inicioActividades
    });

    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(null);
    }, 4000);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSecurityConfig({
      adminPass,
      depositoPass,
      requireAdminPass,
      requireDepositoPass
    });

    setSavedSecurityStatus(true);
    setTimeout(() => {
      setSavedSecurityStatus(null);
    }, 4000);
  };

  const handleResetPasswords = () => {
    if (confirm('¿Deseas restablecer las claves de acceso a los valores por defecto (Admin: "admin123", Depósito: "deposito123")?')) {
      const defaultConfig: ModuleSecurityConfig = {
        adminPass: 'admin123',
        depositoPass: 'deposito123',
        requireAdminPass: true,
        requireDepositoPass: true,
      };
      setAdminPass(defaultConfig.adminPass);
      setDepositoPass(defaultConfig.depositoPass);
      setRequireAdminPass(defaultConfig.requireAdminPass);
      setRequireDepositoPass(defaultConfig.requireDepositoPass);
      onUpdateSecurityConfig(defaultConfig);
      setSavedSecurityStatus(true);
      setTimeout(() => setSavedSecurityStatus(null), 4000);
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="view-mi-empresa">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Datos del Remitente / Empresa</h1>
        <p className="text-slate-500 text-sm">Carga la información comercial e impositiva de tu empresa para que figure automáticamente en el encabezado de todos tus remitos impresos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmitCompany} className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">

          
          {savedStatus && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-sm">
                <p className="font-bold">¡Cambios guardados con éxito!</p>
                <p className="text-emerald-700/80">Los datos impositivos y de contacto se han actualizado para todos los remitos.</p>
              </div>
            </div>
          )}

          {/* Section: Básicos */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Identidad Comercial</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Nombre de la Empresa *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Logistica_Dist."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Subtítulo / Rubro de Actividad</label>
                <input
                  type="text"
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Ej: Distribución e Ingeniería"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Contacto */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Datos de Contacto y Domicilio
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Dirección Física</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. de Mayo 1370, CABA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Teléfono</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: +54 (11) 5219-8000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Email de Despachos</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: despachos@empresa.com.ar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600">Sitio Web Oficial</label>
                <input
                  type="text"
                  value={web}
                  onChange={(e) => setWeb(e.target.value)}
                  placeholder="Ej: www.empresa.com.ar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Impositiva */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Información Fiscal / Impositiva
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">C.U.I.T. de la Empresa</label>
                <input
                  type="text"
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  placeholder="Ej: 30-71234567-8"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Ingresos Brutos (IIBB)</label>
                <input
                  type="text"
                  value={iibb}
                  onChange={(e) => setIibb(e.target.value)}
                  placeholder="Ej: 30-71234567-8 o Conv. Multilateral"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Inicio de Actividades</label>
                <input
                  type="text"
                  value={inicioActividades}
                  onChange={(e) => setInicioActividades(e.target.value)}
                  placeholder="Ej: 01/10/2012"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Datos</span>
            </button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            Vista Previa del Cabezal de Impresión
          </div>
          
          <div className="bg-white border-2 border-slate-950 p-4 font-sans text-slate-950 rounded-lg shadow-sm">
            <div className="grid grid-cols-12 border-2 border-slate-950 min-h-[140px]">
              
              {/* Left Side (Issuer) */}
              <div className="col-span-6 p-2 border-r-2 border-slate-950 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 tracking-tight truncate">
                    {nombre || 'Nombre de la Empresa'}
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    {subtitulo || 'Rubro / Subtítulo'}
                  </p>
                </div>
                <div className="text-[9px] leading-tight space-y-0.5 pt-2 border-t border-slate-100/50">
                  <p className="truncate"><strong>Dir:</strong> {direccion || 'Dirección comercial'}</p>
                  <p><strong>Tel:</strong> {telefono || 'Teléfono comercial'}</p>
                  <p className="truncate"><strong>Email:</strong> {email || 'Email de despacho'}</p>
                  <p className="truncate"><strong>Web:</strong> {web || 'Sitio web'}</p>
                </div>
              </div>

              {/* R Center */}
              <div className="col-span-2 flex flex-col items-center justify-center relative bg-slate-50">
                <div className="border border-slate-950 w-7 h-7 flex items-center justify-center bg-white text-md font-extrabold z-10">
                  R
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-950 -z-0"></div>
                <span className="text-[6px] font-bold text-center mt-1 uppercase tracking-tight max-w-[32px] leading-none">
                  No válido factura
                </span>
              </div>

              {/* Right Side (Tax info) */}
              <div className="col-span-4 p-2 flex flex-col justify-between text-[9px] leading-tight bg-slate-50/30">
                <div>
                  <h5 className="font-extrabold text-[10px]">REMITO</h5>
                  <div className="font-mono text-slate-700 mt-0.5">N° R-0001-XXXXXXXX</div>
                </div>
                <div className="space-y-0.5 pt-2 border-t border-slate-100">
                  <p><strong>Fecha:</strong> DD/MM/AAAA</p>
                  <p className="truncate"><strong>C.U.I.T.:</strong> {cuit || '30-XXXXXXXX-X'}</p>
                  <p className="truncate"><strong>IIBB:</strong> {iibb || 'Nro. de IIBB'}</p>
                  <p className="truncate"><strong>Act.:</strong> {inicioActividades || 'DD/MM/AAAA'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Advice card */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-900">Importante:</p>
              <p className="leading-relaxed">
                Al guardar estos datos, la previsualización y la hoja de impresión A4 generada tomarán estas configuraciones de forma instantánea. No requiere recargar el portal.
              </p>
            </div>
          </div>

          {/* Security & Password Control Panel */}
          <form onSubmit={handleSaveSecurity} className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 shadow-xl p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Seguridad y Claves por Módulo</h3>
                  <p className="text-[11px] text-slate-400">Administra las contraseñas requeridas para ingresar a cada área</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 text-[10px] font-mono font-bold rounded border border-indigo-800 uppercase">
                Admin Control
              </span>
            </div>

            {savedSecurityStatus && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-lg flex items-center gap-2 text-xs animate-in slide-in-from-top-1">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold">¡Claves de seguridad actualizadas correctamente!</span>
              </div>
            )}

            {/* Admin Module Password */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 cursor-pointer">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Módulo Administrador</span>
                </label>
                <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireAdminPass}
                    onChange={(e) => setRequireAdminPass(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500/30"
                  />
                  <span>Requerir clave de acceso</span>
                </label>
              </div>

              {requireAdminPass && (
                <div className="relative">
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Escribe la clave de Admin..."
                    className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            {/* Depósito Module Password */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-300 cursor-pointer">
                  <Boxes className="w-4 h-4 text-amber-400" />
                  <span>Módulo Depósito</span>
                </label>
                <label className="flex items-center gap-2 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireDepositoPass}
                    onChange={(e) => setRequireDepositoPass(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/30"
                  />
                  <span>Requerir clave de acceso</span>
                </label>
              </div>

              {requireDepositoPass && (
                <div className="relative">
                  <input
                    type={showDepositoPass ? 'text' : 'password'}
                    value={depositoPass}
                    onChange={(e) => setDepositoPass(e.target.value)}
                    placeholder="Escribe la clave de Depósito..."
                    className="w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDepositoPass(!showDepositoPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showDepositoPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleResetPasswords}
                className="px-3 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-800 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                title="Restablecer contraseñas por defecto"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Restablecer por Defecto</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold rounded-lg text-xs shadow-md shadow-indigo-900/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Guardar Claves de Acceso</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

