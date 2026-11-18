import StatusBadge from './StatusBadge';
import Spinner from './Spinner';

const TodoRow = ({ todo, onEdit, onDelete, isDeleting }) => (
  <tr className={isDeleting ? 'row--busy' : undefined}>
    <td className="col-id" data-label="ID">{todo.id}</td>
    <td className="col-title" data-label="Title">{todo.title}</td>
    <td className="col-status" data-label="Status">
      <StatusBadge completed={todo.completed} />
    </td>
    <td className="col-actions" data-label="Actions">
      <div className="action-group">
        <button
          type="button"
          className="btn btn--sm btn--secondary"
          onClick={() => onEdit(todo)}
          disabled={isDeleting}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn--sm btn--danger-outline"
          onClick={() => onDelete(todo)}
          disabled={isDeleting}
        >
          {isDeleting ? <Spinner size="sm" label="Deleting" /> : 'Delete'}
        </button>
      </div>
    </td>
  </tr>
);

export default TodoRow;
