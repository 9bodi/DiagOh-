import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, className = '', children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-ohe-blue text-white hover:bg-ohe-blue-dark focus:ring-ohe-blue shadow-sm hover:shadow',
      secondary: 'bg-white text-ohe-slate-900 border border-ohe-slate-200 hover:bg-ohe-slate-50 focus:ring-ohe-slate-200',
      ghost: 'text-ohe-slate-600 hover:bg-ohe-slate-100 focus:ring-ohe-slate-200',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3.5 text-base',
    };

    const width = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
