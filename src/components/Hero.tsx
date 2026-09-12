import { Download } from 'lucide-react';
import { asset } from '../lib/asset';
import './Hero.css';

export default function Hero({
  onNavigate,
}: {
  onNavigate: (id: 'projets' | 'contact') => void;
}) {
  return (
    <main className="hero">
      <h1 className="hero__name">Brandon Harison</h1>
      <p className="hero__role">Développeur Full-Stack</p>
      <p className="hero__bio">
        Je conçois des applications web modernes, du backend à l&apos;interface,
        avec un focus sur la qualité du code et l&apos;expérience utilisateur.
      </p>
      <div className="hero__ctas">
        <a
          className="hero__btn hero__btn--ghost"
          href={asset('CV-Brandon-Harison.pdf')}
          download="CV-Brandon-Harison.pdf"
        >
          <Download size={15} strokeWidth={2} aria-hidden="true" />
          Télécharger mon CV
        </a>
        <button
          type="button"
          className="hero__btn hero__btn--ghost"
          onClick={() => onNavigate('contact')}
        >
          Me contacter
        </button>
      </div>
      <p className="hero__meta">Master 1 · IT University</p>
    </main>
  );
}
