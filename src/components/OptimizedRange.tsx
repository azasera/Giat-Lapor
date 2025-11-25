import React, { useCallback } from 'react';

interface OptimizedRangeProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  title?: string;
  'aria-label'?: string;
  readOnly?: boolean;
}

const OptimizedRange: React.FC<OptimizedRangeProps> = React.memo(({
  value,
  onChange,
  min = 1,
  max = 10,
  className,
  title,
  'aria-label': ariaLabel,
  readOnly = false,
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  }, [onChange]);

  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={handleChange}
      className={className}
      title={title}
      aria-label={ariaLabel}
      disabled={readOnly} // Use disabled for range inputs when readOnly
    />
  );
});

export default OptimizedRange;