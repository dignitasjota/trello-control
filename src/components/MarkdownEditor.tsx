'use client';

import { useState, useRef, useCallback } from 'react';
import MarkdownContent from './memories/MarkdownContent';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

type Action = {
  label: string;
  icon: string;
  prefix: string;
  suffix?: string;
  block?: boolean;
};

const ACTIONS: Action[] = [
  { label: 'Negrita', icon: 'B', prefix: '**', suffix: '**' },
  { label: 'Cursiva', icon: 'I', prefix: '_', suffix: '_' },
  { label: 'Codigo', icon: '<>', prefix: '`', suffix: '`' },
  { label: 'Heading', icon: 'H', prefix: '## ', block: true },
  { label: 'Lista', icon: '•', prefix: '- ', block: true },
  { label: 'Checklist', icon: '☐', prefix: '- [ ] ', block: true },
  { label: 'Link', icon: '🔗', prefix: '[', suffix: '](url)' },
  { label: 'Bloque', icon: '｛｝', prefix: '```\n', suffix: '\n```', block: true },
];

export default function MarkdownEditor({ value, onChange, placeholder = 'Contenido (soporta markdown)', rows = 10 }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyAction = useCallback((action: Action) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const before = value.slice(0, start);
    const after = value.slice(end);

    let newText: string;
    let cursorPos: number;

    if (action.block && !selected) {
      // For block actions on empty selection, add at line start
      const lineStart = before.lastIndexOf('\n') + 1;
      const beforeLine = value.slice(0, lineStart);
      const afterLine = value.slice(lineStart);
      newText = beforeLine + action.prefix + afterLine;
      cursorPos = lineStart + action.prefix.length;
    } else {
      const prefix = action.prefix;
      const suffix = action.suffix || '';
      newText = before + prefix + (selected || 'texto') + suffix + after;
      cursorPos = start + prefix.length + (selected ? selected.length : 5) + suffix.length;
    }

    onChange(newText);
    // Restore focus and cursor
    requestAnimationFrame(() => {
      ta.focus();
      if (!selected) {
        // Select the placeholder "texto" for easy replacement
        const selectStart = start + action.prefix.length;
        const selectEnd = selectStart + (selected ? selected.length : 5);
        ta.setSelectionRange(selectStart, selectEnd);
      } else {
        ta.setSelectionRange(cursorPos, cursorPos);
      }
    });
  }, [value, onChange]);

  return (
    <div className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-zinc-700 bg-zinc-850">
        {ACTIONS.map(action => (
          <button
            key={action.label}
            type="button"
            title={action.label}
            onClick={() => applyAction(action)}
            className="px-1.5 py-0.5 text-[11px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors font-mono"
          >
            {action.icon}
          </button>
        ))}

        <div className="flex-1" />

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
            preview ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {preview ? 'Editar' : 'Vista previa'}
        </button>
      </div>

      {/* Content */}
      {preview ? (
        <div className="px-4 py-3 min-h-[120px] max-h-[400px] overflow-y-auto">
          {value.trim() ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-xs text-zinc-500 italic">Sin contenido</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none font-mono text-xs leading-relaxed"
        />
      )}
    </div>
  );
}
