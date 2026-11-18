import { useEffect, useState } from 'react';
import { getPageNumbers } from '../utils/pagination';

const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  const [jumpValue, setJumpValue] = useState(String(currentPage));

  // Keep the "Go to page" input in sync when the page changes elsewhere.
  useEffect(() => {
    setJumpValue(String(currentPage));
  }, [currentPage]);

  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  const handleJump = (e) => {
    e.preventDefault();
    const page = Number(jumpValue);
    if (Number.isInteger(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setJumpValue(String(currentPage));
    }
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      <p className="pagination__info">
        Showing <strong>{firstItem}</strong>&ndash;<strong>{lastItem}</strong> of{' '}
        <strong>{totalItems}</strong>
        <span className="pagination__divider">|</span>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </p>

      <div className="pagination__controls">
        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          &lsaquo; Prev
        </button>

        {getPageNumbers(currentPage, totalPages).map((page) =>
          typeof page === 'number' ? (
            <button
              key={page}
              type="button"
              className={`page-btn ${page === currentPage ? 'page-btn--active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span key={page} className="page-ellipsis">&hellip;</span>
          ),
        )}

        <button
          type="button"
          className="page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next &rsaquo;
        </button>

        <form className="page-jump" onSubmit={handleJump}>
          <label htmlFor="page-jump-input">Go to</label>
          <input
            id="page-jump-input"
            type="number"
            min={1}
            max={totalPages}
            className="input input--sm"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
          />
          <button type="submit" className="page-btn">Go</button>
        </form>
      </div>
    </nav>
  );
};

export default Pagination;
