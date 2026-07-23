'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  Shield,
  Plane,
  ClipboardList,
  Menu,
  X,
  Tag,
  Calendar,
  BookMarked,
  FileIcon,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Upload,
  AlertCircle,
  Download,
} from 'lucide-react';
import { AVIATION_LIBRARY_DOCS, AviationDoc, DocSection } from '@/data/aviationLibrary';

// ─── Category config ──────────────────────────────────────────────
const CATEGORIES: Record<
  AviationDoc['category'],
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  'anac-raac': {
    label: 'ANAC RAAC',
    icon: <Shield size={14} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20 border-blue-500/40',
  },
  'rfm-bo105': {
    label: 'RFM BO105',
    icon: <Plane size={14} />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20 border-amber-500/40',
  },
  'mop-modena': {
    label: 'MOP Modena',
    icon: <ClipboardList size={14} />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20 border-emerald-500/40',
  },
  safety: {
    label: 'Safety / SMS',
    icon: <BookMarked size={14} />,
    color: 'text-rose-400',
    bg: 'bg-rose-500/20 border-rose-500/40',
  },
};

const CAT_FILTER_ALL = 'all';
type TabType = 'resumen' | 'pdf';

const catBadge = (cat: AviationDoc['category']) =>
  `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${CATEGORIES[cat].bg} ${CATEGORIES[cat].color}`;

