// One-off script: assembles public/docs/rfm-bo105-cbs4-sec{1..9}.pdf from the
// real RFM BO-105 flight manual PDFs in "RFM BO-105/", using the Basic Manual
// portion only (files 1-87, before the Supplements begin at file 88's
// "1--GENERAL.pdf" restart). Section boundaries were identified by reading
// the manual's own numbering (e.g. "6-4-..." = Section 6) and its
// "TABLE-OF-CONTENTS-x" transition pages.
//
// pdf-lib can't parse these source PDFs (malformed xref/object structure),
// so each source page is rendered to a raster image via pdfjs-dist (which is
// tolerant of malformed PDFs) and re-assembled into a PDF with jsPDF.
//
// Run with: node scripts/build-rfm-sections.mjs

import { readFile, mkdir, writeFile } from 'fs/promises';
import { readdirSync } from 'fs';
import path from 'path';
import { createCanvas } from '@napi-rs/canvas';
import { jsPDF } from 'jspdf';

const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const SRC_DIR = path.resolve('RFM BO-105');
const OUT_DIR = path.resolve('public/docs');
const SCALE = 2.0; // ~144 DPI, good balance of legibility vs file size

const SECTIONS = {
  1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  2: range(17, 28),
  3: range(29, 35),
  4: range(36, 43),
  5: range(44, 52),
  6: range(53, 61),
  7: range(62, 73),
  8: range(74, 78),
  9: range(79, 86),
};

function range(a, b) {
  const out = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

function findFileForNumber(files, n) {
  const prefix = `${n}_`;
  const match = files.find((f) => f.startsWith(prefix));
  if (!match) throw new Error(`No file found for page number ${n}`);
  return match;
}

const PDFJS_DIST_DIR = path
  .dirname(new URL(import.meta.resolve('pdfjs-dist/package.json')).pathname)
  .replace(/^\/([A-Za-z]:)/, '$1');
const toFactoryUrl = (dir) => (path.join(PDFJS_DIST_DIR, dir) + path.sep).split(path.sep).join('/');
const STANDARD_FONT_DATA_URL = toFactoryUrl('standard_fonts');
const WASM_URL = toFactoryUrl('wasm');

async function renderPdfPagesToImages(filePath) {
  const data = new Uint8Array(await readFile(filePath));
  const loadingTask = pdfjsLib.getDocument({
    data,
    isEvalSupported: false,
    disableFontFace: true,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
    wasmUrl: WASM_URL,
  });
  const doc = await loadingTask.promise;
  const images = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const ctx = canvas.getContext('2d');
    // white backdrop (scanned pages may have transparent areas)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push({
      buffer: canvas.toBuffer('image/jpeg', 0.85),
      widthPt: viewport.width / SCALE, // PDF points at scale 1 = 72dpi basis
      heightPt: viewport.height / SCALE,
    });
  }
  return images;
}

async function main() {
  const allFiles = readdirSync(SRC_DIR);
  await mkdir(OUT_DIR, { recursive: true });

  for (const [sectionNum, pageNumbers] of Object.entries(SECTIONS)) {
    let doc = null;
    const filesUsed = [];
    let totalPages = 0;

    for (const n of pageNumbers) {
      const filename = findFileForNumber(allFiles, n);
      filesUsed.push(filename);
      const images = await renderPdfPagesToImages(path.join(SRC_DIR, filename));
      for (const img of images) {
        const widthMm = (img.widthPt / 72) * 25.4;
        const heightMm = (img.heightPt / 72) * 25.4;
        if (!doc) {
          doc = new jsPDF({
            orientation: widthMm > heightMm ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [widthMm, heightMm],
          });
        } else {
          doc.addPage([widthMm, heightMm], widthMm > heightMm ? 'landscape' : 'portrait');
        }
        doc.addImage(img.buffer, 'JPEG', 0, 0, widthMm, heightMm);
        totalPages++;
      }
    }

    const outPath = path.join(OUT_DIR, `rfm-bo105-cbs4-sec${sectionNum}.pdf`);
    const arrayBuffer = doc.output('arraybuffer');
    await writeFile(outPath, Buffer.from(arrayBuffer));
    console.log(
      `Sección ${sectionNum}: ${filesUsed.length} archivos, ${totalPages} páginas -> ${outPath}`
    );
    console.log(`  fuentes: ${filesUsed.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
