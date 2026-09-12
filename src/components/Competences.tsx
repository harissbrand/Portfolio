import { useRef, useState } from 'react';
import { asset } from '../lib/asset';
import './Competences.css';

interface Skill {
  name: string;
  logos: string[];
  /** Logo sombre : à inverser pour rester lisible sur fond nuit. */
  light?: boolean;
}

interface Folder {
  id: string;
  label: string;
  items: Skill[];
}

const FOLDERS: Folder[] = [
  {
    id: 'langages',
    label: 'Langages de programmation',
    items: [
      { name: 'Java', logos: [asset('logos/java-original.svg')] },
      { name: 'C#', logos: [asset('logos/csharp-original.svg')] },
      { name: 'Python', logos: [asset('logos/python-original.svg')] },
      { name: 'Node.js', logos: [asset('logos/nodejs-original.svg')] },
      { name: 'PHP', logos: [asset('logos/php-original.svg')] },
      {
        name: 'JS / TS',
        logos: [asset('logos/javascript-original.svg'), asset('logos/typescript-original.svg')],
      },
    ],
  },
  {
    id: 'framework',
    label: 'Frameworks',
    items: [
      { name: 'Spring Boot', logos: [asset('logos/spring-original.svg')] },
      { name: 'Express.js', logos: [asset('logos/express-original.svg')], light: true },
      { name: '.NET', logos: [asset('logos/dotnetcore-original.svg')] },
      { name: 'React', logos: [asset('logos/react-original.svg')] },
      { name: 'Angular', logos: [asset('logos/angular-original.svg')] },
      { name: 'Streamlit', logos: [asset('logos/streamlit-original.svg')] },
      { name: 'Tailwind', logos: [asset('logos/tailwindcss-original.svg')] },
    ],
  },
  {
    id: 'bdd',
    label: 'Bases de données',
    items: [
      { name: 'PostgreSQL', logos: [asset('logos/postgresql-original.svg')] },
      { name: 'MySQL', logos: [asset('logos/mysql-original.svg')] },
      { name: 'SQL Server', logos: [asset('logos/microsoftsqlserver-plain.svg')] },
      { name: 'MongoDB', logos: [asset('logos/mongodb-original.svg')] },
      { name: 'Cloud Firestore', logos: [asset('logos/firebase-plain.svg')] },
    ],
  },
  {
    id: 'outils',
    label: 'Autres',
    items: [
      { name: 'Git', logos: [asset('logos/git-original.svg')] },
      { name: 'Docker', logos: [asset('logos/docker-original.svg')] },
      { name: 'Postman', logos: [asset('logos/postman-original.svg')] },
      { name: 'Swagger', logos: [asset('logos/swagger-original.svg')] },
      { name: 'VS Code', logos: [asset('logos/vscode-original.svg')] },
      { name: 'Cursor', logos: [asset('logos/cursor.svg')] },
    ],
  },
];

export default function Competences() {
  // Sélecteur rotatif : S au centre, AL à gauche, AR à droite,
  // avec rebouclage (AL = folder[x-1], AR = folder[x+1], modulo n).
  // Le survol suffit à sélectionner ; le rail se verrouille pendant
  // la rotation pour éviter les re-sélections en cascade.
  const [sel, setSel] = useState(1);
  const [locked, setLocked] = useState(false);
  const lockTimer = useRef(0);

  const select = (index: number) => {
    const n = FOLDERS.length;
    const next = ((index % n) + n) % n;
    if (next === sel) return;
    setSel(next);
    setLocked(true);
    window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => setLocked(false), 1000);
  };

  return (
    <div className="skills">
      <div
        className={`skills__stage${locked ? ' is-locked' : ''}`}
        aria-label="Dossiers de compétences"
      >
        {FOLDERS.map((folder, i) => {
          // Anneau : S au centre, AL à gauche, AR à droite, le 4e derrière.
          // Les nœuds sont stables (clé = dossier) : seule la position tourne.
          const n = FOLDERS.length;
          const rel = (i - sel + n) % n;
          const pos =
            rel === 0 ? 'is-sel' : rel === 1 ? 'is-right' : rel === n - 1 ? 'is-left' : 'is-back';
          const hidden = pos === 'is-back';
          return (
          <button
            key={folder.id}
            type="button"
            aria-label={folder.label}
            aria-current={rel === 0}
            aria-hidden={hidden}
            tabIndex={hidden ? -1 : undefined}
            className={`skills__card ${pos}`}
            onClick={(e) => {
              select(i);
              // Sur mobile : recentre la carte touchée dans le rail.
              e.currentTarget.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
              });
            }}
            onMouseEnter={() => select(i)}
          >
            <span className="skills__card-title">{folder.label}</span>
            <span className="skills__mosaic" aria-hidden="true">
              {folder.items.map((item) => (
                <span key={item.name} className="skills__cell">
                  {item.logos.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      draggable={false}
                      className={item.light ? 'logo--invert' : undefined}
                    />
                  ))}
                </span>
              ))}
            </span>
          </button>
          );
        })}
      </div>
    </div>
  );
}
