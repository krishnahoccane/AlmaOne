import React from 'react';
import { X } from 'lucide-react';

interface CrestProps {
  variant: 'shield' | 'compass' | 'laurel' | 'columns' | 'unified';
  color?: string;
  size?: number;
  className?: string;
}

export const InstitutionCrest: React.FC<CrestProps> = ({
  variant,
  color = '#1E293B',
  size = 24,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {variant === 'shield' && (
        <>
          <path
            d="M16 3L5 7.5V15.5C5 22.4 9.7 27.9 16 29.5C22.3 27.9 27 22.4 27 15.5V7.5L16 3Z"
            stroke={color}
            strokeWidth="2"
            fill={`${color}14`}
          />
          <path d="M16 8V23M10 13.5H22" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="13.5" r="2.2" fill={color} />
        </>
      )}
      {variant === 'compass' && (
        <>
          <rect x="4" y="4" width="24" height="24" rx="6" stroke={color} strokeWidth="2" fill={`${color}14`} />
          <path d="M16 8L22 22L16 19L10 22L16 8Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="16" cy="14" r="1.5" fill={color} />
        </>
      )}
      {variant === 'laurel' && (
        <>
          <circle cx="16" cy="16" r="12" stroke={color} strokeWidth="2" fill={`${color}14`} />
          <path d="M10 21V11L16 16L22 11V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 23.5H22" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {variant === 'columns' && (
        <>
          <path d="M5 11L16 5L27 11H5Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={`${color}14`} />
          <path d="M9 14V23M16 14V23M23 14V23M6 25.5H26" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {variant === 'unified' && (
        <>
          <rect x="3" y="3" width="26" height="26" rx="7" fill={color} />
          <circle cx="12" cy="12" r="3" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="20" cy="12" r="3" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="16" cy="20" r="3" stroke="#FFFFFF" strokeWidth="1.8" />
          <path d="M14.5 13.5L15 17.5M17.5 13.5L17 17.5" stroke="#FFFFFF" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
};

interface AvatarProps {
  name: string;
  initials: string;
  tone?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const AlumniAvatar: React.FC<AvatarProps> = ({
  name,
  initials,
  tone = '#334155',
  avatarUrl,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${SIZE_MAP[size]} rounded-full object-cover shrink-0 border border-slate-200 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${SIZE_MAP[size]} rounded-full shrink-0 flex items-center justify-center font-semibold text-white tracking-tight select-none ${className}`}
      style={{ backgroundColor: tone }}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

interface QrCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

/**
 * Deterministic high-contrast SVG QR-matrix renderer for Digital Alumni ID & Event Entry Passes.
 */
export const DeterministicQrCode: React.FC<QrCodeProps> = ({
  value,
  size = 132,
  fgColor = '#0F172A',
  bgColor = '#FFFFFF',
}) => {
  const grid = 21;
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, grid - 7) || inBox(grid - 7, 0);
  };

  const finderFilled = (r: number, c: number) => {
    const check = (br: number, bc: number) => {
      const lr = r - br;
      const lc = c - bc;
      if (lr < 0 || lr >= 7 || lc < 0 || lc >= 7) return false;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };
    return check(0, 0) || check(0, grid - 7) || check(grid - 7, 0);
  };

  const cells: React.ReactElement[] = [];
  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      let filled = false;
      if (isFinder(r, c)) {
        filled = finderFilled(r, c);
      } else if (
        (r === 7 && c < 8) ||
        (c === 7 && r < 8) ||
        (r === 7 && c > grid - 9) ||
        (c === grid - 8 && r < 8) ||
        (r === grid - 8 && c < 8) ||
        (c === 7 && r > grid - 9)
      ) {
        filled = false;
      } else {
        const seed = ((r * 31 + c * 17) ^ hash) >>> 0;
        filled = ((seed * 2654435761) >>> 28) % 2 === 0;
      }

      if (filled) {
        cells.push(<rect key={`${r}-${c}`} x={c + 1} y={r + 1} width={1} height={1} fill={fgColor} />);
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid + 2} ${grid + 2}`}
      className="rounded-lg border border-slate-200 shrink-0"
      style={{ backgroundColor: bgColor }}
      role="img"
      aria-label={`QR Code for ${value}`}
    >
      <rect width={grid + 2} height={grid + 2} fill={bgColor} />
      {cells}
    </svg>
  );
};

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-lg',
  children,
}) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-[2px] p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`w-full ${maxWidthClass} bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900 leading-snug">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
