# WebCraft Solutions — Portail projets & formations

Évaluation E1 · Groupe 2 — Conception d'interfaces front-end sans framework.

J'ai réalisé un portail professionnel qui combine un **portfolio de projets clients** (API 1) et un **catalogue de formations techniques** (API 2), avec une page d'**inscription** à une formation.

## Lancer le projet

Aucune installation n'est nécessaire : il suffit d'ouvrir `index.html` dans un navigateur (Chrome, Firefox, Safari ou Edge).
Les deux API autorisent les requêtes de toute origine (CORS), le site fonctionne donc aussi en ouvrant directement le fichier.

## Structure

```
├── index.html          Accueil : hero, projets, formations, modals
├── inscription.html    Formulaire d'inscription + modal de succès
├── css/style.css       Unique feuille de style
├── js/main.js          Unique script, partagé par les deux pages
└── W3C/                Captures de validation W3C des deux pages
```

## Fonctionnalités

**Accueil (`index.html`)**
- Header responsive (menu burger sous 768px), hero avec animation `@keyframes`, footer avec liens réseaux sociaux.
- Section Projets (API 1) : cartes avec image, titre, client, catégorie, badges technologies et bouton « Voir détails ».
- Section Formations (API 2) : cartes avec catégorie, niveau, durée, prix, note, nombre d'étudiants, badges technologies, statut « Disponible / Complet » et boutons « Voir détails » / « S'inscrire ».
- Recherche en temps réel et filtres combinables sur les deux sections (texte + catégorie + technologie, + niveau pour les formations), avec compteur de résultats et message « aucun résultat ».
- Modals de détails (toutes les infos, fonctionnalités / programme, formateur, lien d'inscription), fermeture par ✕, clic extérieur et touche Échap.
- Loader CSS pendant le chargement et message d'erreur si une API est inaccessible.

**Inscription (`inscription.html`)**
- Champs obligatoires : prénom, nom, email, téléphone, formation, niveau, motivation. Champs facultatifs non bloquants : entreprise, expérience.
- Liste des formations chargée depuis l'API 2 (formations disponibles uniquement), avec un loader pendant le chargement et une présélection automatique depuis le bouton « S'inscrire » d'une carte (`?formation=id`).
- Validation en temps réel avec message personnalisé sous chaque champ, validation globale à la soumission, modal de succès puis réinitialisation du formulaire.

## Mes choix techniques

### HTML5, CSS3 et JavaScript natif (ES6+)
J'ai écrit tout le JavaScript en **JavaScript natif** : `const` / `let`, fonctions fléchées, `async` / `await`, template literals, déstructuration, spread / rest, méthodes de tableau (`map`, `filter`, `find`, `flatMap`, `every`), `Set`, `URLSearchParams`.

### Bootstrap 5 (via CDN)
J'utilise Bootstrap pour gagner du temps sur ce qui n'est pas au cœur de l'évaluation, sans remplacer mon propre CSS :
- la **grille** responsive (`row` / `col-*`, basée sur Flexbox) et la **navbar** repliable ;
- les **modals** : la fermeture par ✕, clic extérieur et Échap, le piège du focus et le retour du focus sur le bouton d'origine sont gérés nativement, ce qui garantit une bonne accessibilité clavier ;
- les classes d'état des formulaires (`is-valid` / `is-invalid` / `invalid-feedback`).

La charte graphique reste définie dans `style.css` : variables CSS, couleurs, typographie, cartes, boutons, états, animations et media query. J'ai surchargé les variables de Bootstrap (`--bs-*`) pour qu'il utilise mes couleurs.

### Pourquoi je n'ai pas utilisé jQuery
jQuery était autorisé, mais j'ai choisi de ne pas l'utiliser :
- **Le JavaScript moderne couvre tous mes besoins** : `querySelector`, `classList`, `addEventListener`, `insertAdjacentHTML` et `dataset` remplacent les sélecteurs et la manipulation du DOM de jQuery ; `fetch` remplace `$.ajax`.
- **Le barème valorise l'ES6+** (`fetch`, `async` / `await`, méthodes de tableau) : en écrivant ces mécanismes en natif, je les montre directement.
- **Bootstrap 5 ne dépend plus de jQuery** : l'ajouter aurait chargé une bibliothèque supplémentaire sans aucune fonctionnalité en plus.
- **Moins de dépendances** : une requête et du poids en moins au chargement de la page.

### Chargement des API
- J'ai créé une fonction `fetchData` réutilisable sur les deux pages ; elle lève une erreur si la réponse HTTP n'est pas `ok` (`fetch` ne rejette pas sur une 404 ou une 500).
- Chaque API a **son propre `try / catch`** : si l'une est inaccessible, l'autre section s'affiche quand même. Le loader est masqué dans un `finally`.
- J'appelle les deux API **en parallèle** (`Promise.all`) et **une seule fois** : la recherche, les filtres et les modals travaillent ensuite sur les données en mémoire, sans requête redondante.
- Je déduis les options des filtres des données elles-mêmes, car la liste `technologies` de l'API 2 ne contient pas toutes les technologies utilisées. Seuls les niveaux reprennent la liste de l'API, pour garder l'ordre Débutant → Intermédiaire → Avancé.

### Recherche et filtres
- Une fonction de filtrage par section relit tous les critères et les combine (ET logique).
- La recherche ignore la casse et les accents (`normalize('NFD')`) et porte sur le titre, le client ou le formateur, la description et les technologies.
- J'ai ajouté un **debounce** de 300 ms sur la saisie : le filtrage ne s'exécute qu'une fois la frappe terminée.

### Modals
Les boutons « Voir détails » utilisent `data-bs-toggle="modal"`. Je remplis le contenu à l'événement `show.bs.modal`, en retrouvant l'élément grâce à `event.relatedTarget.dataset` : un seul écouteur par modal, qui fonctionne aussi après un filtrage.

### Formulaire
- `novalidate` désactive les bulles natives du navigateur au profit de ma validation JavaScript.
- J'ai regroupé les règles dans un objet (une fonction par champ, qui renvoie le message d'erreur ou une chaîne vide).
- L'erreur s'affiche quand on quitte un champ, puis se met à jour à chaque frappe : j'évite ainsi d'afficher « email invalide » dès la première lettre.
- À la soumission, je valide tous les champs (`map` puis `every`) pour afficher toutes les erreurs d'un coup, et je place le focus sur le premier champ en erreur.
- J'insère le message de succès avec `textContent` (pas d'injection HTML possible).

