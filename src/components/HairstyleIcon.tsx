interface Props {
  styleKey: string;
  size?: number;
}

// Simple, license-free line-art silhouettes — one per hairstyle category.
// Not photorealistic; meant to give a quick visual cue while browsing options.
export default function HairstyleIcon({ styleKey, size = 48 }: Props) {
  const common = { width: size, height: size, viewBox: "0 0 60 60", fill: "none", stroke: "currentColor", strokeWidth: 2 };

  switch (styleKey) {
    case "long-layers":
      return (
        <svg {...common}>
          <circle cx="30" cy="22" r="12" />
          <path d="M18 24 Q14 45 20 55 M42 24 Q46 45 40 55" />
        </svg>
      );
    case "sleek-straight":
      return (
        <svg {...common}>
          <circle cx="30" cy="22" r="12" />
          <path d="M19 24 L17 52 M41 24 L43 52" />
        </svg>
      );
    case "waves-curls":
      return (
        <svg {...common}>
          <circle cx="30" cy="22" r="12" />
          <path d="M18 24 Q22 32 18 40 Q22 48 18 55 M42 24 Q38 32 42 40 Q38 48 42 55" />
        </svg>
      );
    case "braids":
      return (
        <svg {...common}>
          <circle cx="30" cy="22" r="12" />
          <path d="M25 26 L22 55 M30 26 L30 55 M35 26 L38 55" />
        </svg>
      );
    case "updo-bun":
      return (
        <svg {...common}>
          <circle cx="30" cy="24" r="11" />
          <circle cx="30" cy="10" r="6" />
        </svg>
      );
    case "natural-texture":
      return (
        <svg {...common}>
          <circle cx="30" cy="22" r="12" />
          <path d="M20 16 Q30 6 40 16" strokeDasharray="2 3" />
        </svg>
      );
    case "textured-crop":
      return (
        <svg {...common}>
          <circle cx="30" cy="24" r="12" />
          <path d="M20 16 Q30 8 40 16" strokeDasharray="1 2" />
        </svg>
      );
    case "fade":
      return (
        <svg {...common}>
          <circle cx="30" cy="24" r="12" />
          <path d="M20 20 Q30 12 40 20" />
        </svg>
      );
    case "slicked-back":
      return (
        <svg {...common}>
          <circle cx="30" cy="24" r="12" />
          <path d="M20 15 L40 12" />
        </svg>
      );
    case "buzz-cut":
      return (
        <svg {...common}>
          <circle cx="30" cy="24" r="12" strokeDasharray="1 1.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="30" cy="24" r="12" />
        </svg>
      );
  }
}