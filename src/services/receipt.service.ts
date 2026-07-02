import { api } from '@/lib/api';
import { ExtractionResult } from '@/types/receipt';

export async function analyzeReceipt(imageBase64: string): Promise<ExtractionResult> {
  const response = await api.post<ExtractionResult>('/analyze-receipt', {
    image: imageBase64,
  });
  return response;
}
