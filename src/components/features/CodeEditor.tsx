'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'

interface CodeEditorProps {
  onSubmit: (code: string, language?: string) => void
  isLoading?: boolean
  disabled?: boolean
}

const LANGUAGE_OPTIONS = [
  { value: '', label: '자동 감지' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
]

export function CodeEditor({ onSubmit, isLoading, disabled }: CodeEditorProps) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')

  const handleSubmit = useCallback(() => {
    if (code.trim()) {
      onSubmit(code, language || undefined)
    }
  }, [code, language, onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Allow Tab key to insert tab character
      if (e.key === 'Tab') {
        e.preventDefault()
        const target = e.target as HTMLTextAreaElement
        const start = target.selectionStart
        const end = target.selectionEnd
        const newValue = code.substring(0, start) + '  ' + code.substring(end)
        setCode(newValue)
        // Set cursor position after the tab
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 2
        }, 0)
      }
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    },
    [code, handleSubmit]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="language" className="text-sm font-medium text-gray-700">
          프로그래밍 언어
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="리뷰받을 코드를 붙여넣으세요..."
          disabled={disabled || isLoading}
          className="w-full h-80 px-4 py-3 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-500"
          spellCheck={false}
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
          Ctrl + Enter로 제출
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {code.length > 0 ? `${code.split('\n').length}줄` : '코드를 입력하세요'}
        </p>
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={disabled || !code.trim()}
          size="lg"
        >
          코드 리뷰 요청
        </Button>
      </div>
    </div>
  )
}
