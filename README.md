# Art Shop — Frontend

Interface utilisateur de la plateforme de vente en ligne dédiée à un artiste unique.

---

## Stack technique

**Framework** : React 19 + TypeScript

**Build** : Vite

**Styles** : Tailwind CSS

**Composants UI** : shadcn/ui (Radix UI)

**Formulaires** : React Hook Form + Zod

**Notifications** : Sonner

**Icônes** : Lucide React

**Animations** : Framer Motion + OGL (backgrounds)

**Routing** : React Router DOM

---

## Prérequis

- Node.js >= 18.x
- npm >= 9.x

---

## Installation
```bash
# Cloner le repository
git clone <url-du-repo>
cd art-shop-front

# Installer les dépendances
npm install
```

---

## Lancement
```bash
# Mode développement (avec hot-reload)
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview
```

**URL locale** : http://localhost:5173

---

## Commandes utiles
```bash
# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build

# Vérifier le code avec ESLint
npm run lint

# Prévisualiser le build de production
npm run preview
```

---

## Ajouter un composant shadcn/ui
```bash
# Syntaxe
npx shadcn@latest add <nom-du-composant>

# Exemples
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add toast
```

Liste des composants disponibles : https://ui.shadcn.com/docs/components

---

## Structure du projet
```
src/
├── components/
│   ├── ui/              # Composants shadcn/ui
│   ├── backgrounds/     # Fonds animés (Iridescence)
│   ├── forms/           # Champs de formulaire
│   ├── feedback/        # Toast, Loader
│   ├── navigation/      # Menus, Breadcrumb
│   └── gallery/         # Affichage des œuvres
├── pages/
│   └── auth/            # Login, Register
├── schemas/             # Validations Zod
├── services/            # Appels API
├── lib/
│   └── utils.ts         # Utilitaires (cn, etc.)
└── styles/
    └── globals.css
```

---

## Conventions

**Nommage des composants** : PascalCase (`FormInput.tsx`)

**Nommage des utils** : camelCase (`formatPrice.ts`)

**Langue** : Français (labels, messages, erreurs)

**Icônes** : Lucide React uniquement

**Emojis** : Aucun dans l'interface

---

## Charte graphique

**Thème** : Clair uniquement

**Typographie** : À définir

**Palette** : À définir (neutre pour l'instant)

**Style des formulaires** : Glassmorphism (transparent, blur)

**Backgrounds** :
- Login : Iridescence bleu/violet `color={[0.3, 0.2, 0.5]}`
- Register : Iridescence rosé `color={[1, 0.7, 0.7]}`

---

## Ressources

- [Documentation React](https://react.dev)
- [Documentation Vite](https://vite.dev)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [Composants shadcn/ui](https://ui.shadcn.com)
- [Icônes Lucide](https://lucide.dev/icons)
- [Icônes Lucide Animated](https://lucide-animated.com)
- [Inspirations ReactBits](https://reactbits.dev)
- [Inspirations UIverse](https://uiverse.io)

---

## Lien avec le backend

**API Backend** : http://localhost:3000

**Documentation Swagger** : http://localhost:3000/api

---

## Licence

Ce projet est sous licence MIT.