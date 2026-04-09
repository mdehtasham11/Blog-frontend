import React from 'react'

function Button({ children, type = "button", className = "", disabled = false, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-5 py-2.5 text-sm font-sans font-semibold uppercase tracking-widest border transition-colors duration-150 min-h-[44px]
        ${disabled
          ? 'bg-paper-dark text-ink-faint border-rule cursor-not-allowed'
          : 'bg-ink text-paper border-ink hover:bg-ink-mid hover:border-ink-mid'
        } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
