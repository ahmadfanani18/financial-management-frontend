'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { categoryService, Category, CreateCategoryInput } from '@/services/category.service';
import { CategoryForm } from '@/components/forms/category-form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { CategoryCard } from '@/components/features/categories/category-card';
import { useI18n } from '@/components/i18n/i18n-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function CategorySkeleton() {
  return (
    <div className="bg-card border rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-24 rounded bg-muted mb-2" />
          <div className="h-3 w-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { t } = useI18n();
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
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryInput }) => 
      categoryService.update(id, data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
  });

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  const handleSubmit = async (data: CreateCategoryInput) => {
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, data });
        toast.success('Kategori berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Kategori berhasil dibuat');
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsFormOpen(false);
      setEditingCategory(undefined);
    } catch (err) {
      toast.error('Gagal menyimpan kategori');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success('Kategori berhasil dihapus');
      setDeleteConfirm({ open: false, category: null });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      toast.error('Gagal menghapus kategori');
    }
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteConfirm({ open: true, category });
  };

  const renderCategories = (cats: Category[]) => {
    if (isFetching) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CategorySkeleton key={i} />)}
        </div>
      );
    }
    if (cats.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">{t('categories.noCategories')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('categories.addFirst')}
          </p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('categories.title')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t('categories.manage')}</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('categories.addCategory')}
        </Button>
      </div>

      <FilterTabs
        tabs={[
          {
            value: 'expense',
            label: t('transactions.expense'),
            icon: <ArrowDownCircle className="w-4 h-4 text-rose-500" />,
            count: expenseCategories.length,
            badge: 'destructive',
          },
          {
            value: 'income',
            label: t('transactions.income'),
            icon: <ArrowUpCircle className="w-4 h-4 text-emerald-500" />,
            count: incomeCategories.length,
            badge: 'success',
          },
        ]}
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'expense' | 'income')}
      />

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        title={t('categories.deleteCategory')}
        description={`${t('messages.confirmDelete')} "${deleteConfirm.category?.name}"?`}
        confirmText={t('common.delete')}
        variant="destructive"
        isLoading={deleteMutation.isPending}
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
