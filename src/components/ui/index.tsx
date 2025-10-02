// Button Component
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
  className?: string
}) {
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}

// Input Component
export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  helper,
  required = false,
  disabled = false,
  placeholder,
  className = '',
}: {
  label?: string
  name: string
  type?: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`form-input ${error ? 'form-input-error' : ''}`}
      />
      {error && <p className="form-error">{error}</p>}
      {helper && !error && <p className="form-helper">{helper}</p>}
    </div>
  )
}

// Select Component
export function Select({
  label,
  name,
  value,
  onChange,
  options,
  error,
  helper,
  required = false,
  disabled = false,
  placeholder,
  className = '',
}: {
  label?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`form-input ${error ? 'form-input-error' : ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
      {helper && !error && <p className="form-helper">{helper}</p>}
    </div>
  )
}

// Textarea Component
export function Textarea({
  label,
  name,
  value,
  onChange,
  error,
  helper,
  required = false,
  disabled = false,
  placeholder,
  rows = 3,
  className = '',
}: {
  label?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className={`form-input ${error ? 'form-input-error' : ''}`}
      />
      {error && <p className="form-error">{error}</p>}
      {helper && !error && <p className="form-helper">{helper}</p>}
    </div>
  )
}

// Card Component
export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`card ${className}`}>{children}</div>
}

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`card-header ${className}`}>{children}</div>
}

export function CardBody({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`card-body ${className}`}>{children}</div>
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`card-footer ${className}`}>{children}</div>
}

// Badge Component
export function Badge({
  children,
  variant = 'gray',
  className = '',
}: {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray'
  className?: string
}) {
  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    gray: 'badge-gray',
  }

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Alert Component
export function Alert({
  children,
  variant = 'info',
  className = '',
}: {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info'
  className?: string
}) {
  const variantClasses = {
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
    info: 'alert-info',
  }

  return (
    <div className={`alert ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}

// Loading Spinner
export function Spinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`spinner ${sizeClasses[size]} ${className}`} />
  )
}
