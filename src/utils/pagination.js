export const PAGE_SIZE = 10;

export const getTotalPages = (itemCount, pageSize = PAGE_SIZE) =>
  Math.max(1, Math.ceil(itemCount / pageSize));

export const paginate = (items, page, pageSize = PAGE_SIZE) =>
  items.slice((page - 1) * pageSize, page * pageSize);

/**
 * Builds the list of page buttons to render, e.g. [1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 20].
 * Always shows the first and last page plus a window around the current page,
 * keeping the number of buttons constant so the control does not jump around.
 */
export const getPageNumbers = (currentPage, totalPages) => {
  const MAX_BUTTONS = 7;
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

  if (totalPages <= MAX_BUTTONS) return range(1, totalPages);

  if (currentPage <= 4) return [...range(1, 5), 'end-ellipsis', totalPages];
  if (currentPage >= totalPages - 3) {
    return [1, 'start-ellipsis', ...range(totalPages - 4, totalPages)];
  }
  return [1, 'start-ellipsis', currentPage - 1, currentPage, currentPage + 1, 'end-ellipsis', totalPages];
};
