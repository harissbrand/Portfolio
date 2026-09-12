/**
 * Chemin d'un média du dossier `public/`, préfixé de la base de déploiement
 * (import.meta.env.BASE_URL). Ex. : asset('logos/java-original.svg').
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const clean = path.replace(/^\/+/, '');
  return `${base}${clean}`;
}
