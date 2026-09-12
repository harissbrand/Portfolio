import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { asset } from '../lib/asset';
import './Projets.css';

interface Project {
  id: string;
  index: string;
  name: string;
  kind: string;
  stack: string[];
  description: string;
  accent: string;
  link?: string;
  shots?: string[];
  bg?: string;
  thumb?: string;
}

const LOGOS: Record<string, string> = {
  MongoDB: asset('logos/mongodb-original.svg'),
  Express: asset('logos/express-original.svg'),
  Angular: asset('logos/angular-original.svg'),
  'Node.js': asset('logos/nodejs-original.svg'),
  '.NET': asset('logos/dotnetcore-original.svg'),
  'SQL Server': asset('logos/microsoftsqlserver-plain.svg'),
  React: asset('logos/react-original.svg'),
  'C#': asset('logos/csharp-original.svg'),
  PostgreSQL: asset('logos/postgresql-original.svg'),
  'Cloud Firestore': asset('logos/firebase-plain.svg'),
  Docker: asset('logos/docker-original.svg'),
};

const PROJECTS: Project[] = [
  {
    id: 'centre-commercial',
    index: '01',
    name: 'Centre Commercial',
    kind: 'Web App',
    stack: ['MongoDB', 'Express', 'Angular', 'Node.js'],
    description:
      "Site vitrine e-commerce côté client avec backoffice complet pour l'administrateur, profils boutiques, location de box et espaces de vente.",
    accent: '#00e5ff',
    link: 'https://github.com/Tsiory24/m1p13mean-Finoana-Brandon',
    thumb: asset('logos/LOGO-CentreC.png'),
    bg: asset('screen/MC1.png'),
  },
  {
    id: 'acm',
    index: '02',
    name: 'ACM — Gestion des inspecteurs',
    kind: 'Web App',
    stack: ['.NET', 'Angular', 'SQL Server'],
    description:
      "Application complète de gestion des inspecteurs de l'Aviation Civile de Madagascar : formations, examens, validité des habilitations, badges avec QR code et affectations de mission.",
    accent: '#3b8bff',
    bg: asset('logos/LOGO-ACM.png'),
    thumb: asset('logos/LOGO-ACM.png'),
    shots: [
      asset('screen/ACM1.png'),
      asset('screen/ACM2.jpg'),
      asset('screen/ACM3.jpg'),
      asset('screen/ACM4.jpg'),
    ],
  },
  {
    id: 'crypto-cloud',
    index: '03',
    name: 'Crypto Cloud',
    kind: 'Web & Mobile App',
    stack: ['Node.js', 'React', 'C#', 'PostgreSQL', 'Cloud Firestore', 'Docker'],
    description:
      "Simulation en temps réel de la gestion d'une cryptomonnaie : suivi des cours, achat et vente, dépôts et retraits, avec version mobile.",
    accent: '#7c5cff',
    link: 'https://github.com/harissbrand/CloudProject',
    thumb: asset('logos/LOGO-CryptoC.png'),
  },
];

