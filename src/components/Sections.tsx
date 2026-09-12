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

