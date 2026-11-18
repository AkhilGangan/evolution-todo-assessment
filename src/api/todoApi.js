import axios from 'axios';

/**
 * Axios instance pre-configured for the JSONPlaceholder API.
 * All todo-related network calls go through this module so components
 * never deal with URLs or HTTP details directly.
 */
const apiClient = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
});

export const fetchTodos = async () => {
  const { data } = await apiClient.get('/todos');
  return data;
};

export const createTodo = async (todo) => {
  const { data } = await apiClient.post('/todos', todo);
  return data;
};

export const updateTodo = async (id, todo) => {
  const { data } = await apiClient.put(`/todos/${id}`, todo);
  return data;
};

export const deleteTodo = async (id) => {
  await apiClient.delete(`/todos/${id}`);
};

/** Converts an Axios error into a human-readable message. */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (error?.response) return `${fallback} (Server responded with status ${error.response.status})`;
  if (error?.request) return 'Unable to reach the server. Please check your internet connection.';
  return fallback;
};
