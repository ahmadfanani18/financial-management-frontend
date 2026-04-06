'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isDefault: boolean;
  transactionCount: number;
}

const mockCategories: Category[] = [
  { id: '1', name: 'Makanan', type: 'EXPENSE', icon: '🍔', color: '#F97316', isDefault: true, transactionCount: 45 },
  { id: '2', name: 'Transportasi', type: 'EXPENSE', icon: '🚗', color: '#3B82F6', isDefault: true, transactionCount: 32 },
  { id: '3', name: 'Hiburan', type: 'EXPENSE', icon: '🎬', color: '#EF4444', isDefault: true, transactionCount: 18 },
  { id: '4', name: 'Belanja', type: 'EXPENSE', icon: '🛒', color: '#8B5CF6', isDefault: true, transactionCount: 28 },
  { id: '5', name: 'Gaji', type: 'INCOME', icon: '💰', color: '#10B981', isDefault: true, transactionCount: 4 },
  { id: '6', name: 'Freelance', type: 'INCOME', icon: '💼', color: '#06B6D4', isDefault: false, transactionCount: 8 },
];

export default function CategoriesPage() {
  const [categories] = useState(mockCategories);
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground">Kelola kategori untuk transaksi Anda</p>
        </div>
        <Button>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: category.color + '20' }}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{category.name}</p>
                        {category.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{category.transactionCount} transaksi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="income" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: category.color + '20' }}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{category.name}</p>
                        {category.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{category.transactionCount} transaksi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
