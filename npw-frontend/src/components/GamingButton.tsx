
import React from 'react';

interface GamingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'cta' | 'success' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  as?: 'button' | 'a';
  href?: string;
  iconOnly?: boolean;
  shape?: 'skewed' | 'circular';
}

const GamingButton: React.FC<GamingButtonProps> = (props) => {
  const {
    onClick,
    children,
    variant = 'secondary',
    size = 'md',
    className = '',
    disabled = false,
    type = 'button',
    as = 'button',
    href,
    iconOnly = false,
    shape = 'skewed',
    ...rest
  } = props;
  // Keep original circular button style as it's distinct and works well for its purpose.
  if (shape === 'circular') {
    const baseStyles = 'relative inline-flex items-center justify-center font-exo uppercase tracking-wider font-bold transition-all duration-300 ease-in-out focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-[0_0_15px_#ef4444] rounded-full';

    const sizeStyles = {
      sm: iconOnly ? 'h-10 w-10' : 'text-xs h-10 px-6',
      md: iconOnly ? 'h-12 w-12' : 'text-sm h-12 px-8',
    };

    const variantStyles = {
      primary: 'bg-nexus-blue text-white hover:bg-white hover:text-nexus-dark',
      secondary: 'bg-transparent text-nexus-blue shadow-[inset_0_0_0_2px_#ef4444] hover:bg-nexus-blue hover:text-white',
      cta: 'bg-nexus-purple text-white hover:bg-white hover:text-nexus-dark',
      success: 'bg-green-500 text-white cursor-default',
      danger: 'bg-transparent text-red-500 shadow-[inset_0_0_0_2px_#ef4444] hover:bg-red-500 hover:text-white',
    };
    
    const finalClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
    
    const content = <span className={`relative block`}>{children}</span>;

    if (as === 'a') {
        return (
            <a href={href} onClick={onClick} className={finalClassName} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
                {content}
            </a>
        )
    }

    // Forward any extra button props (aria-*, id, etc.) via rest
    return (
      <button onClick={onClick} className={finalClassName} disabled={disabled} type={type} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {content}
      </button>
    );
  }

  // New "Cyber" Style for default buttons (previously 'skewed')
  // Added focus:ring-nexus-blue to ensure the focus ring is red
  const baseStyles = 'cyber-btn relative inline-flex items-center justify-center font-exo uppercase tracking-wider font-bold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-nexus-dark focus:ring-nexus-blue disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: iconOnly ? 'h-10 w-10' : 'text-xs h-10 px-6',
    md: iconOnly ? 'h-12 w-12' : 'text-sm h-12 px-8',
  };

  const variantData = {
    primary: {
      classes: 'bg-nexus-blue text-white hover:bg-nexus-blue/90',
      borderColor: 'var(--nexus-blue)',
    },
    secondary: {
      classes: 'bg-nexus-gray/50 text-nexus-light hover:bg-nexus-gray',
      borderColor: 'var(--nexus-blue)',
    },
    cta: {
      classes: 'bg-nexus-purple text-white hover:bg-nexus-purple/90 shadow-[0_0_15px_#8a2be2] hover:shadow-[0_0_25px_#8a2be2]',
      borderColor: 'var(--nexus-purple)',
    },
    success: {
      classes: 'bg-green-500 text-white cursor-default',
      borderColor: 'var(--nexus-green)',
    },
    danger: {
      classes: 'bg-transparent text-red-500 hover:bg-red-900/50',
      borderColor: 'var(--nexus-red)',
    }
  };
  
  const currentVariant = variantData[variant];
  
  const style = {
      '--cb-border-color': currentVariant.borderColor,
  } as React.CSSProperties;

  const finalClassName = `${baseStyles} ${sizeStyles[size]} ${currentVariant.classes} ${className}`;
  
  if (as === 'a') {
      return (
          <a href={href} onClick={onClick} className={finalClassName} style={style} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
              {children}
          </a>
      )
  }

  return (
    <button onClick={onClick} className={finalClassName} disabled={disabled} type={type} style={style} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
};

export default GamingButton;
