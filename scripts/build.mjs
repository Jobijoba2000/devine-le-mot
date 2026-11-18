import { writeFileSync } from 'node:fs';
import { lettreTexte, partieTexte, regles, verifier } from './content.mjs';

const fiches = verifier();
const entites = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const html = texte => texte.replace(/[&<>"']/g, caractere => entites[caractere]);

function article(fiche) {
  const depart = fiche.lettresInitiales.map(lettreTexte).join(', ') || 'Aucune';
  const liste = fiche.indices.map(indice => `      <li>${lettreTexte(indice)}.</li>`).join('\n');
  return `  <article id="enigme-${fiche.id}">
    <h3>Énigme ${fiche.id}</h3>
    <dl>
      <dt>Définition</dt>
      <dd>${html(fiche.definition)}</dd>
      <dt>Nombre de lettres</dt>
      <dd>${fiche.longueur}</dd>
      <dt>Lettres à annoncer au départ</dt>
      <dd>${depart}.</dd>
      <dt>Solution réservée à l’animateur</dt>
      <dd>${html(fiche.mot)}</dd>
    </dl>
    <h4>Indices à donner sur demande, dans cet ordre</h4>
    <ol>
${liste}
    </ol>
    <p><strong>Indice supplémentaire.</strong> ${html(fiche.indice)}</p>
  </article>`;
}

const page = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Source de référence pour animer Devine le mot à l’oral avec ChatGPT. Règles et dix énigmes complètes en français.">
  <title>Devine le mot | Règles et énigmes pour ChatGPT</title>
  <style>
    body { max-width: 46rem; margin: 2rem auto; padding: 0 1rem; font: 1.125rem/1.6 system-ui, sans-serif; color: #162331; background: #fff; }
    li { margin-block: .5rem; }
    article { border-top: 1px solid #727d8a; padding-block: 1rem; }
    dt { font-weight: bold; }
    dd { margin: 0 0 .6rem; }
    h4 { margin-bottom: .5rem; }
    a { color: #173c8e; }
  </style>
</head>
<body>
<main>
  <h1>Devine le mot</h1>
  <p>Cette page est la référence de ChatGPT pour animer une partie de Devine le mot en français. Quand le joueur dit « Je veux jouer à Devine le mot » et demande d’utiliser cette source, lis ces règles et les dix fiches. Toute la partie se déroule dans la conversation vocale.</p>

  <h2>Règles pour ChatGPT</h2>
  <ol>
${regles.map(regle => `    <li>${html(regle)}</li>`).join('\n')}
  </ol>

  <h2>Série 1, dix énigmes</h2>
  <p>Les solutions sont réservées à l’animateur et ne doivent être prononcées qu’au moment prévu par les règles.</p>
${fiches.map(article).join('\n\n')}
  <p>Fin de la série 1.</p>
  <p><a href="./partie-01.txt">Même référence en texte brut</a></p>
</main>
</body>
</html>
`;

writeFileSync(new URL('../index.html', import.meta.url), page, 'utf8');
writeFileSync(new URL('../partie-01.txt', import.meta.url), partieTexte(fiches), 'utf8');
writeFileSync(new URL('../data/serie-01.json', import.meta.url), JSON.stringify({ titre: 'Devine le mot - Série 1', regles, enigmes: fiches }, null, 2) + '\n', 'utf8');
console.log(`Page de référence générée avec les règles et ${fiches.length} fiches.`);
