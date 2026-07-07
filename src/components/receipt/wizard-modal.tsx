'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { UploadStep } from './steps/upload-step';
import { ReviewStep } from './steps/review-step';
import { FormStep } from './steps/form-step';
import { ExtractedItem, WizardStep } from '@/types/receipt';

interface ReceiptWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
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
    setDescription(`Nota: ${extractedItems.map(i => i.name).join(', ')}`);
    setStep(3);
  };

  const handleFormComplete = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-lg font-semibold mb-4">Upload Nota</DialogTitle>

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
          <FormStep
            items={items}
            total={total}
            description={description}
            onBack={() => setStep(2)}
            onComplete={handleFormComplete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
