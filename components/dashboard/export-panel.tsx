'use client';

import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Clipboard, Download, Info } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { buildIndustrialCarbonContextReport, GeneratedContextReport } from '@/lib/report-engine';
import { useCarbonStore } from '@/lib/store';

function toPdf(report: GeneratedContextReport): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 34;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  const writeFooter = () => {
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `AuraCarbon v3 | Decision-Support Artifact | Generated: ${report.metadata.generatedAtIso}`,
      margin,
      pageHeight - 16
    );
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 16, { align: 'right' });
  };

  const drawSectionTitle = (title: string, y: number, color: [number, number, number]) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, y, contentWidth, 24, 4, 4, 'F');
    doc.setTextColor(18, 18, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, margin + 10, y + 16);
  };

  doc.setFillColor(18, 18, 18);
  doc.roundedRect(margin, margin, contentWidth, 78, 8, 8, 'F');
  doc.setTextColor(0, 255, 136);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text('Industrial Carbon Context Report', margin + 12, margin + 24);
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text(`Label: ${report.metadata.decisionTag}`, margin + 12, margin + 42);
  doc.text(`App: ${report.metadata.appVersion}`, margin + 12, margin + 56);
  doc.text(`Generated (UTC): ${report.metadata.generatedAtIso}`, margin + 12, margin + 70);

  let y = margin + 92;

  drawSectionTitle('System Metadata & Responsible AI', y, [0, 204, 255]);
  y += 30;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['Field', 'Value']],
    body: [
      ['Country Grid', report.metadata.country],
      ['Total Product Output', `${report.metadata.totalProductOutput} tons`],
      ['Responsible AI Disclaimer', report.metadata.disclaimer],
    ],
    styles: { fontSize: 9, cellPadding: 6, textColor: [230, 230, 230], fillColor: [30, 30, 30] },
    headStyles: { fillColor: [0, 204, 255], textColor: [18, 18, 18], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [38, 38, 38] },
    margin: { left: margin, right: margin },
  });

  y = ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || y) + 14;
  drawSectionTitle('Raw Input Data (RecipeBuilder)', y, [0, 255, 136]);
  y += 30;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['#', 'Material/Fuel', 'Process', 'Quantity', 'Estimated Emissions (kg CO2e)']],
    body: report.rows.length
      ? report.rows.map((row) => [
          row.index.toString(),
          row.materialOrFuel,
          row.process,
          row.quantityWithUnit,
          row.estimatedEmissionsKg.toFixed(2),
        ])
      : [['-', 'No input rows provided', '-', '-', '-']],
    styles: { fontSize: 8.5, cellPadding: 5, textColor: [230, 230, 230], fillColor: [30, 30, 30] },
    headStyles: { fillColor: [0, 255, 136], textColor: [18, 18, 18], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [38, 38, 38] },
    margin: { left: margin, right: margin },
  });

  y = ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || y) + 14;
  drawSectionTitle('Technical Metrics', y, [255, 204, 0]);
  y += 30;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['Metric', 'Value']],
    body: [
      ['Total Emissions', `${report.metrics.totalKg.toFixed(2)} kg CO2e (${report.metrics.totalTonnes.toFixed(4)} tCO2e)`],
      ['Scope 1', `${report.metrics.scope1Kg.toFixed(2)} kg CO2e`],
      ['Scope 2', `${report.metrics.scope2Kg.toFixed(2)} kg CO2e`],
      ['Scope 3', `${report.metrics.scope3Kg.toFixed(2)} kg CO2e`],
      ['Carbon Intensity', `${report.metrics.carbonIntensity.toFixed(4)} tCO2e/t`],
      ['EU CBAM Risk Score', report.metrics.cbamRisk],
    ],
    styles: { fontSize: 9, cellPadding: 6, textColor: [230, 230, 230], fillColor: [30, 30, 30] },
    headStyles: { fillColor: [255, 204, 0], textColor: [18, 18, 18], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [38, 38, 38] },
    margin: { left: margin, right: margin },
  });

  y = ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || y) + 14;
  drawSectionTitle('Local Base Recommendations (E4C-Validated)', y, [255, 51, 102]);
  y += 30;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [['Category', 'Technology', 'Reduction %', 'Implementation & Limitations']],
    body: report.recommendations.map((item) => [
      item.category,
      `${item.title}\n${item.alternative}`,
      `${item.reductionPercent}%`,
      `Implementation: ${item.implementation}\nLimitations: ${item.limitations}`,
    ]),
    styles: { fontSize: 8, cellPadding: 5, textColor: [230, 230, 230], fillColor: [30, 30, 30], overflow: 'linebreak' },
    headStyles: { fillColor: [255, 51, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [38, 38, 38] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 130 },
      2: { cellWidth: 60, halign: 'center' },
      3: { cellWidth: contentWidth - 70 - 130 - 60 },
    },
  });

  y = ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || y) + 18;
  if (y > pageHeight - 180) {
    writeFooter();
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 204, 255);
  doc.text('E4C Knowledgebase References & Citations', margin, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  report.citations.forEach((citation, index) => {
    if (y > pageHeight - 38) {
      writeFooter();
      doc.addPage();
      y = margin;
    }
    const line = `${index + 1}. ${citation.sourceTitle} - ${citation.sourceUrl}`;
    const wrapped = doc.splitTextToSize(line, contentWidth);
    wrapped.forEach((segment: string) => {
      doc.text(segment, margin, y);
      y += 11;
    });
    y += 3;
  });

  if (y > pageHeight - 60) {
    writeFooter();
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(120, 120, 120);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 51, 102);
  doc.text('Responsible AI Guardrail', margin, y);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  const disclaimerLines = doc.splitTextToSize(report.metadata.disclaimer, contentWidth);
  disclaimerLines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 11;
  });

  writeFooter();

  return doc.output('blob');
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const { rows, factors, country, totalProductOutput } = useCarbonStore();
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);

  const canGenerate = useMemo(() => factors && rows.length > 0 && totalProductOutput > 0, [factors, rows, totalProductOutput]);

  const handleDownload = async () => {
    if (!factors) return;

    setDownloading(true);
    try {
      const report = buildIndustrialCarbonContextReport({
        rows,
        factors,
        country,
        totalProductOutput,
      });
      const pdfBlob = toPdf(report);
      const stamp = report.timestampIso.split('T')[0];
      downloadBlob(pdfBlob, `Industrial-Carbon-Context-Report-${stamp}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    if (!factors) return;

    setCopying(true);
    try {
      const report = buildIndustrialCarbonContextReport({
        rows,
        factors,
        country,
        totalProductOutput,
      });
      await navigator.clipboard.writeText(report.markdown);
    } finally {
      setCopying(false);
    }
  };

  return (
    <GlassCard className="w-full" delay={0.33}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-medium text-white tracking-wider uppercase">Export Panel</h3>
          <p className="text-xs text-white/50 mt-1">Decision-Support Artifact</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#00CCFF]/40 bg-[#00CCFF]/10 px-3 py-1 text-xs text-[#00CCFF]">
          <Info className="w-3.5 h-3.5" />
          Take this report to the E4C KnowledgeXpert Agentic App for deep technical chat and validated engineering guidance.
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 mb-4">
        <p className="text-xs text-white/60 leading-relaxed">
          Report includes system metadata, raw process/material input rows, scope breakdown, carbon intensity, EU CBAM risk, and E4C-validated local recommendations with traceable source URLs.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={!canGenerate || downloading}
          className="inline-flex items-center gap-2 rounded-md bg-[#00FF88]/20 px-4 py-2 text-sm text-[#00FF88] hover:bg-[#00FF88]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Preparing PDF...' : 'Download Report'}
        </button>
        <button
          onClick={handleCopy}
          disabled={!canGenerate || copying}
          className="inline-flex items-center gap-2 rounded-md bg-[#00CCFF]/20 px-4 py-2 text-sm text-[#00CCFF] hover:bg-[#00CCFF]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Clipboard className="w-4 h-4" />
          {copying ? 'Copying...' : 'Copy for KnowledgeXpert'}
        </button>
      </div>

      {!canGenerate && (
        <p className="text-xs text-[#FFCC00] mt-3">
          Add at least one recipe row and ensure factors are loaded to generate the report.
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/50">
        Advisory only. Requires human verification by a professional engineer. Calculated using 2026 EU CBAM default values and E4C Solutions Library data.
      </div>
    </GlassCard>
  );
}
