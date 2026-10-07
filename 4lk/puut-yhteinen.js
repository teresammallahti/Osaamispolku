/* Osaamispolku · taitopuiden yhteinen logiikka (taitopuu.html ja taitopolku.html).
   Rakennettu: rakenna_puut.py. Data tulee tiedostosta puut-data.js (PUUDATA). */
"use strict";

const I={
  LUK:'<path d="M4 8h4M4 12h5M4 16h3"/><path d="M13 5h3v14"/><path d="M14.5 19h3.5"/>',
  MUR:'<path d="M17 5L7 19"/><circle cx="8.5" cy="8.5" r="2.2"/><circle cx="15.5" cy="15.5" r="2.2"/>',
  ALG:'<path d="M4 18h3l3-12h3"/><path d="M14 10l6 6M20 10l-6 6"/>',
  GEO:'<path d="M4 19h16L12 5z"/><path d="M9.2 19a5 5 0 0 1 1.4-4"/>',
  MIT:'<rect x="3" y="8" width="18" height="8" rx="1.2"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/>',
  TIL:'<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="14" width="3" height="3"/>',
  AJA:'<path d="M12 3a6 6 0 0 0-3.6 10.8V17h7.2v-3.2A6 6 0 0 0 12 3z"/><path d="M9.6 20h4.8"/>',
  OHJ:'<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>',
  KIRJA:'<path d="M4 5.5A2 2 0 0 1 6 4h5v16H6a2 2 0 0 0-2 1.5z"/><path d="M20 5.5A2 2 0 0 0 18 4h-5v16h5a2 2 0 0 1 2 1.5z"/>',
  PUHE:'<path d="M4 6h16v10H9l-5 4z"/>',
  KYNA:'<path d="M4 20l1-4 11-11 3 3-11 11z"/><path d="M14 6l3 3"/>',
  MAAPALLO:'<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.6 2.5 12.4 0 16-2.5-3.6-2.5-13.4 0-16z"/>',
  LEHTI:'<path d="M5 19c0-8 5-13 14-13 0 9-5 13-11 13H5z"/><path d="M8 18c2-4 4-6 8-8"/>',
  SYDAN:'<path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9z"/>',
  AIKA:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3.5 2"/>',
  NUOTTI:'<circle cx="7" cy="17" r="2.5"/><circle cx="17" cy="15" r="2.5"/><path d="M9.5 17V7l10-2v10"/>',
  SIVELLIN:'<path d="M14 4l6 6-7 7-6-6z"/><path d="M7 11l-3 6 6-3"/>',
  TYOKALU:'<path d="M14.5 4a4.5 4.5 0 0 0-4 6.5L4 17l3 3 6.5-6.5A4.5 4.5 0 1 0 14.5 4z"/>',
  JUOKSU:'<circle cx="15" cy="5" r="2"/><path d="M8 21l3-6 4-2-2-4-4 2-2 4"/><path d="M15 13l3 3 2 4"/>',
  AJATUS:'<circle cx="12" cy="12" r="8"/><path d="M9.5 9.5a2.5 2.5 0 1 1 2.8 3.2V15"/><path d="M12 17.6v.1"/>'
};
const OLETUS={AI:'KIRJA',ET:'AJATUS',ENA:'PUHE',YMP:'LEHTI',UE:'SYDAN',HI:'AIKA',MU:'NUOTTI',KU:'SIVELLIN',KS:'TYOKALU',LI:'JUOKSU'};