### Design et responsive
- Approche **mobile-first** : styles de base pour 320–767px, puis `@media (min-width: 768px)`.
- Charte sobre définie par des **variables CSS** (couleurs, police, tailles de texte, rayon, transitions) : fond papier, texte encre, un seul accent vert sapin, police IBM Plex Sans.
- Zones cliquables d'au moins 44px de haut (liens du menu, petits boutons, liens du footer) pour un usage confortable au doigt sur mobile.
- Animations : `@keyframes fade-in` sur le hero et `@keyframes spin` pour les loaders, désactivées si l'utilisateur a demandé à réduire les animations (`prefers-reduced-motion`).
- Transitions sur les survols (boutons, cartes, liens, champs), état `:active` sur les boutons, page courante soulignée dans le menu, CSS Grid pour les détails des modals.

### Accessibilité
- Balises sémantiques (`header`, `nav`, `main`, `section`, `article`, `footer`, `fieldset` / `legend`, `dl`).
- Lien d'évitement « Aller au contenu », focus visible sur tous les éléments interactifs, navigation complète au clavier.
- `alt` sur toutes les images, `aria-label` sur les boutons répétés, `aria-describedby` reliant chaque champ à son message d'erreur, `aria-live` sur les compteurs de résultats, `role="alert"` sur les erreurs d'API.

## Validation

- HTML : `index.html` et `inscription.html` sont valides sur le validateur W3C (captures dans `W3C/`).
- CSS : `style.css` ne présente aucune erreur sur le validateur CSS du W3C.

## Utilisation de l'IA

J'ai utilisé une IA (Claude) comme assistant pendant le projet, notamment pour :
- l'**amélioration du CSS** (simplification de la charte graphique, cohérence des états de survol et de focus) ;
- la **correction de l'indentation** et la mise en forme du code ;
- l'**optimisation du JavaScript** (factorisation des fonctions, debounce, gestion des erreurs).

Les fonctionnalités suivent le cahier des charges du sujet.
