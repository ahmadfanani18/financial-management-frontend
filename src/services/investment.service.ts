import { api } from '@/lib/api';

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  type: 'CRYPTO' | 'US_STOCK' | 'IDX_STOCK';
  shares: string;
  avgBuyPrice: string;
  currentPrice: string;
  currentValue: string;
  pnl: string;
  pnlPercent: number;
}

export interface InvestmentAccount {
  id: string;
  name: string;
  balance: string;
  type: 'INVESTMENT';
}

export interface Portfolio {
  account: InvestmentAccount;
  holdings: Holding[];
  totalUninvested: string;
  totalHoldingsValue: string;
  totalPortfolioValue: string;
  totalPnL: string;
}

export interface AssetSearchResult {
  symbol: string;
  name: string;
  type: 'CRYPTO' | 'US_STOCK' | 'IDX_STOCK';
}

export interface CreateHoldingInput {
  accountId: string;
  symbol: string;
  shares: string;
  avgBuyPrice: string;
}

export interface UpdateHoldingInput {
  accountId: string;
  shares?: string;
  avgBuyPrice?: string;
}

export const investmentService = {
  async getHoldings(accountId: string) {
    const response = await api.get<Portfolio>(`/investments/holdings?accountId=${accountId}`);
    return response;
  },

  async createHolding(data: CreateHoldingInput) {
    const response = await api.post<{ holding: { id: string } }>('/investments/holdings', data);
    return response.holding;
  },

  async updateHolding(id: string, data: UpdateHoldingInput) {
    const response = await api.put<{ holding: Holding }>(`/investments/holdings/${id}`, data);
    return response.holding;
  },

  async deleteHolding(id: string) {
    return api.delete(`/investments/holdings/${id}`);
  },

  async searchAssets(query: string, type?: 'CRYPTO' | 'US_STOCK' | 'IDX_STOCK') {
    const params = new URLSearchParams({ query });
    if (type) params.append('type', type);
    const response = await api.get<{ results: AssetSearchResult[] }>(`/market-prices/search?${params}`);
    return response.results;
  },

  async sellHolding(
    holdingId: string,
    data: {
      quantity: number;
      sellPrice: number;
      sellDate: string;
      brokerFee?: number;
    }
  ): Promise<{
    transactionId: string;
    symbol: string;
    quantity: number;
    sellPrice: number;
    sellDate: string;
    brokerFee: number;
    grossProceeds: number;
    netProceeds: number;
    realizedPnL: number;
    remainingQuantity: number;
    accountBalance: number;
  }> {
    const response = await api.post(`/holdings/${holdingId}/sell`, data);
    return response.data.data;
  },
};
