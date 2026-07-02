'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UploadStep } from './steps/upload-step';
import { ReviewStep } from './steps/review-step';
import { ConfirmationStep } from './steps/confirmation-step';
import { ExtractedItem, WizardStep } from '@/types/receipt';

interface ReceiptWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: { items: ExtractedItem[]; total: number; description: string }) => void;
}

export function ReceiptWizardModal({ open, onOpenChange, onComplete }: ReceiptWizardModalProps) {
  const [step, setStep] = useState<WizardStep>(1);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [description, setDescription] = useState('');

  const handleReset = () => {
    setStep(1);
    setImageBase64('');
    setItems([]);
    setTotal(0);
    setDescription('');
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleUploadNext = (base64: string) => {
    setImageBase64(base64);
    setStep(2);
  };

  const handleReviewNext = (extractedItems: ExtractedItem[], extractedTotal: number) => {
    setItems(extractedItems);
    setTotal(extractedTotal);
    setStep(3);
  };

  const handleConfirmationComplete = () => {
    const itemNames = items.map(i => i.name).join(', ');
    setDescription(`Nota: ${itemNames}`);
    onComplete({ items, total, description: `Nota: ${itemNames}` });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <div className="absolute right-4 top-4">
          <button
            onClick={handleClose}
            className="rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full transition-colors ${
                s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <UploadStep onNext={handleUploadNext} />
        )}

        {step === 2 && (
          <ReviewStep
            imageBase64={imageBase64}
            onNext={handleReviewNext}
            onBack={handleReset}
          />
        )}

        {step === 3 && (
          <ConfirmationStep
            items={items}
            total={total}
            onComplete={handleConfirmationComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
