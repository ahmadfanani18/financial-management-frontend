'use client';

import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface ValidRow {
  date: string;
  description: string;
  categoryId?: string;
  accountId?: string;
  categoryName: string;
  accountName: string;
  fromAccountId?: string;
  toAccountId?: string;
  fromAccountName?: string;
  toAccountName?: string;
  amount: number;
  adminFee?: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
}

interface ErrorRow {
  row: number;
  data: Record<string, unknown>;
  error: string;
}

interface TransactionUploadPreviewProps {
  data: {
    validRows: ValidRow[];
    errorRows: ErrorRow[];
    summary: {
      valid: number;
      errors: number;
      total: number;
    };
  };
}

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'INCOME':
      return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400';
    case 'EXPENSE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400';
    case 'TRANSFER':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
};

export function TransactionUploadPreview({ data }: TransactionUploadPreviewProps) {
  const { validRows, errorRows, summary } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary.valid}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Valid Rows</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summary.errors}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Errors</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {summary.total}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total Rows</p>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase w-10">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Account/From</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">To</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {validRows.map((row, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                  <td className="px-3 py-2">{row.date}</td>
                  <td className="px-3 py-2 font-medium max-w-[150px] truncate">{row.description}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeColor(row.type)}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {row.type === 'TRANSFER' ? (
                      <span className="text-blue-600">{row.fromAccountName || row.fromAccountId}</span>
                    ) : (
                      <span>{row.accountName || row.categoryName}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {row.type === 'TRANSFER' ? (
                      <span className="text-blue-600 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        {row.toAccountName || row.toAccountId}
                        {row.adminFee && <span className="text-xs text-gray-500">(Fee: {row.adminFee.toLocaleString()})</span>}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-secondary rounded text-xs">
                        {row.categoryName}
                      </span>
                    )}
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${row.type === 'INCOME' ? 'text-green-600' : row.type === 'EXPENSE' ? 'text-red-600' : 'text-blue-600'}`}>
                    {row.type === 'INCOME' ? '+' : row.type === 'EXPENSE' ? '-' : ''}{row.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Valid
                    </span>
                  </td>
                </tr>
              ))}
              {errorRows.map((row, index) => (
                <tr key={index} className="bg-red-50/50 dark:bg-red-950/20">
                  <td className="px-3 py-2 text-gray-500 border-l-2 border-l-red-500">
                    {row.row}
                  </td>
                  <td className="px-3 py-2">{String(row.data.date || 'invalid-date')}</td>
                  <td className="px-3 py-2 font-medium max-w-[150px] truncate">{String(row.data.description || '-')}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      {String(row.data.type || 'unknown')}
                    </span>
                  </td>
                  <td className="px-3 py-2">-</td>
                  <td className="px-3 py-2">-</td>
                  <td className="px-3 py-2 text-right text-red-600 font-medium">
                    {typeof row.data.amount === 'number' ? row.data.amount.toLocaleString('id-ID') : String(row.data.amount || '-')}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-red-600 dark:text-red-400 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {row.error}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">Baris dengan error akan di-skip</p>
            <p className="text-amber-600 dark:text-amber-300 mt-0.5">Hanya baris valid yang akan di-import. Perbaiki dan upload ulang jika perlu.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