// ─── Doc List Item ────────────────────────────────────────────────
function DocListItem({
  doc,
  selected,
  onSelect,
}: {
  doc: AviationDoc;
  selected: boolean;
  onSelect: () => void;
}) {
  const cat = CATEGORIES[doc.category];
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3 py-3 rounded-lg border transition-all duration-200 mb-2
        ${
          selected
            ? 'bg-sky-600/25 border-sky-500/60 shadow-md shadow-sky-900/30'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 shrink-0 ${cat.color}`}>{cat.icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-300 truncate leading-tight">{doc.code}</p>
          <p className="text-xs text-gray-400 leading-tight mt-0.5 line-clamp-2">{doc.title}</p>
          {doc.pdfFilename && (
            <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-emerald-400/70">
              <FileIcon size={9} /> PDF
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Section Accordion ───────────────────────────────────────────
function SectionPanel({ section }: { section: DocSection }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-sky-300">{section.title}</span>
        {open ? (
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-gray-400 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 py-4 bg-white/[0.03] space-y-3">
          {section.content.map((line, i) => {
            const isBlank = line.trim() === '';
            // ⛔ Critical warning header
            const isCritical = line.startsWith('⛔');
            // PROHIBIDO lines
            const isProhibido = line.startsWith('PROHIBIDO');
            // ESTADO ACTUAL table rows
            const isStatusRow =
              line.includes(': NO INSTALADOS') ||
              line.includes(': NO A BORDO') ||
              line.includes(': INSTALADO') ||
              line.includes(': A BORDO') ||
              line.includes(': Disponibles en Base');
            const isHeader =
              !isCritical &&
              !isProhibido &&
              (line.startsWith('—') ||
                line.startsWith('PASO') ||
                line.startsWith('SEÑAL') ||
                line.startsWith('PRECAUCIÓN') ||
                line.startsWith('PROCEDIMIENTO') ||
                line.startsWith('ZONA') ||
                line.startsWith('BASE') ||
                line.startsWith('FRECUENCIAS') ||
                line.startsWith('PROTOCOLO') ||
                line.startsWith('PAUTAS') ||
                line.startsWith('FÓRMULA') ||
                line.startsWith('Fabricante') ||
                line.startsWith('NOTA') ||
                line.startsWith('LÍMITE'));
            const isIndented = !isCritical && line.startsWith('  ');

            if (isBlank) return <div key={i} className="h-1" />;

            if (isCritical)
              return (
                <div key={i} className="flex items-start gap-2 bg-rose-950/50 border border-rose-600/50 rounded-lg px-3 py-2 my-1">
                  <span className="text-rose-400 text-base shrink-0">⛔</span>
                  <p className="text-xs font-bold text-rose-300 uppercase tracking-wide leading-tight">
                    {line.replace('⛔ ', '').replace('⛔', '')}
                  </p>
                </div>
              );

            if (isProhibido)
              return (
                <div key={i} className="flex items-start gap-2 bg-rose-900/30 border-l-4 border-rose-500 rounded-r-lg px-3 py-2 my-1">
                  <span className="text-rose-400 shrink-0 mt-0.5 font-black text-xs">✕</span>
                  <p className="text-sm font-semibold text-rose-200 leading-snug">{line}</p>
                </div>
              );

            if (isStatusRow) {
              const [label, value] = line.split(': ');
              const isOk = value?.startsWith('INSTALADO') || value?.startsWith('A BORDO') || value?.startsWith('Disponibles');
              return (
                <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOk ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                    {value}
                  </span>
                </div>
              );
            }

            if (isHeader)
              return (
                <p key={i} className="text-xs font-bold text-amber-400 uppercase tracking-wide pt-2">
                  {line}
                </p>
              );
            if (isIndented)
              return (
                <p key={i} className="text-xs text-gray-300 pl-4 border-l-2 border-sky-700/50 leading-relaxed">
                  {line.trim()}
                </p>
              );
            return (
              <p key={i} className="text-sm text-gray-200 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PDF Viewer ───────────────────────────────────────────────────
function PdfViewer({ doc }: { doc: AviationDoc }) {
  const [pdfScale, setPdfScale] = useState(100);
  const [localFile, setLocalFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Determine the PDF source to use
  const activePdfSrc = localFile ?? (doc.pdfUrl?.startsWith('http') ? null : doc.pdfUrl) ?? null;
  const localPath = doc.pdfFilename ? `/docs/${doc.pdfFilename}` : null;

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalFile(url);
    setHasError(false);
    setLoading(true);
  }, []);

  const handleReset = () => {
    if (localFile) URL.revokeObjectURL(localFile);
    setLocalFile(null);
    setHasError(false);
    setLoading(true);
  };

  // Try local /docs/ path first, then external URL
  const iframeSrc = localFile ?? localPath ?? doc.pdfUrl;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* PDF toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
          <button
            onClick={() => setPdfScale((s) => Math.max(50, s - 10))}
            className="p-0.5 text-gray-400 hover:text-white transition-colors"
            title="Reducir zoom"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-gray-300 w-10 text-center font-mono">{pdfScale}%</span>
          <button
            onClick={() => setPdfScale((s) => Math.min(200, s + 10))}
            className="p-0.5 text-gray-400 hover:text-white transition-colors"
            title="Aumentar zoom"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setPdfScale(100)}
            className="p-0.5 text-gray-400 hover:text-white transition-colors"
            title="Restablecer zoom"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        <div className="flex-1" />

        {/* Upload local PDF */}
        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-gray-300 transition-colors">
          <Upload size={12} />
          Cargar PDF local
          <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
        </label>

        {localFile && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-xs text-rose-300 hover:bg-rose-500/30 transition-colors"
          >
            <X size={12} /> Quitar
          </button>
        )}

        {/* Open in new tab */}
        {iframeSrc && (
          <a
            href={iframeSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/35 border border-sky-500/30 text-xs text-sky-300 transition-colors"
          >
            <Maximize2 size={12} />
            Abrir en nueva pestaña
          </a>
        )}

        {doc.pdfUrl?.startsWith('http') && !localFile && (
          <a
            href={doc.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/30 text-xs text-emerald-300 transition-colors"
          >
            <Download size={12} />
            Descargar ANAC
          </a>
        )}
      </div>

      {/* PDF Frame area */}
      <div className="flex-1 rounded-xl overflow-hidden border border-white/10 bg-gray-950 relative min-h-0">
        {iframeSrc && !hasError ? (
          <>
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 z-10 gap-3">
                <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Cargando PDF…</p>
              </div>
            )}
            <iframe
              key={iframeSrc}
              src={`${iframeSrc}#zoom=${pdfScale}&view=FitH`}
              className="w-full h-full border-0"
              title={`PDF: ${doc.title}`}
              onLoad={() => setLoading(false)}
              onError={() => {
                setHasError(true);
                setLoading(false);
              }}
            />
          </>
        ) : (
          /* No PDF available — show instructions */
          <div className="h-full flex flex-col items-center justify-center gap-5 p-6 text-center">
            {hasError ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <AlertCircle size={26} className="text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-300 mb-1">No se pudo cargar el PDF</p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    El archivo no está disponible en la ruta configurada. Carga el PDF manualmente con el botón de arriba.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <FileIcon size={26} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200 mb-2">PDF no configurado</p>
                  <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                    Para visualizar este manual, coloca el archivo PDF en la carpeta del servidor:
                  </p>
                  {doc.pdfFilename && (
                    <code className="mt-2 block bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-sky-300 font-mono">
                      /public/docs/{doc.pdfFilename}
                    </code>
                  )}
                  <p className="text-xs text-gray-600 mt-3">
                    — o carga el archivo directamente con el botón —
                  </p>
                </div>
              </>
            )}

            {/* Upload zone */}
            <label className="cursor-pointer flex flex-col items-center gap-2 border-2 border-dashed border-white/15 hover:border-sky-500/50 rounded-xl px-8 py-5 transition-colors group">
              <Upload size={20} className="text-gray-500 group-hover:text-sky-400 transition-colors" />
              <span className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
                Haz clic o arrastra un PDF aquí
              </span>
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
            </label>

            {/* External link for ANAC docs */}
            {doc.pdfUrl?.startsWith('http') && (
              <a
                href={doc.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2"
              >
                <ExternalLink size={12} />
                Abrir en sitio oficial ANAC Argentina
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Resumen Tab ──────────────────────────────────────────────────
function ResumenViewer({ doc }: { doc: AviationDoc }) {
  const cat = CATEGORIES[doc.category];
  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 p-5 shadow-lg">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={catBadge(doc.category)}>
            {cat.icon}&nbsp;{cat.label}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300 border border-white/10">
            <Tag size={11} />
            {doc.code}
          </span>
        </div>
        <h2 className="text-lg font-bold text-white leading-snug mb-2">{doc.title}</h2>
        <p className="text-sm text-gray-300 leading-relaxed">{doc.summary}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <Calendar size={12} />
          <span>Última revisión: {doc.lastRevision}</span>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-sky-900/20 border border-sky-700/30 rounded-2xl p-4">
        <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <BookOpen size={13} /> Puntos Clave
        </h3>
        <ul className="space-y-2">
          {doc.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
              <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400" />
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* Sections */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
          <FileText size={13} /> Contenido por Sección
        </h3>
        {doc.sections?.length > 0 ? (
          doc.sections.map((s) => <SectionPanel key={s.id} section={s} />)
        ) : (
          <p className="text-sm text-gray-500 italic">No hay secciones detalladas.</p>
        )}
      </div>
    </div>
  );
}

// ─── Document Viewer (tabs: Resumen | PDF) ────────────────────────
function DocViewer({ doc }: { doc: AviationDoc }) {
  const [tab, setTab] = useState<TabType>('resumen');

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setTab('resumen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
            ${tab === 'resumen'
              ? 'bg-sky-600/30 border-sky-500/60 text-sky-200 shadow shadow-sky-900/30'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
            }`}
        >
          <BookOpen size={14} />
          Resumen & Índice
        </button>
        <button
          onClick={() => setTab('pdf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
            ${tab === 'pdf'
              ? 'bg-amber-600/30 border-amber-500/60 text-amber-200 shadow shadow-amber-900/30'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
            }`}
        >
          <FileIcon size={14} />
          Visor PDF
          {(doc.pdfUrl || doc.pdfFilename) && (
            <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {tab === 'resumen' ? (
          <ResumenViewer doc={doc} />
        ) : (
          <div className="h-full flex flex-col">
            <PdfViewer doc={doc} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Module ──────────────────────────────────────────────────
function AviationLibraryModule() {
  const [selectedId, setSelectedId] = useState<string>(AVIATION_LIBRARY_DOCS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<AviationDoc['category'] | typeof CAT_FILTER_ALL>(
    CAT_FILTER_ALL
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return AVIATION_LIBRARY_DOCS.filter((d) => {
      const matchCat = categoryFilter === CAT_FILTER_ALL || d.category === categoryFilter;
      const matchSearch =
        !q ||
        d.title.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  const effectiveSelectedId =
    filteredDocs.find((d) => d.id === selectedId)?.id ?? filteredDocs[0]?.id ?? selectedId;
  const effectiveDoc =
    AVIATION_LIBRARY_DOCS.find((d) => d.id === effectiveSelectedId) ?? AVIATION_LIBRARY_DOCS[0];

  const categoryKeys = Object.keys(CATEGORIES) as AviationDoc['category'][];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-slate-900/60 shrink-0">
        <button
          className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <BookOpen size={18} className="text-sky-400 shrink-0" />
        <h1 className="text-sm font-bold text-white">Biblioteca Digital</h1>
        <div className="flex-1" />
        <div className="relative w-48 md:w-64">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar en biblioteca…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white/10 border border-white/15 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex gap-2 px-4 py-2 border-b border-white/10 bg-slate-900/40 shrink-0 overflow-x-auto">
        <button
          onClick={() => setCategoryFilter(CAT_FILTER_ALL)}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all
            ${categoryFilter === CAT_FILTER_ALL
              ? 'bg-sky-600/40 border-sky-500 text-sky-200'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
        >
          Todos ({AVIATION_LIBRARY_DOCS.length})
        </button>
        {categoryKeys.map((cat) => {
          const cfg = CATEGORIES[cat];
          const count = AVIATION_LIBRARY_DOCS.filter((d) => d.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all
                ${categoryFilter === cat
                  ? `${cfg.bg} ${cfg.color} border-current`
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
            >
              {cfg.icon}
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`
            flex-none w-72 border-r border-white/10 bg-slate-900/50 flex flex-col overflow-hidden
            transition-transform duration-300
            md:relative md:translate-x-0
            ${sidebarOpen
              ? 'absolute inset-y-0 left-0 z-30 translate-x-0 shadow-2xl'
              : 'absolute md:static -translate-x-full md:translate-x-0'
            }
          `}
        >
          <div className="px-3 py-2 shrink-0">
            <p className="text-xs text-gray-500 font-medium">
              {filteredDocs.length} documento{filteredDocs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                <Search size={28} className="mx-auto mb-2 opacity-30" />
                Sin resultados.
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <DocListItem
                  key={doc.id}
                  doc={doc}
                  selected={doc.id === effectiveSelectedId}
                  onSelect={() => {
                    setSelectedId(doc.id);
                    setSidebarOpen(false);
                  }}
                />
              ))
            )}
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden absolute inset-0 z-20 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Viewer */}
        <main className="flex-1 overflow-hidden p-4 md:p-5">
          {effectiveDoc ? (
            <DocViewer doc={effectiveDoc} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BookOpen size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Selecciona un documento del panel lateral.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export { AviationLibraryModule };
export default AviationLibraryModule;
