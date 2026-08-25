import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import { exportAsTxt, exportAsCsv, exportAsPdf } from '../lib/exportUtils';
import type { ExportableRow } from '../lib/exportUtils';

interface ExportButtonsProps {
  title: string;
  filenamePrefix: string;
  rows: ExportableRow[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ title, filenamePrefix, rows }) => {
  const { t } = useTranslation();
  const dateStamp = new Date().toISOString().split('T')[0];
  const baseFilename = `${filenamePrefix}_${dateStamp}`;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => exportAsTxt(`${baseFilename}.txt`, title, rows)}
        title={t('export.txt')}
        className="px-2.5 py-2 rounded bg-[var(--bg-void)] border border-[var(--ink-muted)]/30 hover:border-[var(--neon-cyan)] text-[var(--ink-muted)] hover:text-[var(--neon-cyan)] transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span className="text-[10px] font-mono font-bold hidden sm:inline">{t('export.txt_label')}</span>
      </button>
      <button
        onClick={() => exportAsCsv(`${baseFilename}.csv`, rows)}
        title={t('export.csv')}
        className="px-2.5 py-2 rounded bg-[var(--bg-void)] border border-[var(--ink-muted)]/30 hover:border-[var(--neon-green)] text-[var(--ink-muted)] hover:text-[var(--neon-green)] transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <FileSpreadsheet className="w-4 h-4 shrink-0" />
        <span className="text-[10px] font-mono font-bold hidden sm:inline">{t('export.csv_label')}</span>
      </button>
      <button
        onClick={() => exportAsPdf(`${baseFilename}.pdf`, title, rows)}
        title={t('export.pdf')}
        className="px-2.5 py-2 rounded bg-[var(--bg-void)] border border-[var(--ink-muted)]/30 hover:border-[var(--neon-magenta)] text-[var(--ink-muted)] hover:text-[var(--neon-magenta)] transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <FileDown className="w-4 h-4 shrink-0" />
        <span className="text-[10px] font-mono font-bold hidden sm:inline">{t('export.pdf_label')}</span>
      </button>
    </div>
  );
};
