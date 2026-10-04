import React from 'react';

export interface HypChatLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'badge';
  className?: string;
  showHeart?: boolean;
}

/**
 * HypChat Official Original Logo & App Icon
 * 
 * Design Concept:
 * - A distinctive, sleek, modern chat-box shape (not a generic round balloon)
 * - Above the chat box: ONE small, elegant, minimalist heart representing friendship & connection
 * - Inside the chat box: Clearly written "HYPCHAT" in crisp, modern, bold geometric typography
 * - Palette: Royal purple (#7c3aed), rich violet (#8b5cf6), deep twilight purple (#3b0764 / #1e0836), and white
 * - NO fire/flame, NO orange, clean, professional, app-store ready.
 */
export const HypChatLogo: React.FC<HypChatLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showHeart = true
}) => {
  // Dimension tokens
  const sizes = {
    xs: {
      box: 'h-6',
      svg: 'h-6 w-auto',
      text: 'text-[10px] tracking-[0.16em]',
      heart: 'w-2 h-2 -top-1',
      iconDim: 'w-6 h-6'
    },
    sm: {
      box: 'h-8',
      svg: 'h-8 w-auto',
      text: 'text-xs tracking-[0.18em]',
      heart: 'w-2.5 h-2.5 -top-1.5',
      iconDim: 'w-8 h-8'
    },
    md: {
      box: 'h-10',
      svg: 'h-10 w-auto',
      text: 'text-sm tracking-[0.2em]',
      heart: 'w-3 h-3 -top-2',
      iconDim: 'w-10 h-10'
    },
    lg: {
      box: 'h-13',
      svg: 'h-13 w-auto',
      text: 'text-base tracking-[0.22em]',
      heart: 'w-4 h-4 -top-2.5',
      iconDim: 'w-14 h-14'
    },
    xl: {
      box: 'h-18',
      svg: 'h-18 w-auto',
      text: 'text-xl tracking-[0.24em]',
      heart: 'w-5 h-5 -top-3.5',
      iconDim: 'w-20 h-20'
    }
  }[size];

  // B) APP ICON ONLY (Chat box + small minimalist heart above)
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizes.iconDim} drop-shadow-md`}
        >
          <defs>
            {/* Royal Purple to Rich Violet Gradient */}
            <linearGradient id="hypChatPurpleGradIcon" x1="8" y1="12" x2="56" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>

            {/* Subtle Inner Violet Border Sheen */}
            <linearGradient id="hypChatBorderGradIcon" x1="12" y1="14" x2="52" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.3" />
            </linearGradient>

            {/* Heart Gradient */}
            <linearGradient id="hypChatHeartGradIcon" x1="28" y1="2" x2="36" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Above the chat box: ONE small minimalist heart */}
          {showHeart && (
            <path
              d="M32 6.8C30.9 5.2 28.7 4.2 26.8 4.9C24.3 5.7 23.5 8.2 24.6 10.4C25.9 13.2 30.4 16.0 32 16.9C33.6 16.0 38.1 13.2 39.4 10.4C40.5 8.2 39.7 5.7 37.2 4.9C35.3 4.2 33.1 5.2 32 6.8Z"
              fill="url(#hypChatHeartGradIcon)"
              className="drop-shadow-sm"
            />
          )}

          {/* Distinctive Modern Chat Box Shape with subtle architectural tail */}
          <path
            d="M16 18C11.5817 18 8 21.5817 8 26V44C8 48.4183 11.5817 52 16 52H20L18.2 57.4C17.9 58.3 18.8 59.1 19.6 58.6L27.5 52H48C52.4183 52 56 48.4183 56 44V26C56 21.5817 52.4183 18 48 18H16Z"
            fill="url(#hypChatPurpleGradIcon)"
            stroke="url(#hypChatBorderGradIcon)"
            strokeWidth="2"
          />

          {/* Minimalist modern H monogram inside the icon */}
          <path
            d="M25 28V40M39 28V40M25 34H39"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // A) FULL LOGO: Chat box + small minimalist heart + HYPCHAT inside
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      <svg
        viewBox="0 0 210 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizes.svg}
      >
        <defs>
          {/* Deep Royal Purple to Rich Violet Gradient */}
          <linearGradient id="hypChatPurpleGradFull" x1="10" y1="12" x2="200" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="45%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          {/* Refined Chamfer Border Sheen */}
          <linearGradient id="hypChatBorderGradFull" x1="20" y1="14" x2="190" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#9333ea" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.2" />
          </linearGradient>

          {/* Small Heart Gradient */}
          <linearGradient id="hypChatHeartGradFull" x1="101" y1="2" x2="109" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          {/* Subtle Drop Shadow */}
          <filter id="purpleGlow" x="0" y="0" width="210" height="68" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#7c3aed" floodOpacity="0.25" />
          </filter>
        </defs>

        <g filter="url(#purpleGlow)">
          {/* Above the chat box: ONE small, elegant, minimalist heart */}
          {showHeart && (
            <path
              d="M105 5.8C103.8 4.2 101.8 3.3 99.9 3.9C97.6 4.7 96.9 7.1 97.9 9.2C99.2 12.0 103.4 14.8 105 15.6C106.6 14.8 110.8 12.0 112.1 9.2C113.1 7.1 112.4 4.7 110.1 3.9C108.2 3.3 106.2 4.2 105 5.8Z"
              fill="url(#hypChatHeartGradFull)"
            />
          )}

          {/* Sleek Modern Distinctive Chat Box Shape with subtle architectural speech tail */}
          <path
            d="M26 14C17.1634 14 10 21.1634 10 30V42C10 50.8366 17.1634 58 26 58H36L32.2 64.6C31.7 65.5 32.8 66.4 33.7 65.8L44.5 58H184C192.837 58 200 50.8366 200 42V30C200 21.1634 192.837 14 184 14H26Z"
            fill="url(#hypChatPurpleGradFull)"
            stroke="url(#hypChatBorderGradFull)"
            strokeWidth="1.8"
          />

          {/* Inside the chat box, clearly write: HYPCHAT */}
          <text
            x="105"
            y="36"
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            fontFamily="'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontWeight="800"
            fontSize="21"
            letterSpacing="0.22em"
          >
            HYPCHAT
          </text>
        </g>
      </svg>
    </div>
  );
};

export const HypChatAppIcon: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  return <HypChatLogo size={size} variant="icon" className={className} />;
};
