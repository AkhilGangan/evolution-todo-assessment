const SummaryCard = ({ label, value, variant }) => (
  <div className={`summary-card summary-card--${variant}`}>
    <span className="summary-card__label">{label}</span>
    <span className="summary-card__value">{value}</span>
  </div>
);

const SummaryCards = ({ todos }) => {
  const completed = todos.filter((t) => t.completed).length;

  return (
    <section className="summary-grid" aria-label="Todo summary">
      <SummaryCard label="Total Tasks" value={todos.length} variant="total" />
      <SummaryCard label="Completed" value={completed} variant="completed" />
      <SummaryCard label="Pending" value={todos.length - completed} variant="pending" />
    </section>
  );
};

export default SummaryCards;
