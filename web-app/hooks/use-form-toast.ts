'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface FormState {
  error?: string;
  success?: string;
  errors?: Record<string, string[]>;
}

/**
 * Hook que exibe toasts automaticamente baseado no estado do formulário.
 * Observa mudanças em `state.error` e `state.success` para exibir feedback.
 *
 * @param state - Estado retornado pelo useActionState
 * @example
 * const [state, formAction] = useActionState(loginAction, null);
 * useFormToast(state);
 */
export function useFormToast(state: FormState | null) {
  // Guarda a referência do objeto state anterior, não apenas as strings
  const prevStateRef = useRef<FormState | null>(null);

  useEffect(() => {
    // Só exibe toast se o state mudou (nova submissão)
    if (!state || state === prevStateRef.current) return;

    if (state.error) {
      toast.error(state.error);
    }

    if (state.success) {
      toast.success(state.success);
    }

    prevStateRef.current = state;
  }, [state]);
}
