import { useEffect } from 'react';

const Modal = ({ title, onClose, children }) => {
  // Close on Escape and lock background scrolling while the dialog is open.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">{title}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
