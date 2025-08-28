import { type ReactNode } from 'react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary'
}: ConfirmModalProps) {
  const confirmButtonClass = confirmVariant === 'danger'
    ? 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
    : 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={false}>
      <div className="mb-6">
        {children}
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          type="button"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={confirmButtonClass}
          type="button"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}