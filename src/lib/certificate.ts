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
  const centerX = 148.5;

  // Full-page background
  doc.setFillColor(...SLATE_50);
  doc.rect(0, 0, 297, 210, 'F');

  // Minimal-margin border
  const margin = 6;
  doc.setDrawColor(...SKY_600);
  doc.setLineWidth(1.6);
  doc.rect(margin, margin, 297 - margin * 2, 210 - margin * 2);
  doc.setDrawColor(...SLATE_400);
  doc.setLineWidth(0.2);
  doc.rect(margin + 2.5, margin + 2.5, 297 - (margin + 2.5) * 2, 210 - (margin + 2.5) * 2);

  let y = 14;

  // Logo, large and centered at the top
  if (logoImg) {
    const imgHeight = 40;
    const aspectRatio = logoImg.width / logoImg.height;
    const imgWidth = imgHeight * aspectRatio;
    doc.addImage(logoImg.dataUrl, 'JPEG', centerX - imgWidth / 2, y, imgWidth, imgHeight);
    y += imgHeight;
  }

  y += 6;
  doc.setDrawColor(...SKY_500);
  doc.setLineWidth(0.6);
  doc.line(centerX - 22, y, centerX + 22, y);

  y += 12;
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...SLATE_900);
  doc.text('CERTIFICADO DE APROBACIÓN', centerX, y, { align: 'center' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...SLATE_600);
  doc.text('Se certifica que', centerX, y, { align: 'center' });

  y += 13;
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...SKY_600);
  doc.text(data.pilotName.toUpperCase(), centerX, y, { align: 'center' });

  if (data.licenseType && data.licenseNumber) {
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...SLATE_600);
    doc.text(`Lic. ${data.licenseType} N° ${data.licenseNumber}`, centerX, y, { align: 'center' });
  }

  y += 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...SLATE_600);
  doc.text('ha completado y aprobado exitosamente el', centerX, y, { align: 'center' });

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...SLATE_900);
  doc.text(data.courseTitle, centerX, y, { align: 'center' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SLATE_600);
  doc.text(data.achievementLine, centerX, y, { align: 'center' });

  if (data.footerNote) {
    y += 7;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_400);
    const lines = doc.splitTextToSize(data.footerNote, 210);
    doc.text(lines, centerX, y, { align: 'center' });
  }

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_400);
  doc.text(`Fecha de emisión: ${data.dateStr}   ·   N° ${data.certificateId}`, centerX, 163, { align: 'center' });

  // Signature Line and Position
  const lineY = 188;

  // Render transparent signature 50% larger (sigHeight = 24mm)
  if (signatureImg) {
    const sigHeight = 24; // 50% larger than 16mm
    const sigAspect = signatureImg.width / signatureImg.height;
    const sigWidth = sigHeight * sigAspect;
    const sigY = lineY - sigHeight + 2; // Overlaps line slightly
    doc.addImage(signatureImg.dataUrl, 'PNG', centerX - sigWidth / 2, sigY, sigWidth, sigHeight);
  }

  doc.setDrawColor(...SLATE_600);
  doc.setLineWidth(0.3);
  doc.line(centerX - 35, lineY, centerX + 35, lineY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...SLATE_900);
  doc.text('Eduardo J Forgan', centerX, lineY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_600);
  doc.text('IVH 12572581', centerX, lineY + 9, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...SKY_600);
  doc.text('Flight Express S.A.', centerX, lineY + 13, { align: 'center' });

  doc.save(`${data.fileNameBase}_${data.pilotName.replace(/\s+/g, '_')}.pdf`);
}

type LogoAsset = { dataUrl: string; width: number; height: number };

const LOGO_MAX_DIMENSION = 700;

function loadLogo(): Promise<LogoAsset | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = '/mas_logo.jpg';
    img.onload = () => {
      const scale = Math.min(1, LOGO_MAX_DIMENSION / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      
      const padding = 10;
      const paddedWidth = width + padding * 2;
      const paddedHeight = height + padding * 2;
      
      const canvas = document.createElement('canvas');
      canvas.width = paddedWidth;
      canvas.height = paddedHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(undefined);
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, paddedWidth, paddedHeight);
      ctx.drawImage(img, padding, padding, width, height);
      
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.9), width: paddedWidth, height: paddedHeight });
    };
    img.onerror = () => resolve(undefined);
  });
}

function loadSignature(): Promise<LogoAsset | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = '/firmabugy.jpg';
    img.onload = () => {
      const scale = Math.min(1, 600 / Math.max(img.width, img.height));
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
      
      // Make white background transparent
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 190 && g > 190 && b > 190) {
          data[i + 3] = 0; // Transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);
      
      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
    };
    img.onerror = () => resolve(undefined);
  });
}
