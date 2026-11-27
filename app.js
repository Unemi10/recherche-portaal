/* ============================================================
   Recherche Portaal — gekoppeld aan Firebase Firestore.
   Alle leden delen dezelfde database: wijzigingen van de ene
   gebruiker verschijnen automatisch bij iedereen (onSnapshot),
   zonder dat iemand hoeft te verversen.
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyB_Q-jkV6Z41e8vH5V_SOmD95CHgxCry2o",
  authDomain: "belgiepd-recherche.firebaseapp.com",
  projectId: "belgiepd-recherche",
  storageBucket: "belgiepd-recherche.firebasestorage.app",
  messagingSenderId: "447517609100",
  appId: "1:447517609100:web:aa2673a41e4ccde1d83fa9"
};
let firestoreDocRef = null;
// Foto's staan NIET in het hoofddocument (dat zou de live-sync van alles zwaar en traag maken),
// maar elk in hun eigen klein document in een aparte collectie, enkel opgehaald wanneer een foto
// ook echt getoond moet worden. Zo blijft alles behalve de foto's zelf razendsnel synchroniseren.
let fotosCollectionRef = null;
try {
  if (typeof firebase === "undefined") throw new Error("Firebase-script niet geladen (CDN onbereikbaar?).");
  firebase.initializeApp(firebaseConfig);
  firestoreDocRef = firebase.firestore().collection("recherche").doc("hoofddata");
  fotosCollectionRef = firebase.firestore().collection("recherche_fotos");
} catch (err){
  console.error("Firebase-initialisatie mislukt:", err);
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("app").innerHTML = `<div style="padding:80px 20px;text-align:center" class="muted">Kon geen verbinding maken met de database (Firebase kon niet laden).<br>Herlaad de pagina; blijft dit aanhouden, meld dit aan de verantwoordelijke.</div>`;
  });
}

function seedData(){
  return {
    members: [
      { id: 1,  naam: "Unemi",     rol: "leiding", admin: true,  specialisaties: ["OBN", "CSI", "GO"], volgorde: 1, discordId: "", callsign: "", status: "Actief" },
      { id: 2,  naam: "EXTRA",     rol: "leiding", admin: false, specialisaties: ["OBN", "CSI", "GO"], volgorde: 2, discordId: "", callsign: "", status: "Actief" },
      { id: 3,  naam: "Dex",       rol: "leiding", admin: false, specialisaties: [], volgorde: 3, discordId: "", callsign: "", status: "Actief" },
      { id: 4,  naam: "J.Eclaire", rol: "lid",     admin: false, specialisaties: [], volgorde: 4, discordId: "", callsign: "", status: "Actief" },
      { id: 5,  naam: "Jelle",     rol: "lid",     admin: false, specialisaties: [], volgorde: 5, discordId: "", callsign: "", status: "Actief" },
      { id: 6,  naam: "Mathieu",   rol: "lid",     admin: false, specialisaties: [], volgorde: 6, discordId: "", callsign: "", status: "Actief" },
      { id: 7,  naam: "SEDA",      rol: "lid",     admin: false, specialisaties: [], volgorde: 7, discordId: "", callsign: "", status: "Actief" },
      { id: 8,  naam: "Jan",       rol: "lid",     admin: false, specialisaties: [], volgorde: 8, discordId: "", callsign: "", status: "Actief" },
      { id: 9,  naam: "Seppe",     rol: "lid",     admin: false, specialisaties: [], volgorde: 9, discordId: "", callsign: "", status: "Actief" },
      { id: 10, naam: "Adam",      rol: "lid",     admin: false, specialisaties: [], volgorde: 10, discordId: "", callsign: "", status: "Actief" }
    ],
    // Deze seed-functie wordt enkel ooit gebruikt bij een volledig lege/nieuwe Firestore-database
    // (eerste opstart); eenmaal er data in Firestore staat, wordt dit nooit meer uitgevoerd. Geen
    // vaste/echte toegangscodes hier plaatsen: die zouden anders blijvend zichtbaar staan in de
    // (eventueel publieke) broncode. Leden/admins genereren na een eventuele herstart hun codes
    // gewoon opnieuw via Beheer > Toegangscodes.
    accessCodes: [],
    dossiers: [
      {
        id: "kingfisher", naam: "Kingfisher", status: "open",
        typeDelict: "Handel verdovende middelen",
        verantwoordelijke: "Unemi", datumGeopend: "23/10/2026",
        samenvatting: "Opgestart na een melding over Victor DE SMET via het Wijkteam Zuid. Lopende samenwerking met de Cobra-eenheid: meerdere meetings, onderzoekshandelingen en resultaten van telecom- en bankbevraging.",
        betrokkenen: [
          { naam: "Victor DE SMET", detail: "Hoofdverdachte &ndash; vermoedelijk handel verdovende middelen", tag: "Verdachte", tagClass: "chip-wanted" },
          { naam: "Insp. Rudi", detail: "Wijkagent Wijkteam Zuid PZ Los Santos &ndash; initiële melding", tag: "Melder", tagClass: "chip-open" },
          { naam: "Cobra-eenheid", detail: "Uitvoering onderzoekshandelingen &amp; observaties", tag: "Andere", tagClass: "chip-muted" }
        ],
        voertuigen: [
          { kenteken: "1-KFW-204", merkModel: "BMW 3-reeks", kleur: "Zwart", betrokkeneNaam: "Victor DE SMET", notities: "Gezien aan de loods tijdens de OBN-observaties.", fotos: 0 }
        ],
        acties: [
          { id: "act1", tekst: "TAP-dossier opvolgen en aanvullen zodra er nieuwe resultaten zijn.", voltooid: false, toegewezenId: 3, aangemaaktDoor: "Unemi", aangemaaktOp: "24/10/2026" },
          { id: "act2", tekst: "Victor DE SMET laten oproepen voor verhoor.", voltooid: true, toegewezenId: 1, aangemaaktDoor: "Unemi", aangemaaktOp: "23/10/2026" }
        ],
        documenten: [
          { id: "d1", type: "Melding", datum: "23/10/2026", tijd: "09:50", titel: "Melding &ndash; anonieme tip over Victor DE SMET", auteur: "Insp. Rudi",
            secties: [{ kop: "", tekst: "Insp. Rudi (Wijkteam Zuid) meldt verdachte bedrijvigheid rond Victor DE SMET aan de recherche, met vermoeden van betrokkenheid bij handel in verdovende middelen." }]
          },
          { id: "d2", type: "Bijkomende informatie", datum: "23/10/2026", tijd: "16:30", titel: "Bijkomende informatie &ndash; kenteken en voertuig", auteur: "Jelle",
            secties: [{ kop: "", tekst: "Navraag bij DIV levert een kentekenplaat op die geregistreerd staat op naam van Victor DE SMET, gekoppeld aan een bestelwagen die meermaals werd gezien in de buurt van de loods." }]
          },
          { id: "d3", type: "Algemeen verslag", datum: "24/10/2026", tijd: "10:00", titel: "Overzicht onderzoekshandelingen &ndash; 1ste ronde", auteur: "Unemi",
            secties: [
              { kop: "Jelle &ndash; navraag contacten drugswereld", tekst: "Doet navraag bij contacten in de drugswereld. Na het tonen van een foto herkennen enkele contacten DE SMET als 'King Dela'. Een concrete verblijfplaats kon niet achterhaald worden." },
              { kop: "Mathieu &ndash; sociale media", tekst: "Checkt sociale media op voertuigen van de verdachte. Onder de naam 'King Dela' worden meerdere profielen aangetroffen die mogelijk aan DE SMET gelinkt zijn." },
              { kop: "Adam &ndash; ANPR-bevraging", tekst: "Checkt de nummerplaat tegen ANPR-hits. Eén relevante hit, met meerdere registraties rond de haven." }
            ]
          },
          { id: "d4", type: "Opdracht", afkomstigVan: "Procureur des Konings", datum: "28/10/2026", tijd: "09:00", titel: "Opdracht &ndash; bevraging bankgegevens DE SMET", auteur: "Unemi",
            secties: [{ kop: "", tekst: "Machtiging verkregen om de bankgegevens van Victor DE SMET op te vragen bij het Centraal Aanspreekpunt, met het oog op het opsporen van verdachte financiële bewegingen." }]
          },
          { id: "d5", type: "Beschikbare resultaten", datum: "02/11/2026", tijd: "09:40", titel: "Resultaten &ndash; Bank", auteur: "Infocel LRD", inhoud: "Bankbevraging via het Centraal Aanspreekpunt.",
            rows: [
              { label: "Rekeningnummer", waarde: "BE71 0961 2345 6769" },
              { label: "Bank", waarde: "BNP Paribas Fortis" },
              { label: "Saldo op aanvraagdatum", waarde: "&euro; 1.240,55" },
              { label: "Opvallende verrichting", waarde: "Cashopname &euro; 4.800 op 18/10/2026" }
            ],
            aanvullingen: [
              { datum: "12/11/2026", tijd: "10:05", tekst: "Bijkomende verrichting vastgesteld: overschrijving van &euro; 2.300 naar een onbekende rekening op 06/11/2026.", auteur: "Infocel LRD" }
            ]
          },
          { id: "d6", type: "Opdracht", afkomstigVan: "Onderzoeksrechter", datum: "05/11/2026", tijd: "09:00", titel: "Opdracht &ndash; machtiging telefoontap DE SMET", auteur: "Unemi",
            secties: [{ kop: "", tekst: "Machtiging verkregen tot het afluisteren van het gsm-nummer van Victor DE SMET, op basis van de eerder verzamelde aanwijzingen." }]
          },
          { id: "d7", type: "TAP-dossier", datum: "05/11/2026", tijd: "11:00", titel: "TAP &ndash; DE SMET Victor", auteur: "Onderzoeksrechter", inhoud: "Machtiging lopende sinds 05/11/2026. Wordt aangevuld naarmate er relevante gesprekken binnenkomen.",
            rows: [
              { label: "Onderzoeksrechter", waarde: "Onderzoeksrechter Peeters" },
              { label: "Nummer onder afluistering", waarde: "0470 12 34 56" },
              { label: "Looptijd machtiging", waarde: "05/11/2026 &ndash; 05/01/2027" }
            ],
            aanvullingen: [
              { datum: "09/11/2026", tijd: "20:12", tekst: "Gesprek met onbekend nummer over 'levering vrijdag' &ndash; vermoedelijk code voor transport.", auteur: "Onderzoeksrechter" },
              { datum: "16/11/2026", tijd: "08:03", tekst: "Oproep naar Victor DE SMET waarin een ontmoeting bij de loods wordt bevestigd.", auteur: "Onderzoeksrechter" }
            ]
          },
          { id: "d8", type: "OBN-verslag", specialisatie: "OBN", datum: "14/11/2026", tijd: "23:40", auteur: "EXTRA",
            locaties: [
              { datum: "14/11/2026", tijd: "23:40", postcode: "2000", tekst: "Verdachte bedrijvigheid vastgesteld aan de loods: twee voertuigen reden rond 23u de loods binnen, deuren werden gesloten.", foto_s: 2 },
              { datum: "15/11/2026", tijd: "01:15", postcode: "2030", tekst: "Later die nacht werd één van de voertuigen opnieuw gezien ter hoogte van de kaai, mogelijk klaargemaakt voor transport.", foto_s: 1 }
            ]
          },
          { id: "d9", type: "Opdracht", afkomstigVan: "Onderzoeksrechter", datum: "19/11/2026", tijd: "09:00", titel: "Opdracht &ndash; huiszoekingsbevel loods Antwerpsesteenweg", auteur: "Unemi",
            secties: [{ kop: "", tekst: "Machtiging verkregen voor huiszoeking en inbeslagname in de loods, naar aanleiding van de vastgestelde verdachte bedrijvigheid tijdens de observaties." }]
          },
          { id: "d10", type: "GO-verslag", specialisatie: "GO", datum: "20/11/2026", tijd: "06:00", postcode: "2000", auteur: "EXTRA",
            bevindingen: "Tussenkomst op basis van het huiszoekingsbevel. Eén persoon aangetroffen en aangehouden ter plaatse.",
            tijdstippen: [
              { label: "Betreden woning", tijd: "06:00" },
              { label: "Arrestatie", tijd: "06:04" },
              { label: "Boeien", tijd: "06:05" },
              { label: "Fouilleren", tijd: "06:07" }
            ],
            rows: [{ label: "Marco STEENS (koerier)", waarde: "Aangehouden; vermoedelijk belast met transport van de partij" }]
          },
          { id: "d11", type: "CSI-verslag", specialisatie: "CSI", datum: "20/11/2026", tijd: "08:30", postcode: "2000", auteur: "Unemi",
            bevindingen: "Forensisch onderzoek van de loods, aansluitend op de tussenkomst door GO.",
            tijdstippen: [
              { label: "Ter plaatse", tijd: "08:30" },
              { label: "Aantreffen sporen", tijd: "09:10" },
              { label: "Einde tussenkomst", tijd: "11:45" }
            ],
            rows: [
              { label: "Spoor 1", waarde: "Vingerafdrukken op de laadklep van het voertuig" },
              { label: "Spoor 2", waarde: "Sporen van verpakkingsmateriaal, vermoedelijk gebruikt voor de partij" }
            ],
            foto_s: 3
          }
        ]
      },
      { id: "nachtuil", naam: "Nachtuil", status: "gesloten", typeDelict: "Inbraakreeks industriezone", verantwoordelijke: "Dex", datumGeopend: "02/09/2026", samenvatting: "Afgesloten dossier.", betrokkenen: [], voertuigen: [], documenten: [], acties: [] },
      { id: "rodeloods", naam: "Rode Loods", status: "gesloten", typeDelict: "Heling", verantwoordelijke: "EXTRA", datumGeopend: "11/08/2026", samenvatting: "Afgesloten dossier.", betrokkenen: [], voertuigen: [], documenten: [], acties: [] }
    ],
    nextMemberId: 11,
    nextDocId: 12,
    nextActieId: 3,
    activiteitenlog: []
  };
}

/* ---------------- data layer ---------------- */
// Vult ontbrekende velden aan bij data die al in Firestore stond vóór een schema-update,
// zodat oudere opgeslagen gegevens niet stuklopen op nieuwere code (bv. ontbrekend admin-veld).
function migrateDb(data){
  // Toegangscodes worden zonder "-" gebruikt; oudere (ook al gemigreerde) codes met een "-" erin
  // worden hier automatisch opgeschoond, telkens opnieuw, zodat dit ook werkt voor wie de vorige
  // versie met de echte ploeg (en toen nog met "-") al geopend had.
  (data.accessCodes || []).forEach(c => { if (c.code.includes("-")) c.code = c.code.replace(/-/g, ""); });
  // Eenmalige vervanging van de placeholder-testleden (Insp. Unemi/Lemmens/De Smet) door de
  // echte ploeg, voor wie al eerder met de placeholder-data had geopend. Enkel wanneer de
  // ledenlijst nog exact de oude 3 placeholders is (dus niets zelf aangepast/toegevoegd), en
  // maar één keer dankzij de rosterV2-vlag.
  if (!data.rosterV2){
    const namen = (data.members || []).map(m => m.naam).sort().join("|");
    if (namen === ["Insp. De Smet", "Insp. Lemmens", "Insp. Unemi"].sort().join("|")){
      const fresh = seedData();
      data.members = fresh.members;
      data.accessCodes = fresh.accessCodes;
      data.nextMemberId = fresh.nextMemberId;
      // Dossiers/documenten (en hun verwijzingen naar "Insp. Unemi" e.d.) laten we met rust als
      // de admin die intussen al bewerkt heeft; enkel bij exact de seed-dossiers vervangen we ook die.
      const dossierNamen = (data.dossiers || []).map(d => d.id).sort().join("|");
      if (dossierNamen === ["kingfisher", "nachtuil", "rodeloods"].sort().join("|")){
        data.dossiers = fresh.dossiers;
        data.nextDocId = fresh.nextDocId;
      }
    }
    data.rosterV2 = true;
  }
  // Eenmalige, expliciet gevraagde reset van de documenten in het Kingfisher-demo-dossier naar de
  // nieuwe fictieve chronologie die alle 9 echte documenttypes toont. Dit overschrijft bewust ook
  // een reeds geopende/aangepaste browser, want dit was een directe vraag van de gebruiker zelf om
  // alle documenten in dit dossier te vervangen. Andere dossiers en alle eigen aanpassingen
  // daarbuiten (leden, andere dossiers, betrokkenen, ...) blijven onaangeroerd. Draait maar één
  // keer dankzij de kingfisherDemoV2-vlag.
  if (!data.kingfisherDemoV2){
    const fresh = seedData();
    const freshKingfisher = fresh.dossiers.find(d => d.id === "kingfisher");
    const kingfisher = (data.dossiers || []).find(d => d.id === "kingfisher");
    if (kingfisher && freshKingfisher){
      kingfisher.documenten = freshKingfisher.documenten;
      data.nextDocId = Math.max(data.nextDocId || 0, fresh.nextDocId);
    }
    data.kingfisherDemoV2 = true;
  }
  // Referentie naar de oorspronkelijke seed, zodat een ontbrekend admin-veld (data die al in
  // localStorage stond vóór dit veld bestond) overneemt wat die persoon oorspronkelijk was
  // (bv. Unemi = admin), in plaats van iedereen stilzwijgend non-admin te maken.
  const seedMembers = seedData().members;
  (data.members || []).forEach(m => {
    if (m.admin === undefined){
      const seedMatch = seedMembers.find(sm => sm.id === m.id) || seedMembers.find(sm => sm.naam === m.naam);
      m.admin = seedMatch ? seedMatch.admin : false;
    }
    if (m.discordId === undefined) m.discordId = "";
    if (m.callsign === undefined) m.callsign = "";
    if (m.status === undefined) m.status = "Actief";
    if (!m.specialisaties) m.specialisaties = [];
  });
  // Ontbrekende volgorde (oudere data): geef elk lid zonder volgorde-veld een oplopend nummer,
  // in de volgorde waarin ze nu in de lijst staan.
  if ((data.members || []).some(m => m.volgorde === undefined)){
    let next = Math.max(0, ...data.members.filter(m => typeof m.volgorde === "number").map(m => m.volgorde)) + 1;
    data.members.forEach(m => { if (m.volgorde === undefined) m.volgorde = next++; });
  }
  // Eenmalige aanmaak van een verborgen adminaccount: logt in met een gewone, automatisch
  // gegenereerde toegangscode zoals elk ander lid, maar komt nergens voor in een ledenlijst,
  // -beheer, teller of keuzelijst (zie zichtbareLeden() en alle plekken die dat gebruiken).
  // Draait maar één keer dankzij de verborgenAdminV1-vlag; zelfde patroon als de andere
  // eenmalige migraties hierboven (de vlag en de nieuwe data worden pas écht weggeschreven bij
  // de eerstvolgende gewone opslag, net als bij rosterV2/kingfisherDemoV2 hierboven).
  if (!data.verborgenAdminV1){
    if (!data.members.some(m => m.verborgen)){
      const verborgenId = (data.nextMemberId || 1) + 9000;
      data.members.push({ id: verborgenId, naam: "Beheer", rol: "leiding", admin: true, specialisaties: [], volgorde: 9999, discordId: "", callsign: "", status: "Actief", verborgen: true });
      if (!data.accessCodes) data.accessCodes = [];
      let code;
      do {
        code = Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
      } while (data.accessCodes.some(c => c.code === code));
      data.accessCodes.push({ code, memberId: verborgenId });
      data.verborgenAdminCode = code;
    }
    data.verborgenAdminV1 = true;
  }
  if (data.nextActieId === undefined) data.nextActieId = 1;
  if (!data.activiteitenlog) data.activiteitenlog = [];
  (data.dossiers || []).forEach(d => {
    if (d.opsporing === undefined) d.opsporing = false;
    if (!d.betrokkenen) d.betrokkenen = [];
    if (!d.voertuigen) d.voertuigen = [];
    // Het vroegere, nooit in de interface gebruikte "bewijs"-veld opruimen: bewijsstukken worden
    // gewoon binnen het CSI-verslag zelf vernoemd, dus dit losse veld is overbodig.
    if (d.bewijs !== undefined) delete d.bewijs;
    if (!d.documenten) d.documenten = [];
    if (!d.acties) d.acties = [];
    // Zelfde reden als bij betrokkenen hierboven: vast, uniek ID voor elk voertuig.
    d.voertuigen.forEach(v => { if (!v.id) v.id = genereerVoertuigId(); });
    d.betrokkenen.forEach(b => {
      // Vast, uniek ID zodat een betrokkene nog teruggevonden kan worden bij het bewerken/
      // verwijderen, ook als de databoom intussen door een nieuwe Firestore-synchronisatie
      // vervangen is (zelfde reden als bij aanvullingen, zie vindLeefBetrokkene).
      if (!b.id) b.id = genereerBetrokkeneId();
      if (b.signalement === undefined) b.signalement = "";
      // De oude "Foto beschikbaar (plaatshouder)"-checkbox wordt een echte foto-teller, zoals
      // elders in de app (OBN/CSI/Bijstandsaanvraag): true wordt 1 foto, anders 0.
      if (b.fotos === undefined) b.fotos = b.foto ? 1 : 0;
      delete b.foto;
      // Hernoemde/vervallen tags bij betrokkenen eenmalig rechtzetten: "Gezocht" en "Verdachte"
      // vallen samen onder "Verdachte" (rood), "Getuige" wordt "Bron/Getuige", "Meldende dienst"
      // wordt "Melder", en de rest (bv. "Ondersteunende dienst") valt onder de algemene "Andere".
      if (b.tag === "Gezocht" || b.tag === "Verdachte"){ b.tag = "Verdachte"; b.tagClass = "chip-wanted"; }
      else if (b.tag === "Getuige" || b.tag === "Bron/Getuige"){ b.tag = "Bron/Getuige"; b.tagClass = "chip-open"; }
      else if (b.tag === "Meldende dienst" || b.tag === "Melder"){ b.tag = "Melder"; b.tagClass = "chip-open"; }
      else if (b.tag !== "Slachtoffer" && b.tag !== "Andere"){ b.tag = "Andere"; b.tagClass = "chip-muted"; }
    });
    d.documenten.forEach(doc => {
      if (!doc.aanwezigen) doc.aanwezigen = [];
      if (doc.secties) doc.secties.forEach(s => {
        if (s.postcode === undefined) s.postcode = "";
        if (s.fotos === undefined) s.fotos = 0;
      });
      // CSI/GO-verslagen toonden nog geen tijdstip in de chronologie (enkel de postcode); dit zet
      // het eenmalig recht naar het eerste ingevulde tijdstip, zoals een OBN-verslag dat ook al deed.
      if ((doc.type === "CSI-verslag" || doc.type === "GO-verslag") && !doc.tijd && doc.tijdstippen && doc.tijdstippen.length){
        doc.tijd = doc.tijdstippen[0].tijd || "";
      }
      // Oudere "Lopende TAP"-documenten waren nog gewoon getypeerd als "Beschikbare resultaten"
      // (enkel via de titel herkenbaar); nu dat een eigen documenttype is (met rode highlight),
      // zetten we dat hier eenmalig recht.
      if (doc.type === "Beschikbare resultaten" && doc.titel && doc.titel.indexOf("Lopende TAP") === 0){
        doc.type = "Lopende TAP";
      }
      // "Lopende TAP" heet voortaan "TAP-dossier"; bestaande documenten krijgen hier eenmalig het nieuwe type.
      if (doc.type === "Lopende TAP") doc.type = "TAP-dossier";
      if (doc.type === "Beschikbare resultaten" || doc.type === "TAP-dossier" || doc.type === "Bijstandsaanvraag"){
        if (!doc.rows) doc.rows = [];
        if (!doc.aanvullingen) doc.aanvullingen = [];
      }
      // Elke aanvulling krijgt een vast, uniek ID (oudere aanvullingen, van vóór dit bestond,
      // krijgen er hier eenmalig één). Nodig zodat een aanvulling nog teruggevonden kan worden
      // bij het bewerken/verwijderen, ook als de databoom intussen door een nieuwe Firestore-
      // synchronisatie vervangen is (zie vindLeefDoc).
      if (doc.aanvullingen) doc.aanvullingen.forEach(a => { if (!a.id) a.id = genereerAanvullingId(); });
      // Een Bijstandsaanvraag had de "Reden/context" eerst nog in het gedeelde "inhoud"-veld staan;
      // dat verhuist hier eenmalig naar het eigen "reden"-veld van de nieuwe, uitgebreidere opbouw.
      if (doc.type === "Bijstandsaanvraag" && !doc.reden && doc.inhoud){
        doc.reden = doc.inhoud;
        doc.inhoud = "";
      }
      // "Beschrijving locatie/woning" en "Omschrijving opdracht / gewenste ondersteuning" waren
      // eerst nog gewone rijen in de gegeventabel; die verhuizen hier eenmalig naar hun eigen vak
      // (beschrijving locatie/woning komt samen met "Beschrijving van het pand" te staan).
      if (doc.type === "Bijstandsaanvraag" && doc.rows && doc.rows.length){
        const vindEnHaalWeg = (label) => {
          const i = doc.rows.findIndex(r => r.label === label);
          if (i === -1) return "";
          return doc.rows.splice(i, 1)[0].waarde || "";
        };
        const locatie = vindEnHaalWeg("Beschrijving locatie/woning");
        const opdracht = vindEnHaalWeg("Omschrijving opdracht / gewenste ondersteuning");
        if (locatie && !doc.pand) doc.pand = locatie;
        else if (locatie) doc.pand = doc.pand + "\n" + locatie;
        if (opdracht && !doc.omschrijvingOpdracht) doc.omschrijvingOpdracht = opdracht;
      }
      // De rij "Postcode" bij een Bijstandsaanvraag krijgt een duidelijkere naam, zodat niet
      // verward wordt met bv. een postcode die ergens anders (briefing, pand) vermeld staat.
      if (doc.type === "Bijstandsaanvraag" && doc.rows && doc.rows.length){
        doc.rows.forEach(r => { if (r.label === "Postcode") r.label = "Postcode tussenkomst"; });
      }
      // "Omschrijving opdracht / gewenste ondersteuning" had nog een eigen vak; dit hoort inhoudelijk
      // bij "Reden / context" en wordt hier eenmalig samengevoegd tot één vak.
      if (doc.type === "Bijstandsaanvraag" && doc.omschrijvingOpdracht){
        doc.reden = doc.reden ? doc.reden + "\n\n" + doc.omschrijvingOpdracht : doc.omschrijvingOpdracht;
        doc.omschrijvingOpdracht = "";
      }
    });
  });
  // Oudere "Algemeen verslag"/"Melding"/"Bijkomende informatie"/"Opdracht"-documenten hadden één
  // los tekstveld "inhoud"; dat wordt nu één sectie in de nieuwe, herhaalbare sectie-opbouw
  // (dezelfde aanpak als de locatieblokken bij OBN/CSI/GO-verslagen), zodat bestaande documenten
  // gewoon blijven werken en verder aangevuld kunnen worden met extra secties.
  (data.dossiers || []).forEach(d => {
    (d.documenten || []).forEach(doc => {
      // "Beschikbare resultaten" en specialisatie-verslagen (locaties) blijven ongemoeid; enkel de
      // eenvoudige documenttypes (Melding, Algemeen verslag, Bijkomende informatie, Opdracht) kregen
      // vroeger enkel "inhoud" en krijgen nu hun eerste sectie daaruit.
      if (doc.type !== "Beschikbare resultaten" && !doc.locaties && !doc.secties && doc.inhoud !== undefined){
        doc.secties = [{ kop: "", tekst: doc.inhoud || "" }];
      }
    });
  });
  // Veiligheidsnet: als er door oudere/overgangsdata niemand meer admin is, zou niemand nog iets
  // kunnen bewerken of verwijderen en zit iedereen vast. Maak in dat geval het eerste leiding-lid
  // opnieuw admin, zodat er altijd minstens één account is dat dit kan herstellen.
  const members = data.members || [];
  if (members.length && !members.some(m => m.rol === "leiding" && m.admin === true)){
    const eersteLeiding = members.find(m => m.rol === "leiding");
    if (eersteLeiding) eersteLeiding.admin = true;
  }
  // Gelezen/ongelezen-status per document: "gezienDoor" houdt bij welke leden dit document (in zijn
  // huidige vorm) al geopend hebben. Bestaande documenten krijgen hier eenmalig alle huidige leden
  // toegewezen, zodat de hele bestaande chronologie niet plots als "nieuw" oplicht voor iedereen;
  // vanaf nu telt enkel een echt nieuw document of een nieuwe aanvulling nog als ongelezen.
  if (!data.gelezenStatusV1){
    const alleLedenIds = members.map(m => m.id);
    (data.dossiers || []).forEach(d => {
      (d.documenten || []).forEach(doc => { doc.gezienDoor = alleLedenIds.slice(); });
    });
    data.gelezenStatusV1 = true;
  }
  // Foto's waren tot nu toe enkel een aantal (een teller, zonder echte beeldgegevens erachter);
  // vanaf nu is elk foto-veld een reeks foto-ID's die verwijzen naar een los document in de
  // "recherche_fotos"-collectie. Een ouder getal kan niet omgezet worden naar een echte foto (er
  // stond nooit beeldmateriaal achter), dus wordt hier eenmalig een lege reeks van gemaakt.
  const naarFotoArray = (v) => Array.isArray(v) ? v : [];
  (data.dossiers || []).forEach(d => {
    (d.betrokkenen || []).forEach(b => { b.fotos = naarFotoArray(b.fotos); });
    (d.voertuigen || []).forEach(v => { v.fotos = naarFotoArray(v.fotos); });
    (d.documenten || []).forEach(doc => {
      (doc.secties || []).forEach(s => { s.fotos = naarFotoArray(s.fotos); });
      (doc.locaties || []).forEach(l => { l.foto_s = naarFotoArray(l.foto_s); });
      if (doc.foto_s !== undefined) doc.foto_s = naarFotoArray(doc.foto_s);
      if (doc.verdachtenFotos !== undefined) doc.verdachtenFotos = naarFotoArray(doc.verdachtenFotos);
      if (doc.pandFotos !== undefined) doc.pandFotos = naarFotoArray(doc.pandFotos);
      (doc.aanvullingen || []).forEach(a => { if (a.foto_s !== undefined) a.foto_s = naarFotoArray(a.foto_s); });
    });
  });
  return data;
}
let db = null;
let dbReady = false;
let dbFout = false;

const DB = {
  save(database){
    if (!firestoreDocRef){
      alert("Geen databaseverbinding. Herlaad de pagina en probeer opnieuw.");
      return;
    }
    // JSON round-trip: identiek gedrag als vroeger localStorage (geen undefined-velden,
    // geen functies), en Firestore aanvaardt geen "undefined" als veldwaarde.
    const schoon = JSON.parse(JSON.stringify(database));
    firestoreDocRef.set(schoon).catch(err => {
      console.error("Opslaan naar Firestore mislukt:", err);
      alert("Je wijziging kon niet worden opgeslagen. Controleer je internetverbinding en probeer opnieuw.");
    });
  }
};

function startDbSync(){
  if (!firestoreDocRef) return; // Firebase kon niet initialiseren; foutmelding staat al op het scherm.
  firestoreDocRef.onSnapshot((snap) => {
    dbFout = false;
    if (!snap.exists){
      // Eerste keer ooit: nog geen data in Firestore, dus de basisgegevens aanmaken.
      firestoreDocRef.set(seedData());
      return; // onSnapshot vuurt meteen opnieuw, met de net opgeslagen data
    }
    db = migrateDb(snap.data());
    // Toon de zonet aangemaakte toegangscode voor het verborgen adminaccount eenmalig in een
    // alert (zie migrateDb/verborgenAdminV1), en bewaar daarna meteen zonder dat tijdelijke veld,
    // zodat de code nergens anders in de data blijft rondslingeren dan in deze ene melding.
    if (db.verborgenAdminCode){
      const verborgenCode = db.verborgenAdminCode;
      delete db.verborgenAdminCode;
      DB.save(db);
      setTimeout(() => alert("Verborgen adminaccount aangemaakt.\n\nToegangscode: " + verborgenCode + "\n\nNoteer deze goed: hij wordt nergens anders getoond en kan niet opnieuw opgevraagd worden via Beheer."), 300);
    }
    dbReady = true;
    render();
  }, (err) => {
    console.error("Firestore-verbinding verloren:", err);
    dbFout = true;
    render();
  });
}

