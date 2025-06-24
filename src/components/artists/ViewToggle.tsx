'use client';

import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

type ViewType = 'grid' | 'list';

type ViewToggleProps = {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
};

export function ViewToggle({ view, onViewChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`inline-flex items-center p-1 rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}>
      <Button
        type="button"
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-md ${view === 'grid' ? 'shadow-sm' : ''}`}
        onClick={() => onViewChange('grid')}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        className={`rounded-md ${view === 'list' ? 'shadow-sm' : ''}`}
        onClick={() => onViewChange('list')}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