const TASO_NIMI = {ydin: "ydintaito", vahvistava: "vahvistava taito", haaste: "haastetaito"};
const PUU = (() => {
  const haku = new URLSearchParams(location.search);
  let koodi = haku.get("aine") || "MAT";
  if (!PUUDATA.some(a => a.koodi === koodi)) koodi = "MAT";

  let aine, solmu, van, lap, osattu;
  const kuuntelijat = [];

  function avain() { return "osaamispolku-puu-" + aine.koodi; }
  function lataaTila() {
    osattu = new Set();
    try {
      const s = JSON.parse(localStorage.getItem(avain()) || "null");
      if (Array.isArray(s)) s.forEach(i => solmu[i] && osattu.add(i));
    } catch (e) { /* selain ei salli tallennusta: aloitetaan tyhjästä */ }
  }
  function tallenna() {
    try { localStorage.setItem(avain(), JSON.stringify([...osattu])); } catch (e) {}
  }

  function valitse(k) {
    aine = PUUDATA.find(a => a.koodi === k) || PUUDATA[0];
    solmu = Object.fromEntries(aine.solmut.map(s => [s.id, s]));
    van = {}; lap = {};
    aine.kaaret.forEach(([a, b]) => { (van[b] ||= []).push(a); (lap[a] ||= []).push(b); });
    lataaTila();
    const u = new URL(location.href); u.searchParams.set("aine", aine.koodi);
    history.replaceState(null, "", u);
    kuuntelijat.forEach(f => f("aine"));
  }

  /* 3. luokan pohjataidot oletetaan osatuiksi: ne on näytetty edellisenä vuonna. */
  function onOsattu(id) { const s = solmu[id]; return s.lk === 3 || osattu.has(id); }
  function tila(id) {
    if (onOsattu(id)) return "osattu";
    const ps = van[id] || [];
    return ps.every(onOsattu) ? "avoin" : "lukittu";
  }
  function vaihda(id) {
    if (solmu[id].lk !== 4) return;
    if (osattu.has(id)) osattu.delete(id); else osattu.add(id);
    tallenna(); kuuntelijat.forEach(f => f("tila"));
  }
  function nollaa() { osattu.clear(); tallenna(); kuuntelijat.forEach(f => f("tila")); }

  function ketju(id, suunta) {
    const kartta = suunta === "ylos" ? van : lap, tulos = new Set(), pino = [id];
    while (pino.length) { const n = pino.pop(); (kartta[n] || []).forEach(m => { if (!tulos.has(m)) { tulos.add(m); pino.push(m); } }); }
    return tulos;
  }
  function alue(id) { return aine.alueet.find(a => a.id === id) || {nimi: id, vari: "#999"}; }
  function ikoni(s) {
    const OL = {AI:"KIRJA",ET:"AJATUS",ENA:"PUHE",YMP:"LEHTI",UE:"SYDAN",HI:"AIKA",MU:"NUOTTI",KU:"SIVELLIN",KS:"TYOKALU",LI:"JUOKSU"};
    return (aine.koodi === "MAT" && I[s.alue]) || I[OL[aine.koodi]] || I.AJA;
  }
  const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  /* ---------- aineen valinta ja yhteiset säätimet ---------- */
  function rakennaValitsin(el) {
    el.innerHTML = PUUDATA.map(a => `<option value="${a.koodi}">${esc(a.nimi)}</option>`).join("");
    el.value = aine.koodi;
    el.addEventListener("change", () => valitse(el.value));
  }

  /* ---------- tietopaneeli ---------- */
  let paneeli, valittu = null;
  function avaa(id) { valittu = id; piirraPaneeli(); kuuntelijat.forEach(f => f("valinta")); }
  function sulje() { valittu = null; piirraPaneeli(); kuuntelijat.forEach(f => f("valinta")); }
  function lista(ids, otsikko) {
    if (!ids.length) return "";
    return `<h4>${otsikko}</h4><ul class="pl-lista">${ids.map(i => {
      const s = solmu[i], t = tila(i);
      return `<li><button type="button" data-hyppy="${i}" class="pl-linkki t-${t}"><span class="pl-pallo" style="--c:${alue(s.alue).vari}"></span>${esc(s.nimi)}${s.lk !== 4 ? ` <em>${s.lk}. lk</em>` : ""}</button></li>`;
    }).join("")}</ul>`;
  }
  function piirraPaneeli() {
    if (!paneeli) return;
    if (!valittu) { paneeli.hidden = true; return; }
    const s = solmu[valittu], a = alue(s.alue), t = tila(valittu);
    const tilaTeksti = {osattu: s.lk === 3 ? "Pohjataito edelliseltä vuodelta" : "Osattu", avoin: "Avoin: kaikki pohjataidot ovat koossa", lukittu: "Lukittu: pohjataitoja puuttuu"}[t];
    const ylos = (van[valittu] || []), alas = (lap[valittu] || []);
    const puuttuu = [...ketju(valittu, "ylos")].filter(i => !onOsattu(i));
    paneeli.hidden = false;
    paneeli.innerHTML = `
      <button type="button" class="pl-sulje" data-sulje aria-label="Sulje">×</button>
      <p class="pl-yla" style="--c:${a.vari}"><span>${s.lk}. luokka</span> · ${esc(a.nimi)}</p>
      <h3>${esc(s.nimi)}</h3>
      <p class="pl-tagit"><span class="pl-tag taso-${s.taso}">${TASO_NIMI[s.taso] || s.taso}</span><span class="pl-tag">${s.jakso}</span><span class="pl-tag t-${t}">${tilaTeksti}</span></p>
      <p class="pl-kuvaus">${esc(s.kuvaus)}</p>
      ${s.naytto ? `<h4>Näin taito näytetään</h4><p>${esc(s.naytto)}</p>` : ""}
      ${s.osaa_kun ? `<h4>Osaa, kun</h4><p>${esc(s.osaa_kun)}</p>` : ""}
      ${lista(ylos, "Pohjalla (opittava ensin)")}
      ${puuttuu.length && s.lk === 4 ? `<p class="pl-huom">Ennen tätä puuttuu vielä ${puuttuu.length} ${puuttuu.length === 1 ? "taito" : "taitoa"} ketjusta.</p>` : ""}
      ${lista(alas, "Avaa seuraavat")}
      <div class="pl-napit">
        ${s.lk === 4 ? `<button type="button" class="pl-nappi ensisij" data-vaihda="${valittu}">${osattu.has(valittu) ? "Peru merkintä" : "Merkitse osatuksi"}</button>` : ""}
        ${s.oppilas ? `<a class="pl-nappi" href="${s.oppilas}">Oppilaan sivu →</a>` : ""}
        ${s.opettaja ? `<a class="pl-nappi" href="${s.opettaja}">Opettajan sivu →</a>` : ""}
      </div>
      ${s.lk !== 4 ? `<p class="pl-huom">${s.lk}. luokan taito näytetään tässä, jotta näet jatkumon. Sen materiaali tehdään myöhemmin.</p>` : ""}`;
  }
  function kiinnitaPaneeli(el) {
    paneeli = el;
    el.addEventListener("click", e => {
      const h = e.target.closest("[data-hyppy]"), v = e.target.closest("[data-vaihda]");
      if (e.target.closest("[data-sulje]")) sulje();
      if (h) { avaa(h.dataset.hyppy); kuuntelijat.forEach(f => f("hyppy")); }
      if (v) { vaihda(v.dataset.vaihda); piirraPaneeli(); }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && valittu) sulje(); });
  }

  function yhteenveto() {
    const n4 = aine.solmut.filter(s => s.lk === 4);
    const ydin = n4.filter(s => s.taso === "ydin");
    return {
      osattu: n4.filter(s => osattu.has(s.id)).length, kaikki: n4.length,
      ydinOsattu: ydin.filter(s => osattu.has(s.id)).length, ydin: ydin.length,
      avoimia: n4.filter(s => tila(s.id) === "avoin").length,
      on3: aine.solmut.some(s => s.lk === 3), on5: aine.solmut.some(s => s.lk === 5),
    };
  }

  valitse(koodi);
  return {
    get aine() { return aine; }, get solmu() { return solmu; }, get van() { return van; }, get lap() { return lap; },
    get valittu() { return valittu; }, tila, ketju, alue, ikoni, esc, valitse, vaihda, nollaa, avaa, sulje,
    rakennaValitsin, kiinnitaPaneeli, piirraPaneeli, yhteenveto, kuuntele: f => kuuntelijat.push(f),
  };
})();
