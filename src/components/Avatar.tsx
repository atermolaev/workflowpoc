import React, { useState, useCallback } from 'react';
import './Avatar.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'away' | 'busy' | 'offline';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  ring?: boolean;
  className?: string;
}

const SIZE_MAP: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const FONT_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 9,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
};

const STATUS_SIZE_MAP: Record<AvatarSize, number> = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 13,
  xl: 17,
};

/** Deterministic hue from a string — same name always yields the same color. */
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name = '',
  size = 'md',
  status,
  ring = false,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const handleError = useCallback(() => setImgError(true), []);

  const px = SIZE_MAP[size];
  const fontSize = FONT_SIZE_MAP[size];
  const statusPx = STATUS_SIZE_MAP[size];
  const showImage = src && !imgError;
  const initials = name ? getInitials(name) : '?';
  const hue = nameToHue(name || alt || '');

  const ringOffset = ring ? 3 : 0;
  const wrapSize = px + ringOffset * 2;

  return (
    <span
      className={`av-root av-${size} ${ring ? 'av-ring' : ''} ${className}`.trim()}
      style={{
        width: wrapSize,
        height: wrapSize,
        ['--av-hue' as string]: hue,
        ['--av-ring-offset' as string]: `${ringOffset}px`,
      }}
      aria-label={alt ?? name}
      role="img"
    >
      <span
        className={`av-inner ${!showImage ? 'av-initials' : ''}`}
        style={{ width: px, height: px }}
      >
        {showImage ? (
          <img
            className="av-img"
            src={src}
            alt={alt ?? name}
            onError={handleError}
            width={px}
            height={px}
            draggable={false}
          />
        ) : (
          <span className="av-letters" style={{ fontSize }}>
            {initials}
          </span>
        )}
      </span>

      {status && (
        <span
          className={`av-status av-status-${status}`}
          style={{ width: statusPx, height: statusPx }}
          aria-label={status}
        />
      )}
    </span>
  );
};

export default Avatar;
