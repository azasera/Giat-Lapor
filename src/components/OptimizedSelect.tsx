import React, { useCallback } from 'react';

interface OptimizedSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  title?: string;
  required?: boolean;
  children: React.ReactNode;
  readOnly?: boolean;
}

const OptimizedSelect: React.FC<OptimizedSelectProps> = React.memo(({
  value,
  onChange,
  className,
  title,
  required,
  children,
  readOnly = false,
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <select
      value={value}
      onChange={handleChange}
      className={className}
      title={title}
      required={required}
      disabled={readOnly} // Use disabled for select elements when readOnly
    >
      {children}
    </select>
  );
});

export default OptimizedSelect;