import { toast } from 'sonner';

export function useNotification() {
  const notify = {
    success: (message: string) => {
      toast.success(message);
    },

    error: (message: string) => {
      toast.error(message);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    promise: (promise: (() => Promise<any>) | Promise<any>, options: any) => {
      const fn = typeof promise === 'function' ? promise : () => promise;
      return toast.promise(fn, {
        loading: options.loading || 'Loading...',
        success: options.success || 'Success',
        error: options.error || 'Error',
      });
    },

    create: (entity: string) => ({
      loading: `${entity} sedang dibuat...`,
      success: `${entity} berhasil dibuat`,
      error: (err: Error) => err.message || `Gagal membuat ${entity}`,
    }),

    update: (entity: string) => ({
      loading: `${entity} sedang diperbarui...`,
      success: `${entity} berhasil diperbarui`,
      error: (err: Error) => err.message || `Gagal memperbarui ${entity}`,
    }),

    delete: (entity: string) => ({
      loading: `${entity} sedang dihapus...`,
      success: `${entity} berhasil dihapus`,
      error: (err: Error) => err.message || `Gagal menghapus ${entity}`,
    }),
  };

  return { toast, notify };
}