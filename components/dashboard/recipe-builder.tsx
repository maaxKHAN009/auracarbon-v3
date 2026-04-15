'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { RecipeRow, useCarbonStore } from '@/lib/store';
import { PROCESSES, UNITS } from '@/lib/constants';
import { Plus, Trash2, Globe, Box, AlertCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildRecipePdf(params: {
  country: string;
  totalProductOutput: number;
  rows: RecipeRow[];
}): Blob {
  const { country, totalProductOutput, rows } = params;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 34;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  const addFooter = () => {
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(`AuraCarbon v3 | Recipe Export | Generated: ${new Date().toISOString()}`, margin, pageHeight - 16);
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
  doc.text('Recipe Input Data Export', margin + 12, margin + 24);
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text(`Country Grid: ${country}`, margin + 12, margin + 42);
  doc.text(`Total Product Output: ${totalProductOutput} tons`, margin + 12, margin + 56);
  doc.text(`Recipe Rows: ${rows.length}`, margin + 12, margin + 70);

  let y = margin + 92;

  drawSectionTitle('Detailed Recipe Table', y, [0, 255, 136]);
  y += 30;

  autoTable(doc, {
    startY: y,
    theme: 'grid',
    head: [[
      '#',
      'Material/Fuel',
      'Process',
      'Quantity',
      'Unit'
    ]],
    body: rows.length
      ? rows.map((row, index) => [
          `${index + 1}`,
          row.materialOrFuel,
          row.process,
          row.quantity.toFixed(3),
          row.unit,
        ])
      : [['-', 'No valid recipe rows', '-', '-', '-']],
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [230, 230, 230],
      fillColor: [30, 30, 30],
      overflow: 'linebreak'
    },
    headStyles: { fillColor: [0, 255, 136], textColor: [18, 18, 18], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [38, 38, 38] },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 24, halign: 'center' },
      1: { cellWidth: 180 },
      2: { cellWidth: 160 },
      3: { cellWidth: 90, halign: 'right' },
      4: { cellWidth: 80 },
    },
  });

  addFooter();
  return doc.output('blob');
}

