'use client';

import { useState } from 'react';
import { FormField, FormFieldType } from '@/lib/types';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

interface FormFieldEditorProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: '텍스트',
  tel: '전화번호',
  email: '이메일',
  radio: '객관식 (단일선택)',
  checkbox: '체크박스',
  textarea: '서술형',
};

export default function FormFieldEditor({ fields, onChange }: FormFieldEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState<{
    type: FormFieldType;
    label: string;
    required: boolean;
    options: string;
  }>({
    type: 'text',
    label: '',
    required: false,
    options: '',
  });

  const addField = () => {
    if (!newField.label.trim()) return;

    const field: FormField = {
      id: `custom_${Date.now()}`,
      type: newField.type,
      label: newField.label.trim(),
      required: newField.required,
    };

    if (newField.type === 'radio' || newField.type === 'checkbox') {
      field.options = newField.options
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    }

    onChange([...fields, field]);
    setNewField({ type: 'text', label: '', required: false, options: '' });
    setShowAddForm(false);
  };

  const removeField = (index: number) => {
    if (fields[index].builtin) return;
    onChange(fields.filter((_, i) => i !== index));
  };

  const toggleRequired = (index: number) => {
    const updated = fields.map((f, i) =>
      i === index ? { ...f, required: !f.required } : f
    );
    onChange(updated);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const updateFieldLabel = (index: number, label: string) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, label } : f));
    onChange(updated);
  };

  const updateFieldOptions = (index: number, optionsStr: string) => {
    const options = optionsStr
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    const updated = fields.map((f, i) => (i === index ? { ...f, options } : f));
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">신청서 필드</label>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Plus className="w-4 h-4" />
          필드 추가
        </button>
      </div>

      {/* 필드 목록 */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={`border rounded-lg p-3 ${
              field.builtin ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateFieldLabel(index, e.target.value)}
                    className="text-sm font-medium bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none flex-1 py-0.5"
                  />
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {FIELD_TYPE_LABELS[field.type]}
                  </span>
                </div>

                {(field.type === 'radio' || field.type === 'checkbox') && field.options && (
                  <input
                    type="text"
                    value={field.options.join(', ')}
                    onChange={(e) => updateFieldOptions(index, e.target.value)}
                    placeholder="옵션 (쉼표로 구분)"
                    className="text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 outline-none w-full mt-1 py-0.5"
                  />
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={() => toggleRequired(index)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  필수
                </label>

                <button
                  type="button"
                  onClick={() => moveField(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, 'down')}
                  disabled={index === fields.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>

                {!field.builtin && (
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 새 필드 추가 폼 */}
      {showAddForm && (
        <div className="border border-dashed border-indigo-300 rounded-lg p-4 bg-indigo-50/30 space-y-3">
          <h4 className="text-sm font-medium text-indigo-700">새 필드 추가</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">필드 유형</label>
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as FormFieldType })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">필드 이름</label>
              <input
                type="text"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                placeholder="예: 소속 기관"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {(newField.type === 'radio' || newField.type === 'checkbox') && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                옵션 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={newField.options}
                onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                placeholder="예: 옵션1, 옵션2, 옵션3"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              필수 입력
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={addField}
                disabled={!newField.label.trim()}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
