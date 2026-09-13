import { useEffect, useState } from 'react';
import { House, UserRound, Briefcase, Settings, Mail } from 'lucide-react';
import './Header.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const ICON_PROPS = {
  strokeWidth: 1.8,
  'aria-hidden': true,
} as const;

/* Accueil en première position : retour rapide à l'index. */
const NAV_ITEMS: NavItem[] = [
  { id: 'accueil', label: 'Accueil', icon: <House {...ICON_PROPS} /> },
  { id: 'profil', label: 'Profil', icon: <UserRound {...ICON_PROPS} /> },
  { id: 'competences', label: 'Compétences', icon: <Settings {...ICON_PROPS} /> },
  { id: 'projets', label: 'Projets', icon: <Briefcase {...ICON_PROPS} /> },
  { id: 'contact', label: 'Contact', icon: <Mail {...ICON_PROPS} /> },
];

export default function Header({
  ready,
  active,
  onSelect,
}: {
  ready: boolean;
  active: string;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Sur mobile le bouton garde le focus après le tap : sans reset,
  // `hovered` resterait figé sur l'option cliquée et le menu ne
  // suivrait plus le slide. On resynchronise à chaque changement.
  useEffect(() => {
    setHovered(null);
  }, [active]);

  // Comme sur PS4 : le survol prévisualise la sélection (zoom + glow),
  // le clic la valide. Au départ, "Accueil" est sélectionné (image 2).
  const focused = hovered ?? active;
  const activeIndex = NAV_ITEMS.findIndex((i) => i.id === focused);

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    const idx = NAV_ITEMS.findIndex((i) => i.id === id);
    if (e.key === 'ArrowRight') {
      const next = NAV_ITEMS[(idx + 1) % NAV_ITEMS.length];
      onSelect(next.id);
      document.getElementById(`ps4-nav-${next.id}`)?.focus();
    }
    if (e.key === 'ArrowLeft') {
      const prev = NAV_ITEMS[(idx - 1 + NAV_ITEMS.length) % NAV_ITEMS.length];
      onSelect(prev.id);
      document.getElementById(`ps4-nav-${prev.id}`)?.focus();
    }
  };


  return (
    <header className={`ps4-header${ready ? ' is-ready' : ' is-loading'}`}>
      {/* Halo d'ambiance : même bleu que le glow central du background */}
      <div className="ps4-header__ambience" aria-hidden="true" />
      {/* Arc subtil : le focus actif ne revient que lorsqu'on quitte le rail */}
      <svg className="ps4-header__arc" viewBox="0 0 440 90" aria-hidden="true">
        <defs>
          <linearGradient id="ps4-arc-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#00f0ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#8fe3ff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#00f0ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M10,20 Q220,80 430,20" fill="none" stroke="url(#ps4-arc-line)" strokeWidth="1.5" />
      </svg>
      <nav className="ps4-header__nav" aria-label="Navigation principale" onMouseLeave={() => setHovered(null)}>
        {NAV_ITEMS.map((item, idx) => {
          const isFocused = item.id === focused;
          // Rail PS4 : les voisins glissent, rétrécissent et s'estompent
          // avec la distance (magnification de dock).
          const distance = idx - activeIndex;
          const abs = Math.abs(distance);
          const dim = isFocused ? 1 : Math.max(0.55, 1 - abs * 0.16);
          // Arc suivant la courbe du dôme : le centre descend le plus bas
          const center = (NAV_ITEMS.length - 1) / 2;
          const drop = Math.round(30 * (1 - ((idx - center) / center) ** 2));
          return (
            <button
              key={item.id}
              id={`ps4-nav-${item.id}`}
              type="button"
              className={`ps4-nav-item${isFocused ? ' is-focused' : ''}${item.id === active ? ' is-active' : ''}`}
              style={
                {
                  ['--drop' as string]: `${drop}px`,
                  ['--i' as string]: idx,
                  ['--dim' as string]: dim,
                  ['--dist' as string]: abs,
                } as React.CSSProperties
              }
              aria-pressed={item.id === active}
              aria-label={item.label}
              onMouseEnter={() => setHovered(item.id)}
              onFocus={() => setHovered(item.id)}
              onBlur={() => setHovered(null)}
              onClick={(e) => {
                setHovered(null);
                onSelect(item.id);
                // Libère le focus (mobile) pour ne pas rester figé dessus.
                e.currentTarget.blur();
              }}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
            >
              <span className="ps4-nav-item__circle">
                <span className="ps4-nav-item__shine" aria-hidden="true" />
                <span className="ps4-nav-item__ring" aria-hidden="true" />
                <span className="ps4-nav-item__icon">{item.icon}</span>
              </span>
              <span className="ps4-nav-item__label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
