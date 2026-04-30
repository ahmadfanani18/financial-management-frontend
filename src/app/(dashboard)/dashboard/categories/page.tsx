'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { categoryService, Category, CreateCategoryInput } from '@/services/category.service';
import { CategoryForm } from '@/components/forms/category-form';

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

function CategoryCard({ 
  category, 
  onEdit, 
  onDelete 
}: { 
  category: Category; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow group relative">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: category.color + '20' }}
          >
            {category.icon || '📁'}
          </div>
          <div className="flex-1" onClick={onEdit}>
            <p className="font-medium">{category.name}</p>
            <Badge variant="secondary" className="text-xs">
              {category.isDefault ? 'Default' : 'Custom'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            {!category.isDefault && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const queryClient = useQueryClient();

  const { data: categories = [], isFetching } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryInput) => categoryService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  const handleSubmit = async (data: CreateCategoryInput) => {
    if (editingCategory) {
      await categoryService.update(editingCategory.id, data);
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsFormOpen(false);
    setEditingCategory(undefined);
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Hapus kategori "${category.name}"?`)) {
      deleteMutation.mutate(category.id);
    }
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
      return <div className="text-center py-8 text-muted-foreground">Belum ada kategori.</div>;
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cats.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={() => handleEdit(category)}
            onDelete={() => handleDelete(category)}
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

      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">Pengeluaran ({expenseCategories.length})</TabsTrigger>
          <TabsTrigger value="income">Pemasukan ({incomeCategories.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-4">
          {renderCategories(expenseCategories)}
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          {renderCategories(incomeCategories)}
        </TabsContent>
      </Tabs>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCategory(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={editingCategory}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
