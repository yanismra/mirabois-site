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
// L'envoi passe par FormSubmit (gratuit, sans serveur) : la demande arrive
// directement dans la boîte e-mail ci-dessous.
const ADRESSE = 'mirabois.construction@gmail.com';
const ENVOI = `https://formsubmit.co/ajax/${ADRESSE}`;
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
    msg.textContent = invalide.type === 'email' && invalide.value
      ? "Cette adresse e-mail ne semble pas complète. Vérifiez-la pour que je puisse vous répondre."
      : 'Ce champ est nécessaire pour vous répondre.';
    invalide.focus();
    return false;
  }
  return true;
}
btnPrec.addEventListener('click', () => afficherEtape(etape - 1));
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
  const delai = new AbortController();
  const minuterie = setTimeout(() => delai.abort(), 30000); // au-delà de 30 s, on abandonne
  try {
    const rep = await fetch(ENVOI, {
      method: 'POST',
      signal: delai.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `Demande de devis : ${d.get('type')} (${d.get('nom')})`,
        _replyto: d.get('email'),
        _template: 'table',
        _captcha: 'false',
        _honey: d.get('_honey') || '',
        Nom: d.get('nom'),
        'E-mail': d.get('email'),
        'Téléphone': d.get('tel') || '—',
        Commune: d.get('ville') || '—',
        Projet: d.get('type'),
        Message: d.get('message'),
      }),
    });
    const res = await rep.json().catch(() => ({}));
    if (!rep.ok || String(res.success) !== 'true') throw new Error(res.message || rep.status);
    // Confirmation : on remplace le formulaire par un message de remerciement
    etapes.forEach((f) => { f.hidden = true; });
    form.querySelector('.form-pied').hidden = true;
    msg.textContent = `Merci ${d.get('nom')} ! Votre demande est bien envoyée. Je vous réponds rapidement, en général sous 48 heures.`;
    msg.classList.add('envoye');
    msg.tabIndex = -1;
    msg.focus();
  } catch (err) {
    btnSuiv.disabled = false;
    btnSuiv.textContent = 'Envoyer ma demande';
    msg.textContent = `L'envoi n'a pas abouti. Réessayez dans un instant, ou écrivez directement à ${ADRESSE} ou appelez le 06 51 91 78 61.`;
  } finally {
    clearTimeout(minuterie);
    envoiEnCours = false;
  }
});
afficherEtape(0, false);
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
