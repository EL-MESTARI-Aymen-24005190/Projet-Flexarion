# Flexarion — site du studio

Site vitrine d'un studio de jeux vidéo indépendant fictif (concours du BUT Informatique d'Aix-en-Provence).
HTML, CSS et JavaScript natifs : aucune dépendance, aucune étape de compilation.

## Voir le site

Double-cliquer sur `flexarion/index.html`, ou lancer un petit serveur local :

```bash
python -m http.server 4173 --directory flexarion
```

puis ouvrir <http://localhost:4173>.

## Arborescence

```
flexarion/
├── index.html                 Accueil
├── studio.html                Le studio (histoire, équipe, Aix-en-Provence)
├── maestral.html              Le jeu phare
├── contact.html               Contact et espace presse
├── mentions-legales.html
├── 404.html
├── devlog/
│   ├── index.html             Liste des devlogs
│   ├── simuler-le-vent-solaire.html
│   ├── direction-artistique-science-fiction-provence.html
│   ├── premiere-demo-maestral-bilan-playtest.html
│   └── feed.xml               Flux RSS
├── assets/
│   ├── css/style.css          Feuille de style unique, commentée
│   ├── js/main.js             Menu, animations, vent solaire, formulaire
│   └── img/                   Illustrations SVG + images de partage
├── sitemap.xml, robots.txt, site.webmanifest
└── favicon.svg, icon-*.png, apple-touch-icon.png
```

## À faire avant la mise en ligne

1. **Remplacer le domaine provisoire.** Dans tout le dossier `flexarion/`, « Rechercher et remplacer » :
   - `https://el-mestari-aymen-24005190.github.io/Projet-Flexarion` → l'adresse réelle du site (sans barre oblique finale) ;
   - `flexarion.example` → le domaine des adresses e-mail.
   Cela met à jour les balises `canonical`, Open Graph, les données structurées, `sitemap.xml`, `robots.txt` et le flux RSS.
2. **Compléter les mentions légales** (`mentions-legales.html`) : les crochets `[Prénom Nom]` et `[Nom de l'hébergeur]`.
3. **Formulaire de contact.** Il ouvre la messagerie du visiteur (`mailto:`). Pour un envoi direct, brancher un service
   de formulaires (Formspree, Netlify Forms…) dans le bloc 7 de `assets/js/main.js`.
4. **Hébergement dans un sous-dossier** (par exemple `utilisateur.github.io/flexarion/`) : `404.html` utilise des chemins
   absolus (`/assets/…`) ; les préfixer par le nom du sous-dossier.

## Après la mise en ligne

- Déclarer le site dans Google Search Console et Bing Webmaster Tools, puis y soumettre `sitemap.xml`.
- Tester une page dans le « Test des résultats enrichis » de Google et dans PageSpeed Insights.
- Publier un nouveau devlog régulièrement : dupliquer un article, l'ajouter à `devlog/index.html`, `sitemap.xml` et `feed.xml`.
