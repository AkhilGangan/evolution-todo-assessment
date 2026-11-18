import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as todoApi from '../api/todoApi';

vi.mock('../api/todoApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchTodos: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  };
});

const networkError = Object.assign(new Error('Network Error'), { request: {} });
const sampleTodos = [
  { userId: 1, id: 1, title: 'first todo', completed: false },
  { userId: 1, id: 2, title: 'second todo', completed: true },
];

describe('Error handling', () => {
  it('shows an error when loading fails and recovers on retry', async () => {
    todoApi.fetchTodos.mockRejectedValueOnce(networkError).mockResolvedValueOnce(sampleTodos);
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText(/Unable to reach the server/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByText('first todo')).toBeInTheDocument());
  });

  it('keeps the form open with an error message when the update fails', async () => {
    todoApi.fetchTodos.mockResolvedValueOnce(sampleTodos);
    todoApi.updateTodo.mockRejectedValueOnce(
      Object.assign(new Error('fail'), { response: { status: 500 } }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click((await screen.findAllByRole('button', { name: 'Edit' }))[0]);
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText(/Failed to update todo/)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('first todo')).toBeInTheDocument();
  });

  it('keeps the row and shows an error when delete fails', async () => {
    todoApi.fetchTodos.mockResolvedValueOnce(sampleTodos);
    todoApi.deleteTodo.mockRejectedValueOnce(networkError);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<App />);

    await user.click((await screen.findAllByRole('button', { name: 'Delete' }))[0]);
    expect(await screen.findByText(/Unable to reach the server/)).toBeInTheDocument();
    expect(screen.getByText('first todo')).toBeInTheDocument();
  });
});
