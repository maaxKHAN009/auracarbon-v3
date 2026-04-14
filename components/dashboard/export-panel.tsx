'use client';

import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { Clipboard, Download, Info } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { buildIndustrialCarbonContextReport } from '@/lib/report-engine';
import { useCarbonStore } from '@/lib/store';

function toPdf(reportText: string): Blob {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 36;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const lines = doc.splitTextToSize(reportText, maxWidth);

  doc.setFont('courier', 'normal');
  doc.setFontSize(9);

  let y = margin;
  lines.forEach((line: string) => {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 12;
  });

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
      const pdfBlob = toPdf(report.markdown);
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
