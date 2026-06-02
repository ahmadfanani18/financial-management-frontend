'use client';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  // Get icon: use first letter of name if icon is not a valid emoji
  const getDisplayIcon = () => {
    if (!category.icon) {
      return category.name.charAt(0).toUpperCase();
    }
    // Check if icon is a single emoji character
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    const isEmoji = emojiRegex.test(category.icon);
    if (isEmoji && category.icon.length <= 2) {
      return category.icon;
    }
    // Not a valid emoji, use first letter
    return category.name.charAt(0).toUpperCase();
  };

  const displayIcon = getDisplayIcon();

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
      
      <CardContent className="p-4 sm:p-5 relative">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon with dynamic background */}
          <div
            className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shrink-0",
              "shadow-sm transition-transform duration-300 group-hover:scale-105"
            )}
            style={iconBgStyle}
          >
            {displayIcon}
          </div>
          
          {/* Content - left side */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <h3 className="font-semibold text-sm sm:text-base truncate">
              {category.name}
            </h3>
            <Badge 
              variant={category.isDefault ? "secondary" : "outline"}
              className={cn(
                "mt-0.5 text-xs font-medium",
                category.isDefault && "bg-primary/10 text-primary border-primary/20"
              )}
            >
              {category.isDefault ? 'Default' : 'Custom'}
            </Badge>
          </div>

          {/* Action Button - right side */}
          <div className="shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Menu aksi</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {!category.isDefault && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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