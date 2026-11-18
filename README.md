# Devine le mot

La page d’accueil sert de référence à ChatGPT pour animer un jeu à l’oral en français. Elle contient les règles et les dix fiches complètes de la première série. Tout figure dans le HTML, et les solutions sont réservées à l’animateur pendant la partie.

## Jouer avec ChatGPT Live

Une fois la page publiée, envoie ce message une fois dans une conversation ordinaire de ton compte ChatGPT, avec la mémoire activée.

> Mémorise ceci pour nos prochaines conversations. Quand je dis « Je veux jouer à Devine le mot », utilise le Web pour ouvrir https://jobijoba2000.github.io/devine-le-mot/ et anime une partie en français à partir de ses règles et de ses fiches. Pose une seule énigme à la fois et attends ma réponse orale. Si tu ne peux pas lire la page, dis-le-moi avant de commencer.

Tu peux ensuite ouvrir une nouvelle conversation vocale en mode Live et dire « Je veux jouer à Devine le mot ». Ce test vérifie à la fois le rappel de la consigne et l’accès à la page avec ton compte.

## Publier sur GitHub Pages

Le site est préparé pour le dépôt [Jobijoba2000/devine-le-mot](https://github.com/Jobijoba2000/devine-le-mot). Une fois les fichiers présents dans une branche du dépôt, ouvrir **Settings**, puis **Pages**. Dans **Build and deployment**, choisir **Deploy from a branch**, sélectionner cette branche et le dossier **/(root)**, puis enregistrer. GitHub affiche le lien quand la publication est prête.

## Entretenir la série

Les mots, définitions et positions des indices sont dans `data/enigmes.json`. Les positions commencent à 1. Le champ facultatif `lettresAuDepart` indique combien des premières lettres de la liste d’indices sont annoncées dès la définition. Le générateur calcule la longueur de chaque mot et les lettres associées aux positions.

Node.js 18 ou plus récent suffit pour régénérer la page et la vérifier.

```text
node scripts/build.mjs
node scripts/check.mjs
```

La page générée est `index.html`. La même série existe en texte brut dans `partie-01.txt` et en JSON dans `data/serie-01.json`. Pour un aperçu sur ton ordinateur, ouvre `index.html` directement dans ton navigateur ou lance `node scripts/serve.mjs` puis ouvre http://127.0.0.1:4173/.
