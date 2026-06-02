import Modal from './Modal';

export default function ConfirmDialog({ open, title = 'Confirm action', message, confirmText = 'Confirm', danger = false, loading = false, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? undefined : onCancel}
      size="max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Working...' : confirmText}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-600">{message}</p>
    </Modal>
  );
}
