const SearchBar = ({ value, onChange, isSearching }) => (
  <div className="search">
    <svg className="search__icon" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8.5 3a5.5 5.5 0 014.38 8.83l3.65 3.64a.75.75 0 11-1.06 1.06l-3.64-3.65A5.5 5.5 0 118.5 3zm0 1.5a4 4 0 100 8 4 4 0 000-8z"
      />
    </svg>
    <input
      type="search"
      className="input search__input"
      placeholder="Search todos by title..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Search todos by title"
    />
    {isSearching && <span className="search__hint">Searching...</span>}
  </div>
);

export default SearchBar;
