import TodoRow from './TodoRow';

const TodoTable = ({ todos, onEdit, onDelete, deletingId, emptyMessage }) => (
  <div className="table-wrap">
    <table className="todo-table">
      <thead>
        <tr>
          <th className="col-id">ID</th>
          <th className="col-title">Title</th>
          <th className="col-status">Completed Status</th>
          <th className="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {todos.length === 0 ? (
          <tr className="row--empty">
            <td colSpan={4}>{emptyMessage}</td>
          </tr>
        ) : (
          todos.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingId === todo.id}
            />
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default TodoTable;