async function buildRecipeXlsx(params: { country: string; totalProductOutput: number; rows: RecipeRow[] }): Promise<Blob> {
  const { country, totalProductOutput, rows } = params;
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Recipe');

  const blackFont = { color: { argb: 'FF000000' } };

  worksheet.addRow(['AuraCarbon Recipe Export']);
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.font = { ...blackFont, bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FAFF' } };

  worksheet.addRow([]);
  worksheet.addRow(['Country Grid', country, 'Total Product Output (Tons)', totalProductOutput, 'Generated At', new Date().toISOString(), '']);
  worksheet.mergeCells('B3:C3');
  worksheet.mergeCells('D3:E3');
  worksheet.mergeCells('F3:G3');

  const metadataRow = worksheet.getRow(3);
  metadataRow.eachCell((cell: any) => {
    cell.font = { ...blackFont, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5FFF2' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    };
  });

  worksheet.addRow([]);
  worksheet.addRow(['Row #', 'Material/Fuel', 'Process', 'Quantity', 'Unit', 'Country Grid', 'Total Product Output (Tons)']);
  const headerRow = worksheet.getRow(5);
  headerRow.eachCell((cell: any) => {
    cell.font = { ...blackFont, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFF7' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFB8B8B8' } },
      left: { style: 'thin', color: { argb: 'FFB8B8B8' } },
      bottom: { style: 'thin', color: { argb: 'FFB8B8B8' } },
      right: { style: 'thin', color: { argb: 'FFB8B8B8' } },
    };
  });

  rows.forEach((row, index) => {
    const dataRow = worksheet.addRow([
      index + 1,
      row.materialOrFuel,
      row.process,
      Number(row.quantity.toFixed(3)),
      row.unit,
      country,
      totalProductOutput,
    ]);

    dataRow.eachCell((cell: any) => {
      cell.font = { ...blackFont };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: index % 2 === 0 ? 'FFF9FDFF' : 'FFF7FFF9' },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    });

    // Approximate auto-fit row height when wrapped text is present.
    const rowValues = Array.isArray(dataRow.values) ? dataRow.values.slice(1) : [];
    const textLengths = rowValues.map((v: unknown) => String(v ?? '').length);
    const maxLen = Math.max(0, ...textLengths);
    dataRow.height = Math.max(20, Math.min(72, 18 + Math.ceil(maxLen / 24) * 10));
  });

  // Auto-fit columns by max content length.
  worksheet.columns.forEach((column: any) => {
    const values = column.values ?? [];
    const maxLength = values.reduce((acc: number, value: unknown) => {
      const text = String(value ?? '');
      return Math.max(acc, text.length);
    }, 10);
    column.width = Math.min(40, Math.max(12, maxLength + 2));
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function buildRecipeJson(params: { country: string; totalProductOutput: number; rows: RecipeRow[] }): Blob {
  const payload = {
    generatedAt: new Date().toISOString(),
    country: params.country,
    totalProductOutputTons: params.totalProductOutput,
    recipeRows: params.rows.map((row, index) => ({
      rowNumber: index + 1,
      materialOrFuel: row.materialOrFuel,
      process: row.process,
      quantity: Number(row.quantity.toFixed(3)),
      unit: row.unit,
    })),
  };

  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
}

export function RecipeBuilder() {
  const { 
    rows, 
    addRow, 
    updateRow, 
    removeRow, 
    country, 
    setCountry, 
    totalProductOutput, 
    setTotalProductOutput, 
    factors, 
    fetchFactors,
    isLoading,
    error,
    clearError
  } = useCarbonStore();
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingXlsx, setExportingXlsx] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);

  useEffect(() => {
    fetchFactors();
  }, [fetchFactors]);

  // Loading state
  if (isLoading && !factors) {
    return (
      <GlassCard className="w-full flex flex-col gap-6" delay={0.1}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-12 bg-white/10 rounded"></div>
          <div className="h-12 bg-white/10 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!factors) return null;

  const canExportRecipe = rows.some((row) => row.materialOrFuel && row.quantity > 0);

  const handleRecipeExport = async () => {
    if (!canExportRecipe) return;

    setExportingPdf(true);
    try {
      const validRows = rows.filter((row) => row.materialOrFuel && row.quantity > 0);
      const pdfBlob = buildRecipePdf({
        country,
        totalProductOutput,
        rows: validRows,
      });

      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(pdfBlob, `AuraCarbon-Recipe-Export-${stamp}.pdf`);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleRecipeXlsxExport = async () => {
    if (!canExportRecipe) return;

    setExportingXlsx(true);
    try {
      const validRows = rows.filter((row) => row.materialOrFuel && row.quantity > 0);
      const xlsxBlob = await buildRecipeXlsx({
        country,
        totalProductOutput,
        rows: validRows,
      });

      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(xlsxBlob, `AuraCarbon-Recipe-Export-${stamp}.xlsx`);
    } finally {
      setExportingXlsx(false);
    }
  };

  const handleRecipeJsonExport = async () => {
    if (!canExportRecipe) return;

    setExportingJson(true);
    try {
      const validRows = rows.filter((row) => row.materialOrFuel && row.quantity > 0);
      const jsonBlob = buildRecipeJson({
        country,
        totalProductOutput,
        rows: validRows,
      });

      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(jsonBlob, `AuraCarbon-Recipe-Export-${stamp}.json`);
    } finally {
      setExportingJson(false);
    }
  };

  return (
    <GlassCard className="w-full flex flex-col gap-6" delay={0.1}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-display font-semibold text-white tracking-wider uppercase">Project Configuration</h3>
          <p className="text-xs text-white/40 mt-1">Industrial Recipe Builder</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecipeExport}
            disabled={!canExportRecipe || exportingPdf}
            aria-label="Download full recipe as PDF"
            className="flex items-center gap-2 bg-[#00CCFF]/20 text-[#00CCFF] px-3 py-1.5 rounded-md hover:bg-[#00CCFF]/30 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> {exportingPdf ? 'Preparing PDF...' : 'Download Recipe PDF'}
          </button>
          <button
            onClick={handleRecipeXlsxExport}
            disabled={!canExportRecipe || exportingXlsx}
            aria-label="Download recipe as XLSX"
            className="flex items-center gap-2 bg-[#00FF88]/20 text-[#00FF88] px-3 py-1.5 rounded-md hover:bg-[#00FF88]/30 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> {exportingXlsx ? 'Preparing XLSX...' : 'Download Recipe XLSX'}
          </button>
          <button
            onClick={handleRecipeJsonExport}
            disabled={!canExportRecipe || exportingJson}
            aria-label="Download recipe as JSON"
            className="flex items-center gap-2 bg-[#FFCC00]/20 text-[#FFCC00] px-3 py-1.5 rounded-md hover:bg-[#FFCC00]/30 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> {exportingJson ? 'Preparing JSON...' : 'Download Recipe JSON'}
          </button>
          <button 
            onClick={addRow}
            aria-label="Add new material or fuel row"
            className="flex items-center gap-2 bg-[#00FF88]/20 text-[#00FF88] px-3 py-1.5 rounded-md hover:bg-[#00FF88]/30 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Row
          </button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-start gap-3 p-3 rounded-lg bg-[#FF3366]/10 border border-[#FF3366]/30"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-5 h-5 text-[#FF3366] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-[#FF3366]">{error}</p>
          </div>
          <button
            onClick={clearError}
            aria-label="Close error notification"
            className="text-[#FF3366]/60 hover:text-[#FF3366] text-xs font-medium"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black p-4 rounded-lg border border-white/10">
        <div>
          <label 
            htmlFor="country-select"
            className="block text-xs text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2"
          >
            <Globe className="w-4 h-4" /> Country Grid
          </label>
          <select 
            id="country-select"
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Select country for grid emission factor"
            className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-[#00CCFF]"
          >
            {Object.keys(factors.grids).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label 
            htmlFor="output-input"
            className="block text-xs text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2"
          >
            <Box className="w-4 h-4" /> Total Product Output (Tons)
          </label>
          <input 
            id="output-input"
            type="number" 
            value={totalProductOutput}
            onChange={(e) => setTotalProductOutput(Number(e.target.value))}
            aria-label="Total product output in tons"
            aria-describedby="output-help"
            className="w-full bg-black/20 border border-white/10 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-[#00CCFF]"
            min="1"
          />
          <p id="output-help" className="text-xs text-white/40 mt-1">Minimum 1 ton</p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {rows.map((row) => (
            <motion.div 
              key={row.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-12 gap-3 items-center bg-white/5 p-3 rounded-lg border border-white/10"
            >
              <div className="col-span-12 md:col-span-3">
                <select 
                  value={row.materialOrFuel} 
                  onChange={(e) => updateRow(row.id, 'materialOrFuel', e.target.value)}
                  aria-label="Select material or fuel"
                  className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00FF88]"
                >
                  <option value="" disabled>Select Item...</option>
                  <optgroup label="Materials">
                    {Object.keys(factors.materials).map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                  <optgroup label="Fuels">
                    {Object.keys(factors.fuels).map(f => <option key={f} value={f}>{f}</option>)}
                  </optgroup>
                </select>
              </div>
              
              <div className="col-span-12 md:col-span-3">
                <select 
                  value={row.process} 
                  onChange={(e) => updateRow(row.id, 'process', e.target.value)}
                  aria-label="Select process type"
                  className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00FF88]"
                >
                  {PROCESSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="col-span-6 md:col-span-2">
                <input 
                  type="number" 
                  value={row.quantity || ''}
                  onChange={(e) => updateRow(row.id, 'quantity', Number(e.target.value))}
                  aria-label="Quantity"
                  placeholder="Qty"
                  min="0"
                  step="0.01"
                  className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00FF88]"
                />
              </div>

              <div className="col-span-4 md:col-span-2">
                <select 
                  value={row.unit} 
                  onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                  aria-label="Select unit"
                  className="w-full bg-black/20 border border-white/10 rounded-md py-1.5 px-2 text-white text-sm focus:outline-none focus:border-[#00FF88]"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div className="col-span-2 md:col-span-2 flex justify-end">
                <button 
                  onClick={() => removeRow(row.id)}
                  aria-label={`Remove ${row.materialOrFuel || 'item'} row`}
                  className="p-1.5 text-[#FF3366]/60 hover:text-[#FF3366] hover:bg-[#FF3366]/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {rows.length === 0 && (
          <div className="text-center py-8 text-white/40 text-sm border border-dashed border-white/10 rounded-lg">
            No materials or processes added yet. Click "Add Row" to begin.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
