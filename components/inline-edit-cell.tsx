'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineEditCellProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number';
  formatter?: (value: string) => string;
}

export function InlineEditCell({
  value,
  onSave,
  placeholder = '',
  type = 'text',
  formatter,
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 bg-gray-800 text-white border-green-500/50 focus:border-green-400 focus:ring-green-400/50 placeholder:text-gray-400"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 hover:bg-green-500/20" 
          onClick={handleSave}
        >
          <Check className="h-4 w-4 text-green-500" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 hover:bg-red-500/20" 
          onClick={handleCancel}
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 group cursor-pointer hover:bg-green-500/10 hover:border hover:border-green-500/30 px-2 py-1 rounded transition-all"
      onClick={() => setIsEditing(true)}
    >
      <span className={value ? 'text-gray-200' : 'text-gray-500'}>
        {formatter ? formatter(value) : value || placeholder}
      </span>
      <Edit2 className="h-3 w-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
