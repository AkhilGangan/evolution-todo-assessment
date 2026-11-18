import { useCallback, useEffect, useState } from 'react';
import * as todoApi from '../api/todoApi';

const DEFAULT_USER_ID = 1;

/** Highest ID returned by JSONPlaceholder; anything above it was created locally. */
const SERVER_MAX_ID = 200;

/**
 * Owns the todo list state and all CRUD operations.
 *
 * JSONPlaceholder does not persist writes, so after every successful
 * POST / PUT / DELETE response the local React state is updated to reflect
 * the change. The state therefore remains the source of truth for the UI.
 */
const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const data = await todoApi.fetchTodos();
      setTodos(data);
    } catch (error) {
      setLoadError(todoApi.getErrorMessage(error, 'Failed to load todos.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const addTodo = async ({ title, completed }) => {
    const payload = { title, completed, userId: DEFAULT_USER_ID };
    const created = await todoApi.createTodo(payload);

    // The API always returns id 201, so generate a temporary unique ID locally.
    setTodos((prev) => {
      const nextId = prev.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      return [{ ...payload, ...created, id: nextId }, ...prev];
    });
  };

  const editTodo = async (id, { title, completed }) => {
    const existing = todos.find((t) => t.id === id);
    const payload = { id, title, completed, userId: existing?.userId ?? DEFAULT_USER_ID };

    // Locally created todos do not exist on the server (PUT would return 404),
    // so for those we only update local state.
    if (id <= SERVER_MAX_ID) {
      await todoApi.updateTodo(id, payload);
    }

    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...payload } : t)));
  };

  const removeTodo = async (id) => {
    await todoApi.deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  return { todos, isLoading, loadError, reload: loadTodos, addTodo, editTodo, removeTodo };
};

export default useTodos;
