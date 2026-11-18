import { useEffect, useState } from 'react';

/**
 * Returns `value` only after it has stopped changing for `delay` ms.
 * Each change clears the previous timer, so rapid typing triggers a single update.
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timerId);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