export default function Projets() {
  const [sel, setSel] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const shotsRef = useRef<HTMLDivElement | null>(null);

  const scrollShots = (dir: 1 | -1) => {
    const el = shotsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  const project = PROJECTS[sel];
  const shots = project.shots ?? [];

  const select = (index: number) => {
    setSel(index);
    setViewer(null);
  };

  useEffect(() => {
    viewerRef.current?.focus();
  }, [viewer, sel]);

  const viewerKey = (e: React.KeyboardEvent) => {
    // Flèches + Échap restées dans la visionneuse (pas de slide du deck).
    e.stopPropagation();
    if (e.key === 'Escape') setViewer(null);
    else if (e.key === 'ArrowRight') setViewer((v) => (v === null ? v : (v + 1) % shots.length));
    else if (e.key === 'ArrowLeft')
      setViewer((v) => (v === null ? v : (v - 1 + shots.length) % shots.length));
  };

  return (
    <div className="projets">
      <div className="projets__intro">
        <h2 className="projets__title">
          Des idées
          <span>en action</span>
        </h2>
        <p className="projets__text">
          Voici une sélection de mes projets, réalisés pour apprendre et
          progresser.
        </p>
        <p className="projets__quote">
          Chaque projet est une nouvelle aventure.
        </p>
      </div>
      <div className="projets__main">
        <article
          className="projets__card"
          key={project.id}
          style={{ ['--accent' as string]: project.accent }}
        >
          <div className="projets__card-bg" aria-hidden="true">
            {project.bg && <img src={project.bg} alt="" draggable={false} />}
          </div>
          <div className="projets__card-meta">
            <span className="projets__card-thumb" aria-hidden="true">
              {project.thumb ? (
                <img src={project.thumb} alt="" draggable={false} />
              ) : (
                project.name
                  .split(' ')
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join('')
              )}
            </span>
            <span className="projets__card-index">Projet {project.index}</span>
            <span className="projets__card-nav" aria-hidden="true">
              <button
                type="button"
                tabIndex={-1}
                aria-label="Projet précédent"
                onClick={() =>
                  select((sel - 1 + PROJECTS.length) % PROJECTS.length)
                }
              >
                <ChevronLeft size={13} />
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Projet suivant"
                onClick={() => select((sel + 1) % PROJECTS.length)}
              >
                <ChevronRight size={13} />
              </button>
            </span>
          </div>
          <h3 className="projets__card-name">{project.name}</h3>
          <p className="projets__card-kind">{project.kind}</p>
          <ul className="projets__stack">
            {project.stack.map((tech) => (
              <li key={tech} className="projets__stack-item">
                {LOGOS[tech] && (
                  <img
                    src={LOGOS[tech]}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className={tech === 'Express' ? 'logo--invert' : undefined}
                  />
                )}
                {tech}
              </li>
            ))}
          </ul>
          <p className="projets__card-desc">{project.description}</p>
          {project.link && (
            <a
              className="projets__link"
              href={project.link}
              target="_blank"
              rel="noreferrer"
            >
              Voir le projet
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          )}
        </article>
        {shots.length > 0 ? (
          <div className="projets__shots-nav">
            <button
              type="button"
              className="projets__shots-btn"
              aria-label="Captures précédentes"
              onClick={() => scrollShots(-1)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div ref={shotsRef} className="projets__shots">
              {shots.map((shot, i) => (
                <button
                  key={shot}
                  type="button"
                  className="projets__shot"
                  onClick={() => setViewer(i)}
                  aria-label={`Agrandir la capture ${i + 1} — ${project.name}`}
                >
                  <img src={shot} alt="" draggable={false} loading="lazy" />
                  <span className="projets__shot-cap" aria-hidden="true">
                    {project.name}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="projets__shots-btn"
              aria-label="Captures suivantes"
              onClick={() => scrollShots(1)}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>
      {viewer !== null &&
        shots.length > 0 &&
        createPortal(
          <div
            ref={viewerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={`Capture ${viewer + 1} sur ${shots.length} — ${project.name}`}
            className="projets__viewer"
            onKeyDown={viewerKey}
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewer(null);
          }}
        >
          <button
            type="button"
            className="projets__viewer-close"
            aria-label="Fermer la visionneuse"
            onClick={() => setViewer(null)}
          >
            <X size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="projets__viewer-nav projets__viewer-prev"
            aria-label="Capture précédente"
            onClick={() =>
              setViewer((viewer - 1 + shots.length) % shots.length)
            }
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <img
            key={shots[viewer]}
            src={shots[viewer]}
            alt={`Capture ${viewer + 1} — ${project.name}`}
            className="projets__viewer-img"
          />
          <button
            type="button"
            className="projets__viewer-nav projets__viewer-next"
            aria-label="Capture suivante"
            onClick={() => setViewer((viewer + 1) % shots.length)}
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
          <p className="projets__viewer-count" aria-hidden="true">
            {viewer + 1} / {shots.length}
          </p>
          </div>,
          document.body,
        )}
      <aside className="projets__list-wrap" aria-label="Liste des projets">
        <p className="projets__list-head">
          Mes projets <span>{String(PROJECTS.length).padStart(2, '0')}</span>
        </p>
        <ul className="projets__list">
          {PROJECTS.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className={`projets__row${i === sel ? ' is-sel' : ''}`}
                style={{ ['--accent' as string]: p.accent }}
                aria-pressed={i === sel}
                onClick={() => select(i)}
                onMouseEnter={() => {
                  if (i !== sel) select(i);
                }}
              >
                <span className="projets__row-art" aria-hidden="true">
                  {p.thumb ? (
                    <img src={p.thumb} alt="" draggable={false} />
                  ) : (
                    p.name
                      .split(' ')
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join('')
                  )}
                </span>
                <span className="projets__row-text">
                  <span className="projets__row-name">{p.name}</span>
                  <span className="projets__row-kind">{p.kind}</span>
                </span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
