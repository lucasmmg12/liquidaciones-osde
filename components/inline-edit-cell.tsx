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
          className="h-8"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}>
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 group cursor-pointer hover:bg-slate-50 px-2 py-1 rounded"
      onClick={() => setIsEditing(true)}
    >
      <span className={value ? '' : 'text-slate-400'}>
        {formatter ? formatter(value) : value || placeholder}
      </span>
      <Edit2 className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
