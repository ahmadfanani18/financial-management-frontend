'use client';

import { useRouter } from 'next/navigation';
import { SearchResults } from '@/services/search.service';
import { Loader2 } from 'lucide-react';

interface SearchResultsDropdownProps {
  results: SearchResults | undefined;
  isLoading: boolean;
  isFetching: boolean;
  query: string;
  onClose: () => void;
}

export function SearchResultsDropdown({ 
  results, 
  isLoading, 
  isFetching,
  query, 
  onClose 
}: SearchResultsDropdownProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  if (isLoading || isFetching) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg p-4 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!results) {
    return null;
  }

  if (results.total === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
        No results found for "{query}"
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
      {results.transactions.length > 0 && (
        <div className="p-2 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">
            Transactions ({results.transactions.length})
          </h4>
          {results.transactions.map((t) => (
            <button
              key={t.id}
              className="w-full text-left px-2 py-2 hover:bg-muted rounded flex justify-between items-center"
              onClick={() => handleNavigate(`/transactions?id=${t.id}`)}
            >
              <span className="text-sm">{t.description}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(t.date).toLocaleDateString('id-ID')}
              </span>
            </button>
          ))}
        </div>
      )}

      {results.accounts.length > 0 && (
        <div className="p-2 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">
            Accounts ({results.accounts.length})
          </h4>
          {results.accounts.map((a) => (
            <button
              key={a.id}
              className="w-full text-left px-2 py-2 hover:bg-muted rounded"
              onClick={() => handleNavigate(`/accounts?id=${a.id}`)}
            >
              <span className="text-sm">{a.name}</span>
              <span className="text-xs text-muted-foreground ml-2">({a.type})</span>
            </button>
          ))}
        </div>
      )}

      {results.categories.length > 0 && (
        <div className="p-2 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">
            Categories ({results.categories.length})
          </h4>
          {results.categories.map((c) => (
            <button
              key={c.id}
              className="w-full text-left px-2 py-2 hover:bg-muted rounded"
              onClick={() => handleNavigate(`/categories?id=${c.id}`)}
            >
              <span className="text-sm">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {results.budgets.length > 0 && (
        <div className="p-2 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">
            Budgets ({results.budgets.length})
          </h4>
          {results.budgets.map((b) => (
            <button
              key={b.id}
              className="w-full text-left px-2 py-2 hover:bg-muted rounded"
              onClick={() => handleNavigate(`/budgets?id=${b.id}`)}
            >
              <span className="text-sm">{b.categoryName}</span>
            </button>
          ))}
        </div>
      )}

      {results.goals.length > 0 && (
        <div className="p-2 border-b">
          <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">
            Goals ({results.goals.length})
          </h4>
          {results.goals.map((g) => (
            <button
              key={g.id}
              className="w-full text-left px-2 py-2 hover:bg-muted rounded"
              onClick={() => handleNavigate(`/goals?id=${g.id}`)}
            >
              <span className="text-sm">{g.name}</span>
            </button>
          ))}
        </div>
      )}

      {results.plans.length > 0 && (
        <div className="p-2">
          <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">
            Plans ({results.plans.length})
          </h4>
          {results.plans.map((p) => (
            <button
              key={p.id}
              className="w-full text-left px-2 py-2 hover:bg-muted rounded"
              onClick={() => handleNavigate(`/plans?id=${p.id}`)}
            >
              <span className="text-sm">{p.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}