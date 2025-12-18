interface OrnamentalDividerProps {
  className?: string;
}

export default function OrnamentalDivider({ className = '' }: OrnamentalDividerProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        width="300"
        height="80"
        viewBox="0 0 300 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-md text-golden opacity-80"
      >
        {/* Left decorative vine */}
        <path
          d="M10 40 Q 30 35, 50 38 Q 65 40, 75 35 L 80 38"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M15 42 Q 25 38, 35 42 Q 45 44, 55 40"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Left leaf details */}
        <path d="M 25 35 Q 28 32, 25 29" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M 45 34 Q 48 37, 51 34" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M 60 38 Q 62 35, 60 32" stroke="currentColor" strokeWidth="0.5" fill="none" />

        {/* Hanging beads left */}
        <circle cx="30" cy="45" r="1" fill="currentColor" />
        <circle cx="50" cy="47" r="1" fill="currentColor" />
        <circle cx="70" cy="44" r="1" fill="currentColor" />
        <line x1="30" y1="38" x2="30" y2="45" stroke="currentColor" strokeWidth="0.3" />
        <line x1="50" y1="40" x2="50" y2="47" stroke="currentColor" strokeWidth="0.3" />
        <line x1="70" y1="36" x2="70" y2="44" stroke="currentColor" strokeWidth="0.3" />

        {/* Center mandala ornament */}
        <circle cx="150" cy="40" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="150" cy="40" r="8" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="150" cy="40" r="4" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.3" />

        {/* Center mandala petals */}
        <path d="M 150 28 L 150 32 M 150 48 L 150 52" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 162 40 L 158 40 M 138 40 L 142 40" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 158.5 31.5 L 155.5 34.5 M 141.5 48.5 L 144.5 45.5" stroke="currentColor" strokeWidth="1" />
        <path d="M 158.5 48.5 L 155.5 45.5 M 141.5 31.5 L 144.5 34.5" stroke="currentColor" strokeWidth="1" />

        {/* Inner mandala decoration */}
        <circle cx="150" cy="32" r="1.5" fill="currentColor" />
        <circle cx="150" cy="48" r="1.5" fill="currentColor" />
        <circle cx="158" cy="40" r="1.5" fill="currentColor" />
        <circle cx="142" cy="40" r="1.5" fill="currentColor" />

        {/* Right decorative vine */}
        <path
          d="M220 38 L 225 35 Q 235 40, 250 38 Q 265 35, 280 40"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M245 40 Q 255 44, 265 42 Q 275 38, 285 42"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Right leaf details */}
        <path d="M 240 38 Q 242 35, 240 32" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M 255 34 Q 252 37, 249 34" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <path d="M 275 35 Q 278 32, 275 29" stroke="currentColor" strokeWidth="0.5" fill="none" />

        {/* Hanging beads right */}
        <circle cx="230" cy="44" r="1" fill="currentColor" />
        <circle cx="250" cy="47" r="1" fill="currentColor" />
        <circle cx="270" cy="45" r="1" fill="currentColor" />
        <line x1="230" y1="36" x2="230" y2="44" stroke="currentColor" strokeWidth="0.3" />
        <line x1="250" y1="40" x2="250" y2="47" stroke="currentColor" strokeWidth="0.3" />
        <line x1="270" y1="38" x2="270" y2="45" stroke="currentColor" strokeWidth="0.3" />

        {/* Connecting swags */}
        <path
          d="M 80 38 Q 100 42, 120 40"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />
        <path
          d="M 180 40 Q 200 42, 220 38"
          stroke="currentColor"
          strokeWidth="0.8"
          fill="none"
        />

        {/* Small dots on swags */}
        <circle cx="90" cy="40" r="0.8" fill="currentColor" />
        <circle cx="110" cy="41" r="0.8" fill="currentColor" />
        <circle cx="190" cy="41" r="0.8" fill="currentColor" />
        <circle cx="210" cy="40" r="0.8" fill="currentColor" />
      </svg>
    </div>
  );
}
