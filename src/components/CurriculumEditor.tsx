'use client';

import { CurriculumItem } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

interface CurriculumEditorProps {
  items: CurriculumItem[];
  onChange: (items: CurriculumItem[]) => void;
}

export default function CurriculumEditor({ items, onChange }: CurriculumEditorProps) {
  const addItem = () => {
    onChange([...items, { week: `${items.length + 1}주차`, title: '', desc: '' }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof CurriculumItem, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          커리큘럼 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Plus className="w-4 h-4" />
          주차 추가
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400 py-2">
          커리큘럼이 없습니다. &quot;주차 추가&quot; 버튼으로 추가하세요.
        </p>
      )}

      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={item.week}
              onChange={(e) => updateItem(index, 'week', e.target.value)}
              placeholder="1주차"
              className="w-24 px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={item.title}
            onChange={(e) => updateItem(index, 'title', e.target.value)}
            placeholder="주제 (예: 카메라의 기초)"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <textarea
            value={item.desc}
            onChange={(e) => updateItem(index, 'desc', e.target.value)}
            placeholder="설명 (선택)"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
          />
        </div>
      ))}
    </div>
  );
}
