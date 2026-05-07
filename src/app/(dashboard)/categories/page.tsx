'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { categoryService, Category, CreateCategoryInput } from '@/services/category.service';
import { CategoryForm } from '@/components/forms/category-form';
import { useNotification } from '@/hooks/use-notification';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CategoryCard } from '@/components/features/categories/category-card';

function CategorySkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted" />
          <div className="flex-1">
            <div className="h-4 w-24 rounded bg-muted mb-2" />
            <div className="h-3 w-12 rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const { notify } = useNotification();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    category: Category | null;
  }>({ open: false, category: null });
  const queryClient = useQueryClient();

  const { data: categories = [], isFetching } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryInput) => categoryService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryInput }) => 
      categoryService.update(id, data),
    onSuccess: async () => {
      await new Promise(r => setTimeout(r, 100));
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  const handleSubmit = async (data: CreateCategoryInput) => {
    try {
      if (editingCategory) {
        await notify.promise(
          () => updateMutation.mutateAsync({ id: editingCategory.id, data }),
          notify.update('Kategori')
        );
      } else {
        await notify.promise(
          () => createMutation.mutateAsync(data),
          notify.create('Kategori')
        );
      }
      setIsFormOpen(false);
      setEditingCategory(undefined);
    } catch (err) {
      // Error handled by toast
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    notify.promise(
      () => deleteMutation.mutateAsync(category.id),
      notify.delete('Kategori')
    );
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteConfirm({ open: true, category });
  };

  const renderCategories = (cats: Category[]) => {
    if (isFetching) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CategorySkeleton key={i} />)}
        </div>
      );
    }
    if (cats.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">📂</span>
          </div>
          <p className="text-sm">Belum ada kategori.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Klik "Tambah Kategori" untuk membuat yang pertama.
          </p>
        </div>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cats.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => handleEdit(category)}
            onDelete={() => handleDeleteClick(category)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground">Kelola kategori untuk transaksi Anda</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <FilterTabs
        tabs={[
          {
            value: 'expense',
            label: 'Pengeluaran',
            icon: <ArrowDownCircle className="w-4 h-4 text-rose-500" />,
            count: expenseCategories.length,
            badge: 'destructive',
          },
          {
            value: 'income',
            label: 'Pemasukan',
            icon: <ArrowUpCircle className="w-4 h-4 text-emerald-500" />,
            count: incomeCategories.length,
            badge: 'success',
          },
        ]}
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'expense' | 'income')}
        className="mb-4"
      />

      <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'expense' && renderCategories(expenseCategories)}
        {activeTab === 'income' && renderCategories(incomeCategories)}
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, category: null })}
        onConfirm={() => {
          if (deleteConfirm.category) {
            handleDelete(deleteConfirm.category);
          }
        }}
        title="Hapus Kategori"
        description={`Apakah Anda yakin ingin menghapus kategori "${deleteConfirm.category?.name}"?`}
        confirmText="Hapus"
        variant="destructive"
      />

      <CategoryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCategory(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingCategory}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
