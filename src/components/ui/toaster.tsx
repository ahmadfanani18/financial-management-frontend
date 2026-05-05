import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ position = 'top-right', ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group pointer-events-auto fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[400px] p-4 bg-background border rounded-lg shadow-lg"
      position={position}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      richColors
      {...props}
    />
  );
};

export { Toaster };