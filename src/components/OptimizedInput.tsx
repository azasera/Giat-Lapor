import React, { useCallback } from 'react';

interface OptimizedInputProps {
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  title?: string;
  required?: boolean;
  rows?: number;
  readOnly?: boolean;
}

const OptimizedInput: React.FC<OptimizedInputProps> = React.memo(({
  type = 'text',
  value,
  onChange,
  className,
  placeholder,
  title,
  required,
  rows,
  readOnly = false,
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  if (type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={handleChange}
        className={className}
        placeholder={placeholder}
        title={title}
        required={required}
        rows={rows}
        readOnly={readOnly}
      />
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      title={title}
      required={required}
      readOnly={readOnly}
      // Add step for time input to encourage 24-hour format display
      {...(type === 'time' && { step: "60" })} 
    />
  );
});

export default OptimizedInput;