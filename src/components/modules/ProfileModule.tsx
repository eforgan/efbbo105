'use client';

import React from 'react';
import { CrewProfile, CrewRole } from '../../types/efb';
import { useEfbData } from '../../context/EfbDataContext';
import { UserCircle, Save, Trash2, ShieldCheck, Info } from 'lucide-react';

const ROLE_LABELS: Record<CrewRole, string> = {
  PIC: 'Piloto al Mando (PIC)',
  SIC: 'Copiloto / HEMS Crew (SIC)',
  medico: 'Médico Aeroevacuador',
  despachante: 'Despachante / ARO-AIS',
};

export const ProfileModule: React.FC = () => {
  const { profile, setProfile } = useEfbData();

  const [fullName, setFullName] = React.useState(profile?.fullName ?? '');
  const [role, setRole] = React.useState<CrewRole>(profile?.role ?? 'PIC');
  const [licenseNumber, setLicenseNumber] = React.useState(profile?.licenseNumber ?? '');
  const [email, setEmail] = React.useState(profile?.email ?? '');
  const [phone, setPhone] = React.useState(profile?.phone ?? '');
  const [savedFlash, setSavedFlash] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const next: CrewProfile = { fullName: fullName.trim(), role, licenseNumber: licenseNumber.trim(), email: email.trim(), phone: phone.trim() };
    setProfile(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  const handleClear = () => {
    setProfile(null);
    setFullName('');
    setRole('PIC');
    setLicenseNumber('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto font-sans">
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-cyan-400" /> Mi Perfil
          </h2>
          <p className="text-xs text-slate-400">
            Registro local de tripulante — se usa para completar automáticamente los campos de nombre en Despacho PDF, Plan de Vuelo OACI y Bitácora.
          </p>
        </div>
        {profile && (
          <span className="text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Perfil Activo
          </span>
        )}
      </div>

      <div className="glass-card p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 text-xs font-mono text-slate-300 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          Este perfil se guarda <strong>solo en este dispositivo/navegador</strong> (localStorage), no en un servidor ni cuenta en la nube.
          No es un inicio de sesión con contraseña — es una ficha local que evita reescribir tus datos en cada módulo. Si compartís este
          equipo con otros tripulantes, cada uno puede sobrescribir el perfil antes de despachar su propio vuelo.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-4 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2">Datos del Tripulante</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">Nombre Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Cap. Juan Pérez"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Rol Operativo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as CrewRole)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            >
              {(Object.keys(ROLE_LABELS) as CrewRole[]).map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Licencia / Matrícula ANAC</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="PC-12345"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Email de Contacto</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@modenaair.com"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 11 0000-0000"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <Save className="w-3.5 h-3.5" /> Guardar Perfil
          </button>
          {profile && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition border border-rose-500/30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Borrar Perfil
            </button>
          )}
          {savedFlash && <span className="text-emerald-400 text-xs font-bold">Perfil guardado ✓</span>}
        </div>
      </form>
    </div>
  );
};
