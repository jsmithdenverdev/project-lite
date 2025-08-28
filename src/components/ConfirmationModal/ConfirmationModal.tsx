import { Modal } from '../Modal';
import type { ConfirmationModalProps } from './types';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning"
}: ConfirmationModalProps) {
  const variantStyles = {
    warning: {
      confirmButton: "bg-orange-600 hover:bg-orange-700 text-white",
      icon: "⚠️"
    },
    danger: {
      confirmButton: "bg-red-600 hover:bg-red-700 text-white",  
      icon: "🗑️"
    },
    info: {
      confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
      icon: "ℹ️"
    }
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{styles.icon}</div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded transition-colors ${styles.confirmButton}`}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}