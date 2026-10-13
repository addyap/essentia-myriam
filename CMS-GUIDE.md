# Édition des textes français — Essentia

## Pour Myriam

Ouvrez `/admin`, puis « Ouvrir l’éditeur ». Connectez-vous avec le compte GitHub autorisé par Antony. L’interface et les champs sont en français.

Choisissez une page dans « Pages du site ». Modifiez uniquement les textes souhaités. Les trois parties du grand titre de l’accueil sont le texte avant le mot doré, le mot doré, puis la suite éventuelle : conservez les espaces nécessaires. Le nombre d’éléments des listes est fixé pour préserver la composition.

Pour vérifier avant publication, créez une branche de brouillon dans le sélecteur de branches, enregistrez, puis cliquez sur l’aperçu de la page. L’aperçu montre les modifications **enregistrées sur cette branche**, pas les frappes non enregistrées. Il force le français et ne mesure aucune visite Analytics. Demandez ensuite la fusion du brouillon vers `main` ; Vercel reconstruit le site automatiquement. Pour les petites corrections validées, enregistrer sur `main` publie directement après le déploiement.

Les autres langues, les photographies, les vidéos, les animations et les liens de contact techniques ne sont pas modifiables ici. Les modèles de textes légaux restent dans le code ; leurs informations à compléter sont éditables dans « Informations légales ». Le CMS ne vérifie pas les qualifications ou les affirmations juridiques : leur validation reste celle de la responsable du site.

Pour annuler une erreur publiée, Antony restaure la version du texte dans l’historique GitHub. Aucun contenu n’est stocké dans une base de données.

## Activation initiale par Antony

1. En local, copiez `.env.example` vers `.env.local`. Pour tester sans GitHub, gardez `NEXT_PUBLIC_KEYSTATIC_LOCAL=true` et lancez `npm run dev -- -H 127.0.0.1`. Ouvrez `http://127.0.0.1:3000/admin`. Ce mode est interdit sur Vercel et dans tous les builds de production.
2. Pour connecter GitHub, passez `NEXT_PUBLIC_KEYSTATIC_LOCAL=false` et redémarrez le serveur. Ouvrez `/keystatic`, puis suivez le créateur officiel de GitHub App. Indiquez le site déployé `https://www.essentiademdb.com`. Autorisez seulement le dépôt `addyap/essentia-myriam` lors de l’installation.
3. Le créateur ajoute `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` et `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` dans l’environnement local. Ne copiez pas leurs valeurs dans une conversation ou un commit.
4. Ajoutez ces quatre variables dans les environnements Vercel concernés et redéployez. `KEYSTATIC_SECRET` doit compter au moins 32 caractères aléatoires. N’activez jamais le mode local sur Vercel. Vérifiez que le callback GitHub inclut `https://www.essentiademdb.com/api/keystatic/github/oauth/callback` (et le callback local utilisé par le créateur).
5. Invitez le compte GitHub de Myriam avec le droit d’écriture sur ce dépôt uniquement. Ce droit porte sur le dépôt, pas uniquement sur les textes : seuls les comptes de confiance doivent le recevoir. La connexion ne nécessite ni mot de passe partagé, ni token personnel saisi dans le navigateur.
6. Vérifiez la connexion, l’aperçu d’un brouillon, le commit des changements vers `main` et un déploiement Vercel Ready. Sans les quatre variables, l’API de production renvoie 503 et ne bascule jamais vers l’édition du disque.

## Architecture et contrôle

Les textes français se trouvent dans `content/fr/*.json`. `lib/french-content.js` recompose exactement l’ancien objet français pour le site. Les fichiers anglais, italien et espagnol restent dans `content/global`. `cms/schema.json` définit les champs et les tailles de listes ; `keystatic.config.js` raccorde les fichiers à des entrées uniques. Les identifiants d’icônes sont préservés mais masqués.

Les routes d’édition sont isolées du header public et exclues de l’indexation. Les API et aperçus sont dynamiques, non mis en cache ; les pages publiques restent prérendues. Les modules Keystatic ne sont importés que par les routes d’édition. Le watcher local utilise Chokidar 4 car les chemins observés sont des dossiers explicites, sans globs ; cela retire la dépendance vulnérable `braces` de Chokidar 3.

Contrôles : `npm run check`, `npm test`, `npm run build`, `npm audit --omit=dev`, puis un test d’enregistrement local et restauration du texte. La publication GitHub/Vercel nécessite l’autorisation initiale de l’App ; elle ne peut pas être annoncée comme opérationnelle avant ce test.

Documentation officielle : https://keystatic.com/docs/github-mode et https://keystatic.com/docs/installation-next-js.
