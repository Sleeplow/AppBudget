# CLAUDE.md — Site Sleeplow (hub multi-applications)

Site statique (HTML/CSS/JS, sans build) déployé sur GitHub Pages via `CNAME`.
La page d'accueil est un **carousel** qui présente plusieurs applications ; chaque
app a son propre dossier, son icône, sa couleur de thème et ses pages.

## Structure

```
index.html            Accueil = carousel (en-tête + cartes rendus par script.js)
styles.css            Styles partagés + thèmes par app ([data-app]) + carousel
script.js             Registre APPS + logique carousel + langue + sections repliables
placeholder-logo.svg  Icône de l'app placeholder « Bientôt »
budget/               1 dossier par app
  ├── help.html       Aide & fonctionnalités
  ├── privacy.html    Politique de confidentialité
  ├── contact.html    Contact & support
  └── logo.svg        Icône de l'app (glyphe utilisé comme masque CSS)
```

## Ajouter une nouvelle application

Tout est piloté par les données — **3 étapes** :

1. **Créer le dossier** `monapp/` avec `help.html`, `privacy.html`, `contact.html`
   et `logo.svg`. Le plus simple : copier ceux de `budget/` puis adapter le contenu.
   Dans chaque page HTML, mettre `<html lang="fr" data-app="monapp">`. Les chemins
   relatifs sont déjà en `../styles.css`, `../script.js`, back-link `../index.html`.

2. **Ajouter le thème** dans `styles.css` : dupliquer un bloc `[data-app="..."]`
   (variante claire + variante sombre dans la `@media (prefers-color-scheme: dark)`)
   avec la couleur d'accent de l'app et `--app-logo: url(monapp/logo.svg);`.

3. **Enregistrer l'app** dans le tableau `APPS` de `script.js` : `id` = nom du
   dossier/`data-app`, plus `name`, `tagline`, `footer` et les `cards` (FR/EN).

Le carousel (en-tête, couleur, cartes, flèches, points) se met à jour tout seul.

### Slide placeholder « Bientôt »
La dernière entrée `id: 'next'` de `APPS` est une démo. Quand une vraie app la
remplace, **supprimer** cette entrée dans `script.js`, le bloc `[data-app="next"]`
dans `styles.css`, et `placeholder-logo.svg` si inutilisé.

## Conventions

- **Thème par app** : déclaratif en CSS via l'attribut `data-app` sur `<html>`
  (statique sur les sous-pages, changé dynamiquement par le carousel sur l'accueil).
  Le logo est une variable CSS (`--app-logo`) résolue par rapport à `styles.css`
  (racine), donc le même chemin fonctionne depuis n'importe quelle page.
- **Langue** : switch FR/EN global dans le bandeau d'en-tête (`.lang-switch`),
  identique sur toutes les pages. `setLang()` mémorise le choix (`localStorage`
  clé `budget-lang` + paramètre d'URL `?lang=fr|en`) et re-rend le carousel.
- **Texte bilingue** : sur les sous-pages via `[lang-section="fr|en"]` ; dans le
  registre `APPS` via des valeurs `{ fr, en }` (ou une simple chaîne si identique).

## Développement / vérification

```bash
python3 -m http.server 8000   # puis ouvrir http://localhost:8000/
```

À vérifier après une modif du carousel : changement d'app (flèches/points/clavier/
swipe) met bien à jour icône + nom + couleur du thème ; mode sombre ; bascule FR/EN
re-traduit les cartes ; sous-pages (`budget/help.html`…) ont le switch dans l'en-tête
et le retour `‹ Accueil` fonctionne ; aucune erreur console.