/* ---------------- session ---------------- */
function getSession(){
  const id = sessionStorage.getItem("rpd_session_member");
  if (!id) return null;
  return db.members.find(m => String(m.id) === id) || null;
}
// Leiding met adminrechten mag dossiers volledig bewerken; gewone leiding niet.
function isAdmin(session){
  return !!(session && session.rol === "leiding" && session.admin === true);
}
// Een admin mag élk verslag bewerken/verwijderen. Daarnaast mag de auteur van een verslag ook
// zijn eigen verslag nog bewerken (bv. om nadien nog foto's toe te voegen) &mdash; elke wijziging
// blijft gewoon gelogd via logActiviteit, net als bij een admin-wijziging. Oudere documenten (van
// vóór dit auteurId-veld bestond) vallen terug op een naamvergelijking.
function magDocBewerken(doc, session){
  if (!session) return false;
  if (isAdmin(session)) return true;
  if (!doc) return false;
  if (doc.auteurId !== undefined && doc.auteurId !== null) return String(doc.auteurId) === String(session.id);
  return !!doc.auteur && doc.auteur === session.naam;
}
// Een aanvulling (toevoeging bij een document) mag door eender wie toegevoegd worden -- dat is
// net de bedoeling, zodat ook een ander lid later nog iets kan aanvullen bij eens anders verslag.
// Bewerken/verwijderen van een bestaande aanvulling blijft wel beperkt: admin, de hoofdauteur van
// het document zelf, of wie die aanvulling zelf schreef.
function magAanvullingBewerken(aanvulling, doc, session){
  if (!session) return false;
  if (isAdmin(session) || magDocBewerken(doc, session)) return true;
  if (!aanvulling) return false;
  if (aanvulling.auteurId !== undefined && aanvulling.auteurId !== null) return String(aanvulling.auteurId) === String(session.id);
  return !!aanvulling.auteur && aanvulling.auteur === session.naam;
}
// Wie mag een NIEUWE aanvulling toevoegen bij dit document? Admin en de auteur van het document
// zelf mogen dat altijd. Bij een Algemeen verslag of Bijkomende informatie mag daarnaast eender
// welk ingelogd lid aanvullen &mdash; dat zijn de "open" verslagtypes. Bij een specialisatieverslag
// (OBN/CSI/GO) mag een lid enkel aanvullen als het ook effectief die specialisatie/rol heeft.
// Bij Beschikbare resultaten, TAP-dossier en Bijstandsaanvraag blijft het beperkt tot admin/auteur:
// dat zijn de "officiële" documenten waar niet zomaar iedereen aan mag toevoegen.
function magAanvullingToevoegen(doc, session){
  if (!session) return false;
  if (magDocBewerken(doc, session)) return true;
  if (doc.type === "Algemeen verslag" || doc.type === "Bijkomende informatie") return true;
  if (doc.specialisatie) return (session.specialisaties || []).includes(doc.specialisatie);
  return false;
}
// Herbruikbare HTML/wiring voor de aanvullingen-sectie, zodat elk documenttype dat aanvullingen
// toelaat (Algemeen verslag, Bijkomende informatie, OBN/CSI/GO, en de admin/auteur-only types)
// dezelfde weergave en dezelfde rechten-logica gebruikt.
function aanvullingenSectieHtml(doc, session){
  const aanvullingen = sortChronologisch(doc.aanvullingen || [], x => x.datum, x => x.tijd);
  if (!aanvullingen.length) return "";
  return `
    <div class="hint" style="margin:16px 0 8px">Aanvullingen</div>
    ${aanvullingen.map(a => `
      <div class="pv-loc">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px">
          <div style="font-size:11px;color:#8a90a3">${a.datum} &middot; ${a.tijd || ""} ${a.auteur ? "&middot; " + a.auteur : ""}</div>
          ${magAanvullingBewerken(a, doc, session) ? `<div style="display:flex;gap:10px;flex:0 0 auto">
            <span class="aanv-edit" data-id="${a.id}" style="font-size:11px;color:var(--gold);cursor:pointer;font-weight:600">Bewerken</span>
            <span class="aanv-del" data-id="${a.id}" style="font-size:11px;color:var(--red);cursor:pointer;font-weight:600">Verwijderen</span>
          </div>` : ""}
        </div>
        <div class="verslag-tekst">${renderOpgemaakteTekst(a.tekst)}</div>
        ${fotosGalerijHtml(a.foto_s, "margin-top:10px")}
      </div>`).join("")}
  `;
}
function addAanvullingBtnHtml(doc, session){
  return magAanvullingToevoegen(doc, session) ? `<button class="btn btn-ghost btn-sm" id="addAanvullingBtn">+ Aanvulling toevoegen</button>` : "";
}
// Zoekt een dossier/document opnieuw op aan de hand van hun ID, in de op dat moment actuele
// (live) db &mdash; in plaats van te vertrouwen op een object-verwijzing die al een tijdje
// vastgehouden wordt (bv. in een openstaand formulier). Dat laatste is nodig omdat de volledige
// "db" bij elke Firestore-synchronisatie vervangen wordt door een compleet nieuwe boom (zie
// startDbSync): zodra dat gebeurt terwijl iemand een formulier open heeft staan &mdash; bv. omdat
// een collega ondertussen iets anders in hetzelfde dossier opslaat, of gewoon doordat je eigen
// vorige opslag met een korte vertraging terug binnenkomt &mdash; houdt dat formulier nog de OUDE,
// losstaande objecten vast. Een wijziging daarop doorvoeren en dan gewoon "DB.save(db)" aanroepen
// zou die wijziging stil verliezen (de huidige, ondertussen al vervangen "db" wordt dan immers
// opnieuw opgeslagen, zonder de wijziging): exact de "soms wel, meestal niet"-opslagbug bij
// aanvullingen. Door dossier/document/aanvulling vlak vóór het opslaan opnieuw op te zoeken via
// hun ID, wordt altijd op de actuele versie gewerkt.
function vindLeefDossier(dossierId){
  return (db.dossiers || []).find(x => x.id === dossierId) || null;
}
function vindLeefDoc(dossierId, docId){
  const dossierObj = vindLeefDossier(dossierId);
  if (!dossierObj) return null;
  const doc = (dossierObj.documenten || []).find(x => x.id === docId);
  return doc ? { dossierObj, doc } : null;
}
// Zelfde reden/patroon als vindLeefDoc hierboven, maar dan voor een betrokkene of voertuig.
function vindLeefBetrokkene(dossierId, betrokkeneId){
  const dossierObj = vindLeefDossier(dossierId);
  if (!dossierObj) return null;
  const betrokkene = (dossierObj.betrokkenen || []).find(x => x.id === betrokkeneId);
  return betrokkene ? { dossierObj, betrokkene } : null;
}
function vindLeefVoertuig(dossierId, voertuigId){
  const dossierObj = vindLeefDossier(dossierId);
  if (!dossierObj) return null;
  const voertuig = (dossierObj.voertuigen || []).find(x => x.id === voertuigId);
  return voertuig ? { dossierObj, voertuig } : null;
}
// Zelfde reden/patroon, maar voor een lid (db.members zit niet onder een dossier).
function vindLeefMember(memberId){
  return db.members.find(x => x.id === memberId) || null;
}
function wireAanvullingenKnoppen(doc, dossierObj, session){
  const dossierId = dossierObj.id, docId = doc.id;
  const addBtn = document.getElementById("addAanvullingBtn");
  if (addBtn) addBtn.addEventListener("click", () => {
    const live = vindLeefDoc(dossierId, docId);
    if (!live){ alert("Dit document bestaat niet meer (mogelijk ondertussen verwijderd)."); closeModal(); render(); return; }
    closeModal();
    openAanvullingForm(live.doc, live.dossierObj, session);
  });
  document.querySelectorAll(".aanv-edit").forEach(span => span.addEventListener("click", () => {
    const live = vindLeefDoc(dossierId, docId);
    if (!live){ alert("Dit document bestaat niet meer (mogelijk ondertussen verwijderd)."); closeModal(); render(); return; }
    const aanvulling = (live.doc.aanvullingen || []).find(a => a.id === span.dataset.id);
    if (!aanvulling){ alert("Deze aanvulling bestaat niet meer (mogelijk ondertussen verwijderd)."); openDocDetail(live.doc, live.dossierObj, session); return; }
    closeModal();
    openAanvullingForm(live.doc, live.dossierObj, session, aanvulling);
  }));
  document.querySelectorAll(".aanv-del").forEach(span => span.addEventListener("click", () => {
    confirmModal("Deze aanvulling verwijderen?", () => {
      const live = vindLeefDoc(dossierId, docId);
      if (!live){ alert("Dit document bestaat niet meer (mogelijk ondertussen verwijderd)."); closeModal(); render(); return; }
      const target = (live.doc.aanvullingen || []).find(a => a.id === span.dataset.id);
      if (!target){ openDocDetail(live.doc, live.dossierObj, session); return; }
      (target.foto_s || []).forEach(verwijderFoto);
      live.doc.aanvullingen = live.doc.aanvullingen.filter(x => x !== target);
      logActiviteit(session, "Aanvulling verwijderd", live.dossierObj.naam);
      DB.save(db);
      openDocDetail(live.doc, live.dossierObj, session);
    });
  }));
}
// Leiding (admin of niet) en hoofdrechercheur mogen het Beheer-tabblad zien; binnen Beheer zelf
// bepalen de specifieke functies verder wat ze precies mogen (zie beheerLeden/openMemberForm).
function magBeheerZien(session){
  return !!(session && (session.rol === "leiding" || session.rol === "hoofdrechercheur"));
}
function login(code){
  const entry = db.accessCodes.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!entry) return false;
  sessionStorage.setItem("rpd_session_member", String(entry.memberId));
  return true;
}
function logout(){
  sessionStorage.removeItem("rpd_session_member");
  view = { tab: "overons" };
  render();
}

/* ---------------- view state ---------------- */
let view = { tab: "overons", dossierId: null, dossierTab: "tijdlijn" };

function go(tab, extra){
  view = Object.assign({ tab }, extra || {});
  render();
}

/* ---------------- diepe link naar een dossier/document (bv. vanuit een Discord-melding) ---------------- */
// Ontleedt "#dossier=<id>&doc=<id>" (doc optioneel) uit de URL bij het opstarten van de app. Wordt
// maar één keer ingelezen; de effectieve navigatie gebeurt pas zodra zowel de database als een
// sessie klaarstaan (zie render() en de login-flow in openLoginModal hieronder), en wordt nadien
// gewist zodat een latere her-render (bv. door een nieuwe Firestore-synchronisatie) niet opnieuw
// naar hetzelfde dossier springt.
let pendingDeepLink = parseDeepLinkHash();
function parseDeepLinkHash(){
  const hash = (location.hash || "").replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const dossierId = params.get("dossier");
  if (!dossierId) return null;
  return { dossierId, docId: params.get("doc") || null };
}
// Bouwt de deelbare link zelf op (zie genereerDiscordMelding). Vast adres van het portaal zelf,
// in plaats van de huidige locatie van de pagina: zo blijft de link altijd correct, ook als de
// app ooit via een ander adres (bv. een preview-omgeving) bekeken wordt.
const PORTAAL_BASIS_URL = "https://unemi10.github.io/recherche-portaal/";
function portaalLink(dossierObj, doc){
  let hash = "#dossier=" + encodeURIComponent(dossierObj.id);
  if (doc && doc.id) hash += "&doc=" + encodeURIComponent(doc.id);
  return PORTAAL_BASIS_URL + hash;
}
// Past een eventuele pendingDeepLink toe zodra er een sessie is: navigeert naar het juiste
// dossier en, indien meegegeven, opent meteen het juiste document. Geeft true terug als er
// effectief iets toegepast werd.
function pasPendingDeepLinkToe(session){
  if (!pendingDeepLink) return false;
  const doel = pendingDeepLink;
  pendingDeepLink = null;
  history.replaceState(null, "", location.pathname + location.search);
  const dossierObj = db.dossiers.find(d => d.id === doel.dossierId);
  if (!dossierObj) return false;
  go("dossiers", { dossierId: dossierObj.id, dossierTab: "tijdlijn" });
  if (doel.docId){
    const doc = (dossierObj.documenten || []).find(x => x.id === doel.docId);
    if (doc) setTimeout(() => openDocDetail(doc, dossierObj, session), 50);
  }
  return true;
}

/* ---------------- helpers ---------------- */
function el(html){
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}
function fmtDateInput(raw){
  const d = String(raw || "").replace(/[^0-9]/g, "").slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "/" + d.slice(2, 4);
  if (d.length > 4) out += "/" + d.slice(4, 8);
  return out;
}
function nuAlsDatum(){
  const n = new Date();
  const pad = (x) => String(x).padStart(2, "0");
  return `${pad(n.getDate())}/${pad(n.getMonth() + 1)}/${n.getFullYear()}`;
}
function nuAlsDatumTijd(){
  const n = new Date();
  const pad = (x) => String(x).padStart(2, "0");
  return `${nuAlsDatum()} ${pad(n.getHours())}:${pad(n.getMinutes())}`;
}
// Centrale activiteitenlog (Beheer &mdash; tabblad "Activiteitenlog"): elke belangrijke mutatie
// (document/dossier/lid/betrokkene/voertuig aanmaken, bewerken of verwijderen) roept dit aan met
// wie het deed, wat er gebeurde en, indien van toepassing, in welk dossier. De lijst wordt
// begrensd op de laatste 300 items zodat het Firestore-document niet onbeperkt aangroeit.
function logActiviteit(session, actie, dossierNaam){
  if (!db.activiteitenlog) db.activiteitenlog = [];
  db.activiteitenlog.unshift({
    tijdstip: nuAlsDatumTijd(),
    actor: (session && session.naam) || "Onbekend",
    actie,
    dossierNaam: dossierNaam || ""
  });
  if (db.activiteitenlog.length > 300) db.activiteitenlog.length = 300;
}
function fmtTimeInput(raw){
  const d = String(raw || "").replace(/[^0-9]/g, "").slice(0, 4);
  let out = d.slice(0, 2);
  if (d.length > 2) out += ":" + d.slice(2, 4);
  return out;
}
// Controleert of een datum-string een volledig ingetypte, kalenderkundig bestaande DD/MM/JJJJ-
// datum is (dus geen 31/02, geen 00/00, geen jaartal buiten een redelijk bereik). Een lege string
// is toegestaan: veel datumvelden zijn optioneel en worden bij opslaan de placeholder "&ndash;".
// Een onvolledig ingetypte datum (bv. nog maar "12/3") is wél ongeldig: die mag niet stilletjes
// als "12/03/....." bewaard worden.
function datumIsGeldig(str){
  const s = String(str || "").trim();
  if (!s) return true;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return false;
  const dd = +m[1], mm = +m[2], yyyy = +m[3];
  if (yyyy < 1900 || yyyy > 2200) return false;
  const dt = new Date(yyyy, mm - 1, dd);
  return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
}
// Zelfde soort controle voor UU:MM (uren 00-23, minuten 00-59). Ook hier is leeg toegestaan.
function tijdIsGeldig(str){
  const s = String(str || "").trim();
  if (!s) return true;
  const m = /^(\d{2}):(\d{2})$/.exec(s);
  if (!m) return false;
  const hh = +m[1], mi = +m[2];
  return hh <= 23 && mi <= 59;
}
// Zet live een rode rand op een datum/tijd-veld zodra de ingetypte waarde volledig lijkt
// (8 cijfers voor een datum, 4 voor een tijd) maar toch ongeldig is &mdash; blokkeert het typen
// zelf niet. Het echte tegenhouden van opslaan gebeurt per formulier met datumIsGeldig/tijdIsGeldig.
function markeerVeldGeldigheid(input, waarde, isGeldigFn){
  const cijfers = String(waarde || "").replace(/[^0-9]/g, "").length;
  const verwacht = isGeldigFn === tijdIsGeldig ? 4 : 8;
  const toonFout = cijfers >= verwacht && !isGeldigFn(waarde);
  input.classList.toggle("veld-ongeldig", toonFout);
}
// Zet DD/MM/JJJJ (+ optioneel UU:MM) om in een sorteerbare sleutel; onbekende/placeholder-datums (bv. "&ndash;")
// komen achteraan terecht, zodat items met een echte datum altijd chronologisch vooraan staan.
function dateSortKey(datum, tijd){
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(datum || "").trim());
  if (!m) return Infinity;
  const [, dd, mm, yyyy] = m;
  const t = /^(\d{2}):(\d{2})$/.exec(String(tijd || "").trim());
  const hh = t ? t[1] : "00", min = t ? t[2] : "00";
  return Number(yyyy + mm + dd + hh + min);
}
function sortChronologisch(items, getDatum, getTijd){
  return items.map((x, i) => ({ x, i })).sort((a, b) => {
    const diff = dateSortKey(getDatum(a.x), getTijd(a.x)) - dateSortKey(getDatum(b.x), getTijd(b.x));
    return diff !== 0 ? diff : a.i - b.i;
  }).map(e => e.x);
}
// Vaste volgorde van de betrokkene-tags &mdash; zowel in de keuzelijst bij toevoegen als in elke
// weergave (dossierdetail, export) worden betrokkenen zo gegroepeerd getoond.
const BETROKKENE_TAG_VOLGORDE = ["Verdachte", "Slachtoffer", "Bron/Getuige", "Melder", "Andere"];
function sortBetrokkenen(list){
  return list.map((x, i) => ({ x, i })).sort((a, b) => {
    const diff = BETROKKENE_TAG_VOLGORDE.indexOf(a.x.tag) - BETROKKENE_TAG_VOLGORDE.indexOf(b.x.tag);
    return diff !== 0 ? diff : a.i - b.i;
  }).map(e => e.x);
}
// ============================================================
// Lichte tekstopmaak voor verslag-tekstvakken (secties, bevindingen, notities, enz.).
// Opslag blijft gewone platte tekst met simpele markeringen (**vet**, _cursief_, ++onderlijnd++,
// "- " voor een opsomming) zodat de data eenvoudig en leesbaar blijft in Firestore. Weergave
// gebeurt altijd via renderOpgemaakteTekst(), die eerst HTML escaped (veiligheid tegen
// ingetypte tags) en pas daarna de markeringen omzet &mdash; ingetypte HTML verschijnt dus
// gewoon als platte tekst, nooit als actieve opmaak.
// ============================================================
function escapeHtml(str){
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function renderOpgemaakteTekst(tekst){
  if (!tekst) return "";
  // Tijdelijke plaatshouder voor een regeleinde ZOLANG we nog binnen hetzelfde opmaakblok zitten
  // (zie hieronder): zo'n plaatshouder is, anders dan een echte "\n", geen regex-regeleinde, en
  // laat "**vet**"/"_cursief_"/"++onderlijnd++" dus ook over meerdere regels/zinnen heen werken
  // (bv. een volledige alinea in één keer cursief maken), in plaats van enkel binnen één regel.
  const NL = "\u0001";
  const inline = (blok) => escapeHtml(blok)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\+\+(.+?)\+\+/g, "<u>$1</u>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .split(NL).join("<br>");
  const regels = String(tekst).split("\n");
  const blokken = [];
  regels.forEach(regel => {
    const m = /^\s*-\s+(.*)$/.exec(regel);
    if (m){
      const laatste = blokken[blokken.length - 1];
      if (laatste && laatste.type === "lijst") laatste.items.push(m[1]);
      else blokken.push({ type: "lijst", items: [m[1]] });
    } else {
      const laatste = blokken[blokken.length - 1];
      if (laatste && laatste.type === "regel") laatste.regels.push(regel);
      else blokken.push({ type: "regel", regels: [regel] });
    }
  });
  const html = blokken.map(b => b.type === "lijst"
    ? `<ul>${b.items.map(i => `<li>${inline(i)}</li>`).join("")}</ul>`
    : inline(b.regels.join(NL)) + "<br>"
  ).join("");
  return html.replace(/<br>$/, "");
}
// Past een inline opmaakmarkering (bv. **...**) toe op de huidige selectie in de textarea. Staat
// de selectie (of de tekst er net buiten) al tussen diezelfde markeringen, dan wordt de opmaak er
// net afgehaald in plaats van een tweede keer toegevoegd &mdash; zo werkt nogmaals klikken/
// nogmaals de sneltoets indrukken als een echte aan/uit-schakelaar, zoals in Word of Google Docs.
function toggleInlineOpmaak(textarea, before, after){
  textarea.focus();
  const start = textarea.selectionStart, end = textarea.selectionEnd;
  const waarde = textarea.value;
  const voorMatch = waarde.slice(Math.max(0, start - before.length), start) === before;
  const naMatch = waarde.slice(end, end + after.length) === after;
  if (voorMatch && naMatch){
    const nieuweStart = start - before.length;
    const nieuweEnd = end + after.length;
    textarea.value = waarde.slice(0, nieuweStart) + waarde.slice(start, end) + waarde.slice(nieuweEnd);
    textarea.selectionStart = nieuweStart;
    textarea.selectionEnd = nieuweStart + (end - start);
  } else {
    const selectie = waarde.slice(start, end) || "tekst";
    const vervanging = before + selectie + after;
    textarea.value = waarde.slice(0, start) + vervanging + waarde.slice(end);
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selectie.length;
  }
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}
// Voegt een balkje met opmaakknoppen toe vlak voor de meegegeven textarea, en koppelt meteen ook
// de bijhorende sneltoetsen (Ctrl+B/I/U, of Cmd+B/I/U op Mac) aan diezelfde textarea. Werkt op de
// tekstselectie van de gebruiker (of voegt markeringen rond de cursor in als er niets
// geselecteerd is) en stuurt daarna een "input"-event, zodat de bestaande input-listener
// op de textarea de state gewoon bijwerkt &mdash; geen aparte opslaglogica nodig per aanroepplaats.
function maakOpmaakToolbar(textarea){
  const bar = document.createElement("div");
  bar.className = "opmaak-toolbar";
  const knoppen = [
    { html: "<b>V</b>", titel: "Vet (Ctrl+B)", before: "**", after: "**", sneltoets: "b" },
    { html: "<i>I</i>", titel: "Cursief (Ctrl+I)", before: "_", after: "_", sneltoets: "i" },
    { html: "<u>O</u>", titel: "Onderlijnd (Ctrl+U)", before: "++", after: "++", sneltoets: "u" },
    { html: "&bull;", titel: "Opsomming", lijst: true }
  ];
  knoppen.forEach(k => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "opmaak-btn";
    btn.title = k.titel;
    btn.innerHTML = k.html;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (k.lijst){
        textarea.focus();
        const start = textarea.selectionStart, end = textarea.selectionEnd;
        const waarde = textarea.value;
        const voorRegelStart = waarde.lastIndexOf("\n", start - 1) + 1;
        let naRegelEnd = waarde.indexOf("\n", end);
        if (naRegelEnd === -1) naRegelEnd = waarde.length;
        const blok = waarde.slice(voorRegelStart, naRegelEnd);
        const nieuwBlok = blok.split("\n").map(r => /^\s*-\s+/.test(r) ? r : (r ? "- " + r : r)).join("\n");
        textarea.value = waarde.slice(0, voorRegelStart) + nieuwBlok + waarde.slice(naRegelEnd);
        textarea.selectionStart = voorRegelStart;
        textarea.selectionEnd = voorRegelStart + nieuwBlok.length;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        toggleInlineOpmaak(textarea, k.before, k.after);
      }
    });
    bar.appendChild(btn);
  });
  textarea.addEventListener("keydown", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    const knop = knoppen.find(k => !k.lijst && k.sneltoets === e.key.toLowerCase());
    if (!knop) return;
    e.preventDefault();
    toggleInlineOpmaak(textarea, knop.before, knop.after);
  });
  textarea.parentNode.insertBefore(bar, textarea);
  return bar;
}
// Hangt een opmaakbalkje boven elke textarea met de opgegeven CSS-klasse binnen "container".
// Wordt na elke render_() van een formulier aangeroepen (net als de andere wireEvents-stappen).
function wireOpmaakToolbars(container, selector){
  container.querySelectorAll(selector).forEach(ta => {
    if (ta.dataset.opmaakGewired) return;
    ta.dataset.opmaakGewired = "1";
    maakOpmaakToolbar(ta);
  });
}

