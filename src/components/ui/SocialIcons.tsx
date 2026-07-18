// src/components/ui/SocialIcons.tsx
// Two variants per brand:
//   - Colored (original) — retains each platform's official brand color; kept for
//     any surface that wants the classic look.
//   - Mono (currentColor) — path-only glyph that inherits color from the parent.
//     Use when the tile itself carries brand styling (see FollowUsSection).

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Monochrome glyph set. All paths use `currentColor` — set the color via
 * a `text-*` Tailwind class on the wrapping element.
 */
export function InstagramMonoIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd"
        d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5a4.25 4.25 0 0 0 4.25 4.25h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8ZM17.6 6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
    </svg>
  );
}

export function FacebookMonoIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.6 1.6-1.6h1.7V4.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4V14h2.7v8h3.4Z" />
    </svg>
  );
}

export function YoutubeMonoIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.4a2.5 2.5 0 0 0-1.7 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.7 1.8C5.7 19 12 19 12 19s6.3 0 7.9-.4a2.5 2.5 0 0 0 1.7-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z" />
    </svg>
  );
}

export function LinkedinMonoIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0 0-5Zm-2 6.5h4V21h-4V10Zm7 0h3.8v1.5h.1c.5-1 1.8-2 3.8-2 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V10Z" />
    </svg>
  );
}

export function PinterestMonoIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.7 6.2 9.2-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.4-2 3.4-5 0-2.6-1.9-4.4-4.5-4.4-3.1 0-4.9 2.3-4.9 4.7 0 .9.4 1.9.8 2.5.1.1.1.2.1.3l-.4 1.5c-.1.2-.2.3-.4.2-1.5-.7-2.4-2.9-2.4-4.6 0-3.8 2.7-7.2 7.9-7.2 4.1 0 7.4 3 7.4 6.9 0 4.1-2.6 7.5-6.2 7.5-1.2 0-2.4-.6-2.8-1.4l-.7 2.9c-.3 1-1 2.3-1.5 3.1.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-gradient)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  );
}

export function FacebookIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="4" fill="#1877F2" />
      <path
        d="M16.5 8H14.5C13.948 8 13.5 8.448 13.5 9V11H16.5L16 14H13.5V22H10.5V14H8.5V11H10.5V9C10.5 6.791 12.291 5 14.5 5H16.5V8Z"
        fill="white"
      />
    </svg>
  );
}

export function YoutubeIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="4" fill="#FF0000" />
      <path
        d="M19.5 7.5C19.5 7.5 19.3 6.3 18.7 5.7C17.9 4.9 17.1 4.9 16.7 4.9C14.1 4.7 10 4.7 10 4.7C10 4.7 5.9 4.7 3.3 4.9C2.9 4.9 2.1 4.9 1.3 5.7C0.7 6.3 0.5 7.5 0.5 7.5C0.5 7.5 0.3 8.9 0.3 10.3V11.6C0.3 13 0.5 14.4 0.5 14.4C0.5 14.4 0.7 15.6 1.3 16.2C2.1 17 3.1 17 3.5 17C4.9 17.1 10 17.2 10 17.2C10 17.2 14.1 17.2 16.7 16.9C17.1 16.9 17.9 16.9 18.7 16.1C19.3 15.5 19.5 14.3 19.5 14.3C19.5 14.3 19.7 12.9 19.7 11.5V10.2C19.7 8.9 19.5 7.5 19.5 7.5Z"
        fill="#FF0000"
        transform="translate(2, 3.5)"
      />
      <polygon points="9.5,8.5 9.5,15.5 15.5,12" fill="white" />
    </svg>
  );
}

export function LinkedinIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        d="M7 9H4.5V17H7V9ZM5.75 8C4.784 8 4 7.216 4 6.25C4 5.284 4.784 4.5 5.75 4.5C6.716 4.5 7.5 5.284 7.5 6.25C7.5 7.216 6.716 8 5.75 8ZM20 17H17.5V12.9C17.5 11.4 16.9 11 16.1 11C15.3 11 14.5 11.6 14.5 12.9V17H12V9H14.4V10.1C14.8 9.4 15.7 8.8 17 8.8C19 8.8 20 10.1 20 12.4V17Z"
        fill="white"
      />
    </svg>
  );
}

export function PinterestIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="24" height="24" rx="4" fill="#E60023" />
      <path
        d="M12 4C7.6 4 4 7.6 4 12C4 15.4 6.1 18.3 9 19.5C9 18.9 9 18.1 9.2 17.4L10.3 12.9C10.3 12.9 10 12.3 10 11.4C10 10 10.8 8.9 11.8 8.9C12.6 8.9 13 9.5 13 10.2C13 11 12.5 12.2 12.2 13.3C12 14.2 12.6 15 13.5 15C15.1 15 16.2 13.1 16.2 10.5C16.2 8.3 14.7 6.7 12 6.7C9 6.7 7.2 8.9 7.2 11.3C7.2 12.1 7.5 13 7.9 13.4C8 13.6 8 13.7 7.9 13.9C7.8 14.3 7.6 15.1 7.5 15.5C7.5 15.7 7.3 15.8 7.1 15.7C5.9 15.1 5.2 13.4 5.2 11.2C5.2 7.8 7.7 4.7 12.3 4.7C16 4.7 18.8 7.3 18.8 10.6C18.8 14.2 16.6 17 13.7 17C12.7 17 11.8 16.5 11.5 15.9L10.9 18.1C10.6 19.1 10 20.2 9.6 20.9C10.4 21.1 11.2 21.2 12 21.2C16.4 21.2 20 17.6 20 13.2C20 7.6 16.4 4 12 4Z"
        fill="white"
      />
    </svg>
  );
}
