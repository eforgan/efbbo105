export type CertificateData = {
  pilotName: string;
  licenseType?: string;
  licenseNumber?: string;
  courseTitle: string;
  achievementLine: string;
  dateStr: string;
  certificateId: string;
  footerNote?: string;
  fileNameBase: string;
};

const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_600: [number, number, number] = [71, 85, 105];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_400: [number, number, number] = [148, 163, 184];
const SLATE_50: [number, number, number] = [248, 250, 252];
const SKY_600: [number, number, number] = [2, 132, 199];
const SKY_500: [number, number, number] = [14, 165, 233];

export function generateCertificateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${prefix}-${rand}-${y}${m}${d}`;
}

export async function generateCertificatePdf(data: CertificateData): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const logoImg = await loadLogo();
  const signatureImg = await loadSignature();
  const centerX = 148.5; // A4 Landscape width (297mm) / 2

  // Full-page background
  doc.setFillColor(...SLATE_50);
  doc.rect(0, 0, 297, 210, 'F');

  // Double border frame
  const margin = 6;
  doc.setDrawColor(...SKY_600);
  doc.setLineWidth(1.6);
  doc.rect(margin, margin, 297 - margin * 2, 210 - margin * 2);
  doc.setDrawColor(...SLATE_400);
  doc.setLineWidth(0.3);
  doc.rect(margin + 2.5, margin + 2.5, 297 - (margin + 2.5) * 2, 210 - (margin + 2.5) * 2);

  let y = 14;

  // 1. Logo (Enlarged to 48mm height with transparent background)
  if (logoImg) {
    const imgHeight = 48;
    const aspectRatio = logoImg.width / logoImg.height;
    const imgWidth = imgHeight * aspectRatio;
    doc.addImage(logoImg.dataUrl, 'PNG', centerX - imgWidth / 2, y, imgWidth, imgHeight);
    y += imgHeight;
  }

  y += 5;
  doc.setDrawColor(...SKY_500);
  doc.setLineWidth(0.8);
  doc.line(centerX - 30, y, centerX + 30, y);

  // 2. Certificate Header
  y += 13;
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...SLATE_900);
  doc.text('CERTIFICADO DE APROBACIÓN', centerX, y, { align: 'center' });

  y += 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(...SLATE_600);
  doc.text('Se certifica que', centerX, y, { align: 'center' });

  // 3. Student / Pilot Name
  y += 14;
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...SKY_600);
  doc.text(data.pilotName.toUpperCase(), centerX, y, { align: 'center' });

  if (data.licenseType && data.licenseNumber) {
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...SLATE_600);
    doc.text(`Lic. ${data.licenseType} N° ${data.licenseNumber}`, centerX, y, { align: 'center' });
  }

  // 4. Course Details
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...SLATE_600);
  doc.text('ha completado y aprobado exitosamente el', centerX, y, { align: 'center' });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...SLATE_900);
  doc.text(data.courseTitle, centerX, y, { align: 'center' });

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...SLATE_600);
  doc.text(data.achievementLine, centerX, y, { align: 'center' });

  if (data.footerNote) {
    y += 8;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_400);
    const lines = doc.splitTextToSize(data.footerNote, 210);
    doc.text(lines, centerX, y, { align: 'center' });
  }

  // 5. Date & Certificate Code
  y += 9;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_400);
  doc.text(`Fecha de emisión: ${data.dateStr}   ·   N° ${data.certificateId}`, centerX, y, { align: 'center' });

  // 6. Signature Area (Enlarged signature to 30mm height with transparent background)
  const lineY = 188;

  if (signatureImg) {
    const sigHeight = 30; // Enlarged to 30mm for clear presence
    const sigAspect = signatureImg.width / signatureImg.height;
    const sigWidth = sigHeight * sigAspect;
    const sigY = lineY - sigHeight + 3; // Overlaps line naturally
    doc.addImage(signatureImg.dataUrl, 'PNG', centerX - sigWidth / 2, sigY, sigWidth, sigHeight);
  }

  doc.setDrawColor(...SLATE_600);
  doc.setLineWidth(0.4);
  doc.line(centerX - 38, lineY, centerX + 38, lineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...SLATE_900);
  doc.text('Eduardo J Forgan', centerX, lineY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_600);
  doc.text('IVH 12572581', centerX, lineY + 9, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...SKY_600);
  doc.text('Flight Express S.A.', centerX, lineY + 13, { align: 'center' });

  doc.save(`${data.fileNameBase}_${data.pilotName.replace(/\s+/g, '_')}.pdf`);
}

type LogoAsset = { dataUrl: string; width: number; height: number };

const LOGO_MAX_DIMENSION = 900;

function loadLogo(): Promise<LogoAsset | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = '/mas_logo.jpg';
    img.onload = () => {
      const scale = Math.min(1, LOGO_MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(undefined);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Remove white/light background for transparent PNG output
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 210 && g > 210 && b > 210) {
          data[i + 3] = 0; // Transparent alpha
        }
      }
      ctx.putImageData(imgData, 0, 0);
      
      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
    };
    img.onerror = () => resolve(undefined);
  });
}

function loadSignature(): Promise<LogoAsset | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = '/firmabugy.jpg';
    img.onload = () => {
      const scale = Math.min(1, 800 / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(undefined);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      
      // Remove white/light background for transparent PNG output
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 190 && g > 190 && b > 190) {
          data[i + 3] = 0; // Transparent alpha
        }
      }
      ctx.putImageData(imgData, 0, 0);
      
      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
    };
    img.onerror = () => resolve(undefined);
  });
}
