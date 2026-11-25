// ---------- En-tête : passe en plein au défilement ----------
const entete = document.getElementById('entete');
const majEntete = () => entete.classList.toggle('defile', window.scrollY > 40 || nav.dataset.ouvert === 'true');

// ---------- Menu mobile ----------
const burger = document.querySelector('.burger');
const nav = document.getElementById('nav');
function basculerMenu(ouvrir) {
  nav.dataset.ouvert = String(ouvrir);
  burger.setAttribute('aria-expanded', String(ouvrir));
  majEntete();
}
burger.addEventListener('click', () => basculerMenu(nav.dataset.ouvert !== 'true'));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) basculerMenu(false); });
window.addEventListener('scroll', majEntete, { passive: true });
majEntete();

// ---------- Savoir-faire : onglets ----------
const onglets = [...document.querySelectorAll('[role="tab"]')];
function choisir(onglet, focus) {
  onglets.forEach((o) => {
    const actif = o === onglet;
    o.setAttribute('aria-selected', String(actif));
    o.tabIndex = actif ? 0 : -1;
    document.getElementById(o.getAttribute('aria-controls')).hidden = !actif;
  });
  if (focus) onglet.focus();
  onglet.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
onglets.forEach((o, i) => {
  o.addEventListener('click', () => choisir(o));
  o.addEventListener('keydown', (e) => {
    const n = onglets.length;
    if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); choisir(onglets[(i + 1) % n], true); }
    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); choisir(onglets[(i - 1 + n) % n], true); }
  });
});

// ---------- Réalisations : visionneuse par catégorie ----------
const PHOTOS = [
  { cat: 'charpente', src: 'charpente-fermes', txt: 'Charpente traditionnelle en cours de levage' },
  { cat: 'charpente', src: 'hero-charpente', txt: "Levage d'une charpente neuve" },
  { cat: 'charpente', src: 'charpente-apparente', txt: 'Charpente apparente, fermes et voligeage' },
  { cat: 'ossature', src: 'renovation-chalet', txt: "Rénovation et bardage d'une maison" },
  { cat: 'ossature', src: 'isolation-facade', txt: "Isolation par l'extérieur avant bardage" },
  { cat: 'renovation', src: 'couverture-bardeaux', txt: 'Couverture en bardeaux de bois' },
  { cat: 'renovation', src: 'pose-fenetre-toit', txt: "Pose d'une fenêtre de toit" },
  { cat: 'abris', src: 'auvent-meuliere', txt: 'Auvent sur façade en meulière' },
  { cat: 'abris', src: 'abri-voiture', txt: 'Abri voiture, ferme apparente' },
  { cat: 'abris', src: 'auvent-console', txt: 'Auvent sur console bois' },
  { cat: 'terrasses', src: 'terrasse-chalet', txt: 'Terrasse sur poteaux et garde-corps bois' },
  { cat: 'terrasses', src: 'garde-corps', txt: "Garde-corps à barreaudage, détail d'angle" },
  { cat: 'terrasses', src: 'coursive-couverte', txt: 'Coursive couverte, plafond et platelage bois' },
  { cat: 'isolation', src: 'isolation-combles', txt: 'Isolation sous rampants et frein-vapeur' },
  { cat: 'isolation', src: 'bardage-bois', txt: 'Bardage bois et sous-face de débord' },
];
if (document.getElementById('visionneuse')) { // uniquement sur l'accueil
const dlg = document.getElementById('visionneuse');
const dImg = document.getElementById('visionneuse-img');
const dLeg = document.getElementById('visionneuse-legende');
let liste = [];
let courant = 0;
function montrer(i) {
  courant = (i + liste.length) % liste.length;
  const p = liste[courant];
  dImg.src = `assets/img/${p.src}.webp`;
  dImg.alt = p.txt;
  dLeg.textContent = `${p.txt}  ·  ${courant + 1} / ${liste.length}`;
}
document.querySelectorAll('[data-cat]').forEach((btn) => btn.addEventListener('click', () => {
  const cat = btn.dataset.cat;
  liste = cat === 'tout' ? PHOTOS : PHOTOS.filter((p) => p.cat === cat);
  montrer(0);
  if (typeof dlg.showModal === 'function') dlg.showModal();
}));
dlg.addEventListener('click', (e) => {
  const a = e.target.closest('[data-action]')?.dataset.action;
  if (a === 'fermer' || e.target === dlg || e.target.classList.contains('visionneuse-cadre')) dlg.close();
  else if (a === 'prec') montrer(courant - 1);
  else if (a === 'suiv') montrer(courant + 1);
});
dlg.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') montrer(courant - 1);
  if (e.key === 'ArrowRight') montrer(courant + 1);
});
}

