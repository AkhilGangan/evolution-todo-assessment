/**
 * End-to-end style tests that render the full app and talk to the real
 * JSONPlaceholder API (requires an internet connection).
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from '../App';

const API = 'https://jsonplaceholder.typicode.com/todos';
let allTodos = [];

const getBodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);
const getRowIds = () => getBodyRows().map((row) => Number(within(row).getAllByRole('cell')[0].textContent));
const pageInfo = () => screen.getByRole('navigation', { name: 'Pagination' }).querySelector('.pagination__info').textContent;
const summaryValue = (label) =>
  screen.getAllByText(label).find((el) => el.classList.contains('summary-card__label')).closest('.summary-card').querySelector('.summary-card__value').textContent;

const renderLoadedApp = async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText('Loading todos...')).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument(), { timeout: 15000 });
  return user;
};

const search = async (user, text) => {
  const input = screen.getByRole('searchbox', { name: /search todos/i });
  await user.clear(input);
  await user.type(input, text);
  await waitFor(() => expect(screen.queryByText('Searching...')).not.toBeInTheDocument(), { timeout: 2000 });
};

beforeAll(async () => {
  ({ data: allTodos } = await axios.get(API));
});

afterEach(() => vi.restoreAllMocks());

describe('Load todos', () => {
  it('shows a loader, then renders the first page and summary', async () => {
    await renderLoadedApp();
    expect(getRowIds()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(pageInfo()).toContain('Page 1 of 20');
    expect(summaryValue('Total Tasks')).toBe(String(allTodos.length));
    const completed = allTodos.filter((t) => t.completed).length;
    expect(summaryValue('Completed')).toBe(String(completed));
    expect(summaryValue('Pending')).toBe(String(allTodos.length - completed));
    // Status badges
    expect(within(getBodyRows()[0]).getByText(allTodos[0].completed ? 'Completed' : 'Pending')).toBeInTheDocument();
  });
});

describe('Pagination', () => {
  it('navigates next, previous, to a page number and via "Go to"', async () => {
    const user = await renderLoadedApp();
    const prev = screen.getByRole('button', { name: 'Previous page' });
    expect(prev).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(getRowIds()[0]).toBe(11);
    expect(pageInfo()).toContain('Page 2 of 20');

    await user.click(prev);
    expect(getRowIds()[0]).toBe(1);

    await user.click(screen.getByRole('button', { name: '20' }));
    expect(getRowIds()).toHaveLength(10);
    expect(getRowIds()[0]).toBe(191);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    const jump = screen.getByLabelText('Go to');
    await user.clear(jump);
    await user.type(jump, '17{Enter}');
    expect(getRowIds()[0]).toBe(161);
    expect(pageInfo()).toContain('Page 17 of 20');
  });
});

describe('Debounced search', () => {
  it('filters case-insensitively only after ~500ms and paginates the results', async () => {
    const user = await renderLoadedApp();
    await user.click(screen.getByRole('button', { name: '3' })); // move away from page 1

    const input = screen.getByRole('searchbox', { name: /search todos/i });
    await user.type(input, 'QUI');

    // Immediately after typing the list has not been filtered yet.
    expect(screen.getByText('Searching...')).toBeInTheDocument();
    expect(getRowIds()[0]).toBe(21);

    const expected = allTodos.filter((t) => t.title.toLowerCase().includes('qui'));
    await waitFor(() => expect(pageInfo()).toContain(`of ${expected.length}`), { timeout: 2000 });
    expect(pageInfo()).toContain(`Page 1 of ${Math.ceil(expected.length / 10)}`);
    expect(getRowIds()).toEqual(expected.slice(0, 10).map((t) => t.id));

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(getRowIds()).toEqual(expected.slice(10, 20).map((t) => t.id));

    await search(user, 'zzz-no-match');
    expect(screen.getByText(/No todos found matching/)).toBeInTheDocument();
  });
});

describe('Create todo', () => {
  it('validates the title, POSTs, and prepends the todo with a unique id', async () => {
    const user = await renderLoadedApp();
    const postSpy = vi.spyOn(axios.Axios.prototype, 'request');

    await user.click(screen.getByRole('button', { name: /add todo/i }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Add Todo' }));
    expect(within(dialog).getByText('Title is required.')).toBeInTheDocument();
    expect(postSpy).not.toHaveBeenCalled();

    await user.type(within(dialog).getByLabelText(/^title/i), 'Write assessment README');
    expect(within(dialog).queryByText('Title is required.')).not.toBeInTheDocument();
    await user.click(within(dialog).getByLabelText('Mark as completed'));
    await user.click(within(dialog).getByRole('button', { name: 'Add Todo' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 10000 });
    expect(postSpy).toHaveBeenCalledWith(expect.objectContaining({ method: 'post', url: '/todos' }));
    expect(screen.getByText('Todo created successfully.')).toBeInTheDocument();

    const firstRow = getBodyRows()[0];
    expect(within(firstRow).getByText('Write assessment README')).toBeInTheDocument();
    expect(within(firstRow).getByText('Completed')).toBeInTheDocument();
    expect(getRowIds()[0]).toBe(201);
    expect(summaryValue('Total Tasks')).toBe('201');

    // A second creation gets a different temporary id.
    await user.click(screen.getByRole('button', { name: /add todo/i }));
    await user.type(screen.getByLabelText(/^title/i), 'Second new todo');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add Todo' }));
    await waitFor(() => expect(getRowIds()[0]).toBe(202), { timeout: 10000 });

    // Editing a locally created todo works even though the server does not know it.
    await user.click(within(getBodyRows()[0]).getByRole('button', { name: 'Edit' }));
    const titleInput = screen.getByLabelText(/^title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Second new todo (edited)');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(within(getBodyRows()[0]).getByText('Second new todo (edited)')).toBeInTheDocument());
  });
});

describe('Update todo', () => {
  it('populates the form, PUTs, and updates the row in place', async () => {
    const user = await renderLoadedApp();
    const spy = vi.spyOn(axios.Axios.prototype, 'request');
    const original = allTodos[0];

    await user.click(within(getBodyRows()[0]).getByRole('button', { name: 'Edit' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Edit Todo #1')).toBeInTheDocument();
    const titleInput = within(dialog).getByLabelText(/^title/i);
    expect(titleInput).toHaveValue(original.title);
    expect(within(dialog).getByLabelText('Mark as completed')).toHaveProperty('checked', original.completed);

    await user.clear(titleInput);
    await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));
    expect(within(dialog).getByText('Title is required.')).toBeInTheDocument();

    await user.type(titleInput, 'Updated Todo');
    await user.click(within(dialog).getByLabelText('Mark as completed'));
    await user.click(within(dialog).getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 10000 });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ method: 'put', url: '/todos/1' }));
    const row = getBodyRows()[0];
    expect(within(row).getByText('Updated Todo')).toBeInTheDocument();
    expect(within(row).getByText(original.completed ? 'Pending' : 'Completed')).toBeInTheDocument();
    expect(screen.getByText('Todo updated successfully.')).toBeInTheDocument();
  });
});

describe('Delete todo', () => {
  it('asks for confirmation, DELETEs and removes the row', async () => {
    const user = await renderLoadedApp();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);

    await user.click(within(getBodyRows()[0]).getByRole('button', { name: 'Delete' }));
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
    expect(getRowIds()[0]).toBe(1); // cancelled

    await user.click(within(getBodyRows()[0]).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(getRowIds()[0]).toBe(2), { timeout: 10000 });
    expect(getRowIds()).toHaveLength(10); // page back-filled from the next page
    expect(summaryValue('Total Tasks')).toBe('199');
    expect(pageInfo()).toContain('of 199');
  });

  it('moves to the previous page when the last item on the last page is deleted (filtered results)', async () => {
    // Find a search term whose result count leaves exactly one item on the last page.
    const words = new Set(allTodos.flatMap((t) => t.title.toLowerCase().split(/\s+/)));
    const term = [...words].find((w) => {
      const count = allTodos.filter((t) => t.title.toLowerCase().includes(w)).length;
      return w.length > 3 && count > 10 && count % 10 === 1;
    });
    expect(term).toBeTruthy();
    const matches = allTodos.filter((t) => t.title.toLowerCase().includes(term));
    const lastPage = Math.ceil(matches.length / 10);

    const user = await renderLoadedApp();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await search(user, term);
    await user.click(screen.getByRole('button', { name: String(lastPage) }));
    expect(getRowIds()).toHaveLength(1);

    await user.click(within(getBodyRows()[0]).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(pageInfo()).toContain(`Page ${lastPage - 1} of ${lastPage - 1}`), { timeout: 10000 });
    expect(getRowIds()).toHaveLength(10);
  });
});