// ============================================================
// Foto's — elke foto wordt vóór opslag in de browser verkleind/gecomprimeerd en als eigen klein
// document bewaard in de Firestore-collectie "recherche_fotos" (gratis Spark-plan, geen Storage/
// Blaze-abonnement nodig). Overal in dossiers/verslagen wordt enkel het foto-ID bijgehouden
// (in een reeks zoals vroeger het aantal bijgehouden werd); de echte beeldgegevens worden pas
// opgehaald wanneer een foto ook getoond moet worden, en dan in het geheugen gecached.
// ============================================================
function genereerFotoId(){
  return "f" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
// Zelfde soort uniek ID, maar dan voor een aanvulling bij een document (zie verderop bij
// vindLeefDoc/openAanvullingForm waarom dit nodig is).
function genereerAanvullingId(){
  return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
// Zelfde soort unieke ID's, voor betrokkenen/voertuigen (zie vindLeefBetrokkene/vindLeefVoertuig
// hierboven): die hadden voordien geen eigen ID en werden enkel via array-referentie herkend,
// wat kwetsbaar is voor dezelfde "stale db"-opslagbug als bij aanvullingen.
function genereerBetrokkeneId(){
  return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function genereerVoertuigId(){
  return "v" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
// Leest een gekozen bestand in, tekent het verkleind op een canvas en levert het resultaat als
// JPEG-base64 op (ruim voldoende leesbaar voor een dossier, maar typisch maar enkele tientallen
// tot ~150 KB groot, zodat we ruim binnen de gratis Firestore-limieten blijven).
function comprimeerFoto(file, maxBreedte, kwaliteit){
  maxBreedte = maxBreedte || 900;
  kwaliteit = kwaliteit || 0.6;
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith("image/")){ reject(new Error("Geen afbeeldingsbestand.")); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("Kon bestand niet lezen."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Kon de afbeelding niet lezen."));
      img.onload = () => {
        const schaal = Math.min(1, maxBreedte / img.width);
        const w = Math.max(1, Math.round(img.width * schaal));
        const h = Math.max(1, Math.round(img.height * schaal));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", kwaliteit));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
// Comprimeert en uploadt een foto als nieuw document; levert het gegenereerde foto-ID op zodra
// het klaar is (dat ID wordt dan ergens in db.* bijgehouden, bv. in een secties[i].fotos-reeks).
function uploadFoto(file, session){
  if (!fotosCollectionRef) return Promise.reject(new Error("Geen databaseverbinding."));
  return comprimeerFoto(file).then(dataUrl => {
    const id = genereerFotoId();
    return fotosCollectionRef.doc(id).set({
      data: dataUrl,
      doorId: (session && session.id) || null,
      opTijdstip: new Date().toISOString()
    }).then(() => id);
  });
}
// Verwijdert een foto effectief uit de aparte recherche_fotos-verzameling in Firestore (niet enkel
// de verwijzing ernaar). Fire-and-forget: de gebruiker hoeft hier niet op te wachten, en als het
// toevallig faalt (bv. kort internetprobleem) blijft het hooguit een weeskopie &mdash; geen dataverlies
// aan de kant van de gebruiker, die ziet gewoon dat de foto weg is uit het verslag.
function verwijderFoto(id){
  if (!fotosCollectionRef || !id) return;
  delete fotoCache[id];
  fotosCollectionRef.doc(id).delete().catch(err => console.error("Foto verwijderen uit database mislukt:", err));
}
// Verzamelt alle foto-ID's die ergens in één document hangen (hoofdfoto's, per sectie/locatie,
// aanvullingen, de verdachten/pand-foto's van een Bijstandsaanvraag), zodat ze bij het verwijderen
// van dat document ook effectief uit recherche_fotos gehaald kunnen worden in plaats van weeskopie
// te worden.
function fotoIdsVanDoc(doc){
  const ids = [];
  if (doc.foto_s) ids.push(...doc.foto_s);
  if (doc.secties) doc.secties.forEach(s => { if (s.fotos) ids.push(...s.fotos); });
  if (doc.locaties) doc.locaties.forEach(l => { if (l.foto_s) ids.push(...l.foto_s); });
  if (doc.aanvullingen) doc.aanvullingen.forEach(a => { if (a.foto_s) ids.push(...a.foto_s); });
  if (doc.verdachtenFotos) ids.push(...doc.verdachtenFotos);
  if (doc.pandFotos) ids.push(...doc.pandFotos);
  return ids;
}
// Idem, maar dan alle foto-ID's van een volledig dossier (betrokkenen, voertuigen, en alle
// documenten erin) &mdash; gebruikt bij het volledig verwijderen van een dossier.
function fotoIdsVanDossier(d){
  const ids = [];
  (d.betrokkenen || []).forEach(b => { if (b.fotos) ids.push(...b.fotos); });
  (d.voertuigen || []).forEach(v => { if (v.fotos) ids.push(...v.fotos); });
  (d.documenten || []).forEach(doc => ids.push(...fotoIdsVanDoc(doc)));
  return ids;
}
// Foto-ID's die tijdens het bewerken van een open formulier via het kruisje verwijderd zijn, maar
// pas effectief uit de database gehaald worden als het formulier ook echt opgeslagen wordt (anders
// zou annuleren een foto laten verdwijnen die nog ergens anders aan hing). Wordt bij het openen van
// elk formulier met een foto-widget gereset, en na een geslaagde opslag geleegd/effectief verwijderd.
let pendingVerwijderdeFotoIds = [];
function flushPendingVerwijderdeFotoIds(){
  pendingVerwijderdeFotoIds.forEach(verwijderFoto);
  pendingVerwijderdeFotoIds = [];
}
const fotoCache = {};
// Haalt (eenmalig, niet live) de beeldgegevens van een foto op en roept dan onGeladen(dataUrl) aan;
// bij een reeds gecachete foto gebeurt dat meteen en synchroon.
function laadFoto(id, onGeladen){
  if (fotoCache[id]){ onGeladen(fotoCache[id]); return; }
  if (!fotosCollectionRef) return;
  fotosCollectionRef.doc(id).get().then(snap => {
    if (snap.exists){
      fotoCache[id] = snap.data().data;
      onGeladen(fotoCache[id]);
    }
  }).catch(err => console.error("Foto laden mislukt:", err));
}
function openFotoLightbox(dataUrl){
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:300;display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out";
  const img = document.createElement("img");
  img.src = dataUrl;
  img.style.cssText = "max-width:100%;max-height:100%;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.5)";
  overlay.appendChild(img);
  overlay.addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
}
// Bewerkbaar foto-widgetje voor in formulieren: toont de al toegevoegde foto's (met een kruisje
// om te verwijderen) plus een "+"-knop om een nieuwe foto te kiezen, comprimeren en uploaden.
// "idsRef" is de array die in de form-state hoort (bv. state.secties[i].fotos) &mdash; wordt in
// place aangepast zodat de bestaande save-logica er niets van hoeft te weten.
function maakFotoWidget(container, idsRef, session){
  function tekenen(){
    container.innerHTML = "";
    idsRef.forEach((id, i) => {
      const thumb = document.createElement("div");
      thumb.className = "photothumb";
      thumb.title = "Klik om te verwijderen";
      thumb.style.backgroundSize = "cover";
      thumb.style.backgroundPosition = "center";
      laadFoto(id, (dataUrl) => { thumb.style.backgroundImage = `url(${dataUrl})`; });
      thumb.addEventListener("click", () => { pendingVerwijderdeFotoIds.push(id); idsRef.splice(i, 1); tekenen(); });
      container.appendChild(thumb);
    });
    const addBtn = document.createElement("div");
    addBtn.className = "photothumb";
    addBtn.textContent = "+";
    addBtn.title = "Foto toevoegen";
    addBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file"; input.accept = "image/*";
      input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;
        addBtn.textContent = "…";
        uploadFoto(file, session).then(id => { idsRef.push(id); tekenen(); }).catch(err => {
          console.error("Foto uploaden mislukt:", err);
          alert("Foto uploaden mislukt. Controleer je internetverbinding en probeer opnieuw.");
          addBtn.textContent = "+";
        });
      });
      input.click();
    });
    container.appendChild(addBtn);
  }
  tekenen();
}
// Niet-bewerkbare foto-galerij voor in detailweergaves/export: levert eerst lege plaatshouders op
// (de HTML-string) &mdash; roep na het invoegen in de pagina altijd wireFotosGalerij() aan op de
// omliggende container, zodat de echte beeldgegevens alsnog opgehaald en getoond worden.
function fotosGalerijHtml(ids, stijl){
  if (!ids || !ids.length) return "";
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;${stijl || "margin-top:8px"}">${ids.map(id => `<div class="pv-photo" data-foto-id="${id}"></div>`).join("")}</div>`;
}
function wireFotosGalerij(container){
  container.querySelectorAll("[data-foto-id]").forEach(el => {
    const id = el.dataset.fotoId;
    laadFoto(id, (dataUrl) => {
      el.style.backgroundImage = `url(${dataUrl})`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.cursor = "pointer";
      el.addEventListener("click", () => openFotoLightbox(dataUrl));
    });
  });
}
function memberName(id){ const m = db.members.find(x => x.id === id); return m ? m.naam : "?"; }
// Leden met "verborgen: true" komen nergens voor in een lijst, teller of keuzelijst (publieke
// Ledenlijst, Ledenbeheer, Toegangscodes, de "Aanwezigen"-picker, "toewijzen aan"-lijsten,
// statistieken, ...) &mdash; wel blijven ze gewoon inlogbaar en worden hun naam/acties normaal
// getoond via de losse lookups (memberName/memberLabel/getSession/...), die dit NIET filteren.
function zichtbareLeden(){
  return db.members.filter(m => !m.verborgen);
}
// Naam van een lid met de callsign ervoor (bv. "COBRA-3 | Unemi"), zoals in de ledenlijst en
// het ledenbeheer getoond wordt; zonder callsign gewoon de naam.
function naamMetCallsign(m){
  return m.callsign ? `${m.callsign} | ${m.naam}` : m.naam;
}
// Weergave van een lid-rol (ook "Rechercheur in opleiding") en de bijhorende chipkleur, en
// hetzelfde voor de ledenstatus &mdash; gedeeld tussen de publieke Ledenlijst en Ledenbeheer.
const ROL_LABEL = { leiding: "Leiding", opleiding: "Rechercheur in opleiding", lid: "Rechercheur", hoofdrechercheur: "Hoofdrechercheur" };
const ROL_CHIP_CLASS = { leiding: "chip-gold", opleiding: "chip-pending", lid: "chip-bronze", hoofdrechercheur: "chip-silver" };
function rolLabel(rol){ return ROL_LABEL[rol] || "Rechercheur"; }
function rolChipClass(rol){ return ROL_CHIP_CLASS[rol] || "chip-muted-light"; }
const STATUS_CHIP_CLASS = { "Actief": "chip-status-open", "Inactief": "chip-inactief", "Verlof": "chip-open" };
function statusChipClass(status){ return STATUS_CHIP_CLASS[status] || "chip-status-open"; }
// Gedeeld "Aanwezigen"-veld voor documentformulieren: losstaand van de auteur/opsteller, want wie
// het document opstelt is niet noodzakelijk wie er effectief bij was. Slaat lid-ID's op (niet
// namen), zodat dit blijft kloppen ook als een lid later hernoemd wordt.
function aanwezigenFieldHtml(selectedIds){
  const sorted = zichtbareLeden().sort((a, b) => (a.volgorde ?? 0) - (b.volgorde ?? 0));
  const pills = sorted.map(m => `<button type="button" class="aanwezige-pill${selectedIds.includes(m.id) ? " is-selected" : ""}" data-id="${m.id}">${naamMetCallsign(m)}</button>`).join("");
  return `<div class="field"><label>Aanwezigen (optioneel)</label>
    <div class="aanwezige-picker">${pills}</div>
    <div class="hint" style="margin-top:6px">Klik een lid aan/uit &mdash; losstaand van wie het document opstelt.</div>
  </div>`;
}
// Klik-toggle voor de aanwezigen-pillen: rechtstreeks op de knop, zonder volledige her-render
// (anders dan de meeste andere velden in deze formulieren, die wel via render_() lopen).
function wireAanwezigenPills(modalBody, state){
  modalBody.querySelectorAll(".aanwezige-pill").forEach(btn => btn.addEventListener("click", () => {
    const id = +btn.dataset.id;
    const i = state.aanwezigen.indexOf(id);
    if (i === -1) state.aanwezigen.push(id); else state.aanwezigen.splice(i, 1);
    btn.classList.toggle("is-selected");
  }));
}
// Toont "Aanwezigen" als eigen, volle-breedte blok met een tegel per lid (in plaats van één lange,
// kommagescheiden tekst) zodat het niet de pv-meta-rij (Opgesteld door / Datum / ...) verdrukt.
// Enkel getoond wanneer dit effectief ingevuld is; gedeeld tussen documentweergave en -export.
function aanwezigenMetaHtml(doc){
  if (!doc.aanwezigen || !doc.aanwezigen.length) return "";
  const chips = doc.aanwezigen.map(id => `<span class="pv-aanwezigen-chip">${naamMetCallsign(db.members.find(m => m.id === id) || { naam: "?" })}</span>`).join("");
  return `<div class="pv-aanwezigen"><div class="lbl">Aanwezigen</div><div class="pv-aanwezigen-chips">${chips}</div></div>`;
}
function memberLabel(id){
  const m = db.members.find(x => x.id === id);
  if (!m) return "?";
  return naamMetCallsign(m) + (m.discordId ? ` <span class="muted" style="font-size:11px">(Discord: ${m.discordId})</span>` : "");
}
function dossier(id){ return db.dossiers.find(d => d.id === id); }

/* ---------------- modal ---------------- */
function openModal(innerHtml, wide){
  const root = document.getElementById("modal-root");
  root.innerHTML = "";
  const backdrop = el(`<div class="modal-backdrop"><div class="modal ${wide ? "wide" : ""}">${innerHtml}</div></div>`);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  root.appendChild(backdrop);
}
function closeModal(){ document.getElementById("modal-root").innerHTML = ""; }
// Toont een klein, los popupje bovenop een eventueel al openstaand formulier (bv. de
// standaardtekst van de rechten bij een verhoor), zonder dat openstaande modal/formulier
// (met zijn nog niet-opgeslagen invoer) daarbij verloren gaat: dit hangt, anders dan
// openModal(), een EXTRA laag toe aan de pagina in plaats van modal-root leeg te maken.
function openInfoPopup(titel, bodyHtml){
  const overlay = el(`<div class="modal-backdrop" style="z-index:200">
    <div class="modal">
      <div class="modal-head"><h2>${titel}</h2><button class="modal-close" id="infoPopupClose">&times;</button></div>
      <div style="font-size:13px;line-height:1.7">${bodyHtml}</div>
    </div>
  </div>`);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector("#infoPopupClose").addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
}
// Korte, in eigen woorden samengevatte herinnering aan de rechten die een verdachte/ondervraagde
// voorafgaand aan een verhoor moet krijgen (gebaseerd op art. 47bis Wetboek van Strafvordering,
// de Belgische "Salduz"-regeling) &mdash; een geheugensteun, geen letterlijke wettekst.
const RECHTEN_STANDAARDTEKST = `
  <p style="margin-top:0">Voor het eerste verhoor moet de ondervraagde gewezen worden op onder meer volgende rechten:</p>
  <ul style="margin:0 0 14px 20px; padding:0">
    <li style="margin-bottom:6px">Vrije keuze: een verklaring afleggen, op vragen antwoorden, of zwijgen.</li>
    <li style="margin-bottom:6px">Niet verplicht worden zichzelf te beschuldigen.</li>
    <li style="margin-bottom:6px">Alles wat gezegd wordt, kan als bewijs gebruikt worden.</li>
    <li style="margin-bottom:6px">Recht op bijstand van een advocaat.</li>
    <li style="margin-bottom:6px">Recht op een tolk/vertaling als de proceduretaal niet begrepen of gesproken wordt.</li>
    <li style="margin-bottom:6px">Recht om op het einde van het verhoor kosteloos een kopie van de verklaring te vragen.</li>
    <li>Bij vrijheidsberoving: recht om iemand te laten verwittigen en recht op bijstand van een arts.</li>
  </ul>
  <div class="hint">Dit is een samenvatting als geheugensteun, geen letterlijke wettekst &mdash; raadpleeg bij twijfel art. 47bis Wetboek van Strafvordering.</div>
`;

// Vervangt window.confirm(): die wordt geblokkeerd in de sandboxed iframe waarin dit
// artifact draait (daar verschijnt nooit een popup en geeft confirm() altijd "false" terug,
// waardoor verwijderen leek te "niet werken"). Dit is een eigen, gestylede bevestigingsmodal.
function confirmModal(message, onConfirm, confirmLabel){
  openModal(`
    <div class="modal-head"><h2>Bevestigen</h2><button class="modal-close" id="mClose">&times;</button></div>
    <div style="font-size:13px;line-height:1.6;margin-bottom:20px">${message}</div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-ghost" id="cancelConfirmBtn">Annuleren</button>
      <button class="btn btn-danger" id="doConfirmBtn">${confirmLabel || "Verwijderen"}</button>
    </div>
  `);
  document.getElementById("mClose").addEventListener("click", closeModal);
  document.getElementById("cancelConfirmBtn").addEventListener("click", closeModal);
  document.getElementById("doConfirmBtn").addEventListener("click", () => {
    closeModal();
    onConfirm();
  });
}

/* ============================================================
   RENDER: navigatie
   ============================================================ */
function renderNav(){
  const session = getSession();
  const nav = document.getElementById("navlinks");
  nav.innerHTML = "";

  const items = [
    { key: "overons", label: "Over ons" },
    { key: "leden", label: "Ledenlijst" }
  ];
  if (session){
    items.push({ key: "dossiers", label: "Dossiers" });
    items.push({ key: "opleidingen", label: "Opleidingen" });
    if (magBeheerZien(session)) items.push({ key: "beheer", label: "Beheer" });
  }

  items.forEach(item => {
    const btn = el(`<button class="navlink ${view.tab === item.key ? "active" : ""}">${item.label}</button>`);
    btn.addEventListener("click", () => go(item.key));
    nav.appendChild(btn);
  });

  if (session){
    const who = el(`<div style="display:flex;align-items:center;gap:16px">
      <span id="wieBenIk" style="font-size:12px;color:var(--muted2);cursor:pointer;text-decoration:underline" title="Mijn toegangscode wijzigen">${session.naam}</span>
      <button class="btn btn-ghost btn-sm" id="logoutBtn">Afmelden</button>
    </div>`);
    nav.appendChild(who);
    who.querySelector("#wieBenIk").addEventListener("click", () => openWijzigCodeModal(session));
    who.querySelector("#logoutBtn").addEventListener("click", logout);
  } else {
    const loginBtn = el(`<button class="btn btn-gold btn-sm">Aanmelden</button>`);
    loginBtn.addEventListener("click", openLoginModal);
    nav.appendChild(loginBtn);
  }
}

function openLoginModal(){
  openModal(`
    <div class="modal-head"><h2>Aanmelden</h2><button class="modal-close" id="mClose">&times;</button></div>
    <div class="field"><label>Toegangscode</label><input id="codeInput" autofocus></div>
    <div id="loginError" style="color:var(--red);font-size:12px;margin-bottom:10px;display:none">Ongeldige toegangscode.</div>
    <button class="btn btn-gold" id="doLogin" style="width:100%;justify-content:center">Aanmelden</button>
  `);
  document.getElementById("mClose").addEventListener("click", closeModal);
  const doLogin = () => {
    const code = document.getElementById("codeInput").value;
    if (login(code)){
      closeModal();
      if (!pasPendingDeepLinkToe(getSession())) go("dossiers");
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  };
  document.getElementById("doLogin").addEventListener("click", doLogin);
  document.getElementById("codeInput").addEventListener("keydown", (e) => { if (e.key === "Enter") doLogin(); });
}

// Elk ingelogd lid kan zijn eigen toegangscode wijzigen naar iets persoonlijks, zodat de
// oorspronkelijk toegewezen code (vaak willekeurig gegenereerd) niet voorgoed hoeft te blijven.
function openWijzigCodeModal(session){
  const huidigeCode = (db.accessCodes.find(c => c.memberId === session.id) || {}).code || "";
  openModal(`
    <div class="modal-head"><h2>Mijn toegangscode wijzigen</h2><button class="modal-close" id="mClose">&times;</button></div>
    <div class="muted" style="font-size:13px;line-height:1.6;margin-bottom:14px">Huidige code: <strong>${huidigeCode}</strong>. Kies hieronder een nieuwe code (minstens 4 tekens, enkel letters en cijfers).</div>
    <div class="field"><label>Nieuwe toegangscode</label><input id="nieuweCodeInput" autofocus maxlength="20"></div>
    <div id="codeWijzigenError" style="color:var(--red);font-size:12px;margin-bottom:10px;display:none"></div>
    <button class="btn btn-gold" id="doWijzigCode" style="width:100%;justify-content:center">Opslaan</button>
  `);
  document.getElementById("mClose").addEventListener("click", closeModal);
  const doWijzig = () => {
    const errEl = document.getElementById("codeWijzigenError");
    errEl.style.display = "none";
    const nieuw = document.getElementById("nieuweCodeInput").value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (nieuw.length < 4){
      errEl.textContent = "De code moet minstens 4 letters/cijfers bevatten.";
      errEl.style.display = "block";
      return;
    }
    const bestaatAl = db.accessCodes.some(c => c.code === nieuw && c.memberId !== session.id);
    if (bestaatAl){
      errEl.textContent = "Deze code is al in gebruik door iemand anders. Kies een andere.";
      errEl.style.display = "block";
      return;
    }
    let entry = db.accessCodes.find(c => c.memberId === session.id);
    if (entry) entry.code = nieuw;
    else db.accessCodes.push({ code: nieuw, memberId: session.id });
    logActiviteit(session, "Eigen toegangscode gewijzigd");
    DB.save(db);
    closeModal();
    render();
  };
  document.getElementById("doWijzigCode").addEventListener("click", doWijzig);
  document.getElementById("nieuweCodeInput").addEventListener("keydown", (e) => { if (e.key === "Enter") doWijzig(); });
}

/* ============================================================
   RENDER: pagina's
   ============================================================ */
function renderApp(){
  const app = document.getElementById("app");
  app.innerHTML = "";

  if (view.tab === "overons") app.appendChild(renderOverOns());
  else if (view.tab === "leden") app.appendChild(renderLeden());
  else if (view.tab === "dossiers") app.appendChild(view.dossierId ? renderDossierDetail(view.dossierId) : renderDossierLijst(getSession()));
  else if (view.tab === "opleidingen") app.appendChild(renderOpleidingen());
  else if (view.tab === "beheer") app.appendChild(renderBeheer(getSession()));
  else app.appendChild(renderOverOns());
}

function renderOverOns(){
  const session = getSession();
  const openCount = db.dossiers.filter(d => d.status === "open").length;
  const opsporingCount = db.dossiers.filter(d => d.status === "open" && d.opsporing).length;
  const ledenCount = zichtbareLeden().length;
  const docCount = db.dossiers.reduce((sum, d) => sum + d.documenten.length, 0);

  const wrap = el(`
    <div>
      <div class="hero">
        <div class="hero-glow" aria-hidden="true"></div>
        <div class="hero-text">
          <span class="chip chip-gold">RECHERCHE &middot; BelgiëPD</span>
          <div class="hero-title">Onderzoek met<br>een vaste structuur</div>
          <div class="muted" style="font-size:15px;line-height:1.7;max-width:480px;margin:18px 0 26px">Van basisrechercheur tot specialisatie in observatie, technisch labo of gerichte opsporingen. Elk dossier chronologisch opgebouwd, consistent en herleesbaar &mdash; van eerste melding tot afsluiting.</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn-gold" id="heroCta"></button>
          </div>
        </div>
        <div class="hero-badge" aria-hidden="true">
          <img src="assets/logo.png" alt="" style="width:200px;height:200px;object-fit:contain">
        </div>
      </div>

      ${session ? `
      <div class="stat-row">
        <div class="stat-card"><div class="stat-num">${openCount}</div><div class="stat-lbl">Open dossiers</div></div>
        <div class="stat-card ${opsporingCount ? "stat-card-alert" : ""}"><div class="stat-num">${opsporingCount}</div><div class="stat-lbl">Actieve opsporingen</div></div>
        <div class="stat-card"><div class="stat-num">${ledenCount}</div><div class="stat-lbl">Leden in dienst</div></div>
        <div class="stat-card"><div class="stat-num">${docCount}</div><div class="stat-lbl">Documenten verwerkt</div></div>
      </div>
      ` : ""}

      <div class="section-title">Hoe een dossier verloopt</div>
      <div class="process-row">
        <div class="process-step">
          <div class="process-num">1</div>
          <div class="process-title">Melding</div>
          <div class="muted" style="font-size:12px;line-height:1.5">Info van interne of externe partners</div>
        </div>
        <div class="process-step">
          <div class="process-num">2</div>
          <div class="process-title">Onderzoek</div>
          <div class="muted" style="font-size:12px;line-height:1.5">Recherche start een dossier en bouwt deze op</div>
        </div>
        <div class="process-step">
          <div class="process-num">3</div>
          <div class="process-title">Specialisatie</div>
          <div class="muted" style="font-size:12px;line-height:1.5">OBN, CSI of GO versterkt waar nodig</div>
        </div>
        <div class="process-step">
          <div class="process-num">4</div>
          <div class="process-title">Tussenkomst</div>
          <div class="muted" style="font-size:12px;line-height:1.5">Al dan niet met hulp van partners</div>
        </div>
        <div class="process-step">
          <div class="process-num">5</div>
          <div class="process-title">Afsluiting</div>
          <div class="muted" style="font-size:12px;line-height:1.5">Dossier afronden met positieve resultaten</div>
        </div>
      </div>

      <div class="card" style="margin:28px 0 36px;display:flex;gap:20px;align-items:flex-start">
        <div class="about-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 3.5v5.2c0 5.6-3.4 9.2-8 11.3-4.6-2.1-8-5.7-8-11.3V5.5L12 2z" stroke="#d8b36a" stroke-width="1.6"/></svg>
        </div>
        <div>
          <div class="section-title" style="margin-bottom:10px">Over de dienst</div>
          <div style="font-size:14px;line-height:1.7" class="muted">
            De Recherche onderzoekt complexe dossiers binnen BelgiëPD, van eerste melding tot afsluiting. Iedereen start als basisrechercheur; na opleiding kan verder gespecialiseerd worden in Observatie (OBN), het technisch labo (CSI) of Gerichte Opsporingen (GO).
          </div>
        </div>
      </div>

      <div class="section-title" id="specSection">Specialisaties</div>
      <div class="org-wrap">
        <div class="card org-top-card">
          <div class="org-title">Basisrecherche</div>
          <div class="org-subtitle">Startpunt voor elk lid</div>
          <div class="muted" style="font-size:13px;line-height:1.6">Basisonderzoek, dossieropbouw en vaardigheden.<br>De fundering waaruit elke specialisatie verder groeit.</div>
        </div>
        <div class="org-stem"></div>
        <div class="org-row">
          <div class="org-branch">
            <div class="card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-bottom:8px"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="#d8b36a" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="#d8b36a" stroke-width="1.6"/></svg>
              <div style="font-size:15px;font-weight:700;margin-bottom:6px">OBN</div>
              <div class="org-subtitle">Observatie</div>
              <div class="muted" style="font-size:13px;line-height:1.5">Discreet volgen van doelwitten.</div>
            </div>
          </div>
          <div class="org-branch">
            <div class="card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-bottom:8px"><circle cx="10" cy="10" r="7" stroke="#d8b36a" stroke-width="1.6"/><line x1="15" y1="15" x2="21" y2="21" stroke="#d8b36a" stroke-width="1.8" stroke-linecap="round"/></svg>
              <div style="font-size:15px;font-weight:700;margin-bottom:6px">CSI</div>
              <div class="org-subtitle">Labo van Technische en Wetenschappelijke Politie</div>
              <div class="muted" style="font-size:13px;line-height:1.5">Sporenonderzoek.</div>
            </div>
          </div>
          <div class="org-branch">
            <div class="card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-bottom:8px"><circle cx="12" cy="12" r="9" stroke="#d8b36a" stroke-width="1.4"/><circle cx="12" cy="12" r="3.2" stroke="#d8b36a" stroke-width="1.4"/><line x1="12" y1="1" x2="12" y2="5" stroke="#d8b36a" stroke-width="1.4"/><line x1="12" y1="19" x2="12" y2="23" stroke="#d8b36a" stroke-width="1.4"/><line x1="1" y1="12" x2="5" y2="12" stroke="#d8b36a" stroke-width="1.4"/><line x1="19" y1="12" x2="23" y2="12" stroke="#d8b36a" stroke-width="1.4"/></svg>
              <div style="font-size:15px;font-weight:700;margin-bottom:6px">GO</div>
              <div class="org-subtitle">Gerichte Opsporingen</div>
              <div class="muted" style="font-size:13px;line-height:1.5">Versterkte huiszoekingen.<br>Tussenschakel met partners.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `);

  const cta = wrap.querySelector("#heroCta");
  if (session){
    cta.textContent = "Bekijk dossiers";
    cta.addEventListener("click", () => go("dossiers"));
  } else {
    cta.textContent = "Aanmelden om te starten";
    cta.addEventListener("click", openLoginModal);
  }
  return wrap;
}

function renderLeden(){
  const wrap = el(`<div>
    <div class="row" style="margin-bottom:18px">
      <div class="section-title" style="margin:0">Ledenlijst</div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="simple">
        <thead><tr><th>Status</th><th>Callsign</th><th>Naam</th><th>Rol</th><th>Specialisatie(s)</th></tr></thead>
        <tbody id="ledenBody"></tbody>
      </table>
    </div>
  </div>`);
  const body = wrap.querySelector("#ledenBody");
  zichtbareLeden().sort((a, b) => (a.volgorde ?? 0) - (b.volgorde ?? 0)).forEach(m => {
    body.appendChild(el(`<tr>
      <td><span class="chip ${statusChipClass(m.status)}">${m.status || "Actief"}</span></td>
      <td class="mono">${m.callsign || "&mdash;"}</td>
      <td style="font-weight:600">${m.naam}</td>
      <td><span class="chip ${rolChipClass(m.rol)}">${rolLabel(m.rol)}</span></td>
      <td>${m.specialisaties.map(s => `<span class="chip chip-muted" style="margin-right:6px">${s}</span>`).join("") || "&mdash;"}</td>
    </tr>`));
  });
  return wrap;
}

function renderOpleidingen(){
  return el(`
    <div>
      <div class="section-title">Opleidingen</div>
      <div class="card" style="border-color:var(--gold);background:linear-gradient(180deg,#171109,var(--panel));display:flex;align-items:center;gap:12px">
        <span class="chip chip-gold">Work in progress</span>
        <span class="muted" style="font-size:12px">Dit onderdeel is nog in ontwikkeling &mdash; inhoud en werking kunnen nog wijzigen.</span>
      </div>
    </div>
  `);
}

/* ---------------- Dossiers: lijst ---------------- */
function renderDossierLijst(session){
  const admin = isAdmin(session);
  const wrap = el(`<div>
    <div class="row" style="margin-bottom:18px">
      <div class="section-title" style="margin:0">Dossiers</div>
      ${admin ? `<button class="btn btn-gold btn-sm" id="newDossierBtn">+ Nieuw dossier</button>` : ""}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px" id="dossierRows"></div>
  </div>`);
  const newBtn = wrap.querySelector("#newDossierBtn");
  if (newBtn) newBtn.addEventListener("click", () => openOverzichtForm(null));
  const rows = wrap.querySelector("#dossierRows");
  // Open dossiers eerst, opsporingsdossiers (gezochte persoon) bovenaan binnen die groep; gesloten dossiers onderaan.
  const sorted = db.dossiers.slice().sort((a, b) => {
    const rank = x => (x.status === "open" ? 0 : 2) - (x.status === "open" && x.opsporing ? 1 : 0);
    return rank(a) - rank(b);
  });
  sorted.forEach(d => {
    const isClosed = d.status !== "open";
    const row = el(`<div class="card row ${isClosed ? "card-closed" : ""}" style="cursor:pointer;${d.opsporing ? "border-color:#5a2222" : ""}">
      <div style="display:flex;align-items:center;gap:16px">
        <div style="width:40px;height:40px;border-radius:10px;background:${d.opsporing ? "#2e1212" : "#1a1306"};display:flex;align-items:center;justify-content:center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="6" stroke="${d.opsporing ? "#e05f5f" : "#d8b36a"}" stroke-width="2"/><line x1="14.5" y1="14.5" x2="20" y2="20" stroke="${d.opsporing ? "#e05f5f" : "#d8b36a"}" stroke-width="2.4" stroke-linecap="round"/></svg>
        </div>
        <div>
          <div style="font-weight:700">${d.naam}</div>
          <div class="muted" style="font-size:12px">${d.typeDelict} &middot; geopend ${d.datumGeopend} &middot; ${d.verantwoordelijke}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        <span class="muted" style="font-size:12px">${d.documenten.length} documenten</span>
        ${(d.acties || []).filter(a => !a.voltooid).length ? `<span class="chip chip-gold">${(d.acties || []).filter(a => !a.voltooid).length} openstaande acties</span>` : ""}
        ${d.opsporing ? `<span class="chip chip-opsporing">OPSPORING</span>` : ""}
        <span class="chip ${d.status === "open" ? "chip-status-open" : "chip-closed"}">${d.status.toUpperCase()}</span>
        ${admin ? `<button class="btn btn-ghost btn-sm edit-dossier">Bewerken</button>` : ""}
      </div>
    </div>`);
    row.addEventListener("click", (e) => { if (!e.target.closest(".edit-dossier")) go("dossiers", { dossierId: d.id, dossierTab: "overzicht" }); });
    const editBtn = row.querySelector(".edit-dossier");
    if (editBtn) editBtn.addEventListener("click", (e) => { e.stopPropagation(); openOverzichtForm(d); });
    rows.appendChild(row);
  });
  return wrap;
}

/* ---------------- Dossiers: detail ---------------- */
function renderDossierDetail(id){
  const d = dossier(id);
  const session = getSession();
  const wrap = el(`<div>
    <button class="btn btn-ghost btn-sm" id="backBtn" style="margin-bottom:18px">&larr; Terug naar dossiers</button>
    <div class="row" style="margin-bottom:24px">
      <div>
        <div style="font-size:20px;font-weight:800">${d.naam}</div>
        <div class="muted" style="font-size:12px;margin-top:4px">${d.typeDelict}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn btn-ghost btn-sm" id="exportPdfBtn" title="Volledig dossier als PDF exporteren">Exporteer dossier (PDF)</button>
        ${d.opsporing ? `<span class="chip chip-opsporing">OPSPORING</span>` : ""}
        <span class="chip ${d.status === "open" ? "chip-status-open" : "chip-closed"}">${d.status.toUpperCase()}</span>
      </div>
    </div>
    <div style="display:flex;gap:6px;border-bottom:1px solid var(--border);margin-bottom:24px" id="dossierTabs"></div>
    <div id="dossierTabContent"></div>
  </div>`);

  wrap.querySelector("#backBtn").addEventListener("click", () => go("dossiers"));
  wrap.querySelector("#exportPdfBtn").addEventListener("click", () => exporteerDossierAlsPdf(d, session));

  const tabs = [
    { key: "overzicht", label: "Overzicht" },
    { key: "betrokkenen", label: "Betrokkenen" },
    { key: "voertuigen", label: "Voertuigen" },
    { key: "kaart", label: "Kaart" }
  ];
  // "tijdlijn", "documenten" en "bewijs" bestaan niet meer als aparte tabbladen; stuur oude
  // links/klikken naar het samengevoegde overzicht (documenten zitten daar al in).
  if (view.dossierTab === "tijdlijn" || view.dossierTab === "documenten" || view.dossierTab === "bewijs") view.dossierTab = "overzicht";
  const tabBar = wrap.querySelector("#dossierTabs");
  tabs.forEach(t => {
    const b = el(`<button class="navlink" style="padding:10px 14px;${view.dossierTab === t.key ? "color:var(--text);border-bottom:2px solid var(--gold)" : ""}">${t.label}</button>`);
    b.addEventListener("click", () => go("dossiers", { dossierId: id, dossierTab: t.key }));
    tabBar.appendChild(b);
  });

  const content = wrap.querySelector("#dossierTabContent");
  if (view.dossierTab === "overzicht") content.appendChild(dossierOverzichtTijdlijn(d, session));
  else if (view.dossierTab === "betrokkenen") content.appendChild(dossierBetrokkenen(d, session));
  else if (view.dossierTab === "voertuigen") content.appendChild(dossierVoertuigen(d, session));
  else if (view.dossierTab === "kaart") content.appendChild(dossierKaartTab(d, session));

  return wrap;
}

// Verzamelt alle postcodes die ergens in de chronologie van een dossier voorkomen (zowel het
// postcode-veld van een tussenkomst als de losse locaties van een OBN-verslag), telt hoe vaak
// elke postcode voorkomt, en koppelt ze aan de x/y-plekken uit assets/postcodes.js (dezelfde
// kaart/postcodebestand als de DISPATCHING/miniCAD-tool) om pins op de kaart te tonen.
function dossierPostcodeTellingen(d){
  const telling = {};
  (d.documenten || []).forEach(doc => {
    if (doc.postcode) telling[doc.postcode] = (telling[doc.postcode] || 0) + 1;
    if (doc.locaties) doc.locaties.forEach(l => { if (l.postcode) telling[l.postcode] = (telling[l.postcode] || 0) + 1; });
    if (doc.secties) doc.secties.forEach(s => { if (s.postcode) telling[s.postcode] = (telling[s.postcode] || 0) + 1; });
  });
  return telling;
}
// Schikt pin-labels die te dicht bij elkaar staan uit elkaar, zodat postcodes leesbaar blijven.
// De dot blijft altijd exact op zijn echte coördinaat staan; enkel het tekstlabel schuift (in een
// kleine waaier rond de dot) als er een andere pin te dichtbij staat. Moet draaien NA opname in de
// echte DOM (anders is getBoundingClientRect nog leeg) &mdash; vandaar telkens via requestAnimationFrame.
function dekonflicteerPinLabels(containerEl){
  if (!containerEl) return;
  const pins = Array.from(containerEl.querySelectorAll(".map-pin"));
  if (pins.length < 2) return;
  const info = pins.map(p => {
    const dot = p.querySelector(".map-pin-dot");
    const label = p.querySelector(".map-pin-label");
    const r = dot.getBoundingClientRect();
    return { label, cx: r.left + r.width / 2, cy: r.top + r.height / 2, eenheid: Math.max(r.width, 6) };
  });
  const gebruikt = new Set();
  info.forEach((a, i) => {
    if (gebruikt.has(i)) return;
    const minDist = a.eenheid * 3.2;
    const cluster = [a];
    gebruikt.add(i);
    info.forEach((b, j) => {
      if (i === j || gebruikt.has(j)) return;
      if (Math.hypot(a.cx - b.cx, a.cy - b.cy) < minDist){ cluster.push(b); gebruikt.add(j); }
    });
    if (cluster.length > 1){
      const radius = a.eenheid * 2.6;
      cluster.forEach((item, idx) => {
        const hoek = (idx / cluster.length) * Math.PI * 2 - Math.PI / 2;
        const dx = Math.cos(hoek) * radius;
        const dy = Math.sin(hoek) * radius * 0.7 - radius * 0.3;
        item.label.style.setProperty("--dx", `${dx}px`);
        item.label.style.setProperty("--dy", `${dy}px`);
      });
    }
  });
}
// Compacte kaart (enkel pins, geen legende) voor naast de chronologie in het Overzicht.
function dossierKaartCompactHtml(d){
  const telling = dossierPostcodeTellingen(d);
  const postcodes = Object.keys(telling);
  const plekken = window.POSTCODE_PLEKKEN || {};
  const gekend = postcodes.filter(pc => plekken[pc]);
  if (!postcodes.length){
    return `<div class="card"><div class="section-title">Kaart</div><div class="muted" style="font-size:13px">Nog geen postcodes geregistreerd in dit dossier.</div></div>`;
  }
  const pinsHtml = gekend.map(pc => `
    <div class="map-pin" style="left:${plekken[pc].x * 100}%;top:${plekken[pc].y * 100}%" title="Postcode ${pc} &middot; ${telling[pc]}x in dit dossier">
      <div class="map-pin-inner">
        <div class="map-pin-dot"></div>
        <div class="map-pin-label">${pc}</div>
      </div>
    </div>`).join("");
  return `
    <div class="card">
      <div class="section-title">Kaart</div>
      <div class="dossier-map-wrap dossier-map-wrap-sm">
        <img src="assets/kaart.jpg" alt="Kaart" class="dossier-map-img" width="3000" height="4500">
        ${pinsHtml}
      </div>
      <div class="hint" style="margin-top:10px">Zie tab &ldquo;Kaart&rdquo; voor details per locatie.</div>
    </div>`;
}
// Grote, interactieve kaart (eigen tab): klik op een pin toont de documenten die aan die
// postcode gekoppeld zijn (herbruikt docRow, zodat je meteen kan doorklikken naar het document).
function dossierKaartTab(d, session){
  const telling = dossierPostcodeTellingen(d);
  const postcodes = Object.keys(telling).sort();
  const plekken = window.POSTCODE_PLEKKEN || {};
  const gekend = postcodes.filter(pc => plekken[pc]);
  const ongekend = postcodes.filter(pc => !plekken[pc]);
  if (!postcodes.length){
    return el(`<div class="muted" style="font-size:13px">Nog geen postcodes geregistreerd in dit dossier &mdash; voeg een OBN-, CSI- of GO-verslag toe met een locatie/postcode.</div>`);
  }
  const wrap = el(`<div>
    <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start">
      <div class="dossier-map-viewport" id="kaartViewport">
        <div class="dossier-map-inner" id="kaartInner">
          <img src="assets/kaart.jpg" alt="Kaart" class="dossier-map-img" width="3000" height="4500">
        </div>
        <div class="map-zoom-controls">
          <div class="map-zoom-btn" id="kaartZoomIn" title="Inzoomen">+</div>
          <div class="map-zoom-btn" id="kaartZoomOut" title="Uitzoomen">&minus;</div>
          <div class="map-zoom-btn" id="kaartZoomReset" title="Reset">&#8634;</div>
        </div>
        <div class="map-zoom-hint">Scrollen of +/&minus; om te zoomen &middot; sleep om te verschuiven</div>
      </div>
      <div style="flex:1;min-width:260px">
        <div class="hint" style="margin-bottom:10px">Klik op een pin op de kaart voor de gekoppelde documenten</div>
        <div id="kaartUitleg"></div>
        ${ongekend.length ? `<div class="hint" style="margin-top:14px">${ongekend.length} postcode(s) niet gevonden op de kaart: ${ongekend.join(", ")}.</div>` : ""}
      </div>
    </div>
  </div>`);
  const viewport = wrap.querySelector("#kaartViewport");
  const inner = wrap.querySelector("#kaartInner");
  const uitlegWrap = wrap.querySelector("#kaartUitleg");
  function docsVoorPostcode(pc){
    return (d.documenten || []).filter(doc => doc.postcode === pc || (doc.locaties && doc.locaties.some(l => l.postcode === pc)) || (doc.secties && doc.secties.some(s => s.postcode === pc)));
  }
  // Toont meteen de inhoud die specifiek over deze postcode gaat (de tekst/foto's van die
  // locatie of sectie, of de bevindingen bij een tussenkomst), in plaats van enkel een kaartje
  // dat je dan nog moet openklikken. Een link onderaan laat nog toe het volledige document te
  // bekijken (bv. voor aanwezigen, sporen/inbeslagname, andere locaties in hetzelfde verslag).
  function postcodeInhoudHtml(doc, pc){
    if (doc.locaties){
      return doc.locaties.filter(l => l.postcode === pc).map(l => `
        <div style="margin-bottom:10px">
          <div class="muted" style="font-size:11px;margin-bottom:3px">${l.datum || ""} ${l.tijd || ""}</div>
          <div class="verslag-tekst">${renderOpgemaakteTekst(l.tekst) || `<span class="muted">Geen tekst ingevuld.</span>`}</div>
          ${fotosGalerijHtml(l.foto_s, "")}
        </div>`).join("");
    }
    if (doc.secties){
      return doc.secties.filter(s => s.postcode === pc).map(s => `
        <div style="margin-bottom:10px">
          ${s.kop ? `<div style="font-weight:600;font-size:13px;margin-bottom:3px">${escapeHtml(s.kop)}</div>` : ""}
          <div class="verslag-tekst">${renderOpgemaakteTekst(s.tekst) || `<span class="muted">Geen tekst ingevuld.</span>`}</div>
          ${fotosGalerijHtml(s.fotos, "")}
        </div>`).join("");
    }
    if (doc.postcode === pc){
      const rowsHtml = (doc.rows || []).filter(r => r.label || r.waarde).map(r => `<div style="font-size:13px;margin-bottom:2px"><strong>${escapeHtml(r.label)}</strong>${r.label && r.waarde ? " &mdash; " : ""}${escapeHtml(r.waarde)}</div>`).join("");
      return `
        <div style="margin-bottom:10px">
          <div class="verslag-tekst">${renderOpgemaakteTekst(doc.bevindingen) || `<span class="muted">Geen bevindingen ingevuld.</span>`}</div>
          ${fotosGalerijHtml(doc.foto_s, "")}
          ${rowsHtml ? `<div style="margin-top:8px">${rowsHtml}</div>` : ""}
        </div>`;
    }
    return "";
  }
  function toonUitleg(pc){
    inner.querySelectorAll(".map-pin").forEach(p => p.classList.toggle("map-pin-active", p.dataset.pc === pc));
    uitlegWrap.innerHTML = "";
    const titel = el(`<div class="section-title" style="margin-bottom:10px">Postcode ${pc} &middot; ${telling[pc]} document(en)</div>`);
    uitlegWrap.appendChild(titel);
    const docs = docsVoorPostcode(pc);
    if (!docs.length){
      uitlegWrap.appendChild(el(`<div class="muted" style="font-size:13px">Geen documenten gekoppeld.</div>`));
      return;
    }
    docs.forEach(doc => {
      const kaart = el(`<div class="card" style="margin-bottom:8px">
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
          <span class="chip ${docTypeChipClass(doc.type)}">${doc.type}</span>
          <span class="muted" style="font-size:11px">${doc.datum || ""} &middot; ${doc.auteur || ""}</span>
        </div>
        ${postcodeInhoudHtml(doc, pc)}
        <div class="hint doc-open-link" style="cursor:pointer;margin-top:4px">Volledig document openen &rarr;</div>
      </div>`);
      kaart.querySelector(".doc-open-link").addEventListener("click", () => openDocDetail(doc, d, session));
      wireFotosGalerij(kaart);
      uitlegWrap.appendChild(kaart);
    });
  }
  gekend.forEach(pc => {
    const pin = el(`<div class="map-pin map-pin-clickable" data-pc="${pc}" style="left:${plekken[pc].x * 100}%;top:${plekken[pc].y * 100}%" title="Postcode ${pc}">
      <div class="map-pin-inner">
        <div class="map-pin-dot"></div>
        <div class="map-pin-label">${pc}</div>
      </div>
    </div>`);
    pin.addEventListener("click", () => toonUitleg(pc));
    inner.appendChild(pin);
  });
  if (gekend.length) toonUitleg(gekend[0]);
  requestAnimationFrame(() => { centreerOpPins(); dekonflicteerPinLabels(inner); });

  // --- Zoom & pan op de kaart-viewport ---
  let scale = 1, tx = 0, ty = 0;
  const MIN_SCALE = 1, MAX_SCALE = 5;
  function clamp(){
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const iw = vw * scale, ih = (inner.offsetHeight || vh) * scale;
    const minTx = Math.min(0, vw - iw);
    const minTy = Math.min(0, vh - ih);
    tx = Math.max(minTx, Math.min(0, tx));
    ty = Math.max(minTy, Math.min(0, ty));
  }
  function pasPinSchaalAan(){
    // De kaart zelf schaalt 1:1 mee met de zoom; de pins zouden daardoor torenhoog en overlappend
    // worden. Daarom krijgen pins een gedempte tegen-schaling: ze groeien wel een beetje mee bij het
    // inzoomen (zodat het zoomen voelbaar blijft), maar veel minder dan de kaart zelf.
    const pinFactor = 1 / Math.sqrt(scale);
    inner.querySelectorAll(".map-pin-inner").forEach(p => { p.style.transform = `scale(${pinFactor})`; });
  }
  function apply(){
    clamp();
    inner.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    pasPinSchaalAan();
  }
  // Opent/herstelt de kaart niet op de linkerbovenhoek van de afbeelding, maar gecentreerd op de
  // postcode-pins van dit dossier (het gemiddelde van de verst uiteenliggende pins), zodat je
  // meteen ziet waar het dossier zich afspeelt in plaats van eerst te moeten zoeken/verslepen.
  function centreerOpPins(){
    scale = 1; tx = 0; ty = 0;
    if (gekend.length){
      const xs = gekend.map(pc => plekken[pc].x);
      const ys = gekend.map(pc => plekken[pc].y);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const vw = viewport.clientWidth, vh = viewport.clientHeight;
      const ih = inner.offsetHeight || vh;
      tx = vw / 2 - cx * vw;
      ty = vh / 2 - cy * ih;
    }
    apply();
  }
  function zoomAt(clientX, clientY, factor){
    const rect = viewport.getBoundingClientRect();
    const px = clientX - rect.left, py = clientY - rect.top;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    if (newScale === scale) return;
    const ratio = newScale / scale;
    tx = px - (px - tx) * ratio;
    ty = py - (py - ty) * ratio;
    scale = newScale;
    apply();
  }
  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.2 : 1 / 1.2;
    zoomAt(e.clientX, e.clientY, factor);
  }, { passive: false });
  wrap.querySelector("#kaartZoomIn").addEventListener("click", () => {
    const r = viewport.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.3);
  });
  wrap.querySelector("#kaartZoomOut").addEventListener("click", () => {
    const r = viewport.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.3);
  });
  wrap.querySelector("#kaartZoomReset").addEventListener("click", () => {
    centreerOpPins();
  });
  let panning = false, startX = 0, startY = 0, startTx = 0, startTy = 0;
  viewport.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".map-pin-clickable, .map-zoom-btn")) return;
    panning = true;
    startX = e.clientX; startY = e.clientY; startTx = tx; startTy = ty;
    viewport.classList.add("panning");
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!panning) return;
    tx = startTx + (e.clientX - startX);
    ty = startTy + (e.clientY - startY);
    apply();
  });
  function stopPan(){
    panning = false;
    viewport.classList.remove("panning");
  }
  viewport.addEventListener("pointerup", stopPan);
  viewport.addEventListener("pointercancel", stopPan);
  viewport.addEventListener("dblclick", (e) => {
    if (e.target.closest(".map-pin-clickable, .map-zoom-btn")) return;
    centreerOpPins();
  });
  return wrap;
}
function dossierOverzichtTijdlijn(d, session){
  const wrap = el(`<div>
    <div class="row" style="margin-bottom:0">
      <div></div>
      ${isAdmin(session) ? `<button class="btn btn-ghost btn-sm" id="editOverzichtBtn" style="margin-bottom:16px">Bewerken</button>` : ""}
    </div>
    <div class="card" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:22px;margin-bottom:20px">
      <div><div class="hint" style="text-transform:uppercase;font-weight:700">Type delict</div><div style="margin-top:4px">${d.typeDelict}</div></div>
      <div><div class="hint" style="text-transform:uppercase;font-weight:700">Status</div><div style="margin-top:4px;color:${d.status === "open" ? "var(--green)" : "var(--muted)"}">${d.status === "open" ? "Open" : "Gesloten"}</div></div>
      <div><div class="hint" style="text-transform:uppercase;font-weight:700">Verantwoordelijke</div><div style="margin-top:4px">${d.verantwoordelijke}</div></div>
      <div><div class="hint" style="text-transform:uppercase;font-weight:700">Datum geopend</div><div style="margin-top:4px">${d.datumGeopend}</div></div>
    </div>
    <div class="card" style="margin-bottom:20px"><div class="section-title">Samenvatting</div><div class="muted verslag-tekst">${renderOpgemaakteTekst(d.samenvatting)}</div></div>
    <div id="actiesEmbed"></div>
    <div style="display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap">
      <div style="flex:2;min-width:300px">
        <div class="row" style="margin-bottom:16px">
          <div class="section-title" style="margin:0">Chronologisch verloop</div>
          ${session ? `<button class="btn btn-gold btn-sm" id="addDocBtn">+ Document toevoegen</button>` : ""}
        </div>
        <div id="tijdlijnEmbed" class="tijdlijn-scroll-box"></div>
      </div>
      <div style="flex:1;min-width:220px">${dossierKaartCompactHtml(d)}</div>
    </div>
  </div>`);
  const editBtn = wrap.querySelector("#editOverzichtBtn");
  if (editBtn) editBtn.addEventListener("click", () => openOverzichtForm(d));
  const addDocBtn = wrap.querySelector("#addDocBtn");
  if (addDocBtn) addDocBtn.addEventListener("click", () => openDocTypePicker(d, session));
  renderActiesCard(wrap.querySelector("#actiesEmbed"), d, session);
  wrap.querySelector("#tijdlijnEmbed").appendChild(dossierTijdlijn(d, session, false));
  requestAnimationFrame(() => dekonflicteerPinLabels(wrap.querySelector(".dossier-map-wrap-sm")));
  return wrap;
}

// Takenlijst / openstaande acties voor dit dossier &mdash; tussen Samenvatting en het chronologisch
// verloop. Elke leiding (dus niet enkel een admin, in tegenstelling tot de rest van de
// dossierbewerking) mag acties toevoegen/verwijderen of aan iemand toewijzen; een actie afvinken
// mag door eender welke leiding, of door het toegewezen lid zelf voor zijn eigen actie &mdash;
// gewone leden (rol "lid") zien de lijst enkel.
function renderActiesCard(container, d, session){
  const canBeheer = !!(session && (session.rol === "leiding" || session.rol === "hoofdrechercheur" || isAdmin(session)));
  // Zie openSimpleDocForm hierboven: dit kaartje kan een tijdje zichtbaar blijven (bv. terwijl
  // iemand een nieuwe actie staat te typen) zonder dat de hele pagina opnieuw rendert, dus bij
  // elke mutatie hieronder altijd het live dossier via zijn ID opnieuw opzoeken.
  const dossierId = d.id;
  let toonVoltooid = false;
  function render_(){
    const acties = d.acties || [];
    const open = acties.filter(a => !a.voltooid);
    const voltooid = acties.filter(a => a.voltooid);
    const lijst = toonVoltooid ? acties : open;
    const rijenHtml = lijst.length ? lijst.map(a => {
      const toegewezenLid = a.toegewezenId ? db.members.find(m => m.id === a.toegewezenId) : null;
      const magAfvinken = canBeheer || (toegewezenLid && session && session.id === toegewezenLid.id);
      return `
        <div class="actie-row ${a.voltooid ? "is-voltooid" : ""}">
          <label class="actie-checkbox">
            <input type="checkbox" class="actie-check" data-id="${a.id}" ${a.voltooid ? "checked" : ""} ${magAfvinken ? "" : "disabled"}>
            <span class="actie-checkbox-box"></span>
          </label>
          <div class="actie-row-body">
            <div class="actie-row-tekst">${a.tekst}</div>
            <div class="actie-row-meta">
              <span class="chip chip-muted-light">${toegewezenLid ? naamMetCallsign(toegewezenLid) : "Niet toegewezen"}</span>
              <span class="muted">toegevoegd door ${a.aangemaaktDoor}</span>
            </div>
          </div>
          ${canBeheer ? `<span class="actie-del" data-id="${a.id}">Verwijderen</span>` : ""}
        </div>`;
    }).join("") : `<div class="muted" style="font-size:13px;padding:4px 0">Geen openstaande acties.</div>`;

    container.innerHTML = `
      <div class="card" style="margin-bottom:20px">
        <div class="row" style="margin-bottom:14px">
          <div class="section-title" style="margin:0">Takenlijst ${open.length ? `<span class="chip chip-gold" style="margin-left:8px;vertical-align:middle">${open.length} openstaand</span>` : ""}</div>
          ${voltooid.length ? `<span class="hint" id="toggleVoltooid" style="cursor:pointer;text-decoration:underline">${toonVoltooid ? "Verberg voltooide" : "Toon voltooide (" + voltooid.length + ")"}</span>` : ""}
        </div>
        <div id="actiesRijen" class="acties-lijst">${rijenHtml}</div>
        ${canBeheer ? `
        <div class="acties-toolbar">
          <input id="fNieuweActie" placeholder="Nieuwe actie toevoegen...">
          <select id="fActieToegewezen">
            <option value="">&mdash; niemand &mdash;</option>
            ${zichtbareLeden().filter(m => m.status === "Actief").map(m => `<option value="${m.id}">${m.naam}</option>`).join("")}
          </select>
          <button class="btn btn-gold btn-sm" id="addActieBtn">+ Toevoegen</button>
        </div>` : ""}
      </div>
    `;
    wire();
  }
  function wire(){
    const toggleBtn = container.querySelector("#toggleVoltooid");
    if (toggleBtn) toggleBtn.addEventListener("click", () => { toonVoltooid = !toonVoltooid; render_(); });
    container.querySelectorAll(".actie-check").forEach(cb => cb.addEventListener("change", (e) => {
      const liveDossierObj = vindLeefDossier(dossierId);
      if (!liveDossierObj){ render(); return; }
      const a = (liveDossierObj.acties || []).find(x => x.id === e.target.dataset.id);
      if (!a) return;
      a.voltooid = e.target.checked;
      logActiviteit(session, `Actie ${a.voltooid ? "afgevinkt" : "heropend"}: "${a.tekst}"`, liveDossierObj.naam);
      DB.save(db);
      render_();
    }));
    container.querySelectorAll(".actie-del").forEach(btn => btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      confirmModal("Deze actie verwijderen?", () => {
        const liveDossierObj = vindLeefDossier(dossierId);
        if (!liveDossierObj){ render(); return; }
        const a = (liveDossierObj.acties || []).find(x => x.id === id);
        liveDossierObj.acties = (liveDossierObj.acties || []).filter(x => x.id !== id);
        logActiviteit(session, `Actie verwijderd: "${a ? a.tekst : ""}"`, liveDossierObj.naam);
        DB.save(db);
        render_();
      });
    }));
    const addBtn = container.querySelector("#addActieBtn");
    if (addBtn) addBtn.addEventListener("click", () => {
      const input = container.querySelector("#fNieuweActie");
      const tekst = input.value.trim();
      if (!tekst) return;
      const liveDossierObj = vindLeefDossier(dossierId);
      if (!liveDossierObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); render(); return; }
      const toegewezenRaw = container.querySelector("#fActieToegewezen").value;
      if (!liveDossierObj.acties) liveDossierObj.acties = [];
      liveDossierObj.acties.push({
        id: "act" + (db.nextActieId++),
        tekst,
        voltooid: false,
        toegewezenId: toegewezenRaw ? +toegewezenRaw : null,
        aangemaaktDoor: session.naam,
        aangemaaktOp: nuAlsDatum()
      });
      logActiviteit(session, `Actie toegevoegd: "${tekst}"`, liveDossierObj.naam);
      DB.save(db);
      render_();
    });
  }
  render_();
}

