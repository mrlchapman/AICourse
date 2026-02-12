'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, Bot, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface InputStepProps {
  title: string;
  onTitleChange: (title: string) => void;
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  model: string;
  onModelChange: (model: string) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function InputStep({
  title,
  onTitleChange,
  sourceText,
  onSourceTextChange,
  model,
  onModelChange,
  apiKey,
  onApiKeyChange,
}: InputStepProps) {
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [envKeys, setEnvKeys] = useState<{ hasGeminiKey: boolean; hasOpenAIKey: boolean }>({ hasGeminiKey: false, hasOpenAIKey: false });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/ai/config').then(r => r.json()).then(setEnvKeys).catch(() => {});
  }, []);

  const hasEnvKey = model.startsWith('gemini') ? envKeys.hasGeminiKey : envKeys.hasOpenAIKey;

  const processFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      onSourceTextChange(data.text);
      setUploadedFile({ name: file.name, size: file.size });
      setInputMode('file');
    } catch (err: any) {
      alert(err.message || 'Failed to parse document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearFile = () => {
    setUploadedFile(null);
    onSourceTextChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="space-y-6 relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Full-area drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary rounded-xl flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Upload className="h-10 w-10 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-primary">Drop file to upload</p>
            <p className="text-xs text-primary/70 mt-1">PDF, DOCX, PPTX, or TXT</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">
          What would you like to create?
        </h2>
        <p className="text-sm text-foreground-muted">
          Provide content and the AI will generate an interactive course with activities, quizzes, and more.
        </p>
      </div>

      {/* Course Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="e.g. Introduction to Machine Learning"
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Input Mode Tabs */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Source Content <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setInputMode('text')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              inputMode === 'text'
                ? 'bg-primary text-white'
                : 'bg-surface-hover text-foreground-muted hover:text-foreground'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Paste Text
          </button>
          <button
            onClick={() => setInputMode('file')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              inputMode === 'file'
                ? 'bg-primary text-white'
                : 'bg-surface-hover text-foreground-muted hover:text-foreground'
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File
          </button>
        </div>

        {inputMode === 'text' ? (
          <textarea
            value={sourceText}
            onChange={(e) => onSourceTextChange(e.target.value)}
            placeholder="Paste your course content, lecture notes, or topic description here...&#10;&#10;The more detail you provide, the better the generated course will be. You can paste entire documents, syllabi, or even just a topic overview."
            rows={12}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y text-sm"
          />
        ) : (
          <div>
            {uploadedFile ? (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-green-50">
                <FileText className="h-8 w-8 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {formatFileSize(uploadedFile.size)} &middot;{' '}
                    {sourceText.length.toLocaleString()} characters extracted
                  </p>
                </div>
                <button
                  onClick={clearFile}
                  className="p-1.5 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <X className="h-4 w-4 text-green-700" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed transition-colors cursor-pointer',
                  isUploading
                    ? 'border-primary bg-primary/5'
                    : isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-surface-hover'
                )}
              >
                {isUploading ? (
                  <>
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-primary font-medium">Parsing document...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-foreground-muted" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Drag & drop a file here, or click to browse
                      </p>
                      <p className="text-xs text-foreground-muted mt-1">
                        PDF, DOCX, PPTX, or TXT (max 20MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {sourceText && (
          <p className="mt-1.5 text-xs text-foreground-subtle">
            {sourceText.length.toLocaleString()} characters
          </p>
        )}
      </div>

      {/* AI Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            <Bot className="h-3.5 w-3.5 inline mr-1" />
            AI Model
          </label>
          <select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            API Key {!hasEnvKey && <span className="text-red-500">*</span>}
          </label>
          {hasEnvKey && !apiKey && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-green-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Using key from server config</span>
            </div>
          )}
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder={hasEnvKey ? 'Override with your own key (optional)' : model.startsWith('gemini') ? 'Gemini API key' : 'OpenAI API key'}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
          />
        </div>
      </div>
    </div>
  );
}
