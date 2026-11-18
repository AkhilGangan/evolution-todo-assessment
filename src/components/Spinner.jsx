const Spinner = ({ size = 'md', label }) => (
  <span className="spinner-wrap" role="status">
    <span className={`spinner spinner--${size}`} aria-hidden="true" />
    {label ? <span>{label}</span> : <span className="sr-only">Loading</span>}
  </span>
);

export default Spinner;
