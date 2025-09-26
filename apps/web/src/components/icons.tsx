import type { SVGProps } from 'react'

const iconDefaults = 'h-5 w-5'

const buildClassName = (className?: string) => (className ? `${iconDefaults} ${className}`.trim() : iconDefaults)

export const GitHubIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={buildClassName(className)} aria-hidden {...props}>
    <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.79-1.34-1.79-1.1-.76.08-.74.08-.74 1.22.09 1.87 1.25 1.87 1.25 1.08 1.86 2.82 1.32 3.51 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.48-1.34-5.48-5.96 0-1.32.47-2.4 1.24-3.25-.13-.3-.54-1.5.12-3.12 0 0 1.01-.32 3.3 1.23a11.46 11.46 0 0 1 6.01 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.62.25 2.82.12 3.12.77.85 1.23 1.93 1.23 3.25 0 4.63-2.81 5.66-5.49 5.96.43.37.81 1.1.81 2.22 0 1.6-.01 2.88-.01 3.27 0 .32.21.7.82.58A12 12 0 0 0 12 .5Z" />
  </svg>
)

export const LinkedInIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={buildClassName(className)} aria-hidden {...props}>
    <path d="M20.45 20.45h-3.55v-5.29c0-1.26-.03-2.89-1.76-2.89-1.76 0-2.03 1.38-2.03 2.8v5.38H9.56V9h3.41v1.56h.05c.48-.91 1.64-1.87 3.38-1.87 3.61 0 4.28 2.38 4.28 5.47v6.29Zm-15.9-12h3.54v12H4.55v-12ZM6.32 3.5a2.06 2.06 0 1 1 0 4.12 2.06 2.06 0 0 1 0-4.12Z" />
  </svg>
)

export const ExternalLinkIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={buildClassName(className)} aria-hidden {...props}>
    <path d="M14 3h7v7" />
    <path d="M10 14 21 3" />
    <path d="M21 14v7h-7" />
    <path d="M3 10v11h11" />
  </svg>
)

export const LocationIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={buildClassName(className)} aria-hidden {...props}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

export const WorkIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={buildClassName(className)} aria-hidden {...props}>
    <path d="M3 7h18" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 7v9a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V7" />
    <path d="M8 11h8" />
  </svg>
)

export const MoonIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={buildClassName(className)} aria-hidden {...props}>
    <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
  </svg>
)

export const SunIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={buildClassName(className)} aria-hidden {...props}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="m4.22 4.22 1.42 1.42" />
    <path d="m18.36 18.36 1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="m4.22 19.78 1.42-1.42" />
    <path d="m18.36 5.64 1.42-1.42" />
  </svg>
)

export const MenuIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={buildClassName(className)} aria-hidden {...props}>
    <path d="M3 6h18" />
    <path d="M3 12h18" />
    <path d="M3 18h18" />
  </svg>
)

export const CloseIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={buildClassName(className)} aria-hidden {...props}>
    <path d="m4 4 16 16" />
    <path d="M20 4 4 20" />
  </svg>
)

export const InstagramIcon = ({ className = '', ...props }: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={buildClassName(className)} aria-hidden {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
    <path d="m17.5 6.5-.01.01" />
  </svg>
)
