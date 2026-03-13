'use client';

import { useState } from 'react';
import type { FormField } from '@/lib/types';

interface ApplicationFormProps {
  fields: FormField[];
  onSubmit: (answers: Record<string, string | string[]>) => Promise<void>;
  disabled?: boolean;
}

export default function ApplicationForm({ fields, onSubmit, disabled }: ApplicationFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const updateAnswer = (fieldId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const toggleCheckboxOption = (fieldId: string, option: string) => {
    const current = (answers[fieldId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    updateAnswer(fieldId, updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      if (!field.required) continue;

      const value = answers[field.id];

      if (field.type === 'checkbox') {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = '필수 항목입니다';
        }
      } else {
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors[field.id] = '필수 항목입니다';
        }
      }

      if (field.type === 'email' && value && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.id] = '올바른 이메일 주소를 입력하세요';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(answers);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.id];

    switch (field.type) {
      case 'text':
      case 'tel':
      case 'email':
        return (
          <input
            type={field.type}
            value={(answers[field.id] as string) || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder={
              field.type === 'tel'
                ? '010-1234-5678'
                : field.type === 'email'
                  ? 'example@email.com'
                  : ''
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm ${
              hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={(answers[field.id] as string) || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none ${
              hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    answers[field.id] === option
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300 group-hover:border-indigo-400'
                  }`}
                >
                  {answers[field.id] === option && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options ? (
              field.options.map((option) => {
                const checked = ((answers[field.id] as string[]) || []).includes(option);
                return (
                  <label
                    key={option}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        checked
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300 group-hover:border-indigo-400'
                      }`}
                      onClick={() => toggleCheckboxOption(field.id, option)}
                    >
                      {checked && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                );
              })
            ) : (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    answers[field.id]
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300 group-hover:border-indigo-400'
                  }`}
                  onClick={() =>
                    updateAnswer(field.id, answers[field.id] ? [] : [field.label])
                  }
                >
                  {answers[field.id] && (Array.isArray(answers[field.id]) ? (answers[field.id] as string[]).length > 0 : true) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700">{field.label}</span>
              </label>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            {field.type !== 'checkbox' && field.label}
            {field.required && field.type !== 'checkbox' && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          {renderField(field)}
          {errors[field.id] && (
            <p className="text-xs text-red-500">{errors[field.id]}</p>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading || disabled}
        className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {loading ? '제출 중...' : '신청하기'}
      </button>
    </form>
  );
}
