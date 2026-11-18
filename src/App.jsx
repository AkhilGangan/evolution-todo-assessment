import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import SearchBar from './components/SearchBar';
import TodoTable from './components/TodoTable';
import Pagination from './components/Pagination';
import Modal from './components/Modal';
import TodoForm from './components/TodoForm';
import Alert from './components/Alert';
import Spinner from './components/Spinner';
import useTodos from './hooks/useTodos';
import useDebounce from './hooks/useDebounce';
import { getErrorMessage } from './api/todoApi';
import { PAGE_SIZE, getTotalPages, paginate } from './utils/pagination';

const SEARCH_DELAY_MS = 500;
const NOTIFICATION_DURATION_MS = 3500;

const App = () => {
  const { todos, isLoading, loadError, reload, addTodo, editTodo, removeTodo } = useTodos();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formState, setFormState] = useState(null); // null | { mode: 'create' } | { mode: 'edit', todo }
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState(null); // { type, message }

  const debouncedSearch = useDebounce(searchTerm, SEARCH_DELAY_MS);
  const isSearching = searchTerm !== debouncedSearch;

  // Case-insensitive filter on the title, applied only to the debounced value.
  const filteredTodos = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return todos;
    return todos.filter((todo) => todo.title.toLowerCase().includes(query));
  }, [todos, debouncedSearch]);

  const totalPages = getTotalPages(filteredTodos.length);
  const visibleTodos = paginate(filteredTodos, currentPage);

  // A new search always starts from the first page of the filtered results.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // If the current page no longer exists (e.g. last item on the last page was deleted), step back.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Auto-dismiss success / info notifications.
  useEffect(() => {
    if (!notification) return undefined;
    const timerId = setTimeout(() => setNotification(null), NOTIFICATION_DURATION_MS);
    return () => clearTimeout(timerId);
  }, [notification]);

  const openCreateForm = () => setFormState({ mode: 'create' });
  const openEditForm = (todo) => setFormState({ mode: 'edit', todo });
  const closeForm = useCallback(() => setFormState(null), []);

  const handleFormSubmit = async (values) => {
    const isEditing = formState?.mode === 'edit';
    try {
      if (isEditing) {
        await editTodo(formState.todo.id, values);
        setNotification({ type: 'success', message: 'Todo updated successfully.' });
      } else {
        await addTodo(values);
        setCurrentPage(1); // New todos are added to the top of the list.
        setNotification({ type: 'success', message: 'Todo created successfully.' });
      }
      closeForm();
    } catch (error) {
      // Surface the error inside the form so the user can retry without losing input.
      throw new Error(getErrorMessage(error, `Failed to ${isEditing ? 'update' : 'create'} todo.`));
    }
  };

  const handleDelete = async (todo) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    setDeletingId(todo.id);
    try {
      await removeTodo(todo.id);
      setNotification({ type: 'success', message: `Todo #${todo.id} deleted successfully.` });
    } catch (error) {
      setNotification({ type: 'error', message: getErrorMessage(error, 'Failed to delete todo.') });
    } finally {
      setDeletingId(null);
    }
  };

  const emptyMessage = debouncedSearch.trim()
    ? `No todos found matching "${debouncedSearch.trim()}".`
    : 'No todos yet. Click "Add Todo" to create one.';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="state-panel">
          <Spinner size="lg" label="Loading todos..." />
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="state-panel">
          <Alert
            message={loadError}
            action={
              <button type="button" className="btn btn--sm btn--secondary" onClick={reload}>
                Retry
              </button>
            }
          />
        </div>
      );
    }

    return (
      <>
        <TodoTable
          todos={visibleTodos}
          onEdit={openEditForm}
          onDelete={handleDelete}
          deletingId={deletingId}
          emptyMessage={emptyMessage}
        />
        {filteredTodos.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTodos.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  return (
    <div className="app">
      <Header />

      <main className="container main">
        <SummaryCards todos={todos} />

        {notification && (
          <Alert
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <section className="panel">
          <div className="panel__header">
            <div>
              <h2 className="panel__title">All Todos</h2>
              <p className="panel__subtitle">
                {debouncedSearch.trim()
                  ? `${filteredTodos.length} result${filteredTodos.length === 1 ? '' : 's'} found`
                  : 'Manage your tasks below'}
              </p>
            </div>
            <div className="toolbar">
              <SearchBar value={searchTerm} onChange={setSearchTerm} isSearching={isSearching} />
              <button
                type="button"
                className="btn btn--primary"
                onClick={openCreateForm}
                disabled={isLoading || Boolean(loadError)}
              >
                <span aria-hidden="true">+</span> Add Todo
              </button>
            </div>
          </div>

          {renderContent()}
        </section>
      </main>

      {formState && (
        <Modal title={formState.mode === 'edit' ? `Edit Todo #${formState.todo.id}` : 'Add New Todo'} onClose={closeForm}>
          <TodoForm
            key={formState.mode === 'edit' ? formState.todo.id : 'new'}
            initialValues={formState.todo}
            isEditing={formState.mode === 'edit'}
            onSubmit={handleFormSubmit}
            onCancel={closeForm}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;
