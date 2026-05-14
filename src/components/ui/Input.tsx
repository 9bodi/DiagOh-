import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ohe-slate-900 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 text-sm
            bg-white border rounded-lg
            text-ohe-slate-900 placeholder:text-ohe-slate-600/60
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-ohe-blue/30 focus:border-ohe-blue
            disabled:bg-ohe-slate-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-ohe-slate-200'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-xs text-ohe-slate-600">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
