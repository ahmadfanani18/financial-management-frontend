'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Category } from '@/services/category.service';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const iconBgStyle = {
    backgroundColor: `${category.color}15`,
    color: category.color,
  };

  const getDisplayIcon = () => {
    if (!category.icon) {
      return category.name.charAt(0).toUpperCase();
    }
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    const isEmoji = emojiRegex.test(category.icon);
    if (isEmoji && category.icon.length <= 2) {
      return category.icon;
    }
    return category.name.charAt(0).toUpperCase();
  };

  const displayIcon = getDisplayIcon();
  const typeLabel = category.type === 'EXPENSE' ? 'Pengeluaran' : 'Pendapatan';

  return (
    <Card 
      variant="interactive" 
      className="group relative overflow-hidden"
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${category.color}08 0%, transparent 50%)`,
        }}
      />
      
      <CardContent className="p-4 relative">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0",
              "transition-transform duration-300 group-hover:scale-105"
            )}
            style={iconBgStyle}
          >
            {displayIcon}
          </div>
          
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold text-sm truncate">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {typeLabel}
            </p>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            {!category.isDefault && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: category.color }}
        />
      </CardContent>
    </Card>
  );
}