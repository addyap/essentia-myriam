# Édition française — Essentia

## Pour Myriam

Ouvrez `/admin`, puis « Ouvrir l’éditeur ». Votre compte personnel utilise votre adresse Gmail (celle qui reçoit les messages du site) et le mot de passe que vous choisissez lors de l’invitation. Vous n’avez pas besoin de compte GitHub et vous n’utilisez jamais le mot de passe d’Antony.

Choisissez une page dans « Pages du site ». Modifiez les textes et vérifiez l’aperçu français. Les trois parties du grand titre de l’accueil sont le texte avant le mot doré, le mot doré et la suite éventuelle ; conservez les espaces et laissez la dernière partie vide si nécessaire. Les listes gardent leur nombre d’éléments.

Enregistrez le brouillon. Quand il est prêt, passez-le en révision puis choisissez « Publier ». Le texte est enregistré dans GitHub et Vercel reconstruit le site. Les changements apparaissent après un déploiement réussi. Si vous préférez une validation par Antony, laissez le contenu en brouillon ou en révision.

### Écrire un article de blog

Ouvrez « Blog », puis « ＋ article ». Renseignez le titre, la date de publication (aujourd’hui par défaut), un court résumé et, si vous le souhaitez, une image de couverture accompagnée d’une phrase qui la décrit. Rédigez le texte avec la barre d’outils : gras, italique, liens, intertitres, citations, listes et images. Le titre de l’article est déjà affiché en haut de la page ; commencez donc vos intertitres au niveau 2.

L’aperçu à droite montre l’article tel qu’il apparaîtra sur le site. Enregistrez, passez en révision puis publiez, comme pour les pages. L’adresse de l’article est créée à partir du titre lors du premier enregistrement (« L’écoute, première étape » devient `/blog/l-ecoute-premiere-etape`) et ne change plus ensuite. L’article apparaît sur la page « Blog & podcast » après le déploiement du site. Les articles sont publiés en français ; les visiteurs d’une autre langue voient un message qui le signale.

Les textes de la page « Blog & podcast », les libellés des articles et la page « Podcast » (annonce « Bientôt ») se modifient dans « Pages du site ».

### Titres et descriptions dans Google

« Référencement (Google et partages) » contient, pour chaque page, le titre et la description qui apparaissent dans les résultats de Google et lorsqu’un lien est partagé (WhatsApp, LinkedIn…). Visez environ 60 caractères pour un titre et 155 pour une description. Ces textes ne sont pas visibles sur les pages, l’éditeur n’en propose donc pas d’aperçu. Google peut mettre plusieurs jours à prendre en compte une modification.

Les autres langues, les photos des pages et les animations ne font pas partie des champs d’édition ; seules les images des articles se choisissent dans l’éditeur. Les modèles légaux restent dans le code ; les informations à compléter sont dans « Informations partagées ». Toute affirmation juridique ou professionnelle doit être validée par la responsable du site.

## Activation par Antony

1. Créez le compte propriétaire DecapBridge avec **antony@antonyaddy.com**. Choisissez vous-même son mot de passe et validez l’adresse email. Le tableau de bord du fournisseur est actuellement en anglais ; il est réservé au propriétaire. Le CMS et la connexion sur le site sont configurés en français.
2. Ajoutez un site : dépôt `addyap/essentia-myriam`, URL de connexion `https://www.essentiademdb.com/cms/index.html`, type d’authentification **PKCE** pour une connexion email/mot de passe directement sur le site.
3. Dans GitHub, créez un token à portée fine, limité à ce seul dépôt : Contents lecture/écriture et Pull requests lecture/écriture. Saisissez-le uniquement dans le tableau de bord sécurisé DecapBridge. Ne le mettez ni dans le site, ni dans un commit, ni dans une conversation. Cette délégation de droit doit être autorisée par le propriétaire. Ne réutilisez pas un token donnant accès à tous vos dépôts.
4. Copiez uniquement l’identifiant public du site fourni par DecapBridge dans `DECAPBRIDGE_SITE_ID` sur Vercel. Aucun secret n’est nécessaire dans le code du site. Redéployez.
5. Invitez l’adresse Gmail de Myriam comme collaboratrice de ce seul site. Elle choisit elle-même son mot de passe. N’activez pas d’inscription ouverte. Le serveur DecapBridge contrôle réellement les droits ; afficher une adresse dans l’interface ne crée pas un compte ni une autorisation.
6. Vérifiez que Myriam peut se connecter, récupérer son mot de passe, enregistrer un brouillon, vérifier l’aperçu et publier. Les emails automatiques sont émis par DecapBridge : vérifiez leur langue dans le compte fournisseur avant de promettre des emails intégralement français. Ne souscrivez pas d’option payante sans accord.

Le forfait gratuit annoncé par DecapBridge couvre actuellement 3 sites et 10 collaborateurs par site ; vérifier les conditions du fournisseur au moment de l’activation. Aucune base de données à créer ou administrer pour Essentia. L’identité est gérée par le service hébergé, les textes restent dans GitHub.

## Architecture

`content/fr/*.json` contient les textes français inchangés. Les articles de blog sont des fichiers `content/blog/<adresse>.json` (titre, date, résumé, image, texte en Markdown) ; les images téléversées vont dans `public/uploads`. `lib/french-content.js` les recompose pour le site. Les traductions restent dans `content/global`. `cms/schema.json` définit les champs. `/api/cms-config` fournit uniquement une configuration publique et les chemins français autorisés ; il n’expose aucun token et ne réalise aucune écriture.

Le CMS officiel Decap 3.16.3 est chargé depuis sa distribution npm épinglée, seulement sur `/cms/index.html`, avec `locale: fr`. La connexion PKCE redirige vers DecapBridge et prend en charge Google, Microsoft et le mot de passe. Le portail du fournisseur peut présenter du texte en anglais. Aucun widget Netlify n’est chargé.

L’aperçu est un iframe de même origine. Il reçoit les modifications du parent, en vérifiant origine, fenêtre source, type de message, nonce et section autorisée. Il affiche uniquement les champs français connus, conserve les identifiants d’icônes et n’exécute aucun HTML provenant des textes. Les articles sont lus par `lib/markdown.js`, qui ne reconnaît que les éléments de la barre d’outils : le HTML saisi reste du texte et les liens autres que `https`, `mailto`, `tel` ou internes sont ignorés. Aucun brouillon n’est lu depuis GitHub par une route publique. L’aperçu ne mesure aucune visite Analytics. Les autres pages gardent l’interdiction d’être intégrées dans un iframe ; seule `/cms-preview` accepte la même origine.

`/cms/index.html?demo=1` active notre backend isolé en mémoire avec les textes publics existants. Il ne change aucun fichier et ne publie rien, y compris en production. Sans identifiant DecapBridge valide, la connexion de production affiche un message français d’accès en préparation.

Contrôles : `npm run check`, `npm test`, `npm run build`, puis essais du brouillon et de sa publication après activation du fournisseur. L’enregistrement GitHub, la récupération de mot de passe et les emails ne peuvent pas être déclarés vérifiés avant que le service soit connecté.

Documentation : https://decapbridge.com/docs/getting-started et https://decapcms.org/docs/editorial-workflows/.

## Essai sur le site

Depuis `/admin`, « Essayer la démonstration » ouvre un éditeur isolé. Les modifications restent en mémoire dans le navigateur, sans connexion GitHub ni publication réelle. Un article d’exemple, présent uniquement dans la démonstration, permet de découvrir l’éditeur d’articles. Recharger rétablit les textes publics. Le mode réel exige toujours la connexion DecapBridge et une invitation personnelle.
