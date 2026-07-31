'use client';

import React from 'react';
import { CrewProfile, CrewRole, PilotLicenseType } from '../../types/efb';
import { useEfbData } from '../../context/EfbDataContext';
import { SyncBadge } from '../SyncBadge';
import { Save, Trash2, ShieldCheck, Info, Users, CheckCircle2, AlertTriangle, UserCheck, Phone } from 'lucide-react';
import { telHref } from '../../lib/telHref';

const ROLE_LABELS: Record<CrewRole, string> = {
  PIC: 'Piloto al Mando (PIC)',
  SIC: 'Copiloto / HEMS Crew (SIC)',
  medico: 'Médico Aeroevacuador',
  despachante: 'Despachante / ARO-AIS',
};

const LICENSE_TYPE_LABELS: Record<PilotLicenseType, string> = {
  PCH: 'PCH - Piloto Comercial de Helicóptero',
  PLH: 'PLH - Piloto de Línea Aérea de Helicóptero',
  PPH: 'PPH - Piloto Privado de Helicóptero',
  INST: 'INST - Instructor de Vuelo',
  OTRO: 'OTRO',
};

const EMPTY_FORM = {
  fullName: '', role: 'PIC' as CrewRole, licenseType: '' as PilotLicenseType | '', licenseNumber: '',
  email: '', phone: '', whatsapp: '', licenseExpiry: '', medicalExpiry: '',
};

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function expiryStatus(dateStr?: string): { label: string; color: string } | null {
  const days = daysUntil(dateStr);
  if (days === null) return null;
  if (days < 0) return { label: `VENCIDO hace ${Math.abs(days)} d`, color: 'text-rose-400 bg-rose-500/20 border-rose-500/30' };
  if (days <= 30) return { label: `Vence en ${days} d`, color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
  return { label: `Vigente (${days} d)`, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
}

export const ProfileModule: React.FC = () => {
  const { profiles, upsertProfile, deleteProfile, activeProfileId, setActiveProfileId, activeProfile, syncPin } = useEfbData();

  const [form, setForm] = React.useState(EMPTY_FORM);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [savedFlash, setSavedFlash] = React.useState(false);

  const startEdit = (p: CrewProfile) => {
    setEditingId(p.id);
    setForm({
      fullName: p.fullName, role: p.role, licenseType: p.licenseType ?? '', licenseNumber: p.licenseNumber, email: p.email,
      phone: p.phone, whatsapp: p.whatsapp ?? '', licenseExpiry: p.licenseExpiry ?? '', medicalExpiry: p.medicalExpiry ?? '',
    });
  };

  const resetForm = () => { setEditingId(null); setForm(EMPTY_FORM); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    const record = { ...form, fullName: form.fullName.trim(), licenseType: form.licenseType || undefined };
    if (editingId) {
      const existing = profiles.find(p => p.id === editingId);
      upsertProfile({ ...(existing as CrewProfile), ...record, id: editingId });
    } else {
      const id = `crew-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      upsertProfile({ id, ...record });
      setActiveProfileId(id);
    }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
    resetForm();
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    if (editingId === id) resetForm();
  };

  const expiringSoon = profiles.filter(p => {
    const l = daysUntil(p.licenseExpiry);
    const m = daysUntil(p.medicalExpiry);
    return (l !== null && l <= 30) || (m !== null && m <= 30);
  });

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto font-sans">
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 font-mono">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" /> Roster de Tripulantes
          </h2>
          <p className="text-xs text-slate-400">
            Elegí quién vuela hoy para autocompletar Despacho PDF, Plan de Vuelo OACI y Bitácora.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeProfile && (
            <span className="text-xs bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Hoy vuela: {activeProfile.fullName}
            </span>
          )}
          <SyncBadge />
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/10 text-xs font-mono text-slate-300 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          Este roster se guarda en este dispositivo (localStorage) y funciona sin conexión. {syncPin
            ? 'Con el PIN operativo activo, se sincroniza automáticamente con el roster compartido en cuanto hay conexión.'
            : 'Ingresá el PIN operativo (arriba) para compartirlo con el resto de la tripulación en la nube.'}
        </p>
      </div>

      {expiringSoon.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-amber-500/40 bg-amber-950/20 space-y-2 font-mono text-xs">
          <h3 className="font-bold text-amber-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Vencimientos Próximos / Vencidos</h3>
          {expiringSoon.map(p => (
            <div key={p.id} className="flex flex-wrap items-center gap-2 text-slate-300">
              <span className="font-bold">{p.fullName}</span>
              {expiryStatus(p.licenseExpiry) && <span className={`text-[10px] px-2 py-0.5 rounded border ${expiryStatus(p.licenseExpiry)!.color}`}>Licencia: {expiryStatus(p.licenseExpiry)!.label}</span>}
              {expiryStatus(p.medicalExpiry) && <span className={`text-[10px] px-2 py-0.5 rounded border ${expiryStatus(p.medicalExpiry)!.color}`}>Cert. Médico: {expiryStatus(p.medicalExpiry)!.label}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Roster list */}
      {profiles.length > 0 && (
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
          <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2">Tripulantes Guardados</h3>
          {profiles.map(p => {
            const lic = expiryStatus(p.licenseExpiry);
            const med = expiryStatus(p.medicalExpiry);
            const isActive = p.id === activeProfileId;
            return (
              <div key={p.id} className={`p-3 rounded-lg border space-y-1.5 ${isActive ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-900/60 border-slate-800'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-100">{p.fullName}</span>
                    <span className="text-slate-400 ml-2">{ROLE_LABELS[p.role]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveProfileId(isActive ? null : p.id)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      <UserCheck className="w-3 h-3" /> {isActive ? 'Vuela Hoy' : 'Elegir'}
                    </button>
                    <button onClick={() => startEdit(p)} className="px-2 py-1 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {p.licenseNumber && <span className="text-slate-500">Lic. {p.licenseType ? `${p.licenseType} ` : ''}{p.licenseNumber}</span>}
                  {p.phone && (
                    <a href={telHref(p.phone)} className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5">
                      <Phone className="w-2.5 h-2.5" /> {p.phone}
                    </a>
                  )}
                  {lic && <span className={`px-1.5 py-0.5 rounded border ${lic.color}`}>Licencia: {lic.label}</span>}
                  {med && <span className={`px-1.5 py-0.5 rounded border ${med.color}`}>Médico: {med.label}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-card p-4 rounded-xl border border-slate-800 space-y-4 font-mono text-xs">
        <h3 className="text-xs font-bold text-slate-100 uppercase border-b border-slate-800 pb-2">
          {editingId ? 'Editar Tripulante' : 'Agregar Tripulante'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">Nombre Completo</label>
            <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Cap. Juan Pérez" required className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Rol Operativo</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as CrewRole })} className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200">
              {(Object.keys(ROLE_LABELS) as CrewRole[]).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Tipo de Licencia ANAC</label>
            <select value={form.licenseType} onChange={(e) => setForm({ ...form, licenseType: e.target.value as PilotLicenseType | '' })} className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200">
              <option value="">Sin especificar</option>
              {(Object.keys(LICENSE_TYPE_LABELS) as PilotLicenseType[]).map(t => <option key={t} value={t}>{LICENSE_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Número de Licencia</label>
            <input type="text" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} placeholder="12345" className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Vencimiento Licencia</label>
            <input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Vencimiento Certificado Médico</label>
            <input type="date" value={form.medicalExpiry} onChange={(e) => setForm({ ...form, medicalExpiry: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Email de Contacto</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nombre@modenaair.com" className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200" />
            <span className="text-[10px] text-slate-600 mt-1 block">Se envía confirmación de alta/actualización a esta dirección (si se completa) y siempre a eforgan@gruppomodena.com.</span>
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Teléfono</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+54 9 11 0000-0000" className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">WhatsApp</label>
            <input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+54 9 11 0000-0000" className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200" />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition">
            <Save className="w-3.5 h-3.5" /> {editingId ? 'Guardar Cambios' : 'Agregar a la Lista'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs cursor-pointer transition">
              Cancelar
            </button>
          )}
          {savedFlash && <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Guardado</span>}
        </div>
      </form>
    </div>
  );
};
