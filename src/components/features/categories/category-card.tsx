'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  return (
    <Card 
      variant="interactive" 
      className="group relative overflow-hidden"
    >
      {/* Subtle gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${category.color}08 0%, transparent 50%)`,
        }}
      />
      
      <CardContent className="p-5 relative">
        <div className="flex items-center gap-4">
          {/* Icon with dynamic background */}
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
              "shadow-sm transition-transform duration-300 group-hover:scale-105"
            )}
            style={iconBgStyle}
          >
            {category.icon || '📁'}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">
              {category.name}
            </h3>
            <Badge 
              variant={category.isDefault ? "secondary" : "outline"}
              className={cn(
                "mt-1 text-xs font-medium",
                category.isDefault && "bg-primary/10 text-primary border-primary/20"
              )}
            >
              {category.isDefault ? 'Default' : 'Custom'}
            </Badge>
          </div>
          
          {/* Action Buttons - Always visible on mobile, hover on desktop */}
          <div className={cn(
            "flex items-center gap-1",
            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
            "transition-all duration-200"
          )}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            {!category.isDefault && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: category.color }}
        />
      </CardContent>
    </Card>
  );
}