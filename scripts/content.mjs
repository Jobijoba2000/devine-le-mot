import { readFileSync } from 'node:fs';

export const normaliser = mot => mot.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
export const source = JSON.parse(readFileSync(new URL('../data/enigmes.json', import.meta.url), 'utf8'));

export function verifier() {
  if (source.length !== 10) throw new Error('La série 1 doit contenir 10 énigmes.');
  const ids = new Set();
  const mots = new Set();
  return source.map(fiche => {
    const lettres = normaliser(fiche.mot);
    if (!/^\d{2}$/.test(fiche.id) || ids.has(fiche.id)) throw new Error(`Identifiant incorrect : ${fiche.id}`);
    if (!/^[A-Z]+$/.test(lettres) || mots.has(lettres)) throw new Error(`Mot incorrect ou dupliqué : ${fiche.mot}`);
    if (!fiche.definition?.trim() || !fiche.indice?.trim()) throw new Error(`Fiche incomplète : ${fiche.id}`);
    if (!['Facile', 'Intermédiaire'].includes(fiche.niveau)) throw new Error(`Niveau inconnu : ${fiche.id}`);
    if (!Array.isArray(fiche.positions) || fiche.positions.length !== 3 || new Set(fiche.positions).size !== 3) {
      throw new Error(`Trois positions distinctes sont nécessaires : ${fiche.id}`);
    }
    const indices = fiche.positions.map(position => {
      if (!Number.isInteger(position) || position < 1 || position > lettres.length) {
        throw new Error(`Position hors du mot : ${fiche.id}, ${position}`);
      }
      return { position, lettre: lettres[position - 1] };
    });
    const lettresAuDepart = fiche.lettresAuDepart ?? 0;
    if (!Number.isInteger(lettresAuDepart) || lettresAuDepart < 0 || lettresAuDepart >= indices.length) {
      throw new Error(`Nombre de lettres initiales incorrect : ${fiche.id}`);
    }
    ids.add(fiche.id);
    mots.add(lettres);
    return {
      ...fiche,
      lettres,
      longueur: lettres.length,
      lettresInitiales: indices.slice(0, lettresAuDepart),
      indices: indices.slice(lettresAuDepart)
    };
  });
}

export const regles = [
  'Anime la partie en français, entièrement à l’oral. Vérifie que tu as accès aux dix fiches complètes et utilise uniquement cette série. Si tu ne peux pas lire la page ou que des données manquent, préviens le joueur avant de commencer. N’invente aucune énigme.',
  'Commence par la fiche 01 et suis l’ordre des fiches. Pour chaque énigme, lis sa définition, annonce son nombre de lettres, puis lis uniquement les lettres prévues au départ avec leurs positions. Attends la réponse du joueur. Ne lis pas la solution, les autres indices ni le reste de la page à voix haute.',
  'Conserve la même fiche jusqu’à ce que le joueur trouve le mot, dise « je passe » ou demande la solution. Ne change jamais le mot pour le faire correspondre à une réponse.',
  'À la demande « un indice », donne la prochaine lettre de la liste des indices, avec sa position, puis attends. Quand toutes les lettres de la liste ont été données, propose l’indice supplémentaire. Si tout a déjà été donné, dis-le simplement.',
  'À la demande « répète », relis la définition, la longueur et seulement les lettres déjà révélées. À la demande « quelles lettres », récapitule uniquement les lettres déjà révélées.',
  'Reprends exactement le nombre de lettres et les positions inscrits sur la fiche. Les positions commencent à 1. Les indices utilisent les lettres sans accents et un caractère accentué compte pour une seule lettre.',
  'Compare la réponse au mot enregistré. Accepte une réponse orale correcte sans exiger de l’épeler. Ignore la casse et les accents dans sa transcription. Si la reconnaissance vocale est ambiguë ou si un synonyme paraît plausible, demande une précision et rappelle les contraintes sans changer la solution.',
  'Si la réponse est incorrecte, dis-le simplement puis attends. Ne révèle pas de lettre supplémentaire sans demande. Si la réponse est correcte, confirme et prononce le mot. Si le joueur dit « je passe » ou demande la solution, prononce le mot.',
  'Quand une énigme est terminée, demande si le joueur souhaite continuer s’il reste des fiches. Si toutes les fiches ont été jouées ou si le joueur dit « stop », annonce la fin de la partie.',
  'Laisse le temps de réfléchir et n’utilise aucun chronomètre. Garde en mémoire l’énigme en cours et les indices déjà donnés. Ne répète pas une énigme déjà terminée.'
];

export function lettreTexte({ lettre, position }) {
  return `Lettre ${lettre} en position ${position}`;
}

export function ficheTexte(fiche) {
  return [
    `ÉNIGME ${fiche.id}`,
    `Niveau : ${fiche.niveau}`,
    `Définition : ${fiche.definition}`,
    `Nombre de lettres : ${fiche.longueur}`,
    `Solution réservée à l’animateur : ${fiche.mot}`,
    `Lettres à annoncer au départ : ${fiche.lettresInitiales.map(lettreTexte).join(', ') || 'Aucune'}.`,
    ...fiche.indices.map((indice, index) => `Indice sur demande ${index + 1} : ${lettreTexte(indice)}.`),
    `Indice supplémentaire : ${fiche.indice}`
  ].join('\n');
}

export function partieTexte(fiches) {
  return [
    'DEVINE LE MOT - SÉRIE 1',
    'Source de référence pour ChatGPT. Quand le joueur demande une partie à l’oral, suis les règles et utilise les fiches ci-dessous.',
    'RÈGLES DE LA PARTIE',
    ...regles.map((regle, index) => `${index + 1}. ${regle}`),
    'FICHES RÉSERVÉES À L’ANIMATEUR',
    ...fiches.map(ficheTexte)
  ].join('\n\n') + '\n';
}
