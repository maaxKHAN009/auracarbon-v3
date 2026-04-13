/**
 * PDF Report Generator for AuraCarbon
 * Generates comprehensive emission analysis reports
 */

export interface ReportData {
  country: string;
  productOutput: number;
  rows: Array<{
    id: string;
    materialOrFuel: string;
    quantity: number;
    unit: string;
    process: string;
    emissions: number;
  }>;
  totals: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
    intensity: number;
  };
  generatedAt: string;
}

export async function generatePDFReport(data: ReportData): Promise<Blob> {
  // Dynamic import to avoid issues with SSR
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let startY = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(0, 255, 136); // Green
  doc.text('AuraCarbon Emission Analysis Report', pageWidth / 2, startY, { align: 'center' });
  
  startY += 15;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${data.generatedAt}`, pageWidth / 2, startY, { align: 'center' });

  // Executive Summary
  startY += 15;
  doc.setFontSize(14);
  doc.setTextColor(0, 204, 255); // Cyan
  doc.text('Executive Summary', 20, startY);
  
  startY += 10;
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text(`Country: ${data.country}`, 25, startY);
  startY += 7;
  doc.text(`Annual Product Output: ${data.productOutput.toLocaleString()} tonnes`, 25, startY);
  startY += 7;
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 25, startY);

  // Emissions Summary
  startY += 15;
  doc.setFontSize(14);
  doc.setTextColor(0, 204, 255);
  doc.text('Total Emissions Summary', 20, startY);
  
  startY += 10;
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text(`Total Emissions (CO2e): ${(data.totals.total / 1000).toFixed(2)} tonnes`, 25, startY);
  startY += 7;
  doc.text(`Carbon Intensity: ${data.totals.intensity.toFixed(4)} tCO2e/tonne product`, 25, startY);
  startY += 7;
  doc.text(`Scope 1 (Direct): ${(data.totals.scope1 / 1000).toFixed(2)} tonnes`, 25, startY);
  startY += 7;
  doc.text(`Scope 2 (Energy): ${(data.totals.scope2 / 1000).toFixed(2)} tonnes`, 25, startY);
  startY += 7;
  doc.text(`Scope 3 (Materials): ${(data.totals.scope3 / 1000).toFixed(2)} tonnes`, 25, startY);

  // Materials & Processes Table
  startY += 15;
  const tableData = data.rows.map(row => [
    row.materialOrFuel,
    `${row.quantity} ${row.unit}`,
    row.process,
    `${(row.emissions / 1000).toFixed(2)} t`,
  ]);

  autoTable(doc, {
    startY,
    head: [['Material/Fuel', 'Quantity', 'Process', 'Emissions']],
    body: tableData,
    theme: 'dark',
    headStyles: {
      fillColor: [0, 204, 255],
      textColor: [18, 18, 18],
      fontStyle: 'bold',
      fontSize: 11,
    },
    bodyStyles: {
      fillColor: [40, 40, 40],
      textColor: [200, 200, 200],
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [50, 50, 50],
    },
  });

  // Recommendations Footer
  const finalY = (doc as any).lastAutoTable?.finalY || startY + 50;
  doc.setFontSize(12);
  doc.setTextColor(0, 255, 136);
  doc.text('📋 Next Steps:', 20, finalY + 15);
  
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text('1. Review E4C-validated material alternatives in the AuraCarbon dashboard', 25, finalY + 22);
  doc.text('2. Click "View E4C Evidence" to verify technical solutions', 25, finalY + 29);
  doc.text('3. Consult with your engineering team on implementation feasibility', 25, finalY + 36);
  doc.text('4. Monitor progress using the Predictive Optimization module', 25, finalY + 43);

  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
