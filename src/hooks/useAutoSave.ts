import { useEffect, useRef, useCallback, useState } from 'react';
import { JSONContent } from '@tiptap/react';

interface DraftResponse {
  id: string;
  title: string;
  content: JSONContent;
  excerpt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface UseAutoSaveOptions {
  content: JSONContent | null;
  articleId?: string;
  title?: string;
  excerpt?: string;
  enabled?: boolean;
  onSaveSuccess?: (response: DraftResponse) => void;
  onSaveError?: (error: Error) => void;
}

interface AutoSaveState {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: Error | null;
}

export function useAutoSave({
  content,
  articleId,
  title,
  excerpt,
  enabled = true,
  onSaveSuccess,
  onSaveError,
}: UseAutoSaveOptions) {
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSavedAt: null,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousContentRef = useRef<string | undefined>(undefined);

  const saveDraft = useCallback(async () => {
    // Check isSaving using setState callback to get latest state
    setState(prev => {
      if (!content || prev.isSaving) return prev;
      return { ...prev, isSaving: true, error: null };
    });

    // Early return if no content
    if (!content) return;

    try {
      const response = await fetch('/api/articles/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: articleId,
          title: title || 'Untitled',
          content,
          excerpt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save draft: ${response.statusText}`);
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSavedAt: new Date(),
        error: null,
      }));

      onSaveSuccess?.(data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to save draft');
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: err,
      }));

      onSaveError?.(err);
    }
  }, [content, articleId, title, excerpt, onSaveSuccess, onSaveError]);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 30000); // 30 seconds
  }, [saveDraft]);

  // Effect to handle content changes
  useEffect(() => {
    if (!enabled || !content) return;

    const contentString = JSON.stringify(content);
    
    // Only trigger save if content actually changed
    if (previousContentRef.current !== contentString) {
      previousContentRef.current = contentString;
      debouncedSave();
    }

    // Cleanup on unmount or when deps change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, enabled, debouncedSave]);

  // Save immediately function for manual triggers
  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await saveDraft();
  }, [saveDraft]);

  // Effect to save on window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enabled && content && !state.isSaving) {
        // Try to save before leaving
        navigator.sendBeacon('/api/articles/draft/beacon', JSON.stringify({
          id: articleId,
          title: title || 'Untitled',
          content,
          excerpt,
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, content, articleId, title, excerpt, state.isSaving]);

  return {
    ...state,
    saveNow,
  };
}