export function ResumeAnalyzerIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="56" height="56" rx="12" fill="url(#paint0_linear)"/>
      
      {/* Chart bars */}
      <rect x="14" y="28" width="6" height="16" rx="1" fill="#4F6FD8"/>
      <rect x="25" y="18" width="6" height="26" rx="1" fill="#4F7CFF"/>
      <rect x="36" y="24" width="6" height="20" rx="1" fill="#79A2FF"/>
      
      {/* Accent line */}
      <line x1="12" y1="46" x2="44" y2="46" stroke="#E8E2DB" strokeWidth="1" strokeLinecap="round"/>
      
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1A3263" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#4F7CFF" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