function slugifyDossierNaam(naam){
  let base = naam.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "dossier";
  let slug = base, n = 2;
  while (db.dossiers.some(x => x.id === slug)){ slug = base + "-" + n; n++; }
  return slug;
}

function openOverzichtForm(d){
  const isNew = !d;
  // Zie openSimpleDocForm verderop: enkel het ID bewaren, bij opslaan/verwijderen altijd live opzoeken.
  const dossierId = d ? d.id : null;
  const obj = d || { id: null, naam: "", typeDelict: "", status: "open", verantwoordelijke: "", datumGeopend: "", samenvatting: "", opsporing: false, betrokkenen: [], voertuigen: [], documenten: [], acties: [] };
  openModal(`
    <div class="modal-head"><h2>${isNew ? "Nieuw dossier" : "Dossier bewerken"}</h2><button class="modal-close" id="mClose">&times;</button></div>
    <div class="field"><label>Naam dossier</label><input id="fNaam" value="${obj.naam}"></div>
    <div class="field"><label>Type delict</label><input id="fType" value="${obj.typeDelict}"></div>
    <div class="field"><label>Status</label>
      <select id="fStatus">
        <option value="open" ${obj.status === "open" ? "selected" : ""}>Open</option>
        <option value="gesloten" ${obj.status === "gesloten" ? "selected" : ""}>Gesloten</option>
      </select>
    </div>
    <div class="field"><label>Verantwoordelijke</label><input id="fVerantw" value="${obj.verantwoordelijke}"></div>
    <div class="field"><label>Datum geopend</label><input class="mono" id="fDatum" value="${obj.datumGeopend}" placeholder="DD/MM/JJJJ" maxlength="10"></div>
    <div class="field"><label>Samenvatting</label><textarea id="fSamenv" rows="4" style="resize:vertical">${obj.samenvatting}</textarea></div>
    <div class="field">
      <label style="font-size:13px;font-weight:400;text-transform:none;letter-spacing:0"><input type="checkbox" id="fOpsporing" ${obj.opsporing ? "checked" : ""}> Actieve opsporing &mdash; dossier krijgt een OPSPORING-badge en staat bovenaan de lijst</label>
    </div>
    <div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn btn-gold" id="saveOverzicht">Opslaan</button>
      ${!isNew ? `<button class="btn btn-danger" id="deleteDossier">Dossier verwijderen</button>` : ""}
    </div>
  `);
  document.getElementById("mClose").addEventListener("click", closeModal);
  document.getElementById("fDatum").addEventListener("input", (e) => { e.target.value = fmtDateInput(e.target.value); markeerVeldGeldigheid(e.target, e.target.value, datumIsGeldig); });
  maakOpmaakToolbar(document.getElementById("fSamenv"));
  document.getElementById("saveOverzicht").addEventListener("click", () => {
    const naam = document.getElementById("fNaam").value.trim();
    if (!naam) return;
    const typeDelict = document.getElementById("fType").value.trim();
    const status = document.getElementById("fStatus").value;
    const verantwoordelijke = document.getElementById("fVerantw").value.trim();
    const datumGeopend = document.getElementById("fDatum").value.trim();
    const samenvatting = document.getElementById("fSamenv").value.trim();
    const opsporing = document.getElementById("fOpsporing").checked;
    if (!datumIsGeldig(datumGeopend)){ alert("Datum geopend is geen geldige datum (DD/MM/JJJJ)."); return; }
    if (isNew){
      db.dossiers.push({
        id: slugifyDossierNaam(naam), naam, typeDelict, status, verantwoordelijke, datumGeopend, samenvatting, opsporing,
        betrokkenen: [], voertuigen: [], documenten: [], acties: []
      });
      logActiviteit(getSession(), `Dossier aangemaakt: "${naam}"`, naam);
    } else {
      const liveObj = vindLeefDossier(dossierId);
      if (!liveObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
      liveObj.naam = naam; liveObj.typeDelict = typeDelict; liveObj.status = status;
      liveObj.verantwoordelijke = verantwoordelijke; liveObj.datumGeopend = datumGeopend; liveObj.samenvatting = samenvatting;
      liveObj.opsporing = opsporing;
    }
    DB.save(db);
    closeModal();
    if (isNew) go("dossiers"); else render();
  });
  if (!isNew){
    document.getElementById("deleteDossier").addEventListener("click", () => {
      confirmModal(`Dossier "${obj.naam}" volledig verwijderen? Dit kan niet ongedaan gemaakt worden.`, () => {
        const liveObj = vindLeefDossier(dossierId);
        if (!liveObj){ go("dossiers"); return; }
        fotoIdsVanDossier(liveObj).forEach(verwijderFoto);
        db.dossiers = db.dossiers.filter(x => x.id !== dossierId);
        logActiviteit(getSession(), `Dossier verwijderd: "${liveObj.naam}"`, liveObj.naam);
        DB.save(db);
        go("dossiers");
      });
    });
  }
}

// --- Gelezen/ongelezen per document, en een kant-en-klare Discord-meldingstekst voor admins ---
function isDocOngelezen(doc, session){
  return !!session && Array.isArray(doc.gezienDoor) && !doc.gezienDoor.includes(session.id);
}
function markDocAlsGelezen(doc, session){
  if (!session) return;
  if (!Array.isArray(doc.gezienDoor)) doc.gezienDoor = [];
  if (!doc.gezienDoor.includes(session.id)){
    doc.gezienDoor.push(session.id);
    DB.save(db);
    render();
  }
}
function docTitelKort(doc){
  if (doc.titel) return doc.titel;
  if (doc.locaties) return `${doc.type} &ndash; ${doc.locaties.length} locatie(s)`;
  if (doc.tijdstippen) return `${doc.type} &ndash; postcode ${doc.postcode || "?"}`;
  return doc.type;
}
// Datum (+ tijdstip, met "om" ertussen) voor in een documentweergave &mdash; enkel "om UU:MM" als er
// effectief een tijdstip is.
function datumTijdHtml(doc){
  return doc.tijd ? `${doc.datum} om ${doc.tijd}` : doc.datum;
}
// De extra, vaste secties van een Bijstandsaanvraag (reden/context, info over de verdachten,
// beschrijving van het pand, dossierbeheerder(s)) &mdash; herbruikt in zowel de documentweergave
// als de PDF-export, zodat beide altijd dezelfde opbouw tonen.
function bijstandExtraHtml(doc){
  if (doc.type !== "Bijstandsaanvraag") return "";
  const blok = (label, tekst, fotoIds) => (tekst || (fotoIds && fotoIds.length)) ? `
    <div class="pv-loc">
      <div class="lbl">${label}</div>
      ${tekst ? `<div class="verslag-tekst" style="margin-top:8px">${renderOpgemaakteTekst(tekst)}</div>` : ""}
      ${fotosGalerijHtml(fotoIds, "margin-top:10px")}
    </div>` : "";
  return [
    blok("Reden / context &amp; omschrijving opdracht", doc.reden),
    blok("Informatie verdachten", doc.verdachtenInfo, doc.verdachtenFotos),
    blok("Beschrijving van het pand", doc.pand, doc.pandFotos),
    blok("Dossierbeheerder(s)", doc.dossierbeheerders)
  ].join("");
}
// Icoon per documenttype, enkel om de Discord-melding meteen visueel herkenbaar te maken.
const DISCORD_TYPE_EMOJI = {
  "Melding": "📣",
  "Algemeen verslag": "📄",
  "Bijkomende informatie": "ℹ️",
  "OBN-verslag": "👁️",
  "CSI-verslag": "🔬",
  "GO-verslag": "🚓",
  "Opdracht": "⚖️",
  "Verhoor-verslag": "🗣️",
  "Beschikbare resultaten": "📊",
  "TAP-dossier": "📞",
  "Bijstandsaanvraag": "🆘"
};
// Escaped Discord-opmaaktekens (*, _, ~, `) in vrije tekst, zodat een titel of aanvulling die
// toevallig zo'n teken bevat de opmaak van de melding hieronder niet doorbreekt.
function discordEscape(str){
  return String(str || "").replace(/([*_~`])/g, "\\$1");
}
// Kort, modern Discord-berichtje met een koptekst (###), een vetgedrukte meta-regel en de
// inhoud als citaat (>), afgesloten met een kleine subtekst-regel (-#) als call-to-action &mdash;
// allemaal standaard Discord-markdown, dus dit rendert mooi zodra het in Discord geplakt wordt.
// Geeft bewust geen inhoud van het document/de aanvulling mee &mdash; enkel waar het over gaat
// (type/auteur/datum) en een link naar het portaal zelf, zodat mensen die echt moeten doorklikken
// om de details te zien in plaats van alles al in Discord te kunnen lezen.
function genereerDiscordMelding(doc, dossierObj){
  const laatsteAanvulling = (doc.aanvullingen || []).length ? doc.aanvullingen[doc.aanvullingen.length - 1] : null;
  const emoji = DISCORD_TYPE_EMOJI[doc.type] || "📋";
  const auteur = discordEscape(doc.auteur);
  const meta = `**${doc.type}**${auteur ? " · " + auteur : ""} · ${doc.datum}${doc.tijd ? " " + doc.tijd : ""}`;
  const kop = laatsteAanvulling ? `### 📝 ${dossierObj.naam} — aanvulling` : `### ${emoji} ${dossierObj.naam} — nieuw document`;
  const link = portaalLink(dossierObj, doc);
  return `${kop}\n${meta}\n[👉 Bekijk in het portaal](${link})`;
}
function copyToClipboard(tekst, btn){
  const toon = (ok) => {
    if (!btn) return;
    const origineel = btn.textContent;
    btn.textContent = ok ? "Gekopieerd!" : "Kopiëren mislukt";
    setTimeout(() => { btn.textContent = origineel; }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(tekst).then(() => toon(true)).catch(() => toon(false));
  } else {
    toon(false);
  }
}

function docTypeChipClass(type){
  if (type === "Observatieverslag" || type === "Verhoor-verslag" || VERSLAG_DOC_TYPES.includes(type) || (type && type.indexOf("Cobra") === 0)) return "chip-type";
  if (type === "Antwoord onderzoekshandeling") return "chip-open";
  if (type && type.indexOf("Resultaat") === 0) return "chip-open";
  if (type === "Beschikbare resultaten") return "chip-open";
  if (type === "Opdracht") return "chip-gold";
  if (type === "Melding") return "chip-status-open";
  if (type === "Algemeen verslag") return "chip-muted-light";
  if (type === "Bijkomende informatie") return "chip-muted-light";
  if (type === "TAP-dossier") return "chip-alert";
  if (type === "Bijstandsaanvraag") return "chip-gold";
  return "chip-muted";
}

function docRow(doc, dossierObj, session){
  const ongelezen = isDocOngelezen(doc, session);
  const row = el(`<div class="card ${ongelezen ? "doc-unread" : ""}" style="display:flex;gap:16px;align-items:flex-start;${doc.pending ? "border-style:dashed;opacity:.75" : ""};margin-bottom:8px;cursor:pointer">
    <div style="flex:0 0 92px">
      <div style="font-size:12px;font-weight:600">${doc.datum}</div>
      <div class="muted" style="font-size:11px">${doc.tijd || ""}</div>
    </div>
    <div style="flex:1">
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:4px">
        ${ongelezen ? `<span class="doc-unread-dot" title="Nog niet geopend"></span>` : ""}
        <span class="chip ${docTypeChipClass(doc.type)}">${doc.type === "Opdracht" && doc.afkomstigVan ? (doc.type + " &ndash; " + doc.afkomstigVan) : doc.type}</span>
        ${doc.pending ? `<span class="chip chip-pending">In afwachting</span>` : ""}
        ${ongelezen ? `<span class="chip chip-gold">Nieuw</span>` : ""}
      </div>
      <div style="font-size:13px;font-weight:600">${docTitelKort(doc)}</div>
      <div class="muted" style="font-size:11px;margin-top:3px">${doc.auteur || ""}</div>
    </div>
  </div>`);
  row.addEventListener("click", () => openDocDetail(doc, dossierObj, session));
  return row;
}

function dossierTijdlijn(d, session, showAddButton){
  if (showAddButton === undefined) showAddButton = true;
  const wrap = el(`<div></div>`);
  if (session && showAddButton){
    const addBtn = el(`<button class="btn btn-gold btn-sm" style="margin-bottom:16px">+ Document toevoegen</button>`);
    addBtn.addEventListener("click", () => openDocTypePicker(d, session));
    wrap.appendChild(addBtn);
  }
  // Op het scherm tonen we nieuwste eerst (handig om snel de laatste stand van zaken te zien
  // in een actief dossier); de PDF-export (genereerDossierExportHtml/genereerDocumentExportHtml)
  // blijft wel chronologisch oud-naar-nieuw, zoals een PV als verhaal hoort te lezen.
  const chronologisch = sortChronologisch(d.documenten, x => x.datum, x => x.tijd).reverse();
  chronologisch.forEach(doc => wrap.appendChild(docRow(doc, d, session)));
  if (!d.documenten.length) wrap.appendChild(el(`<div class="muted" style="font-size:13px">Nog geen documenten in dit dossier.</div>`));
  return wrap;
}
function dossierBetrokkenen(d, session){
  // Bewerken/verwijderen van een bestaande betrokkene blijft admin-only, maar elk ingelogd lid mag
  // een nieuwe betrokkene toevoegen (bv. na een vaststelling of tussenkomst).
  const canEdit = isAdmin(session);
  const dossierId = d.id;
  const wrap = el(`<div></div>`);
  const addBtn = el(`<button class="btn btn-gold btn-sm" style="margin-bottom:16px">+ Betrokkene toevoegen</button>`);
  addBtn.addEventListener("click", () => openBetrokkeneForm(d, null));
  wrap.appendChild(addBtn);
  if (!d.betrokkenen.length) wrap.appendChild(el(`<div class="muted" style="font-size:13px">Geen betrokkenen geregistreerd.</div>`));
  sortBetrokkenen(d.betrokkenen).forEach(b => {
    const row = el(`<div class="card" style="display:flex;gap:14px;align-items:flex-start;margin-bottom:8px">
      <div class="persoonthumb">&#128100;</div>
      <div style="flex:1">
        <div class="row" style="margin-bottom:0">
          <div><div style="font-weight:600;font-size:13px">${b.naam}</div><div class="muted" style="font-size:11px">${b.detail}</div></div>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="chip ${b.tagClass}">${b.tag}</span>
            ${canEdit ? `<button class="btn btn-ghost btn-sm edit-b">Bewerken</button><button class="btn btn-danger btn-sm del-b">Verwijderen</button>` : ""}
          </div>
        </div>
        ${b.signalement ? `<div class="muted verslag-tekst" style="font-size:12px;margin-top:8px">${renderOpgemaakteTekst(b.signalement)}</div>` : ""}
        ${fotosGalerijHtml(b.fotos)}
      </div>
    </div>`);
    wireFotosGalerij(row);
    if (canEdit){
      row.querySelector(".edit-b").addEventListener("click", () => {
        const live = vindLeefBetrokkene(dossierId, b.id);
        if (!live){ render(); return; }
        openBetrokkeneForm(live.dossierObj, live.betrokkene);
      });
      row.querySelector(".del-b").addEventListener("click", () => {
        confirmModal("Deze betrokkene verwijderen?", () => {
          const live = vindLeefBetrokkene(dossierId, b.id);
          if (!live){ render(); return; }
          (live.betrokkene.fotos || []).forEach(verwijderFoto);
          live.dossierObj.betrokkenen = live.dossierObj.betrokkenen.filter(x => x.id !== b.id);
          DB.save(db); render();
        });
      });
    }
    wrap.appendChild(row);
  });
  return wrap;
}

function openBetrokkeneForm(d, betrokkene){
  pendingVerwijderdeFotoIds = [];
  // Zie openSimpleDocForm hierboven: enkel ID's bewaren, bij opslaan altijd live opzoeken.
  const dossierId = d.id;
  const betrokkeneId = betrokkene ? betrokkene.id : null;
  const isNew = !betrokkene;
  const b = betrokkene || { naam: "", detail: "", tag: "Verdachte", tagClass: "chip-wanted", signalement: "", fotos: [] };
  const state = { fotos: (b.fotos || []).slice() };
  const tagOptions = [
    { tag: "Verdachte", cls: "chip-wanted" },
    { tag: "Slachtoffer", cls: "chip-open" },
    { tag: "Bron/Getuige", cls: "chip-open" },
    { tag: "Melder", cls: "chip-open" },
    { tag: "Andere", cls: "chip-muted" }
  ];
  openModal(`
    <div class="modal-head"><h2>${isNew ? "Betrokkene toevoegen" : "Betrokkene bewerken"}</h2><button class="modal-close" id="mClose">&times;</button></div>
    <div class="field"><label>Naam</label><input id="fNaam" value="${b.naam}"></div>
    <div class="field"><label>Detail</label><input id="fDetail" value="${b.detail}"></div>
    <div class="field"><label>Tag</label>
      <select id="fTag">${tagOptions.map(o => `<option value="${o.tag}|${o.cls}" ${b.tag === o.tag ? "selected" : ""}>${o.tag}</option>`).join("")}</select>
    </div>
    <div class="field"><label>Signalement / extra informatie</label><textarea id="fSignalement" rows="3" style="resize:vertical" placeholder="Bv. lengte, bouw, kenmerken, laatst gezien...">${b.signalement || ""}</textarea></div>
    <div class="field"><label>Foto's (optioneel)</label>
      <div id="bFotosWrap" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn btn-gold" id="saveB">Opslaan</button>
      ${!isNew ? `<button class="btn btn-danger" id="delB">Verwijderen</button>` : ""}
    </div>
  `);
  maakFotoWidget(document.getElementById("bFotosWrap"), state.fotos, getSession());
  document.getElementById("mClose").addEventListener("click", closeModal);
  maakOpmaakToolbar(document.getElementById("fSignalement"));
  document.getElementById("saveB").addEventListener("click", () => {
    const naam = document.getElementById("fNaam").value.trim();
    const detail = document.getElementById("fDetail").value.trim();
    const [tag, tagClass] = document.getElementById("fTag").value.split("|");
    const signalement = document.getElementById("fSignalement").value.trim();
    const fotos = state.fotos;
    if (!naam) return;
    if (isNew){
      const liveDossierObj = vindLeefDossier(dossierId);
      if (!liveDossierObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
      liveDossierObj.betrokkenen.push({ id: genereerBetrokkeneId(), naam, detail, tag, tagClass, signalement, fotos });
      logActiviteit(getSession(), `Betrokkene toegevoegd: "${naam}"`, liveDossierObj.naam);
    } else {
      const live = vindLeefBetrokkene(dossierId, betrokkeneId);
      if (!live){ alert("Deze betrokkene bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
      const liveB = live.betrokkene;
      liveB.naam = naam; liveB.detail = detail; liveB.tag = tag; liveB.tagClass = tagClass; liveB.signalement = signalement; liveB.fotos = fotos;
    }
    flushPendingVerwijderdeFotoIds();
    DB.save(db); closeModal(); render();
  });
  if (!isNew){
    document.getElementById("delB").addEventListener("click", () => {
      const live = vindLeefBetrokkene(dossierId, betrokkeneId);
      if (!live){ closeModal(); render(); return; }
      (live.betrokkene.fotos || []).forEach(verwijderFoto);
      live.dossierObj.betrokkenen = live.dossierObj.betrokkenen.filter(x => x.id !== betrokkeneId);
      logActiviteit(getSession(), `Betrokkene verwijderd: "${live.betrokkene.naam}"`, live.dossierObj.naam);
      DB.save(db); closeModal(); render();
    });
  }
}

/* ---------------- voertuigen ---------------- */
// Zelfde opbouw als dossierBetrokkenen: elk ingelogd lid mag toevoegen, enkel admin mag
// bewerken/verwijderen. Een voertuig kan gelinkt worden aan een betrokkene (op naam, net zoals
// een document zijn auteur op naam bijhoudt &mdash; er bestaat geen apart id-systeem voor betrokkenen).
function dossierVoertuigen(d, session){
  const canEdit = isAdmin(session);
  const dossierId = d.id;
  const wrap = el(`<div></div>`);
  const addBtn = el(`<button class="btn btn-gold btn-sm" style="margin-bottom:16px">+ Voertuig toevoegen</button>`);
  addBtn.addEventListener("click", () => openVoertuigForm(d, null));
  wrap.appendChild(addBtn);
  if (!d.voertuigen.length) wrap.appendChild(el(`<div class="muted" style="font-size:13px">Geen voertuigen geregistreerd.</div>`));
  d.voertuigen.forEach(v => {
    const row = el(`<div class="card" style="display:flex;gap:14px;align-items:flex-start;margin-bottom:8px">
      <div class="persoonthumb">&#128663;</div>
      <div style="flex:1">
        <div class="row" style="margin-bottom:0">
          <div><div style="font-weight:600;font-size:13px" class="mono">${v.kenteken || "&mdash;"}</div><div class="muted" style="font-size:11px">${v.merkModel}${v.kleur ? " &middot; " + v.kleur : ""}</div></div>
          <div style="display:flex;align-items:center;gap:10px">
            ${v.betrokkeneNaam ? `<span class="chip chip-muted-light">${v.betrokkeneNaam}</span>` : ""}
            ${canEdit ? `<button class="btn btn-ghost btn-sm edit-v">Bewerken</button><button class="btn btn-danger btn-sm del-v">Verwijderen</button>` : ""}
          </div>
        </div>
        ${v.notities ? `<div class="muted verslag-tekst" style="font-size:12px;margin-top:8px">${renderOpgemaakteTekst(v.notities)}</div>` : ""}
        ${fotosGalerijHtml(v.fotos)}
      </div>
    </div>`);
    wireFotosGalerij(row);
    if (canEdit){
      row.querySelector(".edit-v").addEventListener("click", () => {
        const live = vindLeefVoertuig(dossierId, v.id);
        if (!live){ render(); return; }
        openVoertuigForm(live.dossierObj, live.voertuig);
      });
      row.querySelector(".del-v").addEventListener("click", () => {
        confirmModal("Dit voertuig verwijderen?", () => {
          const live = vindLeefVoertuig(dossierId, v.id);
          if (!live){ render(); return; }
          (live.voertuig.fotos || []).forEach(verwijderFoto);
          live.dossierObj.voertuigen = live.dossierObj.voertuigen.filter(x => x.id !== v.id);
          DB.save(db); render();
        });
      });
    }
    wrap.appendChild(row);
  });
  return wrap;
}

function openVoertuigForm(d, voertuig){
  pendingVerwijderdeFotoIds = [];
  // Zie openSimpleDocForm hierboven: enkel ID's bewaren, bij opslaan altijd live opzoeken.
  const dossierId = d.id;
  const voertuigId = voertuig ? voertuig.id : null;
  const isNew = !voertuig;
  const v = voertuig || { kenteken: "", merkModel: "", kleur: "", betrokkeneNaam: "", notities: "", fotos: [] };
  const state = { fotos: (v.fotos || []).slice() };
  const betrokkeneOpties = d.betrokkenen.map(b => b.naam);
  openModal(`
    <div class="modal-head"><h2>${isNew ? "Voertuig toevoegen" : "Voertuig bewerken"}</h2><button class="modal-close" id="mClose">&times;</button></div>
    <div class="field"><label>Kenteken</label><input id="fKenteken" class="mono" value="${v.kenteken}" placeholder="Bv. 1-ABC-123"></div>
    <div class="row2">
      <div class="field"><label>Merk / model</label><input id="fMerkModel" value="${v.merkModel}" placeholder="Bv. BMW 3-reeks"></div>
      <div class="field"><label>Kleur</label><input id="fKleur" value="${v.kleur}" placeholder="Bv. Zwart"></div>
    </div>
    <div class="field"><label>Betrokkene (optioneel)</label>
      <select id="fBetrokkene">
        <option value="">&mdash; geen &mdash;</option>
        ${betrokkeneOpties.map(n => `<option value="${n}" ${v.betrokkeneNaam === n ? "selected" : ""}>${n}</option>`).join("")}
      </select>
    </div>
    <div class="field"><label>Notities (optioneel)</label><textarea id="fNotities" rows="3" style="resize:vertical" placeholder="Bv. waar/wanneer gezien, bijzonderheden...">${v.notities || ""}</textarea></div>
    <div class="field"><label>Foto's (optioneel)</label>
      <div id="vFotosWrap" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn btn-gold" id="saveV">Opslaan</button>
      ${!isNew ? `<button class="btn btn-danger" id="delV">Verwijderen</button>` : ""}
    </div>
  `);
  maakFotoWidget(document.getElementById("vFotosWrap"), state.fotos, getSession());
  document.getElementById("mClose").addEventListener("click", closeModal);
  maakOpmaakToolbar(document.getElementById("fNotities"));
  document.getElementById("saveV").addEventListener("click", () => {
    const kenteken = document.getElementById("fKenteken").value.trim();
    const merkModel = document.getElementById("fMerkModel").value.trim();
    const kleur = document.getElementById("fKleur").value.trim();
    const betrokkeneNaam = document.getElementById("fBetrokkene").value;
    const notities = document.getElementById("fNotities").value.trim();
    const fotos = state.fotos;
    if (!kenteken && !merkModel) return;
    if (isNew){
      const liveDossierObj = vindLeefDossier(dossierId);
      if (!liveDossierObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
      liveDossierObj.voertuigen.push({ id: genereerVoertuigId(), kenteken, merkModel, kleur, betrokkeneNaam, notities, fotos });
      logActiviteit(getSession(), `Voertuig toegevoegd: "${kenteken || merkModel}"`, liveDossierObj.naam);
    } else {
      const live = vindLeefVoertuig(dossierId, voertuigId);
      if (!live){ alert("Dit voertuig bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
      const liveV = live.voertuig;
      liveV.kenteken = kenteken; liveV.merkModel = merkModel; liveV.kleur = kleur; liveV.betrokkeneNaam = betrokkeneNaam; liveV.notities = notities; liveV.fotos = fotos;
    }
    flushPendingVerwijderdeFotoIds();
    DB.save(db); closeModal(); render();
  });
  if (!isNew){
    document.getElementById("delV").addEventListener("click", () => {
      const live = vindLeefVoertuig(dossierId, voertuigId);
      if (!live){ closeModal(); render(); return; }
      (live.voertuig.fotos || []).forEach(verwijderFoto);
      live.dossierObj.voertuigen = live.dossierObj.voertuigen.filter(x => x.id !== voertuigId);
      logActiviteit(getSession(), `Voertuig verwijderd: "${live.voertuig.kenteken || live.voertuig.merkModel}"`, live.dossierObj.naam);
      DB.save(db); closeModal(); render();
    });
  }
}

/* ---------------- document detail ---------------- */
// Briefhoofd bovenaan elk verslag: eigen BelgiëPD-logo + titel, en voor een Opdracht een eigen
// (niet-officieel, zelf getekend) weegschaal-icoon dat het parket/de onderzoeksrechter symboliseert
// &mdash; bewust geen echt logo van politie of Openbaar Ministerie.
function justitieBadgeSvg(){
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a6a2c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 3v17M5 7l-3 5.5a3 3 0 0 0 6 0L5 7Zm14 0l-3 5.5a3 3 0 0 0 6 0L19 7ZM4.2 7h7.6M12.2 7h7.6M8 21h8"/>
  </svg>`;
}
function pvHeadHtml(doc, dossierObj, extraBadgeHtml){
  const isOpdracht = doc.type === "Opdracht";
  const ref = ((dossierObj && dossierObj.naam) || "").toUpperCase() + (doc.id ? " &middot; " + String(doc.id).toUpperCase() : "");
  return `
    <div class="pv-head">
      <div class="pv-head-row">
        <img src="${new URL("assets/logo.png", location.href).href}" alt="" class="pv-logo">
        <div style="flex:1">
          <div class="pv-eyebrow">Recherche &middot; BelgiëPD</div>
          <h3>${doc.type.toUpperCase()}${extraBadgeHtml || ""}</h3>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div class="pv-ref">${ref}</div>
          ${isOpdracht ? `<div class="pv-justitie-badge" title="Officiële opdracht &mdash; ${doc.afkomstigVan || ""}">${justitieBadgeSvg()}</div>` : ""}
        </div>
      </div>
    </div>`;
}
function openDocDetail(doc, dossierObj, session){
  // Deze detailweergave kan een tijdje openstaan (bv. terwijl iemand het rustig doorleest); bij
  // verwijderen daarom altijd live opnieuw opzoeken op ID, niet filteren op de (mogelijk intussen
  // stale) objectreferentie zelf &mdash; zelfde reden als bij de aanvullingen-fix hierboven. Ook
  // meteen hier al, zodat zelfs het openen zelf (en de "gelezen"-markering) op de actuele versie werkt.
  const dossierId = dossierObj.id;
  const docId = doc.id;
  const live = vindLeefDoc(dossierId, docId);
  if (live){ doc = live.doc; dossierObj = live.dossierObj; }
  const canEdit = magDocBewerken(doc, session);
  markDocAlsGelezen(doc, session);
  if (doc.tijdstippen){
    const isCSI = doc.type === "CSI-verslag";
    const rowsLabel = isCSI ? "Sporen" : "Inbeslagname";
    const tijHtml = doc.tijdstippen.map(t => `
      <div style="display:flex;gap:10px;align-items:baseline;margin-bottom:6px">
        <span class="mono" style="font-size:12px;color:var(--gold);min-width:46px">${t.tijd || "&ndash;"}</span>
        <span style="font-size:13px">${t.label || ""}</span>
      </div>`).join("");
    const rowsHtml = (doc.rows || []).length ? `
      <div class="pv-loc">
        <div class="lbl">${rowsLabel}</div>
        <table class="simple" style="margin-top:8px">
          <tbody>${doc.rows.map(r => `<tr><td style="font-weight:600;width:40%">${r.label}</td><td>${r.waarde}</td></tr>`).join("")}</tbody>
        </table>
      </div>` : "";
    const fotosHtml = fotosGalerijHtml(doc.foto_s, "margin-top:14px");
    const aanvullingenHtml = aanvullingenSectieHtml(doc, session);
    openModal(`
      <div class="modal-head"><h2>${doc.type}</h2><button class="modal-close" id="mClose">&times;</button></div>
      <div class="pv-doc">
        ${pvHeadHtml(doc, dossierObj)}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          <div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur}</div></div>
          <div><div class="lbl">Datum</div><div class="val">${doc.datum}</div></div>
          <div><div class="lbl">Postcode</div><div class="val">${doc.postcode || "&mdash;"}</div></div>
        </div>
        <div class="pv-body">
          <div class="pv-loc">
            <div class="lbl">Tijdstippen</div>
            <div style="margin-top:8px">${tijHtml || `<span class="muted" style="font-size:12px">Geen tijdstippen genoteerd.</span>`}</div>
          </div>
          ${doc.bevindingen ? `<div class="pv-loc"><div class="lbl">Bevindingen</div><div class="verslag-tekst" style="margin-top:8px">${renderOpgemaakteTekst(doc.bevindingen)}</div></div>` : ""}
          ${rowsHtml}
          ${fotosHtml}
          ${aanvullingenHtml}
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        ${addAanvullingBtnHtml(doc, session)}
        ${canEdit ? `<button class="btn btn-ghost btn-sm" id="copyDiscordBtn">Kopieer Discord-melding</button><button class="btn btn-gold btn-sm" id="editDocBtn">Bewerken</button><button class="btn btn-danger btn-sm" id="delDocBtn">Verwijderen</button>` : ""}
      </div>
    `, true);
    wireFotosGalerij(document.getElementById("modal-root"));
    document.getElementById("mClose").addEventListener("click", closeModal);
    wireAanvullingenKnoppen(doc, dossierObj, session);
    if (canEdit){
      document.getElementById("copyDiscordBtn").addEventListener("click", (e) => copyToClipboard(genereerDiscordMelding(doc, dossierObj), e.target));
      document.getElementById("editDocBtn").addEventListener("click", () => { closeModal(); openTussenkomstForm(dossierObj, session, doc.type, doc); });
      document.getElementById("delDocBtn").addEventListener("click", () => {
        confirmModal("Dit document verwijderen? Het verdwijnt ook uit de tijdlijn.", () => {
          const live = vindLeefDoc(dossierId, docId);
          if (!live){ closeModal(); render(); return; }
          fotoIdsVanDoc(live.doc).forEach(verwijderFoto);
          live.dossierObj.documenten = live.dossierObj.documenten.filter(x => x.id !== docId);
          logActiviteit(session, `${live.doc.type} verwijderd`, live.dossierObj.naam);
          DB.save(db); render();
        });
      });
    }
    return;
  }
  if (doc.locaties){
    // De specialisatie-badge wordt enkel getoond als het type die niet al zelf vermeldt (bv. legacy "Observatieverslag").
    const showSpecBadge = doc.specialisatie && !doc.type.toUpperCase().startsWith(doc.specialisatie.toUpperCase());
    let locsHtml = sortChronologisch(doc.locaties, x => x.datum, x => x.tijd).map((l, i) => `
      <div class="pv-loc">
        <div class="lbl">Locatie ${i + 1} &middot; postcode ${l.postcode}</div>
        <div style="font-size:11px;color:#8a90a3;margin-bottom:10px">${l.datum} &middot; ${l.tijd}</div>
        <div class="verslag-tekst" style="margin-bottom:${(l.foto_s && l.foto_s.length) ? "12px" : "0"}">${renderOpgemaakteTekst(l.tekst)}</div>
        ${fotosGalerijHtml(l.foto_s, "")}
      </div>`).join("");
    const aanvullingenHtml = aanvullingenSectieHtml(doc, session);
    openModal(`
      <div class="modal-head"><h2>${doc.type}</h2><button class="modal-close" id="mClose">&times;</button></div>
      <div class="pv-doc">
        ${pvHeadHtml(doc, dossierObj, showSpecBadge ? ` <span style="font-size:10px;font-weight:700;border:1px solid #b08a3e;color:#b08a3e;border-radius:999px;padding:2px 10px;margin-left:8px;vertical-align:middle">${doc.specialisatie}</span>` : "")}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          <div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur}</div></div>
          <div><div class="lbl">Aantal locaties</div><div class="val">${doc.locaties.length}</div></div>
        </div>
        <div class="pv-body">${locsHtml}${aanvullingenHtml}</div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        ${addAanvullingBtnHtml(doc, session)}
        ${canEdit ? `<button class="btn btn-ghost btn-sm" id="copyDiscordBtn">Kopieer Discord-melding</button><button class="btn btn-gold btn-sm" id="editDocBtn">Bewerken</button><button class="btn btn-danger btn-sm" id="delDocBtn">Verwijderen</button>` : ""}
      </div>
    `, true);
    wireFotosGalerij(document.getElementById("modal-root"));
    document.getElementById("mClose").addEventListener("click", closeModal);
    wireAanvullingenKnoppen(doc, dossierObj, session);
    if (canEdit){
      document.getElementById("copyDiscordBtn").addEventListener("click", (e) => copyToClipboard(genereerDiscordMelding(doc, dossierObj), e.target));
      document.getElementById("editDocBtn").addEventListener("click", () => { closeModal(); openVerslagForm(dossierObj, session, doc.type, doc); });
      document.getElementById("delDocBtn").addEventListener("click", () => {
        confirmModal("Dit document verwijderen? Het verdwijnt ook uit de tijdlijn.", () => {
          const live = vindLeefDoc(dossierId, docId);
          if (!live){ closeModal(); render(); return; }
          fotoIdsVanDoc(live.doc).forEach(verwijderFoto);
          live.dossierObj.documenten = live.dossierObj.documenten.filter(x => x.id !== docId);
          logActiviteit(session, `${live.doc.type} verwijderd`, live.dossierObj.naam);
          DB.save(db); render();
        });
      });
    }
    return;
  }
  if (SIMPLE_DOC_TYPES.includes(doc.type)){
    const linkLine = doc.externLink ? `<div style="margin-top:16px"><a href="${doc.externLink}" target="_blank" rel="noopener">Externe link &rarr;</a></div>` : "";
    const secties = doc.secties && doc.secties.length ? doc.secties : (doc.inhoud ? [{ kop: "", tekst: doc.inhoud }] : []);
    const sectiesHtml = secties.map(s => {
      const lblDelen = [];
      if (s.kop) lblDelen.push(s.kop);
      if (s.postcode) lblDelen.push("postcode " + s.postcode);
      const lbl = lblDelen.join(" &middot; ");
      const fotosHtml = fotosGalerijHtml(s.fotos, "margin-top:10px");
      return `
      <div class="pv-loc">
        ${lbl ? `<div class="lbl">${lbl}</div>` : ""}
        <div class="verslag-tekst" style="${lbl ? "margin-top:8px" : ""}">${renderOpgemaakteTekst(s.tekst)}</div>
        ${fotosHtml}
      </div>`;
    }).join("");
    const aanvullingenHtml = aanvullingenSectieHtml(doc, session);
    openModal(`
      <div class="modal-head"><h2>${doc.type}</h2><button class="modal-close" id="mClose">&times;</button></div>
      <div class="pv-doc">
        ${pvHeadHtml(doc, dossierObj)}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          ${doc.type === "Opdracht" ? `<div><div class="lbl">Afkomstig van</div><div class="val">${doc.afkomstigVan || ""}</div></div>` : `<div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur || ""}</div></div>`}
          <div><div class="lbl">Datum en tijdstip</div><div class="val">${datumTijdHtml(doc)}</div></div>
        </div>
        <div class="pv-body">
          ${doc.titel ? `<div style="font-size:14px;font-weight:700;margin-bottom:10px">${doc.titel}</div>` : ""}
          ${sectiesHtml}
          ${aanvullingenHtml}
          ${linkLine}
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        ${addAanvullingBtnHtml(doc, session)}
        ${canEdit ? `<button class="btn btn-ghost btn-sm" id="copyDiscordBtn">Kopieer Discord-melding</button><button class="btn btn-gold btn-sm" id="editDocBtn">Bewerken</button><button class="btn btn-danger btn-sm" id="delDocBtn">Verwijderen</button>` : ""}
      </div>
    `, true);
    wireFotosGalerij(document.getElementById("modal-root"));
    document.getElementById("mClose").addEventListener("click", closeModal);
    wireAanvullingenKnoppen(doc, dossierObj, session);
    if (canEdit){
      document.getElementById("copyDiscordBtn").addEventListener("click", (e) => copyToClipboard(genereerDiscordMelding(doc, dossierObj), e.target));
      document.getElementById("editDocBtn").addEventListener("click", () => { closeModal(); openSimpleDocForm(dossierObj, session, doc.type, doc); });
      document.getElementById("delDocBtn").addEventListener("click", () => {
        confirmModal("Dit document verwijderen? Het verdwijnt ook uit de tijdlijn.", () => {
          const live = vindLeefDoc(dossierId, docId);
          if (!live){ closeModal(); render(); return; }
          fotoIdsVanDoc(live.doc).forEach(verwijderFoto);
          live.dossierObj.documenten = live.dossierObj.documenten.filter(x => x.id !== docId);
          logActiviteit(session, `${live.doc.type} verwijderd`, live.dossierObj.naam);
          DB.save(db); render();
        });
      });
    }
    return;
  }
  if (doc.type === "Verhoor-verslag"){
    const secties = doc.secties && doc.secties.length ? doc.secties : [];
    const sectiesHtml = secties.map(s => {
      const fotosHtml = fotosGalerijHtml(s.fotos, "margin-top:10px");
      return `
      <div class="pv-loc">
        ${s.kop ? `<div class="lbl">${s.kop}</div>` : ""}
        <div class="verslag-tekst" style="${s.kop ? "margin-top:8px" : ""}">${renderOpgemaakteTekst(s.tekst)}</div>
        ${fotosHtml}
      </div>`;
    }).join("");
    openModal(`
      <div class="modal-head"><h2>${doc.type}</h2><button class="modal-close" id="mClose">&times;</button></div>
      <div class="pv-doc">
        ${pvHeadHtml(doc, dossierObj)}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          <div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur || ""}</div></div>
          <div><div class="lbl">Datum en tijdstip</div><div class="val">${doc.datum || ""}${doc.tijd ? " &middot; " + doc.tijd : ""}${doc.eindTijd ? " &ndash; " + doc.eindTijd : ""}</div></div>
          <div><div class="lbl">Ondervraagde</div><div class="val">${doc.ondervraagde || "&mdash;"} ${doc.hoedanigheid ? `<span class="chip chip-muted-light" style="margin-left:4px">${doc.hoedanigheid}</span>` : ""}</div></div>
        </div>
        <div class="pv-meta">
          <div><div class="lbl">Rechten</div><div class="val">${doc.cautie ? `Ontvangen${doc.cautieTijd ? " om " + doc.cautieTijd : ""}` : "Niet ontvangen"}</div></div>
          <div><div class="lbl">Bijstand advocaat</div><div class="val">${doc.advocaat ? (doc.advocaatNaam || "Ja") : "Nee"}</div></div>
        </div>
        <div class="pv-body">
          ${doc.titel ? `<div style="font-size:14px;font-weight:700;margin-bottom:10px">${doc.titel}</div>` : ""}
          ${sectiesHtml}
        </div>
      </div>
      ${canEdit ? `<div style="display:flex;gap:10px;margin-top:16px"><button class="btn btn-ghost btn-sm" id="copyDiscordBtn">Kopieer Discord-melding</button><button class="btn btn-gold btn-sm" id="editDocBtn">Bewerken</button><button class="btn btn-danger btn-sm" id="delDocBtn">Verwijderen</button></div>` : ""}
    `, true);
    wireFotosGalerij(document.getElementById("modal-root"));
    document.getElementById("mClose").addEventListener("click", closeModal);
    if (canEdit){
      document.getElementById("copyDiscordBtn").addEventListener("click", (e) => copyToClipboard(genereerDiscordMelding(doc, dossierObj), e.target));
      document.getElementById("editDocBtn").addEventListener("click", () => { closeModal(); openVerhoorForm(dossierObj, session, doc.type, doc); });
      document.getElementById("delDocBtn").addEventListener("click", () => {
        confirmModal("Dit document verwijderen? Het verdwijnt ook uit de tijdlijn.", () => {
          const live = vindLeefDoc(dossierId, docId);
          if (!live){ closeModal(); render(); return; }
          fotoIdsVanDoc(live.doc).forEach(verwijderFoto);
          live.dossierObj.documenten = live.dossierObj.documenten.filter(x => x.id !== docId);
          logActiviteit(session, `${live.doc.type} verwijderd`, live.dossierObj.naam);
          DB.save(db); render();
        });
      });
    }
    return;
  }
  if (doc.type === "Beschikbare resultaten" || doc.type === "TAP-dossier" || doc.type === "Bijstandsaanvraag"){
    const rows = doc.rows || [];
    const tableHtml = rows.length ? `
      <div class="pv-loc">
        <div class="lbl">${doc.type === "Bijstandsaanvraag" ? "Gegevens voor de eenheid" : "Resultaten"}</div>
        <table class="simple" style="margin-top:8px">
          <tbody>${rows.map(r => `<tr><td style="font-weight:600;width:40%">${r.label}</td><td>${r.waarde}</td></tr>`).join("")}</tbody>
        </table>
      </div>` : "";
    const aanvullingen = sortChronologisch(doc.aanvullingen || [], x => x.datum, x => x.tijd);
    const aanvullingenHtml = aanvullingenSectieHtml(doc, session);
    const linkLine = doc.externLink ? `<div style="margin-top:16px"><a href="${doc.externLink}" target="_blank" rel="noopener">Externe link &rarr;</a></div>` : "";
    openModal(`
      <div class="modal-head"><h2>${doc.type}</h2><button class="modal-close" id="mClose">&times;</button></div>
      <div class="pv-doc">
        ${pvHeadHtml(doc, dossierObj)}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          <div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur || ""}</div></div>
          <div><div class="lbl">Datum en tijdstip</div><div class="val">${datumTijdHtml(doc)}</div></div>
        </div>
        <div class="pv-body">
          ${doc.titel ? `<div style="font-size:14px;font-weight:700;margin-bottom:10px">${doc.titel}</div>` : ""}
          ${doc.inhoud ? `<div class="verslag-tekst" style="margin-bottom:${rows.length || aanvullingen.length ? "14px" : "0"}">${renderOpgemaakteTekst(doc.inhoud)}</div>` : ""}
          ${tableHtml}
          ${fotosGalerijHtml(doc.foto_s, "margin-top:10px")}
          ${bijstandExtraHtml(doc)}
          ${aanvullingenHtml}
          ${linkLine}
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        ${doc.type === "Bijstandsaanvraag" ? `<button class="btn btn-ghost btn-sm" id="exportDocBtn" title="Dit document apart als PDF exporteren, bv. om door te sturen naar een andere eenheid">Exporteer (PDF)</button>` : ""}
        ${addAanvullingBtnHtml(doc, session)}
        ${canEdit ? `<button class="btn btn-ghost btn-sm" id="copyDiscordBtn">Kopieer Discord-melding</button>` : ""}
        ${canEdit ? `<button class="btn btn-gold btn-sm" id="editDocBtn">Bewerken</button><button class="btn btn-danger btn-sm" id="delDocBtn">Verwijderen</button>` : ""}
      </div>
    `, true);
    wireFotosGalerij(document.getElementById("modal-root"));
    document.getElementById("mClose").addEventListener("click", closeModal);
    if (doc.type === "Bijstandsaanvraag"){
      document.getElementById("exportDocBtn").addEventListener("click", () => exporteerDocumentAlsPdf(doc, dossierObj));
    }
    wireAanvullingenKnoppen(doc, dossierObj, session);
    if (canEdit){
      document.getElementById("copyDiscordBtn").addEventListener("click", (e) => copyToClipboard(genereerDiscordMelding(doc, dossierObj), e.target));
      document.getElementById("editDocBtn").addEventListener("click", () => { closeModal(); openResultatenForm(dossierObj, session, doc.type, doc); });
      document.getElementById("delDocBtn").addEventListener("click", () => {
        confirmModal("Dit document verwijderen? Het verdwijnt ook uit de tijdlijn.", () => {
          const live = vindLeefDoc(dossierId, docId);
          if (!live){ closeModal(); render(); return; }
          fotoIdsVanDoc(live.doc).forEach(verwijderFoto);
          live.dossierObj.documenten = live.dossierObj.documenten.filter(x => x.id !== docId);
          logActiviteit(session, `${live.doc.type} verwijderd`, live.dossierObj.naam);
          DB.save(db); render();
        });
      });
    }
    return;
  }
  // generic document: datum/tijd/auteur, met externe link (enkel leiding kan bewerken)
  const linkBlock = canEdit
    ? `<div class="field"><label>Externe link (Google Doc/Sheet)</label><input id="linkInput" value="${doc.externLink || ""}" placeholder="https://docs.google.com/..."></div>
       <div style="display:flex;gap:10px"><button class="btn btn-gold" id="saveLink">Opslaan</button><button class="btn btn-danger" id="delDocBtn2">Verwijderen</button></div>`
    : (doc.externLink ? `<div class="field"><label>Externe link</label><a href="${doc.externLink}" target="_blank" rel="noopener">${doc.externLink}</a></div>` : "");
  openModal(`
    <div class="modal-head"><h2>${doc.type}</h2><button class="modal-close" id="mClose">&times;</button></div>
    <div style="font-size:13px;margin-bottom:10px">${doc.titel}</div>
    <div class="muted" style="font-size:12px;margin-bottom:16px">${datumTijdHtml(doc)} &middot; ${doc.auteur || ""}</div>
    ${linkBlock}
  `);
  document.getElementById("mClose").addEventListener("click", closeModal);
  if (canEdit){
    document.getElementById("saveLink").addEventListener("click", () => {
      const live = vindLeefDoc(dossierId, docId);
      if (!live){ alert("Dit document bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
      live.doc.externLink = document.getElementById("linkInput").value.trim();
      DB.save(db);
      closeModal();
      render();
    });
    document.getElementById("delDocBtn2").addEventListener("click", () => {
      confirmModal("Dit document verwijderen? Het verdwijnt ook uit de tijdlijn.", () => {
        const live = vindLeefDoc(dossierId, docId);
        if (!live){ closeModal(); render(); return; }
        fotoIdsVanDoc(live.doc).forEach(verwijderFoto);
        live.dossierObj.documenten = live.dossierObj.documenten.filter(x => x.id !== docId);
        logActiviteit(session, `${live.doc.type} verwijderd`, live.dossierObj.naam);
        DB.save(db); render();
      });
    });
  }
}

/* ---------------- dossier exporteren als PDF (print-weergave) ---------------- */
// Rendert &eacute;&eacute;n document als een afdrukbaar, los "pv-doc"-blok (zelfde opbouw/branches als
// openDocDetail, maar zonder modal-wrapper en zonder knoppen) &mdash; hergebruikt voor de volledige
// dossier-export hieronder.
function docExportHtml(doc, dossierObj){
  if (doc.tijdstippen){
    const isCSI = doc.type === "CSI-verslag";
    const rowsLabel = isCSI ? "Sporen" : "Inbeslagname";
    const tijHtml = doc.tijdstippen.map(t => `
      <div style="display:flex;gap:10px;align-items:baseline;margin-bottom:6px">
        <span class="mono" style="font-size:12px;color:var(--gold);min-width:46px">${t.tijd || "&ndash;"}</span>
        <span style="font-size:13px">${t.label || ""}</span>
      </div>`).join("");
    const rowsHtml = (doc.rows || []).length ? `
      <div class="pv-loc">
        <div class="lbl">${rowsLabel}</div>
        <table class="simple" style="margin-top:8px">
          <tbody>${doc.rows.map(r => `<tr><td style="font-weight:600;width:40%">${r.label}</td><td>${r.waarde}</td></tr>`).join("")}</tbody>
        </table>
      </div>` : "";
    return `
      <div class="pv-doc export-doc">
        ${pvHeadHtml(doc, dossierObj)}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          <div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur}</div></div>
          <div><div class="lbl">Datum</div><div class="val">${doc.datum}</div></div>
          <div><div class="lbl">Postcode</div><div class="val">${doc.postcode || "&mdash;"}</div></div>
        </div>
        <div class="pv-body">
          <div class="pv-loc">
            <div class="lbl">Tijdstippen</div>
            <div style="margin-top:8px">${tijHtml || `<span class="muted" style="font-size:12px">Geen tijdstippen genoteerd.</span>`}</div>
          </div>
          ${doc.bevindingen ? `<div class="pv-loc"><div class="lbl">Bevindingen</div><div class="verslag-tekst" style="margin-top:8px">${renderOpgemaakteTekst(doc.bevindingen)}</div></div>` : ""}
          ${rowsHtml}
          ${aanvullingenSectieHtml(doc)}
        </div>
      </div>`;
  }
  if (doc.locaties){
    const showSpecBadge = doc.specialisatie && !doc.type.toUpperCase().startsWith(doc.specialisatie.toUpperCase());
    const locsHtml = sortChronologisch(doc.locaties, x => x.datum, x => x.tijd).map((l, i) => `
      <div class="pv-loc">
        <div class="lbl">Locatie ${i + 1} &middot; postcode ${l.postcode}</div>
        <div style="font-size:11px;color:#8a90a3;margin-bottom:10px">${l.datum} &middot; ${l.tijd}</div>
        <div class="verslag-tekst">${renderOpgemaakteTekst(l.tekst)}</div>
      </div>`).join("");
    return `
      <div class="pv-doc export-doc">
        ${pvHeadHtml(doc, dossierObj, showSpecBadge ? ` <span style="font-size:10px;font-weight:700;border:1px solid #b08a3e;color:#b08a3e;border-radius:999px;padding:2px 10px;margin-left:8px;vertical-align:middle">${doc.specialisatie}</span>` : "")}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          <div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur}</div></div>
          <div><div class="lbl">Aantal locaties</div><div class="val">${doc.locaties.length}</div></div>
        </div>
        <div class="pv-body">${locsHtml}${aanvullingenSectieHtml(doc)}</div>
      </div>`;
  }
  if (SIMPLE_DOC_TYPES.includes(doc.type)){
    const linkLine = doc.externLink ? `<div style="margin-top:16px"><a href="${doc.externLink}" target="_blank" rel="noopener">Externe link &rarr;</a></div>` : "";
    const secties = doc.secties && doc.secties.length ? doc.secties : (doc.inhoud ? [{ kop: "", tekst: doc.inhoud }] : []);
    const sectiesHtml = secties.map(s => {
      const lblDelen = [];
      if (s.kop) lblDelen.push(s.kop);
      if (s.postcode) lblDelen.push("postcode " + s.postcode);
      const lbl = lblDelen.join(" &middot; ");
      const fotosHtml = fotosGalerijHtml(s.fotos, "margin-top:10px");
      return `
      <div class="pv-loc">
        ${lbl ? `<div class="lbl">${lbl}</div>` : ""}
        <div class="verslag-tekst" style="${lbl ? "margin-top:8px" : ""}">${renderOpgemaakteTekst(s.tekst)}</div>
        ${fotosHtml}
      </div>`;
    }).join("");
    return `
      <div class="pv-doc export-doc">
        ${pvHeadHtml(doc, dossierObj)}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          ${doc.type === "Opdracht" ? `<div><div class="lbl">Afkomstig van</div><div class="val">${doc.afkomstigVan || ""}</div></div>` : `<div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur || ""}</div></div>`}
          <div><div class="lbl">Datum en tijdstip</div><div class="val">${datumTijdHtml(doc)}</div></div>
        </div>
        <div class="pv-body">
          ${doc.titel ? `<div style="font-size:14px;font-weight:700;margin-bottom:10px">${doc.titel}</div>` : ""}
          ${sectiesHtml}
          ${aanvullingenSectieHtml(doc)}
          ${linkLine}
        </div>
      </div>`;
  }
  if (doc.type === "Beschikbare resultaten" || doc.type === "TAP-dossier" || doc.type === "Bijstandsaanvraag"){
    const rows = doc.rows || [];
    const tableHtml = rows.length ? `
      <div class="pv-loc">
        <div class="lbl">${doc.type === "Bijstandsaanvraag" ? "Gegevens voor de eenheid" : "Resultaten"}</div>
        <table class="simple" style="margin-top:8px">
          <tbody>${rows.map(r => `<tr><td style="font-weight:600;width:40%">${r.label}</td><td>${r.waarde}</td></tr>`).join("")}</tbody>
        </table>
      </div>` : "";
    const aanvullingen = sortChronologisch(doc.aanvullingen || [], x => x.datum, x => x.tijd);
    const aanvullingenHtml = aanvullingen.length ? `
      <div class="hint" style="margin:16px 0 8px">Aanvullingen</div>
      ${aanvullingen.map(a => `
        <div class="pv-loc">
          <div style="font-size:11px;color:#8a90a3;margin-bottom:6px">${a.datum} &middot; ${a.tijd || ""} ${a.auteur ? "&middot; " + a.auteur : ""}</div>
          <div class="verslag-tekst">${renderOpgemaakteTekst(a.tekst)}</div>
          ${fotosGalerijHtml(a.foto_s, "margin-top:10px")}
        </div>`).join("")}
    ` : "";
    const linkLine = doc.externLink ? `<div style="margin-top:16px"><a href="${doc.externLink}" target="_blank" rel="noopener">Externe link &rarr;</a></div>` : "";
    return `
      <div class="pv-doc export-doc">
        ${pvHeadHtml(doc, dossierObj)}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          <div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur || ""}</div></div>
          <div><div class="lbl">Datum en tijdstip</div><div class="val">${datumTijdHtml(doc)}</div></div>
        </div>
        <div class="pv-body">
          ${doc.titel ? `<div style="font-size:14px;font-weight:700;margin-bottom:10px">${doc.titel}</div>` : ""}
          ${doc.inhoud ? `<div class="verslag-tekst" style="margin-bottom:${rows.length || aanvullingen.length ? "14px" : "0"}">${renderOpgemaakteTekst(doc.inhoud)}</div>` : ""}
          ${tableHtml}
          ${fotosGalerijHtml(doc.foto_s, "margin-top:10px")}
          ${bijstandExtraHtml(doc)}
          ${aanvullingenHtml}
          ${linkLine}
        </div>
      </div>`;
  }
  if (doc.type === "Verhoor-verslag"){
    const secties = doc.secties && doc.secties.length ? doc.secties : [];
    const sectiesHtml = secties.map(s => {
      const fotosHtml = fotosGalerijHtml(s.fotos, "margin-top:10px");
      return `
      <div class="pv-loc">
        ${s.kop ? `<div class="lbl">${s.kop}</div>` : ""}
        <div class="verslag-tekst" style="${s.kop ? "margin-top:8px" : ""}">${renderOpgemaakteTekst(s.tekst)}</div>
        ${fotosHtml}
      </div>`;
    }).join("");
    return `
      <div class="pv-doc export-doc">
        ${pvHeadHtml(doc, dossierObj)}
        ${aanwezigenMetaHtml(doc)}
        <div class="pv-meta">
          <div><div class="lbl">Opgesteld door</div><div class="val">${doc.auteur || ""}</div></div>
          <div><div class="lbl">Datum en tijdstip</div><div class="val">${doc.datum || ""}${doc.tijd ? " &middot; " + doc.tijd : ""}${doc.eindTijd ? " &ndash; " + doc.eindTijd : ""}</div></div>
          <div><div class="lbl">Ondervraagde</div><div class="val">${doc.ondervraagde || "&mdash;"}${doc.hoedanigheid ? " (" + doc.hoedanigheid + ")" : ""}</div></div>
        </div>
        <div class="pv-meta">
          <div><div class="lbl">Rechten</div><div class="val">${doc.cautie ? `Ontvangen${doc.cautieTijd ? " om " + doc.cautieTijd : ""}` : "Niet ontvangen"}</div></div>
          <div><div class="lbl">Bijstand advocaat</div><div class="val">${doc.advocaat ? (doc.advocaatNaam || "Ja") : "Nee"}</div></div>
        </div>
        <div class="pv-body">
          ${doc.titel ? `<div style="font-size:14px;font-weight:700;margin-bottom:10px">${doc.titel}</div>` : ""}
          ${sectiesHtml}
        </div>
      </div>`;
  }
  // generieke/legacy documenten (enkel titel + link)
  return `
    <div class="pv-doc export-doc">
      <div class="pv-head"><div class="pv-head-row"><div style="flex:1"><div class="pv-eyebrow">Recherche &middot; BelgiëPD</div><h3>${doc.type.toUpperCase()}</h3></div></div></div>
      <div class="pv-body">
        <div style="font-size:13px;margin-bottom:10px">${doc.titel || ""}</div>
        <div class="muted" style="font-size:12px">${datumTijdHtml(doc)} &middot; ${doc.auteur || ""}</div>
        ${doc.externLink ? `<div style="margin-top:16px"><a href="${doc.externLink}" target="_blank" rel="noopener">Externe link &rarr;</a></div>` : ""}
      </div>
    </div>`;
}
// Bouwt een volledige, zelfstandige afdruk-/exportpagina voor een dossier: koptekst, kerngegevens,
// samenvatting, betrokkenen en de volledige chronologie &mdash; bedoeld om via window.print() als PDF
// op te slaan, zodat de korpsleiding het hele dossier in &eacute;&eacute;n document kan inkijken.
function genereerDossierExportHtml(d, session){
  const logoUrl = new URL("assets/logo.png", location.href).href;
  const styleUrl = new URL("style.css", location.href).href;
  const betrokkenenHtml = d.betrokkenen.length ? `
    <table class="simple" style="width:100%;margin-top:8px">
      <tbody>
        ${sortBetrokkenen(d.betrokkenen).map(b => `<tr><td style="font-weight:600;width:28%">${b.naam}</td><td style="width:18%">${b.tag}</td><td>${b.detail || ""}</td></tr>`).join("")}
      </tbody>
    </table>` : `<div class="muted" style="font-size:13px">Geen betrokkenen geregistreerd.</div>`;
  const voertuigenHtml = (d.voertuigen || []).length ? `
    <table class="simple" style="width:100%;margin-top:8px">
      <tbody>
        ${d.voertuigen.map(v => `<tr><td style="font-weight:600;width:22%">${v.kenteken || "&mdash;"}</td><td style="width:28%">${v.merkModel}${v.kleur ? " &middot; " + v.kleur : ""}</td><td>${v.betrokkeneNaam || ""}</td></tr>`).join("")}
      </tbody>
    </table>` : `<div class="muted" style="font-size:13px">Geen voertuigen geregistreerd.</div>`;
  const chronologisch = sortChronologisch(d.documenten, x => x.datum, x => x.tijd);
  const documentenHtml = chronologisch.length
    ? chronologisch.map(doc => docExportHtml(doc, d)).join("")
    : `<div class="muted" style="font-size:13px">Nog geen documenten in dit dossier.</div>`;
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>Dossier-export &ndash; ${d.naam}</title>
<link rel="stylesheet" href="${styleUrl}">
<style>
  body{background:#fff; color:#20242e; padding:0}
  .export-wrap{max-width:860px; margin:0 auto; padding:32px 24px 60px}
  .export-toolbar{display:flex; justify-content:flex-end; gap:10px; margin-bottom:20px}
  .export-doc{margin-bottom:22px; break-inside:avoid}
  .export-dossierhead{display:flex; align-items:center; gap:16px; margin-bottom:22px}
  .export-dossierhead img{height:48px}
  .export-meta-table{width:100%; border-collapse:collapse; margin-bottom:18px}
  .export-meta-table td{padding:6px 10px; font-size:13px; border-bottom:1px solid #e3e3e8; color:#20242e}
  .export-meta-table td:first-child{font-weight:700; width:220px; color:#555}
  .export-wrap table.simple td{color:#20242e; border-top:1px solid #e9ebf1}
  .export-wrap .muted{color:#6b7184}
  .export-wrap .section-title{color:#141822}
  @media print{
    .export-toolbar{display:none}
    .export-wrap{padding:0; max-width:none}
    body{background:#fff}
  }
</style>
</head>
<body>
  <div class="export-wrap">
    <div class="export-toolbar">
      <button class="btn btn-gold" onclick="window.print()">Afdrukken / Opslaan als PDF</button>
    </div>
    <div class="export-dossierhead">
      <img src="${logoUrl}" alt="">
      <div>
        <div class="pv-eyebrow">Recherche &middot; BelgiëPD &middot; Volledig dossier-export</div>
        <h2 style="margin:2px 0 0">${d.naam}</h2>
      </div>
    </div>
    <table class="export-meta-table">
      <tbody>
        <tr><td>Type delict</td><td>${d.typeDelict || ""}</td></tr>
        <tr><td>Status</td><td>${d.status === "open" ? "Open" : "Gesloten"}${d.opsporing ? " &middot; actieve opsporing" : ""}</td></tr>
        <tr><td>Verantwoordelijke</td><td>${d.verantwoordelijke || ""}</td></tr>
        <tr><td>Datum geopend</td><td>${d.datumGeopend || ""}</td></tr>
        <tr><td>Datum export</td><td>${new Date().toLocaleString("nl-BE")}</td></tr>
      </tbody>
    </table>
    <div class="section-title">Samenvatting</div>
    <div class="muted verslag-tekst" style="margin-bottom:22px">${renderOpgemaakteTekst(d.samenvatting || "")}</div>
    <div class="section-title">Betrokkenen</div>
    <div style="margin-bottom:22px">${betrokkenenHtml}</div>
    <div class="section-title">Voertuigen</div>
    <div style="margin-bottom:22px">${voertuigenHtml}</div>
    <div class="section-title" style="margin-bottom:10px">Chronologisch verloop</div>
    ${documentenHtml}
  </div>
</body>
</html>`;
}
function exporteerDossierAlsPdf(d, session){
  const html = genereerDossierExportHtml(d, session);
  const win = window.open("", "_blank");
  if (!win){
    alert("Kon geen nieuw venster openen. Controleer of pop-ups toegelaten zijn voor deze site.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
// Bouwt een zelfstandige afdruk-/exportpagina voor &eacute;&eacute;n enkel document (bv. een
// Bijstandsaanvraag), zodat dit apart doorgestuurd kan worden &mdash; bv. naar de leiding van een
// andere eenheid &mdash; zonder het volledige dossier te moeten delen.
function genereerDocumentExportHtml(doc, dossierObj){
  const logoUrl = new URL("assets/logo.png", location.href).href;
  const styleUrl = new URL("style.css", location.href).href;
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>${doc.type} &ndash; ${dossierObj.naam}</title>
<link rel="stylesheet" href="${styleUrl}">
<style>
  body{background:#fff; color:#20242e; padding:0}
  .export-wrap{max-width:860px; margin:0 auto; padding:32px 24px 60px}
  .export-toolbar{display:flex; justify-content:flex-end; gap:10px; margin-bottom:20px}
  .export-doc{margin-bottom:22px; break-inside:avoid}
  .export-dossierhead{display:flex; align-items:center; gap:16px; margin-bottom:22px}
  .export-dossierhead img{height:48px}
  .export-meta-table{width:100%; border-collapse:collapse; margin-bottom:18px}
  .export-meta-table td{padding:6px 10px; font-size:13px; border-bottom:1px solid #e3e3e8; color:#20242e}
  .export-meta-table td:first-child{font-weight:700; width:220px; color:#555}
  .export-wrap table.simple td{color:#20242e; border-top:1px solid #e9ebf1}
  .export-wrap .muted{color:#6b7184}
  .export-wrap .section-title{color:#141822}
  @media print{
    .export-toolbar{display:none}
    .export-wrap{padding:0; max-width:none}
    body{background:#fff}
  }
</style>
</head>
<body>
  <div class="export-wrap">
    <div class="export-toolbar">
      <button class="btn btn-gold" onclick="window.print()">Afdrukken / Opslaan als PDF</button>
    </div>
    <div class="export-dossierhead">
      <img src="${logoUrl}" alt="">
      <div>
        <div class="pv-eyebrow">Recherche &middot; BelgiëPD &middot; Document-export</div>
        <h2 style="margin:2px 0 0">${doc.type}</h2>
      </div>
    </div>
    <table class="export-meta-table">
      <tbody>
        <tr><td>Dossier</td><td>${dossierObj.naam}</td></tr>
        <tr><td>Datum export</td><td>${new Date().toLocaleString("nl-BE")}</td></tr>
      </tbody>
    </table>
    ${docExportHtml(doc, dossierObj)}
  </div>
</body>
</html>`;
}
function exporteerDocumentAlsPdf(doc, dossierObj){
  const html = genereerDocumentExportHtml(doc, dossierObj);
  const win = window.open("", "_blank");
  if (!win){
    alert("Kon geen nieuw venster openen. Controleer of pop-ups toegelaten zijn voor deze site.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/* ---------------- document toevoegen: type kiezen ---------------- */
const SIMPLE_DOC_TYPES = ["Melding", "Algemeen verslag", "Bijkomende informatie", "Opdracht"];
const VERSLAG_DOC_TYPES = ["OBN-verslag", "CSI-verslag", "GO-verslag"];

// Bepaalt, in vaste volgorde, welke documenttypes deze gebruiker mag kiezen.
function getAvailableDocTypes(session){
  const admin = isAdmin(session);
  const leiding = session.rol === "leiding";
  const hoofdrechercheur = session.rol === "hoofdrechercheur";
  const specs = session.specialisaties || [];
  return [
    { type: "Melding", kind: "simple", label: "Melding", visible: admin || leiding },
    { type: "Algemeen verslag", kind: "simple", label: "Algemeen verslag", visible: true },
    { type: "Bijkomende informatie", kind: "simple", label: "Bijkomende informatie", visible: true },
    { type: "OBN-verslag", kind: "verslag", label: "OBN-verslag", visible: admin || specs.includes("OBN") },
    { type: "CSI-verslag", kind: "tussenkomst", label: "CSI-verslag", visible: admin || specs.includes("CSI") },
    { type: "GO-verslag", kind: "tussenkomst", label: "GO-verslag", visible: admin || specs.includes("GO") },
    { type: "Opdracht", kind: "simple", label: "Opdracht &ndash; Procureur des Konings / Onderzoeksrechter", visible: admin },
    { type: "Verhoor-verslag", kind: "verhoor", label: "Verhoor-verslag", visible: true },
    { type: "Beschikbare resultaten", kind: "resultaten", label: "Beschikbare resultaten", visible: admin },
    { type: "TAP-dossier", kind: "resultaten", label: "TAP-dossier", visible: admin },
    { type: "Bijstandsaanvraag", kind: "resultaten", label: "Bijstandsaanvraag", visible: admin || leiding || hoofdrechercheur }
  ].filter(x => x.visible);
}

function openDocTypePicker(dossierObj, session){
  const options = getAvailableDocTypes(session);
  openModal(`
    <div class="modal-head"><h2>Document toevoegen</h2><button class="modal-close" id="mClose">&times;</button></div>
    <div class="hint" style="margin-bottom:14px">Kies het type document</div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${options.map(o => `<button class="btn btn-ghost" data-t="${o.type}" data-k="${o.kind}" style="justify-content:flex-start">${o.label}</button>`).join("")}
    </div>
  `);
  document.getElementById("mClose").addEventListener("click", closeModal);
  document.querySelectorAll("[data-t]").forEach(btn => btn.addEventListener("click", () => {
    const type = btn.dataset.t, kind = btn.dataset.k;
    closeModal();
    if (kind === "verslag") openVerslagForm(dossierObj, session, type);
    else if (kind === "tussenkomst") openTussenkomstForm(dossierObj, session, type);
    else if (kind === "resultaten") openResultatenForm(dossierObj, session, type);
    else if (kind === "verhoor") openVerhoorForm(dossierObj, session, type);
    else openSimpleDocForm(dossierObj, session, type);
  }));
}

// De auteur is altijd de ingelogde gebruiker; enkel een admin mag dit veld overschrijven (bv. om historisch in te voeren).
function auteurFieldHtml(session, value){
  if (isAdmin(session)) return `<div class="field"><label>Auteur</label><input id="fAuteur" value="${value}"></div>`;
  return `<div class="field"><label>Auteur</label><input id="fAuteur" value="${session.naam}" disabled style="opacity:.55;cursor:not-allowed"></div>`;
}
function readAuteur(session){
  return isAdmin(session) ? document.getElementById("fAuteur").value.trim() : session.naam;
}

/* ---------------- document toevoegen: eenvoudige types ---------------- */
// Zelfde opbouw als de OBN/CSI/GO-verslagen (openVerslagForm): een herhaalbare lijst van blokken
// in plaats van één groot tekstveld, zodat een verslag met meerdere vaststellingen/stappen even
// gestructureerd kan zijn als een echt PV, zonder een vaste structuur op te leggen.
function openSimpleDocForm(dossierObj, session, type, existingDoc){
  pendingVerwijderdeFotoIds = [];
  // Enkel de ID's vasthouden, niet de objecten zelf: dit formulier kan lang openstaan terwijl de
  // live db intussen door een ander/eigen tabblad vervangen wordt (onSnapshot), waardoor dossierObj/
  // existingDoc stale zouden zijn. Bij het opslaan wordt hieronder altijd opnieuw opgezocht.
  const dossierId = dossierObj.id;
  const existingDocId = existingDoc ? existingDoc.id : null;
  const isEdit = !!existingDoc;
  // Aanwezigen enkel tonen bij de echte verslagen (Algemeen verslag / Bijkomende informatie),
  // niet bij een loutere Melding of een Opdracht van PDK/onderzoeksrechter.
  const toontAanwezigen = type === "Algemeen verslag" || type === "Bijkomende informatie";
  // Postcode per sectie (optioneel) bij Melding / Algemeen verslag / Bijkomende informatie, zodat
  // dit ook op de dossierkaart verschijnt &mdash; niet bij een Opdracht (die komt van PDK/
  // onderzoeksrechter en heeft geen eigen locatie).
  const toontPostcode = type === "Melding" || type === "Algemeen verslag" || type === "Bijkomende informatie";
  const bestaandeSecties = existingDoc && existingDoc.secties && existingDoc.secties.length
    ? existingDoc.secties.map(s => ({ kop: s.kop || "", tekst: s.tekst || "", postcode: s.postcode || "", fotos: (s.fotos || []).slice() }))
    : [{ kop: "", tekst: (existingDoc && existingDoc.inhoud) || "", postcode: "", fotos: [] }];
  const state = {
    auteur: (existingDoc && existingDoc.auteur) || session.naam,
    datum: (existingDoc && existingDoc.datum) || "",
    tijd: (existingDoc && existingDoc.tijd) || "",
    titel: (existingDoc && existingDoc.titel) || "",
    afkomstigVan: (existingDoc && existingDoc.afkomstigVan) || "Procureur des Konings",
    secties: bestaandeSecties,
    aanwezigen: (existingDoc && existingDoc.aanwezigen) || []
  };

  function render_(){
    const afkomstigVeld = type === "Opdracht" ? `
      <div class="field"><label>Afkomstig van</label>
        <select id="fAfkomstig">
          <option value="Procureur des Konings" ${state.afkomstigVan === "Procureur des Konings" ? "selected" : ""}>Procureur des Konings</option>
          <option value="Onderzoeksrechter" ${state.afkomstigVan === "Onderzoeksrechter" ? "selected" : ""}>Onderzoeksrechter</option>
        </select>
      </div>` : "";
    const sectiesHtml = state.secties.map((s, i) => `
      <div class="locblock" data-i="${i}">
        <div class="row"><div class="hint" style="text-transform:uppercase;font-weight:700">Sectie ${i + 1}</div>
          ${state.secties.length > 1 ? `<span class="loc-remove" data-i="${i}" style="color:var(--red);font-size:12px;cursor:pointer;font-weight:600">Verwijderen</span>` : ""}
        </div>
        <div class="row2">
          <div class="field" style="${toontPostcode ? "" : "grid-column:1/-1"}"><label>Kop (optioneel)</label><input class="sec-kop" data-i="${i}" value="${s.kop}" placeholder="Bv. Vaststelling, Verloop, Besluit&hellip;"></div>
          ${toontPostcode ? `<div class="field"><label>Postcode (optioneel)</label><input class="sec-postcode" data-i="${i}" value="${s.postcode}" placeholder="Bv. 2000"></div>` : ""}
        </div>
        <div class="field"><label>Tekst</label><textarea class="sec-tekst" data-i="${i}" rows="4" style="resize:vertical">${s.tekst}</textarea></div>
        <div class="field"><label>Foto's (optioneel)</label>
          <div class="sec-fotos-wrap" data-i="${i}" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
        </div>
      </div>
    `).join("");

    modalBody.innerHTML = `
      <div class="modal-head"><h2>${type} ${isEdit ? "bewerken" : "toevoegen"}</h2><button class="modal-close" id="mClose">&times;</button></div>
      ${type === "Opdracht" ? "" : auteurFieldHtml(session, state.auteur)}
      <div class="row2">
        <div class="field"><label>Datum</label><input class="mono" id="fDatum" value="${state.datum}" placeholder="DD/MM/JJJJ" maxlength="10"></div>
        <div class="field"><label>Tijdstip</label><input class="mono" id="fTijd" value="${state.tijd}" placeholder="UU:MM" maxlength="5"></div>
      </div>
      ${afkomstigVeld}
      <div class="field"><label>Titel / korte omschrijving</label><input id="fTitel" value="${state.titel}" placeholder="Verschijnt zo in de tijdlijn"></div>
      <div id="sectiesWrap">${sectiesHtml}</div>
      <button class="btn btn-ghost btn-sm" id="addSecBtn" style="margin:8px 0 18px">+ Sectie toevoegen</button>
      ${toontAanwezigen ? aanwezigenFieldHtml(state.aanwezigen) : ""}
      <button class="btn btn-gold" id="saveSimpleDoc" style="width:100%;justify-content:center;margin-top:14px">${isEdit ? "Wijzigingen opslaan" : "Opslaan in dossier " + dossierObj.naam}</button>
    `;
    wireEvents();
  }

  function wireEvents(){
    modalBody.querySelector("#mClose").addEventListener("click", closeModal);
    if (toontAanwezigen) wireAanwezigenPills(modalBody, state);
    const fAuteurEl = modalBody.querySelector("#fAuteur");
    if (fAuteurEl && isAdmin(session)) fAuteurEl.addEventListener("input", (e) => { state.auteur = e.target.value; });
    modalBody.querySelector("#fDatum").addEventListener("input", (e) => { state.datum = fmtDateInput(e.target.value); e.target.value = state.datum; markeerVeldGeldigheid(e.target, state.datum, datumIsGeldig); });
    modalBody.querySelector("#fTijd").addEventListener("input", (e) => { state.tijd = fmtTimeInput(e.target.value); e.target.value = state.tijd; markeerVeldGeldigheid(e.target, state.tijd, tijdIsGeldig); });
    const afkomstigEl = modalBody.querySelector("#fAfkomstig");
    if (afkomstigEl) afkomstigEl.addEventListener("change", (e) => { state.afkomstigVan = e.target.value; });
    modalBody.querySelector("#fTitel").addEventListener("input", (e) => { state.titel = e.target.value; });
    modalBody.querySelectorAll(".sec-kop").forEach(inp => inp.addEventListener("input", (e) => { state.secties[+e.target.dataset.i].kop = e.target.value; }));
    modalBody.querySelectorAll(".sec-postcode").forEach(inp => inp.addEventListener("input", (e) => { state.secties[+e.target.dataset.i].postcode = e.target.value; }));
    modalBody.querySelectorAll(".sec-tekst").forEach(inp => inp.addEventListener("input", (e) => { state.secties[+e.target.dataset.i].tekst = e.target.value; }));
    wireOpmaakToolbars(modalBody, ".sec-tekst");
    modalBody.querySelectorAll(".sec-fotos-wrap").forEach(wrap => { if (!state.secties[+wrap.dataset.i].fotos) state.secties[+wrap.dataset.i].fotos = []; maakFotoWidget(wrap, state.secties[+wrap.dataset.i].fotos, session); });
    modalBody.querySelectorAll(".loc-remove").forEach(btn => btn.addEventListener("click", () => { state.secties.splice(+btn.dataset.i, 1); render_(); }));
    modalBody.querySelector("#addSecBtn").addEventListener("click", () => { state.secties.push({ kop: "", tekst: "", postcode: "", fotos: [] }); render_(); });
    modalBody.querySelector("#saveSimpleDoc").addEventListener("click", () => {
      // Bij een Opdracht is er geen "opgesteld door": die komt van de PDK/onderzoeksrechter zelf,
      // niet van het lid dat ze hier invoert &mdash; dus geen auteur-veld en geen auteur opslaan.
      if (!datumIsGeldig(state.datum)){ alert("De datum is niet geldig (DD/MM/JJJJ)."); return; }
      if (!tijdIsGeldig(state.tijd)){ alert("Het tijdstip is niet geldig (UU:MM)."); return; }
      const auteur = type === "Opdracht" ? "" : readAuteur(session);
      const datum = state.datum.trim() || "&ndash;";
      const tijd = state.tijd.trim();
      const titel = state.titel.trim();
      const afkomstigVan = type === "Opdracht" ? state.afkomstigVan : undefined;
      const secties = state.secties.map(s => ({ kop: s.kop.trim(), tekst: s.tekst.trim(), postcode: (s.postcode || "").trim(), fotos: s.fotos || [] })).filter(s => s.kop || s.tekst || s.postcode || s.fotos.length);
      if (isEdit){
        const live = vindLeefDoc(dossierId, existingDocId);
        if (!live){ alert("Dit document bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        const liveDoc = live.doc;
        liveDoc.auteur = auteur; liveDoc.datum = datum; liveDoc.tijd = tijd;
        liveDoc.titel = titel; liveDoc.secties = secties.length ? secties : [{ kop: "", tekst: "", postcode: "", fotos: [] }];
        liveDoc.aanwezigen = state.aanwezigen;
        delete liveDoc.inhoud;
        if (afkomstigVan !== undefined) liveDoc.afkomstigVan = afkomstigVan;
        logActiviteit(session, `${type} bewerkt`, live.dossierObj.naam);
      } else {
        const liveDossierObj = vindLeefDossier(dossierId);
        if (!liveDossierObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        const newDoc = { id: "d" + (db.nextDocId++), type, auteur, auteurId: session.id, datum, tijd, titel, secties: secties.length ? secties : [{ kop: "", tekst: "", postcode: "", fotos: [] }], aanwezigen: state.aanwezigen, gezienDoor: [session.id] };
        if (afkomstigVan !== undefined) newDoc.afkomstigVan = afkomstigVan;
        liveDossierObj.documenten.push(newDoc);
        logActiviteit(session, `${type} toegevoegd`, liveDossierObj.naam);
      }
      flushPendingVerwijderdeFotoIds();
      DB.save(db);
      closeModal();
      render();
    });
  }

  openModal(`<div id="docFormBody"></div>`, true);
  const modalBody = document.getElementById("docFormBody");
  render_();
}

/* ---------------- document toevoegen: specialisatie-verslag (OBN/CSI/GO) ---------------- */
function openVerslagForm(dossierObj, session, type, existingDoc){
  pendingVerwijderdeFotoIds = [];
  // Zie openSimpleDocForm hierboven: enkel ID's bewaren, bij opslaan altijd live opzoeken.
  const dossierId = dossierObj.id;
  const existingDocId = existingDoc ? existingDoc.id : null;
  const isEdit = !!existingDoc;
  const specialisatie = (type.split("-")[0]) || "OBN";
  const state = isEdit
    ? {
        auteur: existingDoc.auteur,
        locations: existingDoc.locaties.map(l => ({ datum: l.datum, tijd: l.tijd, postcode: l.postcode, tekst: l.tekst, photos: (l.foto_s || []).slice() })),
        aanwezigen: existingDoc.aanwezigen || []
      }
    : {
        auteur: session.naam,
        locations: [ { datum: "", tijd: "", postcode: "", tekst: "", photos: [] } ],
        aanwezigen: []
      };

  function render_(){
    const locsHtml = state.locations.map((l, i) => `
      <div class="locblock" data-i="${i}">
        <div class="row"><div class="hint" style="text-transform:uppercase;font-weight:700">Locatie ${i + 1}</div>
          ${state.locations.length > 1 ? `<span class="loc-remove" data-i="${i}" style="color:var(--red);font-size:12px;cursor:pointer;font-weight:600">Verwijderen</span>` : ""}
        </div>
        <div class="row2">
          <div class="field"><label>Datum</label><input class="mono loc-datum" data-i="${i}" value="${l.datum}" placeholder="DD/MM/JJJJ" maxlength="10"></div>
          <div class="field"><label>Tijdstip</label><input class="mono loc-tijd" data-i="${i}" value="${l.tijd}" placeholder="UU:MM" maxlength="5"></div>
        </div>
        <div class="field"><label>Postcode</label><input class="loc-postcode" data-i="${i}" value="${l.postcode}" placeholder="Bv. 2000"></div>
        <div class="field"><label>Vaststellingen</label><textarea class="loc-tekst" data-i="${i}" rows="3" style="resize:vertical">${l.tekst}</textarea></div>
        <div class="field"><label>Foto's van de ploeg</label>
          <div class="loc-fotos-wrap" data-i="${i}" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
        </div>
      </div>
    `).join("");

    modalBody.innerHTML = `
      <div class="modal-head"><h2>${type} ${isEdit ? "bewerken" : "toevoegen"}</h2><button class="modal-close" id="mClose">&times;</button></div>
      ${type === "Opdracht" ? "" : auteurFieldHtml(session, state.auteur)}
      <div class="hint" style="margin:10px 0">Locaties &mdash; elk met eigen tijdstip</div>
      <div id="locsWrap">${locsHtml}</div>
      <button class="btn btn-ghost btn-sm" id="addLocBtn" style="margin:8px 0 18px">+ Locatie toevoegen</button>
      ${aanwezigenFieldHtml(state.aanwezigen)}
      <button class="btn btn-gold" id="saveDocBtn" style="width:100%;justify-content:center;margin-top:14px">${isEdit ? "Wijzigingen opslaan" : "Opslaan in dossier " + dossierObj.naam}</button>
    `;
    wireEvents();
  }

  function wireEvents(){
    modalBody.querySelector("#mClose").addEventListener("click", closeModal);
    wireAanwezigenPills(modalBody, state);
    if (isAdmin(session)) modalBody.querySelector("#fAuteur").addEventListener("input", (e) => { state.auteur = e.target.value; });
    modalBody.querySelectorAll(".loc-datum").forEach(inp => inp.addEventListener("input", (e) => {
      const i = +e.target.dataset.i; const caret = e.target.value;
      state.locations[i].datum = fmtDateInput(caret); e.target.value = state.locations[i].datum;
      markeerVeldGeldigheid(e.target, state.locations[i].datum, datumIsGeldig);
    }));
    modalBody.querySelectorAll(".loc-tijd").forEach(inp => inp.addEventListener("input", (e) => {
      const i = +e.target.dataset.i; state.locations[i].tijd = fmtTimeInput(e.target.value); e.target.value = state.locations[i].tijd;
      markeerVeldGeldigheid(e.target, state.locations[i].tijd, tijdIsGeldig);
    }));
    modalBody.querySelectorAll(".loc-postcode").forEach(inp => inp.addEventListener("input", (e) => { state.locations[+e.target.dataset.i].postcode = e.target.value; }));
    modalBody.querySelectorAll(".loc-tekst").forEach(inp => inp.addEventListener("input", (e) => { state.locations[+e.target.dataset.i].tekst = e.target.value; }));
    wireOpmaakToolbars(modalBody, ".loc-tekst");
    modalBody.querySelectorAll(".loc-fotos-wrap").forEach(wrap => { const i = +wrap.dataset.i; if (!state.locations[i].photos) state.locations[i].photos = []; maakFotoWidget(wrap, state.locations[i].photos, session); });
    modalBody.querySelectorAll(".loc-remove").forEach(btn => btn.addEventListener("click", () => { state.locations.splice(+btn.dataset.i, 1); render_(); }));
    modalBody.querySelector("#addLocBtn").addEventListener("click", () => { state.locations.push({ datum: "", tijd: "", postcode: "", tekst: "", photos: [] }); render_(); });
    modalBody.querySelector("#saveDocBtn").addEventListener("click", () => {
      const ongeldigeLoc = state.locations.find(l => !datumIsGeldig(l.datum) || !tijdIsGeldig(l.tijd));
      if (ongeldigeLoc){ alert("Een van de locaties heeft een ongeldige datum (DD/MM/JJJJ) of tijdstip (UU:MM)."); return; }
      const auteur = readAuteur(session);
      const first = state.locations[0] || {};
      const locaties = state.locations.map(l => ({ datum: l.datum, tijd: l.tijd, postcode: l.postcode, tekst: l.tekst, foto_s: l.photos }));
      if (isEdit){
        const live = vindLeefDoc(dossierId, existingDocId);
        if (!live){ alert("Dit document bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        const liveDoc = live.doc;
        liveDoc.auteur = auteur;
        liveDoc.datum = first.datum || "&ndash;";
        liveDoc.tijd = first.tijd || "";
        liveDoc.locaties = locaties;
        liveDoc.aanwezigen = state.aanwezigen;
        logActiviteit(session, `${type} bewerkt`, live.dossierObj.naam);
      } else {
        const liveDossierObj = vindLeefDossier(dossierId);
        if (!liveDossierObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        liveDossierObj.documenten.push({
          id: "d" + (db.nextDocId++),
          type,
          specialisatie,
          auteur,
          auteurId: session.id,
          datum: first.datum || "&ndash;",
          tijd: first.tijd || "",
          locaties,
          aanwezigen: state.aanwezigen,
          gezienDoor: [session.id]
        });
        logActiviteit(session, `${type} toegevoegd`, liveDossierObj.naam);
      }
      flushPendingVerwijderdeFotoIds();
      DB.save(db);
      closeModal();
      render();
    });
  }

  openModal(`<div id="docFormBody"></div>`, true);
  const modalBody = document.getElementById("docFormBody");
  render_();
}

/* ---------------- document toevoegen: CSI/GO-tussenkomst (anders dan OBN: 1 postcode + tijdstippen) ---------------- */
// CSI en GO doen, in tegenstelling tot OBN (dat meerdere locaties observeert), telkens één
// tussenkomst op één postcode, met een reeks tijdstippen. CSI labelt daarbij sporen (rijen,
// zoals bij "Beschikbare resultaten") en kan foto's toevoegen; GO noteert in plaats daarvan wat
// er aangetroffen/in beslag genomen werd. Dat laatste rijenblok is mijn eigen toevoeging op wat
// je vroeg — zeg gerust als dat weg mag of anders moet.
function openTussenkomstForm(dossierObj, session, type, existingDoc){
  pendingVerwijderdeFotoIds = [];
  // Zie openSimpleDocForm hierboven: enkel ID's bewaren, bij opslaan altijd live opzoeken.
  const dossierId = dossierObj.id;
  const existingDocId = existingDoc ? existingDoc.id : null;
  const isEdit = !!existingDoc;
  const isCSI = type === "CSI-verslag";
  const specialisatie = type.split("-")[0];
  const rowsLabel = isCSI ? "Sporen" : "Inbeslagname";
  const rowsHint = isCSI ? "Label / omschrijving per aangetroffen spoor" : "Label / omschrijving per in beslag genomen goed";
  const defaultTijdstippen = [{ label: "", tijd: "" }];
  const tijLabelPlaceholder = isCSI ? "Bv. Ter plaatse, Aantreffen sporen, Einde tussenkomst" : "Bv. Betreden woning, Arrestatie, Boeien, Fouilleren";

  const state = existingDoc ? {
    auteur: existingDoc.auteur,
    datum: existingDoc.datum === "&ndash;" ? "" : existingDoc.datum,
    postcode: existingDoc.postcode || "",
    bevindingen: existingDoc.bevindingen || "",
    tijdstippen: (existingDoc.tijdstippen && existingDoc.tijdstippen.length) ? existingDoc.tijdstippen.map(t => ({ label: t.label || "", tijd: t.tijd || "" })) : defaultTijdstippen.map(t => ({...t})),
    rows: (existingDoc.rows && existingDoc.rows.length) ? existingDoc.rows.map(r => ({ label: r.label || "", waarde: r.waarde || "" })) : [{ label: "", waarde: "" }],
    foto_s: (existingDoc.foto_s || []).slice(),
    aanwezigen: existingDoc.aanwezigen || []
  } : {
    auteur: session.naam,
    datum: "",
    postcode: "",
    bevindingen: "",
    tijdstippen: defaultTijdstippen.map(t => ({...t})),
    rows: [{ label: "", waarde: "" }],
    foto_s: [],
    aanwezigen: []
  };

  function render_(){
    const tijdstippenHtml = state.tijdstippen.map((t, i) => `
      <div class="row2" data-i="${i}" style="align-items:flex-end">
        <div class="field"><label>${i === 0 ? "Moment" : ""}</label><input class="tij-label" data-i="${i}" value="${t.label}" placeholder="${tijLabelPlaceholder}"></div>
        <div style="display:flex;gap:8px;align-items:flex-end">
          <div class="field" style="flex:1"><label>${i === 0 ? "Tijdstip" : ""}</label><input class="mono tij-tijd" data-i="${i}" value="${t.tijd}" placeholder="UU:MM" maxlength="5"></div>
          ${state.tijdstippen.length > 1 ? `<span class="tij-remove" data-i="${i}" style="color:var(--red);font-size:12px;cursor:pointer;font-weight:600;white-space:nowrap;padding-bottom:12px">Verwijderen</span>` : ""}
        </div>
      </div>
    `).join("");
    const rowsHtml = state.rows.map((r, i) => `
      <div class="row2" data-i="${i}" style="align-items:flex-end">
        <div class="field"><label>${i === 0 ? "Label" : ""}</label><input class="row-label" data-i="${i}" value="${r.label}" placeholder="${isCSI ? "Bv. Spoor 1" : "Bv. Inbeslagname 1"}"></div>
        <div style="display:flex;gap:8px;align-items:flex-end">
          <div class="field" style="flex:1"><label>${i === 0 ? "Omschrijving" : ""}</label><input class="row-waarde" data-i="${i}" value="${r.waarde}" placeholder="${isCSI ? "Bv. Vingerafdruk op deurklink slaapkamer" : "Bv. 500g vermoedelijke cocaïne, aangetroffen in slaapkamer"}"></div>
          ${state.rows.length > 1 ? `<span class="row-remove" data-i="${i}" style="color:var(--red);font-size:12px;cursor:pointer;font-weight:600;white-space:nowrap;padding-bottom:12px">Verwijderen</span>` : ""}
        </div>
      </div>
    `).join("");
    const fotosHtml = `
      <div class="field"><label>Foto's van de tussenkomst</label>
        <div id="tkFotosWrap" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
      </div>`;

    modalBody.innerHTML = `
      <div class="modal-head"><h2>${type} ${isEdit ? "bewerken" : "toevoegen"}</h2><button class="modal-close" id="mClose">&times;</button></div>
      ${type === "Opdracht" ? "" : auteurFieldHtml(session, state.auteur)}
      <div class="row2">
        <div class="field"><label>Datum</label><input class="mono" id="fDatum" value="${state.datum}" placeholder="DD/MM/JJJJ" maxlength="10"></div>
        <div class="field"><label>Postcode</label><input id="fPostcode" value="${state.postcode}" placeholder="Bv. 2000"></div>
      </div>
      <div class="hint" style="margin:10px 0">Relevante tijdstippen</div>
      <div id="tijWrap">${tijdstippenHtml}</div>
      <button class="btn btn-ghost btn-sm" id="addTijBtn" style="margin:8px 0 18px">+ Tijdstip toevoegen</button>
      <div class="field"><label>Bevindingen (optioneel)</label><textarea id="fBevindingen" rows="3" style="resize:vertical">${state.bevindingen}</textarea></div>
      <div class="hint" style="margin:10px 0">${rowsHint}</div>
      <div id="rowsWrap">${rowsHtml}</div>
      <button class="btn btn-ghost btn-sm" id="addRowBtn" style="margin:8px 0 18px">+ ${rowsLabel.replace(/s$/, "")} toevoegen</button>
      ${fotosHtml}
      ${aanwezigenFieldHtml(state.aanwezigen)}
      <button class="btn btn-gold" id="saveTussenkomst" style="width:100%;justify-content:center;margin-top:10px">${isEdit ? "Wijzigingen opslaan" : "Opslaan in dossier " + dossierObj.naam}</button>
    `;
    wireEvents();
  }

  function wireEvents(){
    modalBody.querySelector("#mClose").addEventListener("click", closeModal);
    wireAanwezigenPills(modalBody, state);
    if (isAdmin(session)) modalBody.querySelector("#fAuteur").addEventListener("input", (e) => { state.auteur = e.target.value; });
    modalBody.querySelector("#fDatum").addEventListener("input", (e) => { state.datum = fmtDateInput(e.target.value); e.target.value = state.datum; markeerVeldGeldigheid(e.target, state.datum, datumIsGeldig); });
    modalBody.querySelector("#fPostcode").addEventListener("input", (e) => { state.postcode = e.target.value; });
    modalBody.querySelector("#fBevindingen").addEventListener("input", (e) => { state.bevindingen = e.target.value; });
    maakOpmaakToolbar(modalBody.querySelector("#fBevindingen"));
    modalBody.querySelectorAll(".tij-label").forEach(inp => inp.addEventListener("input", (e) => { state.tijdstippen[+e.target.dataset.i].label = e.target.value; }));
    modalBody.querySelectorAll(".tij-tijd").forEach(inp => inp.addEventListener("input", (e) => { const i = +e.target.dataset.i; state.tijdstippen[i].tijd = fmtTimeInput(e.target.value); e.target.value = state.tijdstippen[i].tijd; markeerVeldGeldigheid(e.target, state.tijdstippen[i].tijd, tijdIsGeldig); }));
    modalBody.querySelectorAll(".tij-remove").forEach(btn => btn.addEventListener("click", () => { state.tijdstippen.splice(+btn.dataset.i, 1); render_(); }));
    modalBody.querySelector("#addTijBtn").addEventListener("click", () => { state.tijdstippen.push({ label: "", tijd: "" }); render_(); });
    modalBody.querySelectorAll(".row-label").forEach(inp => inp.addEventListener("input", (e) => { state.rows[+e.target.dataset.i].label = e.target.value; }));
    modalBody.querySelectorAll(".row-waarde").forEach(inp => inp.addEventListener("input", (e) => { state.rows[+e.target.dataset.i].waarde = e.target.value; }));
    modalBody.querySelectorAll(".row-remove").forEach(btn => btn.addEventListener("click", () => { state.rows.splice(+btn.dataset.i, 1); render_(); }));
    modalBody.querySelector("#addRowBtn").addEventListener("click", () => { state.rows.push({ label: "", waarde: "" }); render_(); });
    const tkFotosWrap = modalBody.querySelector("#tkFotosWrap");
    if (tkFotosWrap){ if (!state.foto_s) state.foto_s = []; maakFotoWidget(tkFotosWrap, state.foto_s, session); }
    modalBody.querySelector("#saveTussenkomst").addEventListener("click", () => {
      if (!datumIsGeldig(state.datum)){ alert("De datum is niet geldig (DD/MM/JJJJ)."); return; }
      const ongeldigTijdstip = state.tijdstippen.find(t => !tijdIsGeldig(t.tijd));
      if (ongeldigTijdstip){ alert("Een van de tijdstippen is niet geldig (UU:MM)."); return; }
      const auteur = readAuteur(session);
      const datum = state.datum.trim() || "&ndash;";
      const postcode = state.postcode.trim();
      const bevindingen = state.bevindingen.trim();
      const tijdstippen = state.tijdstippen.map(t => ({ label: t.label.trim(), tijd: t.tijd.trim() })).filter(t => t.label || t.tijd);
      const rows = state.rows.map(r => ({ label: r.label.trim(), waarde: r.waarde.trim() })).filter(r => r.label || r.waarde);
      // Net als bij een OBN-verslag (eerste locatie) wordt het tijdstip in de chronologie
      // overgenomen van het eerste ingevulde tijdstip hier, zodat het ook daar zichtbaar is.
      const eersteTijd = (tijdstippen[0] && tijdstippen[0].tijd) || "";
      if (isEdit){
        const live = vindLeefDoc(dossierId, existingDocId);
        if (!live){ alert("Dit document bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        const liveDoc = live.doc;
        liveDoc.auteur = auteur; liveDoc.datum = datum; liveDoc.tijd = eersteTijd; liveDoc.postcode = postcode;
        liveDoc.bevindingen = bevindingen;
        liveDoc.tijdstippen = tijdstippen.length ? tijdstippen : [{ label: "", tijd: "" }];
        liveDoc.rows = rows;
        liveDoc.aanwezigen = state.aanwezigen;
        liveDoc.foto_s = state.foto_s;
        logActiviteit(session, `${type} bewerkt`, live.dossierObj.naam);
      } else {
        const liveDossierObj = vindLeefDossier(dossierId);
        if (!liveDossierObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        const newDoc = {
          id: "d" + (db.nextDocId++), type, specialisatie, auteur, auteurId: session.id, datum, tijd: eersteTijd,
          postcode, bevindingen,
          tijdstippen: tijdstippen.length ? tijdstippen : [{ label: "", tijd: "" }],
          rows,
          aanwezigen: state.aanwezigen,
          gezienDoor: [session.id],
          foto_s: state.foto_s
        };
        liveDossierObj.documenten.push(newDoc);
        logActiviteit(session, `${type} toegevoegd`, liveDossierObj.naam);
      }
      flushPendingVerwijderdeFotoIds();
      DB.save(db);
      closeModal();
      render();
    });
  }

  openModal(`<div id="docFormBody"></div>`, true);
  const modalBody = document.getElementById("docFormBody");
  render_();
}

/* ---------------- document toevoegen: verhoor-verslag ---------------- */
// Zelfde sectie-opbouw als een Algemeen verslag (kop + tekst + foto's per sectie, bv. voor de
// losse vragen/vaststellingen tijdens het verhoor), met daarbovenop de vaste verhoor-gegevens:
// wie ondervraagd werd, in welke hoedanigheid, of de cautie/rechten werden voorgelezen (en
// wanneer) en of er bijstand van een advocaat was.
function openVerhoorForm(dossierObj, session, type, existingDoc){
  pendingVerwijderdeFotoIds = [];
  // Zie openSimpleDocForm hierboven: enkel ID's bewaren, bij opslaan altijd live opzoeken.
  const dossierId = dossierObj.id;
  const existingDocId = existingDoc ? existingDoc.id : null;
  const isEdit = !!existingDoc;
  const bestaandeSecties = existingDoc && existingDoc.secties && existingDoc.secties.length
    ? existingDoc.secties.map(s => ({ kop: s.kop || "", tekst: s.tekst || "", fotos: (s.fotos || []).slice() }))
    : [{ kop: "", tekst: "", fotos: [] }];
  const state = {
    auteur: (existingDoc && existingDoc.auteur) || session.naam,
    datum: (existingDoc && existingDoc.datum) || "",
    tijd: (existingDoc && existingDoc.tijd) || "",
    eindTijd: (existingDoc && existingDoc.eindTijd) || "",
    ondervraagde: (existingDoc && existingDoc.ondervraagde) || "",
    hoedanigheid: (existingDoc && existingDoc.hoedanigheid) || "Verdachte",
    cautie: !!(existingDoc && existingDoc.cautie),
    cautieTijd: (existingDoc && existingDoc.cautieTijd) || "",
    advocaat: !!(existingDoc && existingDoc.advocaat),
    advocaatNaam: (existingDoc && existingDoc.advocaatNaam) || "",
    titel: (existingDoc && existingDoc.titel) || "",
    secties: bestaandeSecties,
    aanwezigen: (existingDoc && existingDoc.aanwezigen) || []
  };

  function render_(){
    const sectiesHtml = state.secties.map((s, i) => `
      <div class="locblock" data-i="${i}">
        <div class="row"><div class="hint" style="text-transform:uppercase;font-weight:700">Sectie ${i + 1}</div>
          ${state.secties.length > 1 ? `<span class="loc-remove" data-i="${i}" style="color:var(--red);font-size:12px;cursor:pointer;font-weight:600">Verwijderen</span>` : ""}
        </div>
        <div class="field"><label>Kop (optioneel)</label><input class="sec-kop" data-i="${i}" value="${s.kop}" placeholder="Bv. Vraag 1, Verklaring over..."></div>
        <div class="field"><label>Tekst</label><textarea class="sec-tekst" data-i="${i}" rows="4" style="resize:vertical">${s.tekst}</textarea></div>
        <div class="field"><label>Foto's (optioneel)</label>
          <div class="sec-fotos-wrap" data-i="${i}" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
        </div>
      </div>
    `).join("");

    modalBody.innerHTML = `
      <div class="modal-head"><h2>Verhoor-verslag ${isEdit ? "bewerken" : "toevoegen"}</h2><button class="modal-close" id="mClose">&times;</button></div>
      ${auteurFieldHtml(session, state.auteur)}
      <div class="row2">
        <div class="field"><label>Datum</label><input class="mono" id="fDatum" value="${state.datum}" placeholder="DD/MM/JJJJ" maxlength="10"></div>
        <div class="field"><label>Start-uur</label><input class="mono" id="fTijd" value="${state.tijd}" placeholder="UU:MM" maxlength="5"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Ondervraagde</label><input id="fOndervraagde" value="${state.ondervraagde}" placeholder="Naam van de ondervraagde"></div>
        <div class="field"><label>Hoedanigheid</label>
          <select id="fHoedanigheid">
            ${["Verdachte", "Getuige", "Slachtoffer", "Andere"].map(h => `<option value="${h}" ${state.hoedanigheid === h ? "selected" : ""}>${h}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field"><label>Eind-uur (optioneel)</label><input class="mono" id="fEindTijd" value="${state.eindTijd}" placeholder="UU:MM" maxlength="5"></div>
      <div class="row2">
        <div class="field">
          <label style="font-size:13px;font-weight:400;text-transform:none;letter-spacing:0"><input type="checkbox" id="fCautie" ${state.cautie ? "checked" : ""}> Rechten ontvangen</label>
          <div class="hint" id="toonRechtenBtn" style="cursor:pointer;text-decoration:underline;margin-top:4px">Bekijk standaardtekst</div>
        </div>
        <div class="field">
          <label style="font-size:13px;font-weight:400;text-transform:none;letter-spacing:0"><input type="checkbox" id="fAdvocaat" ${state.advocaat ? "checked" : ""}> Bijstand advocaat</label>
        </div>
      </div>
      ${(state.cautie || state.advocaat) ? `<div class="row2">
        <div>${state.cautie ? `<div class="field"><label>Tijdstip rechten ontvangen</label><input class="mono" id="fCautieTijd" value="${state.cautieTijd}" placeholder="UU:MM" maxlength="5"></div>` : ""}</div>
        <div>${state.advocaat ? `<div class="field"><label>Naam advocaat</label><input id="fAdvocaatNaam" value="${state.advocaatNaam}"></div>` : ""}</div>
      </div>` : ""}
      <div class="field"><label>Titel / korte omschrijving</label><input id="fTitel" value="${state.titel}" placeholder="Verschijnt zo in de tijdlijn"></div>
      <div class="hint" style="margin:10px 0">Verklaring &mdash; eventueel opgedeeld in secties (bv. per vraag of per onderwerp)</div>
      <div id="sectiesWrap">${sectiesHtml}</div>
      <button class="btn btn-ghost btn-sm" id="addSecBtn" style="margin:8px 0 18px">+ Sectie toevoegen</button>
      ${aanwezigenFieldHtml(state.aanwezigen)}
      <button class="btn btn-gold" id="saveVerhoor" style="width:100%;justify-content:center;margin-top:14px">${isEdit ? "Wijzigingen opslaan" : "Opslaan in dossier " + dossierObj.naam}</button>
    `;
    wireEvents();
  }

  function wireEvents(){
    modalBody.querySelector("#mClose").addEventListener("click", closeModal);
    wireAanwezigenPills(modalBody, state);
    const fAuteurEl = modalBody.querySelector("#fAuteur");
    if (fAuteurEl && isAdmin(session)) fAuteurEl.addEventListener("input", (e) => { state.auteur = e.target.value; });
    modalBody.querySelector("#fDatum").addEventListener("input", (e) => { state.datum = fmtDateInput(e.target.value); e.target.value = state.datum; markeerVeldGeldigheid(e.target, state.datum, datumIsGeldig); });
    modalBody.querySelector("#fTijd").addEventListener("input", (e) => { state.tijd = fmtTimeInput(e.target.value); e.target.value = state.tijd; markeerVeldGeldigheid(e.target, state.tijd, tijdIsGeldig); });
    modalBody.querySelector("#fEindTijd").addEventListener("input", (e) => { state.eindTijd = fmtTimeInput(e.target.value); e.target.value = state.eindTijd; markeerVeldGeldigheid(e.target, state.eindTijd, tijdIsGeldig); });
    modalBody.querySelector("#fOndervraagde").addEventListener("input", (e) => { state.ondervraagde = e.target.value; });
    modalBody.querySelector("#fHoedanigheid").addEventListener("change", (e) => { state.hoedanigheid = e.target.value; });
    modalBody.querySelector("#fCautie").addEventListener("change", (e) => { state.cautie = e.target.checked; render_(); });
    modalBody.querySelector("#toonRechtenBtn").addEventListener("click", () => openInfoPopup("Rechten bij verhoor", RECHTEN_STANDAARDTEKST));
    const cautieTijdEl = modalBody.querySelector("#fCautieTijd");
    if (cautieTijdEl) cautieTijdEl.addEventListener("input", (e) => { state.cautieTijd = fmtTimeInput(e.target.value); e.target.value = state.cautieTijd; markeerVeldGeldigheid(e.target, state.cautieTijd, tijdIsGeldig); });
    modalBody.querySelector("#fAdvocaat").addEventListener("change", (e) => { state.advocaat = e.target.checked; render_(); });
    const advocaatNaamEl = modalBody.querySelector("#fAdvocaatNaam");
    if (advocaatNaamEl) advocaatNaamEl.addEventListener("input", (e) => { state.advocaatNaam = e.target.value; });
    modalBody.querySelector("#fTitel").addEventListener("input", (e) => { state.titel = e.target.value; });
    modalBody.querySelectorAll(".sec-kop").forEach(inp => inp.addEventListener("input", (e) => { state.secties[+e.target.dataset.i].kop = e.target.value; }));
    modalBody.querySelectorAll(".sec-tekst").forEach(inp => inp.addEventListener("input", (e) => { state.secties[+e.target.dataset.i].tekst = e.target.value; }));
    wireOpmaakToolbars(modalBody, ".sec-tekst");
    modalBody.querySelectorAll(".sec-fotos-wrap").forEach(wrap => { const i = +wrap.dataset.i; if (!state.secties[i].fotos) state.secties[i].fotos = []; maakFotoWidget(wrap, state.secties[i].fotos, session); });
    modalBody.querySelectorAll(".loc-remove").forEach(btn => btn.addEventListener("click", () => { state.secties.splice(+btn.dataset.i, 1); render_(); }));
    modalBody.querySelector("#addSecBtn").addEventListener("click", () => { state.secties.push({ kop: "", tekst: "", fotos: [] }); render_(); });
    modalBody.querySelector("#saveVerhoor").addEventListener("click", () => {
      if (!datumIsGeldig(state.datum)){ alert("De datum is niet geldig (DD/MM/JJJJ)."); return; }
      if (!tijdIsGeldig(state.tijd)){ alert("Het tijdstip is niet geldig (UU:MM)."); return; }
      if (!tijdIsGeldig(state.eindTijd)){ alert("Het eindtijdstip is niet geldig (UU:MM)."); return; }
      if (state.cautie && !tijdIsGeldig(state.cautieTijd)){ alert("Het tijdstip van de cautie is niet geldig (UU:MM)."); return; }
      const auteur = readAuteur(session);
      const datum = state.datum.trim() || "&ndash;";
      const tijd = state.tijd.trim();
      const eindTijd = state.eindTijd.trim();
      const ondervraagde = state.ondervraagde.trim();
      const titel = state.titel.trim() || (ondervraagde ? `Verhoor &ndash; ${ondervraagde}` : "Verhoor-verslag");
      const cautieTijd = state.cautie ? state.cautieTijd.trim() : "";
      const advocaatNaam = state.advocaat ? state.advocaatNaam.trim() : "";
      const secties = state.secties.map(s => ({ kop: s.kop.trim(), tekst: s.tekst.trim(), fotos: s.fotos || [] })).filter(s => s.kop || s.tekst || s.fotos.length);
      const payload = {
        auteur, datum, tijd, eindTijd, ondervraagde, hoedanigheid: state.hoedanigheid,
        cautie: state.cautie, cautieTijd, advocaat: state.advocaat, advocaatNaam, titel,
        secties: secties.length ? secties : [{ kop: "", tekst: "", fotos: [] }],
        aanwezigen: state.aanwezigen
      };
      if (isEdit){
        const live = vindLeefDoc(dossierId, existingDocId);
        if (!live){ alert("Dit document bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        Object.assign(live.doc, payload);
        logActiviteit(session, "Verhoor-verslag bewerkt", live.dossierObj.naam);
      } else {
        const liveDossierObj = vindLeefDossier(dossierId);
        if (!liveDossierObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        liveDossierObj.documenten.push({ id: "d" + (db.nextDocId++), type: "Verhoor-verslag", ...payload, auteurId: session.id, gezienDoor: [session.id] });
        logActiviteit(session, "Verhoor-verslag toegevoegd", liveDossierObj.naam);
      }
      flushPendingVerwijderdeFotoIds();
      DB.save(db);
      closeModal();
      render();
    });
  }

  openModal(`<div id="docFormBody"></div>`, true);
  const modalBody = document.getElementById("docFormBody");
  render_();
}

/* ---------------- document toevoegen: beschikbare resultaten (interne spreadsheet/aanvullingen) ---------------- */
function openResultatenForm(dossierObj, session, type, existingDoc){
  pendingVerwijderdeFotoIds = [];
  // Zie openSimpleDocForm hierboven: enkel ID's bewaren, bij opslaan altijd live opzoeken.
  const dossierId = dossierObj.id;
  const existingDocId = existingDoc ? existingDoc.id : null;
  const isEdit = !!existingDoc;
  const isTap = type === "TAP-dossier";
  const isBijstand = type === "Bijstandsaanvraag";
  // Bij een nieuwe lopende TAP / bijstandsaanvraag alvast de vaste, relevante gegevens als rijen
  // voorstellen; bij "Beschikbare resultaten" blijft het gewoon één lege rij, net als voorheen.
  const defaultRows = isTap
    ? [{ label: "Onderzoeksrechter", waarde: "" }, { label: "Nummer onder afluistering", waarde: "" }, { label: "Looptijd machtiging", waarde: "" }]
    : isBijstand
    ? [
        { label: "Datum tussenkomst", waarde: "" },
        { label: "Tijdstip briefing", waarde: "" },
        { label: "Postcode tussenkomst", waarde: "" },
        { label: "Aantal verdachten", waarde: "" }
      ]
    : [{ label: "", waarde: "" }];
  // Nieuwe bijstandsaanvraag: "Informatie verdachten" krijgt een klein sjabloon mee, zodat de
  // admin enkel na elk label moet aanvullen in plaats van de structuur zelf te moeten verzinnen.
  const verdachtenTemplate = "Identiteit: \nAntecedenten: \nMogelijk gewapend: \nBijzondere risico's: ";
  // Per rij-label een passend placeholder-voorbeeld tonen (datum/tijd/postcode/cijfer), zodat
  // meteen duidelijk is in welk formaat de waarde verwacht wordt.
  const bijstandWaardePlaceholder = (label) => {
    if (label === "Datum tussenkomst") return "DD/MM/JJJJ";
    if (label === "Tijdstip briefing") return "UU:MM";
    if (label === "Postcode tussenkomst") return "Bv. 9000";
    if (label === "Aantal verdachten") return "Bv. 2";
    return "Bv. 0470 12 34 56";
  };
  const state = {
    auteur: (existingDoc && existingDoc.auteur) || session.naam,
    datum: (existingDoc && existingDoc.datum) || "",
    tijd: (existingDoc && existingDoc.tijd) || "",
    titel: (existingDoc && existingDoc.titel) || "",
    inhoud: (existingDoc && existingDoc.inhoud) || "",
    reden: (existingDoc && existingDoc.reden) || "",
    verdachtenInfo: (existingDoc && existingDoc.verdachtenInfo) || (isBijstand && !isEdit ? verdachtenTemplate : ""),
    verdachtenFotos: (existingDoc && existingDoc.verdachtenFotos || []).slice(),
    pand: (existingDoc && existingDoc.pand) || "",
    pandFotos: (existingDoc && existingDoc.pandFotos || []).slice(),
    dossierbeheerders: (existingDoc && existingDoc.dossierbeheerders) || "",
    externLink: (existingDoc && existingDoc.externLink) || "",
    foto_s: (existingDoc && existingDoc.foto_s || []).slice(),
    rows: (existingDoc && existingDoc.rows && existingDoc.rows.length && existingDoc.rows.map(r => ({ label: r.label, waarde: r.waarde }))) || defaultRows,
    aanwezigen: (existingDoc && existingDoc.aanwezigen) || []
  };

  function render_(){
    const rowsHtml = state.rows.map((r, i) => `
      <div class="row2" data-i="${i}" style="align-items:flex-end">
        <div class="field"><label>${i === 0 ? "Label" : ""}</label><input class="row-label" data-i="${i}" value="${r.label}" placeholder="Bv. Nummer / Datum / IMEI"></div>
        <div style="display:flex;gap:8px;align-items:flex-end">
          <div class="field" style="flex:1"><label>${i === 0 ? "Waarde" : ""}</label><input class="row-waarde" data-i="${i}" value="${r.waarde}" placeholder="${isBijstand ? bijstandWaardePlaceholder(r.label) : "Bv. 0470 12 34 56"}"></div>
          ${state.rows.length > 1 ? `<span class="row-remove" data-i="${i}" style="color:var(--red);font-size:12px;cursor:pointer;font-weight:600;white-space:nowrap;padding-bottom:12px">Verwijderen</span>` : ""}
        </div>
      </div>
    `).join("");

    modalBody.innerHTML = `
      <div class="modal-head"><h2>${type} ${isEdit ? "bewerken" : "toevoegen"}</h2><button class="modal-close" id="mClose">&times;</button></div>
      ${type === "Opdracht" ? "" : auteurFieldHtml(session, state.auteur)}
      <div class="row2">
        <div class="field"><label>Datum</label><input class="mono" id="fDatum" value="${state.datum}" placeholder="DD/MM/JJJJ" maxlength="10"></div>
        <div class="field"><label>Tijdstip</label><input class="mono" id="fTijd" value="${state.tijd}" placeholder="UU:MM" maxlength="5"></div>
      </div>
      <div class="field"><label>Titel / korte omschrijving</label><input id="fTitel" value="${state.titel}" placeholder="${isTap ? "Bv. TAP DE SMET Victor" : isBijstand ? "Bv. Bijstand AE &ndash; inval postcode 2000" : "Bv. Resultaten &ndash; Proximus, Resultaten &ndash; Bank, Resultaten &ndash; Andere"}"></div>
      ${isBijstand ? "" : `<div class="field"><label>Inhoud / duiding</label><textarea id="fInhoud" rows="3" style="resize:vertical" placeholder="Korte duiding bij de resultaten">${state.inhoud}</textarea></div>`}
      <div class="hint" style="margin:10px 0">${isBijstand ? "Gegevens voor de eenheid &mdash; label / waarde per rij, zodat ze zich kunnen voorbereiden" : "Resultatentabel &mdash; label / waarde per rij (vervangt de externe spreadsheet)"}</div>
      <div id="rowsWrap">${rowsHtml}</div>
      <button class="btn btn-ghost btn-sm" id="addRowBtn" style="margin:8px 0 18px">+ Rij toevoegen</button>
      ${isBijstand ? `
        <div class="field"><label>Reden / context &amp; omschrijving opdracht</label><textarea id="fReden" rows="4" style="resize:vertical" placeholder="Waarom is bijstand nodig, en wat wordt precies van de eenheid verwacht">${state.reden}</textarea></div>
        <div class="field"><label>Informatie verdachten</label><textarea id="fVerdachten" rows="5" style="resize:vertical">${state.verdachtenInfo}</textarea></div>
        <div class="field"><label>Foto's bij informatie verdachten (optioneel)</label>
          <div id="verdachtenFotosWrap" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
        </div>
        <div class="field"><label>Beschrijving van het pand</label><textarea id="fPand" rows="3" style="resize:vertical" placeholder="Indeling, toegangen, mogelijke vluchtwegen, ...">${state.pand}</textarea></div>
        <div class="field"><label>Foto's bij beschrijving van het pand (optioneel)</label>
          <div id="pandFotosWrap" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
        </div>
        <div class="field"><label>Dossierbeheerder(s)</label><input id="fDossierbeheerders" value="${state.dossierbeheerders}" placeholder="Bv. Unemi, Jelle"></div>
      ` : ""}
      <div class="field"><label>Foto's (optioneel)</label>
        <div id="resultatenFotosWrap" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
      </div>
      <div class="field"><label>Externe link (optioneel)</label><input id="fLink" value="${state.externLink}" placeholder="https://docs.google.com/..."></div>
      <button class="btn btn-gold" id="saveResultatenBtn" style="width:100%;justify-content:center;margin-top:14px">${isEdit ? "Wijzigingen opslaan" : "Opslaan in dossier " + dossierObj.naam}</button>
    `;
    wireEvents();
  }

  function wireEvents(){
    modalBody.querySelector("#mClose").addEventListener("click", closeModal);
    modalBody.querySelector("#fDatum").addEventListener("input", (e) => { e.target.value = fmtDateInput(e.target.value); state.datum = e.target.value; markeerVeldGeldigheid(e.target, state.datum, datumIsGeldig); });
    modalBody.querySelector("#fTijd").addEventListener("input", (e) => { e.target.value = fmtTimeInput(e.target.value); state.tijd = e.target.value; markeerVeldGeldigheid(e.target, state.tijd, tijdIsGeldig); });
    if (isAdmin(session)) modalBody.querySelector("#fAuteur").addEventListener("input", (e) => { state.auteur = e.target.value; });
    if (modalBody.querySelector("#fTitel")) modalBody.querySelector("#fTitel").addEventListener("input", (e) => { state.titel = e.target.value; });
    if (modalBody.querySelector("#fInhoud")){ modalBody.querySelector("#fInhoud").addEventListener("input", (e) => { state.inhoud = e.target.value; }); maakOpmaakToolbar(modalBody.querySelector("#fInhoud")); }
    if (modalBody.querySelector("#fReden")){ modalBody.querySelector("#fReden").addEventListener("input", (e) => { state.reden = e.target.value; }); maakOpmaakToolbar(modalBody.querySelector("#fReden")); }
    if (modalBody.querySelector("#fVerdachten")){ modalBody.querySelector("#fVerdachten").addEventListener("input", (e) => { state.verdachtenInfo = e.target.value; }); maakOpmaakToolbar(modalBody.querySelector("#fVerdachten")); }
    if (modalBody.querySelector("#fPand")){ modalBody.querySelector("#fPand").addEventListener("input", (e) => { state.pand = e.target.value; }); maakOpmaakToolbar(modalBody.querySelector("#fPand")); }
    if (modalBody.querySelector("#fDossierbeheerders")) modalBody.querySelector("#fDossierbeheerders").addEventListener("input", (e) => { state.dossierbeheerders = e.target.value; });
    if (modalBody.querySelector("#fLink")) modalBody.querySelector("#fLink").addEventListener("input", (e) => { state.externLink = e.target.value; });
    modalBody.querySelectorAll(".row-label").forEach(inp => inp.addEventListener("input", (e) => { state.rows[+e.target.dataset.i].label = e.target.value; }));
    modalBody.querySelectorAll(".row-waarde").forEach(inp => inp.addEventListener("input", (e) => {
      const i = +e.target.dataset.i;
      if (isBijstand && state.rows[i].label === "Datum tussenkomst"){ e.target.value = fmtDateInput(e.target.value); markeerVeldGeldigheid(e.target, e.target.value, datumIsGeldig); }
      if (isBijstand && state.rows[i].label === "Tijdstip briefing"){ e.target.value = fmtTimeInput(e.target.value); markeerVeldGeldigheid(e.target, e.target.value, tijdIsGeldig); }
      state.rows[i].waarde = e.target.value;
    }));
    modalBody.querySelectorAll(".row-remove").forEach(btn => btn.addEventListener("click", () => { state.rows.splice(+btn.dataset.i, 1); render_(); }));
    modalBody.querySelector("#addRowBtn").addEventListener("click", () => { state.rows.push({ label: "", waarde: "" }); render_(); });
    if (modalBody.querySelector("#verdachtenFotosWrap")){ if (!state.verdachtenFotos) state.verdachtenFotos = []; maakFotoWidget(modalBody.querySelector("#verdachtenFotosWrap"), state.verdachtenFotos, session); }
    if (modalBody.querySelector("#pandFotosWrap")){ if (!state.pandFotos) state.pandFotos = []; maakFotoWidget(modalBody.querySelector("#pandFotosWrap"), state.pandFotos, session); }
    if (!state.foto_s) state.foto_s = [];
    maakFotoWidget(modalBody.querySelector("#resultatenFotosWrap"), state.foto_s, session);
    modalBody.querySelector("#saveResultatenBtn").addEventListener("click", () => {
      const datumWaarde = modalBody.querySelector("#fDatum").value;
      const tijdWaarde = modalBody.querySelector("#fTijd").value;
      if (!datumIsGeldig(datumWaarde)){ alert("De datum is niet geldig (DD/MM/JJJJ)."); return; }
      if (!tijdIsGeldig(tijdWaarde)){ alert("Het tijdstip is niet geldig (UU:MM)."); return; }
      if (isBijstand){
        const ongeldigeRij = state.rows.find(r =>
          (r.label === "Datum tussenkomst" && !datumIsGeldig(r.waarde)) ||
          (r.label === "Tijdstip briefing" && !tijdIsGeldig(r.waarde))
        );
        if (ongeldigeRij){ alert("\"" + ongeldigeRij.label + "\" is niet geldig."); return; }
      }
      const auteur = readAuteur(session);
      const datum = datumWaarde.trim() || "&ndash;";
      const tijd = tijdWaarde.trim();
      const titel = modalBody.querySelector("#fTitel").value.trim();
      const inhoud = isBijstand ? "" : modalBody.querySelector("#fInhoud").value.trim();
      const externLink = modalBody.querySelector("#fLink").value.trim();
      const rows = state.rows.map(r => ({ label: r.label.trim(), waarde: r.waarde.trim() })).filter(r => r.label || r.waarde);
      const bijstandExtra = isBijstand ? {
        reden: modalBody.querySelector("#fReden").value.trim(),
        verdachtenInfo: modalBody.querySelector("#fVerdachten").value.trim(),
        verdachtenFotos: state.verdachtenFotos || [],
        pand: modalBody.querySelector("#fPand").value.trim(),
        pandFotos: state.pandFotos || [],
        dossierbeheerders: modalBody.querySelector("#fDossierbeheerders").value.trim()
      } : {};
      if (isEdit){
        const live = vindLeefDoc(dossierId, existingDocId);
        if (!live){ alert("Dit document bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        const liveDoc = live.doc;
        liveDoc.auteur = auteur; liveDoc.datum = datum; liveDoc.tijd = tijd;
        Object.assign(liveDoc, bijstandExtra);
        liveDoc.titel = titel; liveDoc.inhoud = inhoud; liveDoc.externLink = externLink;
        liveDoc.rows = rows;
        liveDoc.foto_s = state.foto_s || [];
        liveDoc.aanwezigen = state.aanwezigen;
        logActiviteit(session, `${type} bewerkt`, live.dossierObj.naam);
      } else {
        const liveDossierObj = vindLeefDossier(dossierId);
        if (!liveDossierObj){ alert("Dit dossier bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
        liveDossierObj.documenten.push({
          id: "d" + (db.nextDocId++),
          type,
          auteur, auteurId: session.id, datum, tijd, titel, inhoud, externLink, rows,
          foto_s: state.foto_s || [],
          ...bijstandExtra,
          aanwezigen: state.aanwezigen,
          aanvullingen: [],
          gezienDoor: [session.id]
        });
        logActiviteit(session, `${type} toegevoegd`, liveDossierObj.naam);
      }
      flushPendingVerwijderdeFotoIds();
      DB.save(db);
      closeModal();
      render();
    });
  }

  openModal(`<div id="docFormBody"></div>`, true);
  const modalBody = document.getElementById("docFormBody");
  render_();
}

function openAanvullingForm(doc, dossierObj, session, existingAanvulling){
  pendingVerwijderdeFotoIds = [];
  const dossierId = dossierObj.id, docId = doc.id, aanvullingId = existingAanvulling && existingAanvulling.id;
  const isEdit = !!existingAanvulling;
  const state = {
    datum: (existingAanvulling && existingAanvulling.datum) || "",
    tijd: (existingAanvulling && existingAanvulling.tijd) || "",
    tekst: (existingAanvulling && existingAanvulling.tekst) || "",
    foto_s: (existingAanvulling && existingAanvulling.foto_s || []).slice()
  };
  function render_(){
    modalBody.innerHTML = `
      <div class="modal-head"><h2>Aanvulling ${isEdit ? "bewerken" : "toevoegen"}</h2><button class="modal-close" id="mClose">&times;</button></div>
      <div class="row2">
        <div class="field"><label>Datum</label><input class="mono" id="fADatum" placeholder="DD/MM/JJJJ" maxlength="10"></div>
        <div class="field"><label>Tijdstip</label><input class="mono" id="fATijd" placeholder="UU:MM" maxlength="5"></div>
      </div>
      <div class="field"><label>Aanvullende informatie</label><textarea id="fATekst" rows="4" style="resize:vertical" placeholder="Bv. een statusupdate of nieuwe informatie bij dit document"></textarea></div>
      <div class="field"><label>Foto's (optioneel)</label>
        <div id="aanvFotosWrap" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"></div>
      </div>
      <button class="btn btn-gold" id="saveAanvulling" style="width:100%;justify-content:center;margin-top:10px">${isEdit ? "Wijzigingen opslaan" : "Toevoegen"}</button>
    `;
    wireEvents();
  }
  function wireEvents(){
    modalBody.querySelector("#mClose").addEventListener("click", closeModal);
    const fADatum = modalBody.querySelector("#fADatum"), fATijd = modalBody.querySelector("#fATijd"), fATekst = modalBody.querySelector("#fATekst");
    fADatum.value = state.datum || ""; fATijd.value = state.tijd || ""; fATekst.value = state.tekst || "";
    fADatum.addEventListener("input", (e) => { e.target.value = fmtDateInput(e.target.value); state.datum = e.target.value; markeerVeldGeldigheid(e.target, state.datum, datumIsGeldig); });
    fATijd.addEventListener("input", (e) => { e.target.value = fmtTimeInput(e.target.value); state.tijd = e.target.value; markeerVeldGeldigheid(e.target, state.tijd, tijdIsGeldig); });
    fATekst.addEventListener("input", (e) => { state.tekst = e.target.value; });
    maakOpmaakToolbar(fATekst);
    if (!state.foto_s) state.foto_s = [];
    maakFotoWidget(modalBody.querySelector("#aanvFotosWrap"), state.foto_s, session);
    modalBody.querySelector("#saveAanvulling").addEventListener("click", () => {
    const datumWaarde = modalBody.querySelector("#fADatum").value || "";
    const tijdWaarde = modalBody.querySelector("#fATijd").value || "";
    if (!datumIsGeldig(datumWaarde)){ alert("De datum is niet geldig (DD/MM/JJJJ)."); return; }
    if (!tijdIsGeldig(tijdWaarde)){ alert("Het tijdstip is niet geldig (UU:MM)."); return; }
    const datum = datumWaarde.trim() || "&ndash;";
    const tijd = tijdWaarde.trim();
    const tekst = (modalBody.querySelector("#fATekst").value || "").trim();
    if (!tekst) return;
    // Het document (en het dossier erboven) hier opnieuw opzoeken aan de hand van hun ID, in
    // plaats van de "doc"/"dossierObj" te gebruiken die bij het openen van dit formulier werden
    // meegegeven: als er ondertussen (terwijl dit formulier openstond) een nieuwe Firestore-
    // synchronisatie is binnengekomen &mdash; bv. doordat een collega iets anders heeft opgeslagen,
    // of je eigen vorige opslag elders met wat vertraging terugkomt &mdash; is de volledige "db"
    // intussen vervangen en zijn die meegegeven objecten losstaande, verouderde kopieën geworden.
    // Rechtstreeks daarop verder bouwen zou deze aanvulling stil verliezen in plaats van opslaan.
    const live = vindLeefDoc(dossierId, docId);
    if (!live){
      alert("Dit document bestaat niet meer (mogelijk ondertussen verwijderd). Je aanvulling kon niet opgeslagen worden.");
      closeModal(); render();
      return;
    }
    const liveDoc = live.doc, liveDossier = live.dossierObj;
    if (!liveDoc.aanvullingen) liveDoc.aanvullingen = [];
    if (isEdit){
      const liveAanvulling = liveDoc.aanvullingen.find(a => a.id === aanvullingId);
      if (!liveAanvulling){
        alert("Deze aanvulling bestaat niet meer (mogelijk ondertussen verwijderd). Je wijziging kon niet opgeslagen worden.");
        closeModal();
        openDocDetail(liveDoc, liveDossier, session);
        return;
      }
      liveAanvulling.datum = datum; liveAanvulling.tijd = tijd;
      liveAanvulling.tekst = tekst; liveAanvulling.foto_s = state.foto_s;
      logActiviteit(session, "Aanvulling bewerkt", liveDossier.naam);
    } else {
      liveDoc.aanvullingen.push({ id: genereerAanvullingId(), datum, tijd, tekst, auteur: session.naam, auteurId: session.id, foto_s: state.foto_s });
      // Een nieuwe aanvulling maakt het document opnieuw "ongelezen" voor iedereen behalve wie ze nu
      // net toevoegde, zodat anderen zien dat er iets is bijgekomen.
      liveDoc.gezienDoor = [session.id];
      logActiviteit(session, `Aanvulling toegevoegd bij ${liveDoc.type}`, liveDossier.naam);
    }
    flushPendingVerwijderdeFotoIds();
    DB.save(db);
    closeModal();
    openDocDetail(liveDoc, liveDossier, session);
    });
  }
  openModal(`<div id="docFormBody"></div>`);
  const modalBody = document.getElementById("docFormBody");
  render_();
}

/* ============================================================
   BEHEER (enkel leiding)
   ============================================================ */
function renderBeheer(session){
  const wrap = el(`<div>
    <div class="section-title">Beheer</div>
    <div style="display:flex;gap:6px;border-bottom:1px solid var(--border);margin-bottom:24px" id="beheerTabs"></div>
    <div id="beheerContent"></div>
  </div>`);
  if (!view.beheerTab) view.beheerTab = "leden";
  // Toegangscodes zijn enkel zichtbaar voor admin; andere (leidinggevende) leden krijgen dit tabblad niet te zien.
  const tabs = [
    { key: "leden", label: "Ledenbeheer" },
    { key: "statistieken", label: "Statistieken" },
    // Toegangscodes en het activiteitenlog zijn enkel zichtbaar voor admin; andere (leidinggevende)
    // leden krijgen deze tabbladen niet te zien.
    ...(isAdmin(session) ? [
      { key: "codes", label: "Toegangscodes" },
      { key: "activiteitenlog", label: "Activiteitenlog" },
      { key: "opslag", label: "Opslag" }
    ] : [])
  ];
  if ((view.beheerTab === "codes" || view.beheerTab === "activiteitenlog" || view.beheerTab === "opslag") && !isAdmin(session)) view.beheerTab = "leden";
  const bar = wrap.querySelector("#beheerTabs");
  tabs.forEach(t => {
    const b = el(`<button class="navlink" style="padding:10px 14px;${view.beheerTab === t.key ? "color:var(--text);border-bottom:2px solid var(--gold)" : ""}">${t.label}</button>`);
    b.addEventListener("click", () => { view.beheerTab = t.key; render(); });
    bar.appendChild(b);
  });
  const content = wrap.querySelector("#beheerContent");
  content.appendChild(
    view.beheerTab === "leden" ? beheerLeden(session)
    : view.beheerTab === "statistieken" ? beheerStatistieken(session)
    : view.beheerTab === "activiteitenlog" ? beheerActiviteitenlog(session)
    : view.beheerTab === "opslag" ? beheerOpslag(session)
    : beheerCodes(session)
  );
  return wrap;
}

// Activiteitenlog (enkel admin): de laatste mutaties doorheen de hele applicatie, nieuwste eerst,
// zodat de verantwoordelijke van de Recherche kan nagaan wie wat heeft aangemaakt/bewerkt/
// verwijderd. Optioneel filterbaar op naam van het lid dat de actie uitvoerde.
function beheerActiviteitenlog(session){
  const wrap = el(`<div>
    <div class="row" style="margin-bottom:16px">
      <div class="hint">Toont de laatste ${(db.activiteitenlog || []).length} acties (max. 300 bewaard), nieuwste bovenaan.</div>
      <div class="search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="fFilterActor" placeholder="Filter op naam...">
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden"><table class="simple">
      <thead><tr><th>Tijdstip</th><th>Door</th><th>Actie</th><th>Dossier</th></tr></thead>
      <tbody id="logBody"></tbody>
    </table></div>
  </div>`);
  const body = wrap.querySelector("#logBody");
  function renderRows(filter){
    const entries = (db.activiteitenlog || []).filter(e => !filter || e.actor.toLowerCase().includes(filter.toLowerCase()));
    body.innerHTML = entries.length ? entries.map(e => `
      <tr>
        <td class="mono" style="white-space:nowrap">${e.tijdstip}</td>
        <td>${e.actor}</td>
        <td>${e.actie}</td>
        <td class="muted">${e.dossierNaam || "&mdash;"}</td>
      </tr>
    `).join("") : `<tr><td colspan="4" class="muted" style="text-align:center;padding:20px">Geen activiteit gevonden.</td></tr>`;
  }
  renderRows("");
  wrap.querySelector("#fFilterActor").addEventListener("input", (e) => renderRows(e.target.value));
  return wrap;
}

// Bepaalt wat de ingelogde gebruiker mag doen met een specifiek lid:
// "full"   = alles bewerken (naam, callsign, status, rol, specialisaties, eventueel adminrechten)
// "status" = enkel de status (Actief/Inactief/Verlof) wijzigen
// "none"   = niets, knop niet tonen
function memberManageLevel(viewerSession, m){
  if (isAdmin(viewerSession)) return "full";
  if (viewerSession.rol === "leiding") return m.rol === "leiding" ? "none" : "full";
  if (viewerSession.rol === "hoofdrechercheur") return (m.rol === "lid" || m.rol === "opleiding") ? "status" : "none";
  return "none";
}

function beheerLeden(session){
  const viewerIsAdmin = isAdmin(session);
  const viewerIsLeiding = session.rol === "leiding";
  const wrap = el(`<div>
    ${viewerIsLeiding ? `<button class="btn btn-gold btn-sm" id="addMemberBtn" style="margin-bottom:16px">+ Lid toevoegen</button>` : ""}
    <div class="card" style="padding:0;overflow:hidden"><table class="simple">
      <thead><tr>${viewerIsAdmin ? "<th></th>" : ""}<th>Status</th><th>Callsign</th><th>Naam</th><th>Discord ID</th><th>Rol</th><th>Specialisatie(s)</th><th></th></tr></thead>
      <tbody id="mBody"></tbody>
    </table></div>
  </div>`);
  const body = wrap.querySelector("#mBody");
  const sorted = zichtbareLeden().sort((a, b) => (a.volgorde ?? 0) - (b.volgorde ?? 0));
  sorted.forEach((m, i) => {
    const level = memberManageLevel(session, m);
    const tr = el(`<tr>
      ${viewerIsAdmin ? `<td style="white-space:nowrap">
        <button class="btn btn-ghost btn-sm move-up" data-id="${m.id}" ${i === 0 ? "disabled style=\"opacity:.3;cursor:default\"" : ""} title="Omhoog">&uarr;</button>
        <button class="btn btn-ghost btn-sm move-down" data-id="${m.id}" ${i === sorted.length - 1 ? "disabled style=\"opacity:.3;cursor:default\"" : ""} title="Omlaag">&darr;</button>
      </td>` : ""}
      <td><span class="chip ${statusChipClass(m.status)}">${m.status || "Actief"}</span></td>
      <td class="mono">${m.callsign || "&mdash;"}</td>
      <td style="font-weight:600">${m.naam}</td>
      <td class="muted">${m.discordId || "&mdash;"}</td>
      <td><span class="chip ${rolChipClass(m.rol)}">${rolLabel(m.rol)}</span></td>
      <td>${m.specialisaties.join(", ") || "&mdash;"}</td>
      <td style="text-align:right">${level !== "none" ? `<button class="btn btn-ghost btn-sm edit-m" data-id="${m.id}">${level === "status" ? "Status wijzigen" : "Bewerken"}</button>` : `<span class="muted" style="font-size:11px">Geen toegang</span>`}</td>
    </tr>`);
    if (level !== "none") tr.querySelector(".edit-m").addEventListener("click", () => openMemberForm(m, session));
    if (viewerIsAdmin){
      const upBtn = tr.querySelector(".move-up");
      const downBtn = tr.querySelector(".move-down");
      if (i > 0) upBtn.addEventListener("click", () => swapVolgorde(sorted, i, i - 1));
      if (i < sorted.length - 1) downBtn.addEventListener("click", () => swapVolgorde(sorted, i, i + 1));
    }
    body.appendChild(tr);
  });
  if (viewerIsLeiding) wrap.querySelector("#addMemberBtn").addEventListener("click", () => openMemberForm(null, session));
  return wrap;
}

// Wisselt de volgorde-waarde van twee leden (in de huidig gesorteerde lijst) om, zodat de admin
// leden met pijltjes kan verslepen in de Ledenbeheer-tabel; de volgorde geldt ook in de publieke Ledenlijst.
function swapVolgorde(sortedList, i, j){
  const a = sortedList[i], b = sortedList[j];
  const tmp = a.volgorde;
  a.volgorde = b.volgorde;
  b.volgorde = tmp;
  DB.save(db);
  render();
}

// Genereert een nieuwe toegangscode die nog niet bestaat (kans op botsing is miniem, maar zo
// uitgesloten). Gedeeld tussen het automatisch aanmaken bij een nieuw lid en het handmatige
// "+ Code genereren" in Toegangscodesbeheer.
function genereerUniekeToegangscode(){
  let code;
  do {
    code = Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
  } while (db.accessCodes.some(c => c.code === code));
  return code;
}

function openMemberForm(member, viewerSession){
  // Zie openSimpleDocForm hierboven: enkel het ID bewaren, bij opslaan altijd live opzoeken.
  const memberId = member ? member.id : null;
  const isNew = !member;
  // Nieuwe leden starten standaard als "Rechercheur in opleiding" en actief; leiding kan dit
  // bij promotie/wijziging aanpassen.
  const m = member || { id: null, naam: "", callsign: "", discordId: "", rol: "opleiding", status: "Actief", admin: false, specialisaties: [] };
  const specOptions = ["OBN", "CSI", "GO"];
  const viewerIsAdmin = isAdmin(viewerSession);
  // Enkel leiding kan een nieuw lid aanmaken (zie beheerLeden), dus bij "isNew" mag alles.
  // Bij een bestaand lid bepaalt memberManageLevel of de viewer alles mag, of enkel de status
  // (hoofdrechercheur t.o.v. de rechercheurs/opleiding onder hem).
  const level = isNew ? "full" : memberManageLevel(viewerSession, m);
  const statusOnly = level === "status";

  openModal(`
    <div class="modal-head"><h2>${isNew ? "Lid toevoegen" : (statusOnly ? "Status wijzigen" : "Lid bewerken")}</h2><button class="modal-close" id="mClose">&times;</button></div>
    ${statusOnly ? `<div class="hint" style="margin-bottom:14px">${m.naam} &mdash; je mag enkel de status van dit lid wijzigen.</div>` : ""}
    ${!statusOnly ? `
    <div class="field"><label>Callsign (optioneel)</label><input id="fCallsign" class="mono" value="${m.callsign || ""}" placeholder="Bv. COBRA-3"></div>
    <div class="field"><label>Naam</label><input id="fNaam" value="${m.naam}"></div>
    <div class="field"><label>Discord ID (optioneel)</label><input id="fDiscordId" class="mono" value="${m.discordId || ""}" placeholder="Bv. 412345678901234567"></div>` : ""}
    <div class="field"><label>Status</label>
      <select id="fStatus">
        <option value="Actief" ${(m.status || "Actief") === "Actief" ? "selected" : ""}>Actief</option>
        <option value="Inactief" ${m.status === "Inactief" ? "selected" : ""}>Inactief</option>
        <option value="Verlof" ${m.status === "Verlof" ? "selected" : ""}>Verlof</option>
      </select>
    </div>
    ${!statusOnly ? `
    <div class="field"><label>Rol</label>
      <select id="fRol">
        <option value="opleiding" ${m.rol === "opleiding" ? "selected" : ""}>Rechercheur in opleiding</option>
        <option value="lid" ${m.rol === "lid" ? "selected" : ""}>Rechercheur</option>
        <option value="hoofdrechercheur" ${m.rol === "hoofdrechercheur" ? "selected" : ""}>Hoofdrechercheur</option>
        ${viewerIsAdmin ? `<option value="leiding" ${m.rol === "leiding" ? "selected" : ""}>Leiding</option>` : ""}
      </select>
      ${!viewerIsAdmin ? `<div class="hint" style="margin-top:6px">Enkel admin kan iemand leiding maken.</div>` : ""}
    </div>
    ${viewerIsAdmin ? `
    <div class="field" id="adminField" style="display:${m.rol === "leiding" ? "flex" : "none"}">
      <label>Adminrechten</label>
      <label style="font-size:13px;font-weight:400;text-transform:none;letter-spacing:0"><input type="checkbox" id="fAdmin" ${m.admin ? "checked" : ""}> Leiding met adminrechten &mdash; mag dossiers volledig bewerken (gewone leiding niet)</label>
    </div>` : ""}
    <div class="field"><label>Specialisatie(s) &mdash; max 3</label>
      <div>${specOptions.map(s => `<label style="margin-right:14px;font-size:13px;font-weight:400;text-transform:none;letter-spacing:0"><input type="checkbox" class="fSpec" value="${s}" ${m.specialisaties.includes(s) ? "checked" : ""}> ${s}</label>`).join("")}</div>
    </div>` : ""}
    <div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn btn-gold" id="saveMember">Opslaan</button>
      ${!isNew && !statusOnly ? `<button class="btn btn-danger" id="deleteMember">Verwijderen</button>` : ""}
    </div>
  `);
  document.getElementById("mClose").addEventListener("click", closeModal);
  if (viewerIsAdmin && !statusOnly){
    document.getElementById("fRol").addEventListener("change", (e) => {
      document.getElementById("adminField").style.display = e.target.value === "leiding" ? "flex" : "none";
    });
  }
  document.getElementById("saveMember").addEventListener("click", () => {
    const status = document.getElementById("fStatus").value;
    if (statusOnly){
      const liveMember = vindLeefMember(memberId);
      if (!liveMember){ alert("Dit lid bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
      // Enkel de status wordt aangepast; alle andere velden blijven exact zoals ze waren.
      liveMember.status = status;
      logActiviteit(viewerSession, `Status gewijzigd naar "${status}": "${liveMember.naam}"`);
      DB.save(db);
      closeModal();
      render();
      return;
    }
    const naam = document.getElementById("fNaam").value.trim();
    const callsign = document.getElementById("fCallsign").value.trim();
    const discordId = document.getElementById("fDiscordId").value.trim();
    const rol = document.getElementById("fRol").value;
    // Enkel een admin-viewer mag adminrechten toekennen of afnemen; anders blijft de bestaande waarde ongewijzigd.
    const admin = viewerIsAdmin
      ? (rol === "leiding" && document.getElementById("fAdmin").checked)
      : (rol === "leiding" && !!m.admin);
    const specs = Array.from(document.querySelectorAll(".fSpec:checked")).map(c => c.value).slice(0, 3);
    if (!naam) return;
    if (isNew){
      const volgorde = Math.max(0, ...db.members.map(x => x.volgorde ?? 0)) + 1;
      const newId = db.nextMemberId++;
      db.members.push({ id: newId, naam, callsign, discordId, status, rol, admin, specialisaties: specs, volgorde });
      // Elk lid krijgt meteen zijn eigen toegangscode aangemaakt &mdash; een lid heeft nooit
      // meerdere codes tegelijk (zie ook de filter in beheerCodes).
      db.accessCodes.push({ code: genereerUniekeToegangscode(), memberId: newId });
      logActiviteit(viewerSession, `Lid toegevoegd: "${naam}"`);
    } else {
      const liveMember = vindLeefMember(memberId);
      if (!liveMember){ alert("Dit lid bestaat niet meer (intussen verwijderd?). De pagina wordt ververst."); closeModal(); render(); return; }
      liveMember.naam = naam; liveMember.callsign = callsign; liveMember.discordId = discordId; liveMember.status = status; liveMember.rol = rol; liveMember.admin = admin; liveMember.specialisaties = specs;
      logActiviteit(viewerSession, `Lid bewerkt: "${naam}"`);
    }
    DB.save(db);
    closeModal();
    render();
  });
  if (!isNew && !statusOnly){
    document.getElementById("deleteMember").addEventListener("click", () => {
      const liveMember = vindLeefMember(memberId);
      const naamVoorLog = liveMember ? liveMember.naam : member.naam;
      db.members = db.members.filter(x => x.id !== memberId);
      db.accessCodes = db.accessCodes.filter(c => c.memberId !== memberId);
      logActiviteit(viewerSession, `Lid verwijderd: "${naamVoorLog}"`);
      DB.save(db);
      closeModal();
      render();
    });
  }
}

// Berekent, per lid, hoeveel documenten ze opstelden, hoeveel aanvullingen ze toevoegden, en
// hoe vaak ze als "aanwezig" aangeduid staan &mdash; over alle dossiers heen. Auteur/aanvulling
// worden gematcht op naam (zoals overal in de app, een momentopname bij het opstellen); aanwezig
// wordt gematcht op lid-ID (blijft dus kloppen ook na een naamswijziging).
// dossierId: optioneel &mdash; als meegegeven, tellen enkel documenten/aanvullingen/aanwezigheden
// van dát ene dossier mee (zie beheerStatistieken-filter), anders over alle dossiers heen.
function computeMemberStats(dossierId){
  // byNaam loopt over ALLE leden (ook verborgen), anders klopt de matching niet meer zodra een
  // verborgen lid ooit een document/aanvulling opstelde; stats zelf bevat enkel zichtbare leden,
  // dus die bijdrages tellen simpelweg niet mee in de (zichtbare) statistieken hieronder.
  const byNaam = {};
  db.members.forEach(m => { byNaam[m.naam] = m.id; });
  const stats = {};
  zichtbareLeden().forEach(m => { stats[m.id] = { member: m, documenten: 0, aanvullingen: 0, aanwezig: 0 }; });
  const dossiersVoorStats = dossierId ? db.dossiers.filter(d => d.id === dossierId) : db.dossiers;
  dossiersVoorStats.forEach(d => {
    (d.documenten || []).forEach(doc => {
      if (doc.auteur && byNaam[doc.auteur] !== undefined && stats[byNaam[doc.auteur]]) stats[byNaam[doc.auteur]].documenten++;
      (doc.aanvullingen || []).forEach(a => {
        if (a.auteur && byNaam[a.auteur] !== undefined && stats[byNaam[a.auteur]]) stats[byNaam[a.auteur]].aanvullingen++;
      });
      (doc.aanwezigen || []).forEach(id => { if (stats[id]) stats[id].aanwezig++; });
    });
  });
  return Object.values(stats);
}
// Telt het aantal documenten per brede categorie (niet per los type, anders wordt een taartdiagram
// met 10 flinterdunne taartpunten onleesbaar). Een "Melding" telt bewust niet mee in deze grafiek
// &mdash; dat is geen eigen werk van een lid, maar het vertrekpunt van het dossier.
function computeDocKindStats(dossierId){
  const tellingen = {
    "Algemene verslagen & bijkomende informatie": 0,
    "Verslagen (OBN, CSI en GO)": 0,
    "Opdrachten parket/onderzoeksrechter": 0,
    "Bijstandsaanvragen": 0,
    "Beschikbare resultaten & TAP-dossier": 0
  };
  const dossiersVoorStats = dossierId ? db.dossiers.filter(d => d.id === dossierId) : db.dossiers;
  dossiersVoorStats.forEach(d => (d.documenten || []).forEach(doc => {
    if (doc.type === "Melding") return;
    if (doc.type === "Algemeen verslag" || doc.type === "Bijkomende informatie") tellingen["Algemene verslagen & bijkomende informatie"]++;
    else if (doc.type === "OBN-verslag" || doc.type === "CSI-verslag" || doc.type === "GO-verslag") tellingen["Verslagen (OBN, CSI en GO)"]++;
    else if (doc.type === "Opdracht") tellingen["Opdrachten parket/onderzoeksrechter"]++;
    else if (doc.type === "Bijstandsaanvraag") tellingen["Bijstandsaanvragen"]++;
    else tellingen["Beschikbare resultaten & TAP-dossier"]++;
  }));
  return tellingen;
}
// Cirkeldiagram in platte CSS (conic-gradient, geen externe library nodig) met legende ernaast.
function donutChartHtml(title, segments){
  const totaal = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  const stops = segments.filter(s => s.value > 0).map(s => {
    const start = (acc / (totaal || 1)) * 360;
    acc += s.value;
    const end = (acc / (totaal || 1)) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(", ");
  const legend = segments.map(s => `
    <div style="display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:8px">
      <span style="width:10px;height:10px;border-radius:3px;background:${s.color};flex:0 0 10px"></span>
      <span style="flex:1">${s.label}</span>
      <span class="muted">${s.value} &middot; ${totaal ? Math.round((s.value / totaal) * 100) : 0}%</span>
    </div>`).join("");
  return `
    <div class="card" style="margin-bottom:18px">
      <div class="section-title" style="font-size:13px;margin-bottom:14px">${title}</div>
      <div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap">
        <div style="width:130px;height:130px;border-radius:50%;background:conic-gradient(${stops || "var(--border2) 0deg 360deg"});flex:0 0 130px;position:relative">
          <div style="position:absolute;inset:17px;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700">${totaal}</div>
        </div>
        <div style="flex:1;min-width:170px">${legend}</div>
      </div>
    </div>`;
}
// Vaste kleurenreeks voor de per-lid taartdiagrammen (los van de max. 2-3 vaste kleuren die de
// andere donut-grafieken hierboven gebruiken, want hier kunnen er makkelijk meer dan 6 leden zijn).
const LID_TAART_PALET = ["var(--gold)", "var(--blue)", "var(--purple)", "var(--red)", "var(--green)", "#e2a0a0", "#8a90a3", "#c9a4ff", "#ffd27a", "#7ad6c9", "#f29bc0", "#9fb8d9"];
// Zet dezelfde rijen/waarde-functie als barChartHtml om naar segmenten voor donutChartHtml, zodat
// per statistiek meteen zowel een staaf- als een taartdiagram getoond kan worden met dezelfde data.
function memberDonutSegments(rows, getValue){
  return rows.slice().sort((a, b) => getValue(b) - getValue(a)).map((r, i) => ({
    label: r.member.naam,
    value: getValue(r),
    color: LID_TAART_PALET[i % LID_TAART_PALET.length]
  }));
}
// Eenvoudige horizontale balkjes-grafiek in platte CSS (geen externe library nodig) &mdash; sorteert
// aflopend op waarde en toont iedereen, ook leden op 0, zodat het beeld volledig is.
function barChartHtml(title, rows, getValue){
  const sorted = rows.slice().sort((a, b) => getValue(b) - getValue(a));
  const max = Math.max(1, ...sorted.map(getValue));
  return `
    <div class="card" style="margin-bottom:18px">
      <div class="section-title" style="font-size:13px;margin-bottom:14px">${title}</div>
      ${sorted.map(r => {
        const val = getValue(r);
        const pct = Math.round((val / max) * 100);
        return `<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span>${r.member.naam}</span><span class="muted">${val}</span>
          </div>
          <div style="background:var(--border2);border-radius:6px;height:8px;overflow:hidden">
            <div style="background:var(--gold);height:100%;width:${pct}%"></div>
          </div>
        </div>`;
      }).join("")}
    </div>`;
}
function beheerStatistieken(session){
  // Optioneel filter op één dossier (zie dropdown hieronder); view.statistiekenDossierId blijft
  // bewaard in de globale "view" zodat de keuze overeind blijft bij een her-render (bv. na een
  // Firestore-synchronisatie), net zoals view.dossierTab dat doet voor het dossier-tabblad.
  const geselecteerdDossierId = view.statistiekenDossierId || "";
  const gefilterdDossier = geselecteerdDossierId ? db.dossiers.find(d => d.id === geselecteerdDossierId) : null;
  // Als het geselecteerde dossier intussen verwijderd is, terugvallen op "Alle dossiers".
  const actieveDossierId = gefilterdDossier ? geselecteerdDossierId : "";

  const stats = computeMemberStats(actieveDossierId || undefined);
  const totaalDossiers = gefilterdDossier ? 1 : db.dossiers.length;
  const totaalOpen = gefilterdDossier ? (gefilterdDossier.status === "open" ? 1 : 0) : db.dossiers.filter(d => d.status === "open").length;
  const dossiersVoorTotaal = gefilterdDossier ? [gefilterdDossier] : db.dossiers;
  const totaalDocumenten = dossiersVoorTotaal.reduce((sum, d) => sum + (d.documenten || []).length, 0);
  const totaalActief = zichtbareLeden().filter(m => (m.status || "Actief") === "Actief").length;

  const docKindStats = computeDocKindStats(actieveDossierId || undefined);
  const docKindSegments = [
    { label: "Algemene verslagen &amp; bijkomende informatie", value: docKindStats["Algemene verslagen & bijkomende informatie"], color: "var(--gold)" },
    { label: "Verslagen (OBN, CSI en GO)", value: docKindStats["Verslagen (OBN, CSI en GO)"], color: "var(--blue)" },
    { label: "Opdrachten parket/onderzoeksrechter", value: docKindStats["Opdrachten parket/onderzoeksrechter"], color: "var(--purple)" },
    { label: "Bijstandsaanvragen", value: docKindStats["Bijstandsaanvragen"], color: "var(--red)" },
    { label: "Beschikbare resultaten &amp; TAP-dossier", value: docKindStats["Beschikbare resultaten & TAP-dossier"], color: "var(--muted2)" }
  ];
  const statusCounts = { Actief: 0, Inactief: 0, Verlof: 0 };
  zichtbareLeden().forEach(m => { const s = m.status || "Actief"; statusCounts[s] = (statusCounts[s] || 0) + 1; });
  const statusSegments = [
    { label: "Actief", value: statusCounts.Actief, color: "var(--green)" },
    { label: "Inactief", value: statusCounts.Inactief, color: "#e2a0a0" },
    { label: "Verlof", value: statusCounts.Verlof, color: "var(--blue)" }
  ];

  // Dossiers alfabetisch in de dropdown, los van hun volgorde in de lijstweergave.
  const dossierOpties = db.dossiers.slice().sort((a, b) => a.naam.localeCompare(b.naam, "nl"));

  const wrap = el(`<div>
    <div class="hint" style="margin-bottom:16px">
      Aantal documenten/aanvullingen is wie het meeste opstelt of aanvult; aanwezigheid is wie fysiek bij een actie betrokken was &mdash; dit zijn twee verschillende dingen, geen rangschikking van "inzet".
    </div>
    <div class="field" style="max-width:360px;margin-bottom:16px">
      <label>Filter op dossier</label>
      <select id="statFilterDossier">
        <option value="">Alle dossiers</option>
        ${dossierOpties.map(d => `<option value="${d.id}" ${actieveDossierId === d.id ? "selected" : ""}>${d.naam}</option>`).join("")}
      </select>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:18px">
      <div class="card" style="text-align:center">
        <div class="lbl" style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Dossiers</div>
        <div style="font-size:22px;font-weight:700">${totaalDossiers}</div>
        <div class="muted" style="font-size:11px">${gefilterdDossier ? (gefilterdDossier.status === "open" ? "open" : "gesloten") : totaalOpen + " open"}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="lbl" style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Documenten</div>
        <div style="font-size:22px;font-weight:700">${totaalDocumenten}</div>
        <div class="muted" style="font-size:11px">${gefilterdDossier ? "in " + gefilterdDossier.naam : "over alle dossiers"}</div>
      </div>
      <div class="card" style="text-align:center">
        <div class="lbl" style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Actieve leden</div>
        <div style="font-size:22px;font-weight:700">${totaalActief}</div>
        <div class="muted" style="font-size:11px">van ${zichtbareLeden().length} totaal</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:4px">
      ${donutChartHtml("Documenten per categorie", docKindSegments)}
      ${donutChartHtml("Status leden", statusSegments)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:4px">
      ${barChartHtml("Documenten opgesteld per lid", stats, r => r.documenten)}
      ${donutChartHtml("Documenten per lid", memberDonutSegments(stats, r => r.documenten))}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:4px">
      ${barChartHtml("Keer aanwezig aangeduid per lid", stats, r => r.aanwezig)}
      ${donutChartHtml("Keer aanwezig per lid", memberDonutSegments(stats, r => r.aanwezig))}
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table class="simple">
        <thead><tr><th>Lid</th><th>Documenten</th><th>Aanvullingen</th><th>Aanwezig</th></tr></thead>
        <tbody>
          ${stats.slice().sort((a, b) => (a.member.volgorde ?? 0) - (b.member.volgorde ?? 0)).map(r => `
            <tr>
              <td>${r.member.naam}</td>
              <td>${r.documenten}</td>
              <td>${r.aanvullingen}</td>
              <td>${r.aanwezig}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>
  </div>`);
  wrap.querySelector("#statFilterDossier").addEventListener("change", (e) => {
    view.statistiekenDossierId = e.target.value || null;
    render();
  });
  return wrap;
}

// Verzamelt alle foto-ID's die nog ergens in de databank gebruikt worden (over alle dossiers
// heen), zodat dit vergeleken kan worden met wat er werkelijk in de recherche_fotos-verzameling
// in Firestore staat &mdash; alles dat daar wel staat maar hier niet in voorkomt, is een weeskopie.
function alleGebruikteFotoIds(){
  const ids = new Set();
  (db.dossiers || []).forEach(d => fotoIdsVanDossier(d).forEach(id => ids.add(id)));
  return ids;
}
// Beheer-tabblad (enkel admin): spoort foto's op die nog in de recherche_fotos-verzameling staan
// maar nergens meer in een dossier gebruikt worden (weeskopieën, bv. van vóór verwijderen van een
// foto ook effectief de database opruimde, of door een onderbroken verbinding) en laat ze
// definitief verwijderen.
function beheerOpslag(session){
  const wrap = el(`<div>
    <div class="card">
      <div class="section-title">Foto-opslag opruimen</div>
      <div class="muted" style="font-size:13px;margin:8px 0 16px">Als een foto, document, betrokkene, voertuig of dossier verwijderd wordt, verdwijnt de foto zelf normaal mee uit de database. Door bv. een onderbroken verbinding, of van vóór deze opruimfunctie bestond, kunnen er toch nog losse "weeskopieën" overblijven &mdash; onzichtbaar in de app, maar nog wel plaats innemend in de gratis opslaglimiet. Met onderstaande knop spoor je ze op en verwijder je ze definitief.</div>
      <button class="btn btn-gold btn-sm" id="scanOpruimBtn">Scannen op weeskopieën</button>
      <div id="opruimResultaat" style="margin-top:16px"></div>
    </div>
  </div>`);
  // De status wordt in "view" bijgehouden (niet enkel lokaal in deze DOM) omdat DB.save(db) de
  // live Firestore-sync activeert, die op zijn beurt de hele app opnieuw rendert &mdash; een puur
  // lokale DOM-aanpassing hier zou dan meteen weer overschreven worden door dat her-render.
  const resultaat = wrap.querySelector("#opruimResultaat");
  const st = view.opruimStatus;
  if (st){
    if (st.type === "bezig-scan") resultaat.innerHTML = `<div class="muted" style="font-size:13px">Bezig met scannen...</div>`;
    else if (st.type === "geen") resultaat.innerHTML = `<div class="muted" style="font-size:13px">Geen weeskopieën gevonden &mdash; de opslag is netjes.</div>`;
    else if (st.type === "gevonden") resultaat.innerHTML = `
      <div style="font-size:13px;margin-bottom:10px">${st.ids.length} weeskopie(ën) gevonden &mdash; foto's die nergens meer aan een dossier gekoppeld zijn.</div>
      <button class="btn btn-danger btn-sm" id="verwijderWezenBtn">Definitief verwijderen</button>`;
    else if (st.type === "bezig-verwijderen") resultaat.innerHTML = `<div class="muted" style="font-size:13px">Bezig met verwijderen...</div>`;
    else if (st.type === "klaar") resultaat.innerHTML = `<div class="muted" style="font-size:13px">${st.count} weeskopie(ën) verwijderd.</div>`;
    else if (st.type === "fout") resultaat.innerHTML = `<div class="muted" style="font-size:13px">${st.bericht}</div>`;
  }
  const verwijderBtn = resultaat.querySelector("#verwijderWezenBtn");
  if (verwijderBtn) verwijderBtn.addEventListener("click", () => {
    const ids = view.opruimStatus.ids;
    confirmModal(`${ids.length} weeskopie(ën) definitief verwijderen uit de database? Dit kan niet ongedaan gemaakt worden.`, () => {
      view.opruimStatus = { type: "bezig-verwijderen" };
      render();
      Promise.all(ids.map(id => fotosCollectionRef.doc(id).delete())).then(() => {
        logActiviteit(session, `${ids.length} weeskopie(ën) van foto's opgeruimd`);
        DB.save(db);
        view.opruimStatus = { type: "klaar", count: ids.length };
        render();
      }).catch(err => {
        console.error("Weeskopieën verwijderen mislukt:", err);
        view.opruimStatus = { type: "fout", bericht: "Er ging iets mis bij het verwijderen. Controleer je internetverbinding en probeer opnieuw." };
        render();
      });
    });
  });
  wrap.querySelector("#scanOpruimBtn").addEventListener("click", () => {
    if (!fotosCollectionRef){ view.opruimStatus = { type: "fout", bericht: "Geen databaseverbinding. Herlaad de pagina en probeer opnieuw." }; render(); return; }
    view.opruimStatus = { type: "bezig-scan" };
    render();
    const gebruikt = alleGebruikteFotoIds();
    fotosCollectionRef.get().then(snap => {
      const wezen = [];
      snap.forEach(docSnap => { if (!gebruikt.has(docSnap.id)) wezen.push(docSnap.id); });
      view.opruimStatus = wezen.length ? { type: "gevonden", ids: wezen } : { type: "geen" };
      render();
    }).catch(err => {
      console.error("Scannen op weeskopieën mislukt:", err);
      view.opruimStatus = { type: "fout", bericht: "Scannen mislukt. Controleer je internetverbinding en probeer opnieuw." };
      render();
    });
  });
  return wrap;
}

function beheerCodes(session){
  const viewerIsAdmin = isAdmin(session);
  // Een lid kan maar één toegangscode tegelijk hebben (die krijgt het automatisch bij aanmaak);
  // dit knopje dient dus enkel nog om een lid zonder code (bv. na intrekking) er opnieuw een te geven.
  const ledenZonderCode = zichtbareLeden().filter(m => !db.accessCodes.some(c => c.memberId === m.id));
  const wrap = el(`<div>
    ${viewerIsAdmin
      ? (ledenZonderCode.length
          ? `<button class="btn btn-gold btn-sm" id="addCodeBtn" style="margin-bottom:16px">+ Code genereren</button>`
          : `<div class="hint" style="margin-bottom:16px">Elk lid heeft al een toegangscode &mdash; een lid kan maar één code tegelijk hebben. Trek eerst een code in als een lid een nieuwe nodig heeft.</div>`)
      : `<div class="hint" style="margin-bottom:16px">Enkel admin kan toegangscodes aanmaken of intrekken.</div>`}
    <div class="card" style="padding:0;overflow:hidden"><table class="simple">
      <thead><tr><th>Code</th><th>Lid</th><th></th></tr></thead>
      <tbody id="cBody"></tbody>
    </table></div>
  </div>`);
  const body = wrap.querySelector("#cBody");
  // Zelfde volgorde als Ledenbeheer (op het "volgorde"-veld van het gekoppelde lid), in plaats van
  // de willekeurige aanmaakvolgorde van de toegangscodes zelf.
  const sortedCodes = db.accessCodes.filter(c => {
    const m = db.members.find(x => x.id === c.memberId);
    return !m || !m.verborgen;
  }).sort((a, b) => {
    const ma = db.members.find(m => m.id === a.memberId);
    const mb = db.members.find(m => m.id === b.memberId);
    return (ma?.volgorde ?? 0) - (mb?.volgorde ?? 0);
  });
  sortedCodes.forEach(c => {
    const tr = el(`<tr><td><code>${c.code}</code></td><td>${memberLabel(c.memberId)}</td>
      <td style="text-align:right">${viewerIsAdmin ? `<button class="btn btn-danger btn-sm rev-c" data-code="${c.code}">Intrekken</button>` : ""}</td></tr>`);
    if (viewerIsAdmin) tr.querySelector(".rev-c").addEventListener("click", () => {
      db.accessCodes = db.accessCodes.filter(x => x.code !== c.code);
      DB.save(db); render();
    });
    body.appendChild(tr);
  });
  if (!viewerIsAdmin) return wrap;
  const addBtn = wrap.querySelector("#addCodeBtn");
  if (addBtn) addBtn.addEventListener("click", () => {
    // Enkel leden zonder bestaande code aanbieden: zo kan een lid nooit een tweede code krijgen.
    const memberOptions = ledenZonderCode.map(m => `<option value="${m.id}">${naamMetCallsign(m)}${m.discordId ? " (Discord: " + m.discordId + ")" : ""}</option>`).join("");
    openModal(`
      <div class="modal-head"><h2>Toegangscode genereren</h2><button class="modal-close" id="mClose">&times;</button></div>
      <div class="field"><label>Lid</label><select id="fMember">${memberOptions}</select></div>
      <button class="btn btn-gold" id="genCode">Genereren</button>
    `);
    document.getElementById("mClose").addEventListener("click", closeModal);
    document.getElementById("genCode").addEventListener("click", () => {
      const memberId = +document.getElementById("fMember").value;
      db.accessCodes.push({ code: genereerUniekeToegangscode(), memberId });
      DB.save(db);
      closeModal();
      render();
    });
  });
  return wrap;
}

/* ============================================================
   MASTER RENDER
   ============================================================ */
function render(){
  const navlinks = document.getElementById("navlinks");
  const app = document.getElementById("app");

  if (dbFout){
    navlinks.innerHTML = "";
    app.innerHTML = `<div style="padding:80px 20px;text-align:center" class="muted">Geen verbinding met de database.<br>Controleer je internetverbinding &mdash; dit herstelt automatisch zodra de verbinding terugkeert.</div>`;
    return;
  }
  if (!dbReady){
    navlinks.innerHTML = "";
    app.innerHTML = `<div style="padding:80px 20px;text-align:center" class="muted">Bezig met laden...</div>`;
    return;
  }

  // guard: if logged-out user is on a tab that requires login, send home
  const session = getSession();
  const protectedTabs = ["dossiers", "opleidingen", "beheer"];
  if (!session && protectedTabs.includes(view.tab)) view.tab = "overons";
  if (session && !magBeheerZien(session) && view.tab === "beheer") view.tab = "dossiers";

  // Diepe link (bv. vanuit een Discord-melding) meteen afhandelen zodra db en sessie klaarstaan;
  // zonder sessie eerst de aanmeldmodal tonen (enkel als die nog niet al openstaat, anders zou elke
  // her-render tijdens het typen van de toegangscode het veld resetten).
  if (pendingDeepLink){
    if (session){
      pasPendingDeepLinkToe(session);
      return;
    } else if (!document.getElementById("modal-root").hasChildNodes()){
      openLoginModal();
    }
  }

  renderNav();
  renderApp();
}

render();
startDbSync();
