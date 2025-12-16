import React from 'react';

export type IconName = 'products' | 'users' | 'orders' | 'dashboard' | 'dot' | 'collapse' | 'expand';

interface IconProps {
  name: IconName;
  className?: string;
  'aria-hidden'?: boolean;
  title?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'h-5 w-5', title, ...rest }) => {
  switch (name) {
    case 'products':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden={rest['aria-hidden'] ?? true} role={title ? 'img' : undefined}>
          {title ? <title>{title}</title> : null}
          <path d="M4 3a1 1 0 00-1 1v3h14V4a1 1 0 00-1-1H4z" />
          <path d="M3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3zm4 2h6v2H7v-2z" />
        </svg>
      );
    case 'users':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden={rest['aria-hidden'] ?? true} role={title ? 'img' : undefined}>
          {title ? <title>{title}</title> : null}
          <path d="M10 2a4 4 0 100 8 4 4 0 000-8z" />
          <path d="M2 18a8 8 0 1116 0H2z" />
        </svg>
      );
    case 'orders':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden={rest['aria-hidden'] ?? true} role={title ? 'img' : undefined}>
          {title ? <title>{title}</title> : null}
          <path d="M6 2a1 1 0 00-1 1v2h10V3a1 1 0 00-1-1H6z" />
          <path d="M3 8v6a2 2 0 002 2h10a2 2 0 002-2V8H3zm3 2h8v2H6v-2z" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden={rest['aria-hidden'] ?? true} role={title ? 'img' : undefined}>
          {title ? <title>{title}</title> : null}
          <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" />
        </svg>
      );
    case 'dot':
      return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden={rest['aria-hidden'] ?? true} role={title ? 'img' : undefined}>
          {title ? <title>{title}</title> : null}
          <circle cx="10" cy="10" r="3" />
        </svg>
      );
    case 'collapse':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden={rest['aria-hidden'] ?? true} role={title ? 'img' : undefined}>
          {title ? <title>{title}</title> : null}
          <path d="M6 18L18 6" />
          <path d="M6 6h12v12" />
        </svg>
      );
    case 'expand':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden={rest['aria-hidden'] ?? true} role={title ? 'img' : undefined}>
          {title ? <title>{title}</title> : null}
          <path d="M4 12h16" />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
