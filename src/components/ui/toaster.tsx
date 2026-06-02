import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ position = 'top-right', ...props }: ToasterProps) => {
  return (
    <Sonner
      position={position}
      richColors
      {...props}
    />
  );
};

export { Toaster };