import axios from 'axios';
import { ExtractionResult } from '@/types/receipt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function analyzeReceipt(imageBase64: string, signal?: AbortSignal): Promise<ExtractionResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await axios.post<ExtractionResult>(
    `${API_URL}/analyze-receipt`,
    { image: imageBase64 },
    { signal, headers }
  );
  return response.data;
}