// ---------- Contact : formulaire pas à pas ----------
if (document.getElementById('formulaire')) { // uniquement sur l'accueil
// L'envoi passe par EmailJS (gratuit jusqu'à 200 e-mails par mois), depuis contact@mirabois.fr (SMTP Infomaniak).
// Deux modèles, réglés dans le tableau de bord EmailJS (sources dans _modeles/emails) :
//  - template_demande      : la demande complète, envoyée à mirabois.construction@gmail.com
//  - template_confirmation : la confirmation envoyée au visiteur
const ADRESSE = 'contact@mirabois.fr'; // vraie boîte chez Infomaniak
const EMAILJS = {
  api: 'https://api.emailjs.com/api/v1.0/email/send',
  service: 'service_contact',
  cle: 't3TgFdujsz0QfTNZE', // clé publique : elle est faite pour être visible dans le site
};
const form = document.getElementById('formulaire');
const etapes = [...form.querySelectorAll('.etape-form')];
const btnPrec = document.getElementById('precedent');
const btnSuiv = document.getElementById('suivant');
const compteur = document.getElementById('compteur');
const msg = document.getElementById('formulaire-message');
let etape = 0;

function afficherEtape(i, focus = true) {
  etape = i;
  etapes.forEach((f, j) => { f.hidden = j !== i; });
  btnPrec.hidden = i === 0;
  btnSuiv.textContent = i === etapes.length - 1 ? 'Envoyer ma demande' : 'Suivant →';
  compteur.textContent = `${i + 1} / ${etapes.length}`;
  msg.textContent = '';
  if (focus) etapes[i].querySelector('input, textarea')?.focus({ preventScroll: true });
}
function etapeValide() {
  const champs = [...etapes[etape].querySelectorAll('input, textarea')];
  const invalide = champs.find((c) => !c.checkValidity());
  if (invalide) {
    msg.textContent = invalide.type === 'radio'
      ? 'Choisissez une réponse pour continuer.'
      : invalide.type === 'email' && invalide.value
        ? "Cette adresse e-mail ne semble pas complète. Vérifiez-la pour que nous puissions vous répondre."
        : 'Ce champ est nécessaire pour vous répondre.';
    invalide.focus();
    return false;
  }
  return true;
}
btnPrec.addEventListener('click', () => afficherEtape(etape - 1));

// Envoie un e-mail à partir d'un modèle EmailJS
async function envoyerModele(modele, params, signal) {
  const rep = await fetch(EMAILJS.api, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: EMAILJS.service, template_id: modele, user_id: EMAILJS.cle, template_params: params }),
  });
  if (!rep.ok) throw new Error(`${rep.status} ${await rep.text().catch(() => '')}`);
}
let envoiEnCours = false;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (envoiEnCours || !etapeValide()) return;
  if (etape < etapes.length - 1) { afficherEtape(etape + 1); return; }
  const d = new FormData(form);
  envoiEnCours = true;
  btnSuiv.disabled = true;
  btnSuiv.textContent = 'Envoi en cours…';
  msg.textContent = '';
  const sujet = `Demande de devis : ${d.get('type')}, ${d.get('nature').toLowerCase()} (${d.get('nom')})`;
  const params = {
    nom: d.get('nom'),
    email: d.get('email'),
    telephone: d.get('tel') || '—',
    commune: d.get('ville') || '—',
    nature: d.get('nature'),
    projet: d.get('type'),
    message: d.get('message'),
    budget: d.get('budget'),
  };
  const champs = {
    Nom: params.nom, 'E-mail': params.email, 'Téléphone': params.telephone, Commune: params.commune,
    'Neuf ou rénovation': params.nature, Projet: params.projet, Message: params.message, 'Budget approximatif': params.budget,
  };
  // En principe l'envoi prend quelques secondes ; on rassure quand même si cela traîne
  const patience = setTimeout(() => {
    msg.textContent = 'Envoi en cours, merci de patienter quelques instants…';
  }, 4000);
  const delai = new AbortController();
  const minuterie = setTimeout(() => delai.abort(), 45000);
  try {
    // Champ piège rempli = robot : on fait comme si tout allait bien, sans rien envoyer
    if (!d.get('_honey')) {
      await envoyerModele('template_demande', params, delai.signal);
      // La confirmation au visiteur ne doit pas faire échouer la demande si elle a un souci
      await envoyerModele('template_confirmation', params, delai.signal).catch(() => {});
    }
    // Confirmation : on remplace le formulaire par un message de remerciement
    etapes.forEach((f) => { f.hidden = true; });
    form.querySelector('.form-pied').hidden = true;
    msg.textContent = `Merci ${d.get('nom')} ! Votre demande est bien envoyée. Nous vous répondrons rapidement, si possible sous 48 heures, pour échanger sur votre projet. Le devis vient ensuite, après la visite sur place. Un e-mail de confirmation vient de vous être envoyé (pensez à vérifier vos courriers indésirables).`;
    msg.classList.add('envoye');
    msg.tabIndex = -1;
    msg.focus();
  } catch (err) {
    btnSuiv.disabled = false;
    btnSuiv.textContent = 'Réessayer';
    // Solution de secours : la demande déjà remplie s'ouvre dans la messagerie du visiteur
    const corps = Object.entries(champs).map(([k, v]) => `${k} : ${v}`).join('\n');
    const lien = document.createElement('a');
    lien.href = `mailto:${ADRESSE}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
    lien.textContent = 'envoyez votre demande par e-mail en un clic';
    msg.replaceChildren(
      "L'envoi n'a pas abouti. Réessayez, ou ",
      lien,
      ' (elle est déjà remplie), ou appelez le 06 51 91 78 61.'
    );
  } finally {
    clearTimeout(patience);
    clearTimeout(minuterie);
    envoiEnCours = false;
  }
});
afficherEtape(0, false);
}

// ---------- Bouton « retour en haut » ----------
const haut = document.querySelector('.haut');
if (haut) {
  const majHaut = () => haut.classList.toggle('visible', window.scrollY > 150);
  window.addEventListener('scroll', majHaut, { passive: true });
  majHaut();
  haut.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0 });
    document.querySelector('.logo')?.focus({ preventScroll: true });
  });
}

// ---------- Parallaxe : les photos de fond défilent moins vite que la page ----------
const calques = [...document.querySelectorAll('[data-parallaxe]')];
const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (calques.length && !mouvementReduit) {
  let enAttente = false;
  const majParallaxe = () => {
    const hEcran = window.innerHeight;
    calques.forEach((img) => {
      const vitesse = parseFloat(img.dataset.parallaxe);
      const bloc = img.parentElement.getBoundingClientRect();
      if (bloc.bottom < 0 || bloc.top > hEcran) return; // hors de l'écran : rien à faire
      let decalage;
      if (img.classList.contains('hero-fond')) {
        decalage = -bloc.top * vitesse; // la photo d'accueil descend doucement quand on défile
      } else {
        // centre de la bande par rapport au centre de l'écran, limité à la marge prévue en CSS
        const ecart = (bloc.top + bloc.height / 2) - hEcran / 2;
        const marge = (img.offsetHeight - bloc.height) / 2;
        decalage = Math.max(-marge, Math.min(marge, ecart * vitesse));
      }
      img.style.transform = `translate3d(0, ${decalage.toFixed(1)}px, 0)`;
    });
    enAttente = false;
  };
  const demander = () => { if (!enAttente) { enAttente = true; requestAnimationFrame(majParallaxe); } };
  window.addEventListener('scroll', demander, { passive: true });
  window.addEventListener('resize', demander);
  majParallaxe();
}
