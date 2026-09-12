import { useEffect, useState } from 'react';
import {
  Lightbulb,
  ShieldCheck,
  Puzzle,
  Scale,
  GraduationCap,
  CodeXml,
  Briefcase,
} from 'lucide-react';
import { asset } from '../lib/asset';
import './Profil.css';

// Portrait détouré (fond transparent) avec halo cyan.
const PORTRAIT_SRC = asset('Portrait.png');

const PARCOURS = [
  {
    period: '2019 — 2022',
    title: 'Baccalauréat scientifique',
    school: 'Lycée Saint Michel Amparibe',
    icon: <GraduationCap size={18} strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    period: '2022 — 2025',
    title: 'Licence en informatique — développement',
    school: 'IT University',
    icon: <CodeXml size={18} strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    period: '2025',
    title: 'Stage de développement',
    school: 'ACM',
    icon: <Briefcase size={18} strokeWidth={1.8} aria-hidden="true" />,
  },
  {
    period: 'Depuis 2025',
    title: 'Master 1',
    school: 'IT University',
    icon: <GraduationCap size={18} strokeWidth={1.8} aria-hidden="true" />,
  },
];

const QUALITES = [
  { label: 'Curiosité', icon: <Lightbulb size={14} strokeWidth={2} aria-hidden="true" /> },
  { label: 'Rigueur', icon: <ShieldCheck size={14} strokeWidth={2} aria-hidden="true" /> },
  { label: 'Problem Solving', icon: <Puzzle size={14} strokeWidth={2} aria-hidden="true" /> },
  { label: 'Esprit critique', icon: <Scale size={14} strokeWidth={2} aria-hidden="true" /> },
];

const FULL_NAME = 'Maharo Brandon HARISON';
const NAME_SPLIT = 'Maharo Brandon'.length; // partie blanche / partie cyan

export default function Profil({ active }: { active: boolean }) {
  const [count, setCount] = useState(0);
  const done = count >= FULL_NAME.length;

  // Frappe progressive, rejouée à chaque arrivée sur la section.
  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(FULL_NAME.length);
      return;
    }
    setCount(0);
    const id = window.setInterval(() => {
      setCount((current) => {
        if (current >= FULL_NAME.length) {
          window.clearInterval(id);
          return current;
        }
        return current + 1;
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [active ]);

  return (
    <div className="profil">
      <div className="profil__content">
        <h2
          className={`profil__name${done ? '' : ' typing'}${!done && count > NAME_SPLIT ? ' typing-cyan' : ''}`}
          aria-label="Maharo Brandon HARISON"
        >
          <span aria-hidden="true">
            {FULL_NAME.slice(0, Math.min(count, NAME_SPLIT))}
          </span>
          <span aria-hidden="true">
            {FULL_NAME.slice(NAME_SPLIT, count)}
          </span>
        </h2>
        <h3 className="profil__section-title">À propos de moi</h3>
        <p className="profil__bio">
          J&apos;aime transformer un besoin ou un problème en une solution
          concrète. Je m&apos;intéresse autant à la logique qui se trouve
          derrière une application qu&apos;à la manière dont elle est utilisée.
        </p>
        <h3 className="profil__section-title">Mon parcours</h3>
        <ol className="profil__parcours">
          {PARCOURS.map((item) => (
            <li key={item.title} className="profil__step">
              <span className="profil__step-icon" aria-hidden="true">
                {item.icon}
              </span>
              <p className="profil__step-period">{item.period}</p>
              <p className="profil__step-title">{item.title}</p>
              <p className="profil__step-school">{item.school}</p>
            </li>
          ))}
        </ol>
        <h3 className="profil__section-title">Mes qualités</h3>
        <ul className="profil__qualities">
          {QUALITES.map((quality) => (
            <li key={quality.label} className="profil__quality">
              <span className="profil__quality-icon" aria-hidden="true">
                {quality.icon}
              </span>
              {quality.label}
            </li>
          ))}
        </ul>
      </div>
      <figure className="profil__photo">
        <div className="profil__frame">
          <img src={PORTRAIT_SRC} alt="Portrait de HARISON Maharo Brandon" />
        </div>
        <span className="profil__floor" aria-hidden="true" />
        <span className="profil__streak" aria-hidden="true" />
      </figure>
    </div>
  );
}
