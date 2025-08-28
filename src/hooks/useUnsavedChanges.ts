import { useCallback } from 'react';
import { useProjectContext } from '../context/ProjectContext';

export function useUnsavedChanges() {
  const { state, dispatch } = useProjectContext();
  const { hasUnsavedChanges } = state;

  /**
   * Execute an action, prompting the user if there are unsaved changes
   * @param action - The function to execute
   * @param force - Skip confirmation dialog
   */
  const executeWithConfirmation = useCallback((action: () => void, force: boolean = false) => {
    if (!hasUnsavedChanges || force) {
      // No unsaved changes, execute immediately
      action();
    } else {
      // Show confirmation dialog
      dispatch({ type: 'SHOW_UNSAVED_CHANGES_CONFIRM', payload: action });
    }
  }, [hasUnsavedChanges, dispatch]);

  /**
   * Confirm the pending action and execute it
   */
  const confirmAction = useCallback(() => {
    if (state.pendingAction) {
      state.pendingAction();
      dispatch({ type: 'HIDE_UNSAVED_CHANGES_CONFIRM' });
    }
  }, [state.pendingAction, dispatch]);

  /**
   * Cancel the pending action
   */
  const cancelAction = useCallback(() => {
    dispatch({ type: 'HIDE_UNSAVED_CHANGES_CONFIRM' });
  }, [dispatch]);

  return {
    hasUnsavedChanges,
    executeWithConfirmation,
    confirmAction,
    cancelAction,
    showConfirmation: state.showUnsavedChangesConfirm,
  };
}