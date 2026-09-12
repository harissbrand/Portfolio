import { useRef, useState } from 'react';
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
      { name: 'Java', logos: ['/logos/java-original.svg'] },
      { name: 'C#', logos: ['/logos/csharp-original.svg'] },
      { name: 'Python', logos: ['/logos/python-original.svg'] },
      { name: 'Node.js', logos: ['/logos/nodejs-original.svg'] },
      { name: 'PHP', logos: ['/logos/php-original.svg'] },
      {
        name: 'JS / TS',
        logos: ['/logos/javascript-original.svg', '/logos/typescript-original.svg'],
      },
    ],
  },
  {
    id: 'framework',
    label: 'Frameworks',
    items: [
      { name: 'Spring Boot', logos: ['/logos/spring-original.svg'] },
      { name: 'Express.js', logos: ['/logos/express-original.svg'], light: true },
      { name: '.NET', logos: ['/logos/dotnetcore-original.svg'] },
      { name: 'React', logos: ['/logos/react-original.svg'] },
      { name: 'Angular', logos: ['/logos/angular-original.svg'] },
      { name: 'Streamlit', logos: ['/logos/streamlit-original.svg'] },
      { name: 'Tailwind', logos: ['/logos/tailwindcss-original.svg'] },
    ],
  },
  {
    id: 'bdd',
    label: 'Bases de données',
    items: [
      { name: 'PostgreSQL', logos: ['/logos/postgresql-original.svg'] },
      { name: 'MySQL', logos: ['/logos/mysql-original.svg'] },
      { name: 'SQL Server', logos: ['/logos/microsoftsqlserver-plain.svg'] },
      { name: 'MongoDB', logos: ['/logos/mongodb-original.svg'] },
      { name: 'Cloud Firestore', logos: ['/logos/firebase-plain.svg'] },
    ],
  },
  {
    id: 'outils',
    label: 'Autres',
    items: [
      { name: 'Git', logos: ['/logos/git-original.svg'] },
      { name: 'Docker', logos: ['/logos/docker-original.svg'] },
      { name: 'Postman', logos: ['/logos/postman-original.svg'] },
      { name: 'Swagger', logos: ['/logos/swagger-original.svg'] },
      { name: 'VS Code', logos: ['/logos/vscode-original.svg'] },
      { name: 'Cursor', logos: ['/logos/cursor.svg'] },
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
