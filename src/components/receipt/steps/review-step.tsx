'use client';

import { Component } from 'react';
import axios from 'axios';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { analyzeReceipt } from '@/services/receipt.service';
import { ExtractedItem } from '@/types/receipt';

interface ReviewStepProps {
  imageBase64: string;
  onNext: (items: ExtractedItem[], total: number) => void;
  onBack: () => void;
}

interface State {
  loading: boolean;
  error: string | null;
  items: ExtractedItem[];
  total: number;
}

export class ReviewStep extends Component<ReviewStepProps, State> {
  private abortController: AbortController | null = null;
  private mounted = true;

  constructor(props: ReviewStepProps) {
    super(props);
    this.state = {
      loading: true,
      error: null,
      items: [],
      total: 0,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.extractData();
  }

  componentDidUpdate(prevProps: ReviewStepProps) {
    if (prevProps.imageBase64 !== this.props.imageBase64) {
      this.extractData();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async extractData() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    if (!this.mounted) return;
    this.setState({ loading: true, error: null });

    try {
      const result = await analyzeReceipt(this.props.imageBase64, this.abortController.signal);
      if (!this.mounted) return;
      this.setState({ items: result.items, total: result.total });
    } catch (err) {
      if (!this.mounted) return;
      if (axios.isCancel(err)) return;
      if (err instanceof Error && (err.name === 'CanceledError' || err.message?.includes('cancel'))) return;
      this.setState({ error: err instanceof Error ? err.message : 'Gagal menganalisis nota. Silakan coba lagi.' });
    } finally {
      if (this.mounted) {
        this.setState({ loading: false });
      }
    }
  }

  render() {
    const { loading, error, items, total } = this.state;
    const { onNext, onBack } = this.props;

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Menganalisis nota...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-destructive">{error}</p>
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={onBack}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Upload Ulang
            </Button>
          </div>
        </div>
      );
    }

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('id-ID').format(value);
    };

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Review Data</h2>
          <p className="text-sm text-muted-foreground">
            Periksa hasil ekstraksi data dari nota
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-medium">Item</th>
                <th className="text-right p-3 font-medium">Harga</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={`${item.name}-${i}`} className="border-t">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-right">Rp {formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total">Total</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rp</span>
            <Input
              id="total"
              type="text"
              value={formatCurrency(total)}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                this.setState({ total: parseInt(rawValue) || 0 });
              }}
              className="font-mono"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Upload Ulang
          </Button>
          <Button onClick={() => onNext(items, total)}>
            Konfirmasi
          </Button>
        </div>
      </div>
    );
  }
}
