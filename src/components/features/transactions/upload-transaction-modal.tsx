'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { transactionService } from '@/services/transaction.service';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, ChevronLeft, Download } from 'lucide-react';

interface PreviewData {
  validRows: unknown[];
  errorRows: unknown[];
  summary: { valid: number; errors: number; total: number };
}

interface UploadTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UploadTransactionModal({ open, onOpenChange, onSuccess }: UploadTransactionModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setFile(null);
      setPreviewData(null);
      setLoading(false);
      setIsDragOver(false);
    }
  }, [open]);

  const handleDownloadTemplate = async () => {
    try {
      await transactionService.downloadTemplate();
      toast.success('Template berhasil diunduh');
    } catch {
      toast.error('Gagal mengunduh template');
    }
  };

  const handleFileUpload = async (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      toast.error('Hanya file CSV atau XLSX yang diizinkan');
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const data = await transactionService.importPreview(selectedFile);
      setPreviewData(data);
      setStep(2);
      toast.success('File berhasil diupload');
    } catch {
      toast.error('Gagal membaca file');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const handleBack = () => {
    setStep(1);
    setFile(null);
    setPreviewData(null);
  };

  const handleImport = async () => {
    if (!previewData || previewData.validRows.length === 0) return;

    setLoading(true);
    try {
      const result = await transactionService.importConfirm(previewData.validRows);
      toast.success(`${result.imported} transaksi berhasil diimport${result.failed > 0 ? `, ${result.failed} gagal` : ''}`);
      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error('Gagal mengimport transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Import Transactions</DialogTitle>
              <DialogDescription>Upload CSV file to import transactions</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {step === 1 ? (
          <div className="p-6 space-y-6 overflow-auto">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Download Template CSV</h3>
                  <p className="text-sm text-gray-500 mt-1">Template includes your categories & accounts</p>
                </div>
                <Button variant="gradient" size="sm" onClick={handleDownloadTemplate} leftIcon={<Download className="h-4 w-4" />}>
                  Download
                </Button>
              </div>

              <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg border p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Template Format:</p>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto">
                  <div>Kolom: date*, description*, type*, category**, account**, fromAccount, toAccount, amount*, adminFee</div>
                  <div className="mt-1 text-gray-500">* = wajib semua type | ** = wajib income/expense, kosongkan untuk transfer</div>
                </div>
              </div>
            </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">Upload File</label>
                <div
                  className={`
                    dropzone rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                    ${isDragOver
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                      : 'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }
                  `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('csv-file-input')?.click()}
                >
                  <input
                    type="file"
                    id="csv-file-input"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  {!file ? (
                    <div id="dropzone-content">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Drop file CSV/XLSX di sini</p>
                      <p className="text-sm text-gray-500 mt-1">atau klik untuk browse</p>
                    </div>
                  ) : (
                    <div id="file-info">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 overflow-auto flex-1">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {previewData?.summary.valid ?? 0}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Valid Rows</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {previewData?.summary.errors ?? 0}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Errors</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {previewData?.summary.total ?? 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Rows</p>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-10">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Account</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {previewData?.validRows.map((row: unknown, index: number) => {
                      const r = row as { date?: string; description?: string; categoryName?: string; accountName?: string; amount?: number; type?: string };
                      return (
                        <tr key={index}>
                          <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                          <td className="px-3 py-2">{r.date}</td>
                          <td className="px-3 py-2 font-medium">{r.description}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded text-xs">
                              {r.categoryName}
                            </span>
                          </td>
                          <td className="px-3 py-2">{r.accountName}</td>
                          <td className={`px-3 py-2 text-right font-medium ${r.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                            {r.type === 'INCOME' ? '+' : '-'}{r.amount?.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              Valid
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {previewData?.errorRows.map((row: unknown, index: number) => {
                      const r = row as { row?: number; date?: string; description?: string; data?: { category?: string; account?: string }; amount?: number | string; error?: string };
                      return (
                        <tr className="bg-red-50/50 dark:bg-red-950/20">
                          <td className="px-3 py-2 text-gray-500 border-l-2 border-l-red-500">
                            {r.row || (previewData.validRows?.length ?? 0) + index + 1}
                          </td>
                          <td className="px-3 py-2">{r.date || 'invalid-date'}</td>
                          <td className="px-3 py-2 font-medium">{r.description}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                              {r.data?.category || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-3 py-2">{r.data?.account || '-'}</td>
                          <td className="px-3 py-2 text-right text-red-600 font-medium">
                            {typeof r.amount === 'number' ? r.amount.toLocaleString('id-ID') : r.amount}
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              {r.error || 'Error'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">⚠️</span>
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Rows with errors will be skipped</p>
                  <p className="text-amber-600 dark:text-amber-300 mt-0.5">Only valid rows will be imported. Please fix and re-upload if needed.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button variant="ghost" onClick={handleBack} leftIcon={<ChevronLeft className="h-4 w-4" />}>
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step === 2 && (
              <Button
                variant="gradient"
                onClick={handleImport}
                isLoading={loading}
                disabled={!previewData || previewData.validRows.length === 0}
              >
                Import {previewData?.validRows.length ?? 0} Transactions
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
