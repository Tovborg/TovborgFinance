export default function LogoIcon(props) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        {/* T-bar */}
        <rect x="10" y="20" width="80" height="10" rx="2" />
        
        {/* F-stamme */}
        <rect x="50" y="30" width="10" height="50" rx="2" />
  
        {/* F-arm */}
        <rect x="60" y="45" width="20" height="10" rx="2" />
  
        {/* Venstre del inspireret af AI-logoet */}
        <path
          d="M30 40 Q25 50 30 60 Q35 70 40 60 Q45 50 40 40 Q35 30 30 40 Z"
          fill="currentColor"
        />
      </svg>
    )
  }