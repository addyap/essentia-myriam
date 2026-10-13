# Édition française — Essentia

## Pour Myriam

Ouvrez `/admin`, puis « Ouvrir l’éditeur ». Votre compte personnel utilise **mdbchandale@gmail.com** et le mot de passe que vous choisissez lors de l’invitation. Vous n’avez pas besoin de compte GitHub et vous n’utilisez jamais le mot de passe d’Antony.

Choisissez une page dans « Pages du site ». Modifiez les textes et vérifiez l’aperçu français. Les trois parties du grand titre de l’accueil sont le texte avant le mot doré, le mot doré et la suite éventuelle ; conservez les espaces et laissez la dernière partie vide si nécessaire. Les listes gardent leur nombre d’éléments.

Enregistrez le brouillon. Quand il est prêt, passez-le en révision puis choisissez « Publier ». Le texte est enregistré dans GitHub et Vercel reconstruit le site. Les changements apparaissent après un déploiement réussi. Si vous préférez une validation par Antony, laissez le contenu en brouillon ou en révision.

Les autres langues, les images et les animations ne font pas partie des champs d’édition. Les modèles légaux restent dans le code ; les informations à compléter sont dans « Informations partagées ». Toute affirmation juridique ou professionnelle doit être validée par la responsable du site.

## Activation par Antony

1. Créez le compte propriétaire DecapBridge avec **antony@antonyaddy.com**. Choisissez vous-même son mot de passe et validez l’adresse email. Le tableau de bord du fournisseur est actuellement en anglais ; il est réservé au propriétaire. Le CMS et le widget de connexion sur le site sont configurés en français.
2. Ajoutez un site : dépôt `addyap/essentia-myriam`, URL de connexion `https://www.essentiademdb.com/cms/index.html`, type d’authentification **Classic** pour une connexion email/mot de passe directement sur le site.
3. Dans GitHub, créez un token à portée fine, limité à ce seul dépôt : Contents lecture/écriture et Pull requests lecture/écriture. Saisissez-le uniquement dans le tableau de bord sécurisé DecapBridge. Ne le mettez ni dans le site, ni dans un commit, ni dans une conversation. Cette délégation de droit doit être autorisée par le propriétaire. Ne réutilisez pas un token donnant accès à tous vos dépôts.
4. Copiez uniquement l’identifiant public du site fourni par DecapBridge dans `DECAPBRIDGE_SITE_ID` sur Vercel. Aucun secret n’est nécessaire dans le code du site. Redéployez.
5. Invitez **mdbchandale@gmail.com** comme collaboratrice de ce seul site. Elle choisit elle-même son mot de passe. N’activez pas d’inscription ouverte. Le serveur DecapBridge contrôle réellement les droits ; afficher une adresse dans l’interface ne crée pas un compte ni une autorisation.
6. Vérifiez que Myriam peut se connecter, récupérer son mot de passe, enregistrer un brouillon, vérifier l’aperçu et publier. Les emails automatiques sont émis par DecapBridge : vérifiez leur langue dans le compte fournisseur avant de promettre des emails intégralement français. Ne souscrivez pas d’option payante sans accord.

Le forfait gratuit annoncé par DecapBridge couvre actuellement 3 sites et 10 collaborateurs par site ; vérifier les conditions du fournisseur au moment de l’activation. Aucune base de données à créer ou administrer pour Essentia. L’identité est gérée par le service hébergé, les textes restent dans GitHub.

## Architecture

`content/fr/*.json` contient les textes français inchangés. `lib/french-content.js` les recompose pour le site. Les traductions restent dans `content/global`. `cms/schema.json` définit les champs. `/api/cms-config` fournit uniquement une configuration publique et les chemins français autorisés ; il n’expose aucun token et ne réalise aucune écriture.

Le CMS officiel Decap 3.16.3 et le widget d’identité 2.0.3 sont chargés depuis leurs distributions npm épinglées, seulement sur `/cms/index.html`. Le widget utilise le service DecapBridge (pas Netlify Identity hébergé) avec `locale: fr`. Le CMS utilise également `locale: fr`. Le site public ne charge aucun de ces scripts.

L’aperçu est un iframe de même origine. Il reçoit les modifications du parent, en vérifiant origine, fenêtre source, type de message, nonce et section autorisée. Il affiche uniquement les champs français connus, conserve les identifiants d’icônes et n’exécute aucun HTML provenant des textes. Aucun brouillon n’est lu depuis GitHub par une route publique. L’aperçu ne mesure aucune visite Analytics. Les autres pages gardent l’interdiction d’être intégrées dans un iframe ; seule `/cms-preview` accepte la même origine.

En développement, `/cms/index.html?demo=1` active le backend de test officiel en mémoire avec les textes existants. Il ne change aucun fichier et ne publie rien. Cette démonstration est refusée en production et sur Vercel. Sans identifiant DecapBridge valide, la connexion de production affiche un message français d’accès en préparation.

Contrôles : `npm run check`, `npm test`, `npm run build`, puis essais du brouillon et de sa publication après activation du fournisseur. L’enregistrement GitHub, la récupération de mot de passe et les emails ne peuvent pas être déclarés vérifiés avant que le service soit connecté.

Documentation : https://decapbridge.com/docs/getting-started et https://decapcms.org/docs/editorial-workflows/.

## Essai sur le site

Depuis `/admin`, « Essayer la démonstration » ouvre un éditeur isolé. Les modifications restent en mémoire dans le navigateur, sans connexion GitHub ni publication réelle. Recharger rétablit les textes publics. Le mode réel exige toujours la connexion DecapBridge et une invitation personnelle.
