# Portfolio — Brandon

Portfolio personnel développé avec React et Tailwind CSS.

---

## Stack

| Outil | Version | Rôle |
|---|---|---|
| [Vite](https://vite.dev/) | ^8 | Bundler / serveur de dev |
| [React](https://react.dev/) | ^19 | UI |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Styles utilitaires (via plugin Vite) |

---

## Typographies

| Usage | Police | Source | Graisses disponibles |
|---|---|---|---|
| Titres / Menus | Waukegan LDO | `public/fonts/` (local) | 400, 700, 900 + Oblique |
| Titres larges | Waukegan LDO Extended | `public/fonts/` (local) | 400, 700, 900 + Oblique |
| Textes courants | Noto Sans | Google Fonts (`<link>` dans `index.html`) | 100–900 |

**Variables CSS disponibles :**
```css
--font-heading           /* Waukegan LDO — titres & menus       */
--font-heading-extended  /* Waukegan LDO Extended — variante     */
--font-body              /* Noto Sans — textes courants          */
--font-mono              /* ui-monospace — code                  */
```

---

## Composants

### `DepthLoader`
Écran de chargement intro style "fond marin / encre bleue", inspiré de l'ambiance du menu pause de Persona 3 Reload.

**Props :**
| Prop | Type | Défaut | Description |
|---|---|---|---|
| `name` | `string` | `"Brandon"` | Nom affiché pendant le chargement |
| `role` | `string` | `"Développeur full-stack"` | Sous-titre |
| `durationMs` | `number` | `3200` | Durée de la phase de chargement (ms) |
| `onFinish` | `function` | `() => {}` | Callback appelé une fois l'écran fermé |

**Fonctionnalités :**
- Bulles animées qui remontent (26 bulles générées aléatoirement)
- Caustiques d'eau animées en surface
- Anneau de progression SVG avec pourcentage
- Révélation du nom via clip-path animé
- Transition de fermeture circulaire (wipe)

---

## Développement

```bash
npm run dev      # Serveur de dev (http://localhost:5173)
npm run build    # Build de production
npm run preview  # Aperçu du build
```
