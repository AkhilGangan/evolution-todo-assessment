const StatusBadge = ({ completed }) => (
  <span className={`badge ${completed ? 'badge--completed' : 'badge--pending'}`}>
    {completed ? 'Completed' : 'Pending'}
  </span>
);

export default StatusBadge;
