export interface ExtractedItem {
  name: string;
  price: number;
}

export interface ExtractionResult {
  items: ExtractedItem[];
  total: number;
  rawText?: string;
}

export interface ReceiptData {
  items: ExtractedItem[];
  total: number;
  description: string;
  imageBase64?: string;
}

export type WizardStep = 1 | 2 | 3;
