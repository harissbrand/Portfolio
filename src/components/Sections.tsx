import './Sections.css';

export type SectionId = 'accueil' | 'profil' | 'projets' | 'competences' | 'contact';

export const SECTION_ORDER: SectionId[] = [
  'accueil',
  'profil',
  'competences',
  'projets',
  'contact',
];

export const SECTION_LABELS: Record<SectionId, string> = {
  accueil: 'Accueil',
  profil: 'Profil',
  projets: 'Projets',
  competences: 'Compétences',
  contact: 'Contact',
};

function Shell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section">
      <p className="section__eyebrow">{eyebrow}</p>
      <h2 className="section__title">{title}</h2>
      <span className="section__rule" aria-hidden="true" />
      {children}
    </div>
  );
}

