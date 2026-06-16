export function CreateResumeIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="56" height="56" rx="12" fill="url(#paint0_linear)"/>
      
      {/* Document */}
      <rect x="14" y="12" width="28" height="32" rx="2" fill="#FFFFFF" stroke="#1A3263" strokeWidth="1.5"/>
      
      {/* Document lines */}
      <line x1="20" y1="20" x2="38" y2="20" stroke="#1A3263" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      <line x1="20" y1="26" x2="38" y2="26" stroke="#1A3263" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      <line x1="20" y1="32" x2="32" y2="32" stroke="#1A3263" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
      
      {/* Pencil icon */}
      <g transform="translate(30, 28)">
        <circle cx="0" cy="0" r="7" fill="#FAB95B" opacity="0.2"/>
        <path d="M -1 -3 L 2 0 L -1 3 Z" fill="#FAB95B"/>
        <path d="M 0 -2 L 2.5 0.5 L 0 3 L -2 1" stroke="#FAB95B" strokeWidth="1" fill="none"/>
      </g>
      
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1A3263" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#FAB95B" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
