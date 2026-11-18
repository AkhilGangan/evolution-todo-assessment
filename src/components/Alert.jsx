const Alert = ({ type = 'error', message, onClose, action }) => {
  if (!message) return null;

  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="alert__message">{message}</span>
      <div className="alert__actions">
        {action}
        {onClose && (
          <button type="button" className="alert__close" onClick={onClose} aria-label="Dismiss message">
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
