import { useState } from 'react';
import Alert from './Alert';
import Spinner from './Spinner';

const MAX_TITLE_LENGTH = 200;

const validate = ({ title }) => {
  const errors = {};
  const trimmed = title.trim();
  if (!trimmed) errors.title = 'Title is required.';
  else if (trimmed.length < 3) errors.title = 'Title must be at least 3 characters.';
  else if (trimmed.length > MAX_TITLE_LENGTH) {
    errors.title = `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`;
  }
  return errors;
};

/**
 * Controlled form used for both creating and editing a todo.
 * `initialValues` pre-populates the fields when editing.
 * `onSubmit` must return a promise; a rejection is shown inside the form.
 */
const TodoForm = ({ initialValues, isEditing, onSubmit, onCancel }) => {
  const [values, setValues] = useState({
    title: initialValues?.title ?? '',
    completed: initialValues?.completed ?? false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const nextValues = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(nextValues);
    // Validate live only after the user has interacted with the field once.
    if (touched) setErrors(validate(nextValues));
  };

  const handleBlur = () => {
    setTouched(true);
    setErrors(validate(values));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({ title: values.title.trim(), completed: values.completed });
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
    }
  };

  const titleLength = values.title.trim().length;

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <div className="modal__body">
        <Alert message={submitError} onClose={() => setSubmitError('')} />

        <div className="form-field">
          <label htmlFor="todo-title" className="form-label">
            Title <span className="required">*</span>
          </label>
          <input
            id="todo-title"
            name="title"
            type="text"
            className={`input ${errors.title ? 'input--invalid' : ''}`}
            placeholder="Enter todo title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'todo-title-error' : undefined}
            autoFocus
          />
          <div className="form-meta">
            {errors.title ? (
              <span id="todo-title-error" className="form-error">{errors.title}</span>
            ) : (
              <span />
            )}
            <span className={`form-counter ${titleLength > MAX_TITLE_LENGTH ? 'form-counter--over' : ''}`}>
              {titleLength}/{MAX_TITLE_LENGTH}
            </span>
          </div>
        </div>

        <label className="checkbox">
          <input
            name="completed"
            type="checkbox"
            checked={values.completed}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <span>Mark as completed</span>
        </label>
      </div>

      <div className="modal__footer">
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner size="sm" label={isEditing ? 'Saving...' : 'Adding...'} />
          ) : isEditing ? (
            'Save Changes'
          ) : (
            'Add Todo'
          )}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
