const Header = () => (
  <header className="app-header">
    <div className="container app-header__inner">
      <div className="brand">
        <span className="brand__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <h1 className="brand__title">Todo Manager</h1>
          <p className="brand__subtitle">Track, organise and manage your tasks</p>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
