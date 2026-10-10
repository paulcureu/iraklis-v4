# Irakli Athoneli — site portofoliu („galerie de noapte”)

Site static, făcut doar cu HTML, CSS și JavaScript. Nu are nevoie de build, de Node sau de vreun framework. Merge direct pe **GitHub Pages**, **Vercel** sau **Netlify** și e responsive pentru telefon, tabletă și desktop.

Stilul: fundal aproape negru, lucrările luminate ca de un reflector, titluri mari cu serif (Instrument Serif) și texte mici cu un font curat (Hanken Grotesk). Textele de pe site sunt în engleză.

## Ce conține

```
index.html          Acasă: leul din marmură, „Latest works” (2025), citat, lucrări alese, materiale, premii, comandă
works.html          Catalogul cu toate lucrările, cu filtru pe categorii
work.html           Pagina unei lucrări: work.html?w=troja-warhorse
about.html          Despre artist: bio, pe scurt, atelier și simpozion, premii
contact.html        Contact + formular (și WhatsApp, Instagram, Facebook)
404.html            Pagina „nu există” (GitHub Pages o folosește automat)
assets/
  css/style.css     Tot designul (culori, fonturi și spații sunt în :root, sus)
  js/data.js        LISTA DE LUCRĂRI. Aici editezi lucrările.
  js/main.js        Header, meniul de pe telefon, galeria, pagina lucrării, viewer-ul de poze și formularul
  fonts/            Fonturile, găzduite local
  img/works/<lucrare>/01.jpg, 01-sm.jpg …   Pozele, câte 2 mărimi (1600px și 800px)
  img/materials/    Cele 6 pietre din secțiunea „Materials”
  img/site/         Leul din hero, portretul, poza de la simpozion, imaginea de share (og.jpg)
  img/favicon.svg   Iconița din tab-ul browserului
```

## Cum îl vezi pe calculator

Cel mai simplu e cu extensia **Live Server** din VS Code: click dreapta pe `index.html` și alegi „Open with Live Server”.

Sau din terminal, în folderul proiectului:

```bash
npx serve .
# sau
python3 -m http.server 8000
```

## Cum îl pui pe GitHub Pages

1. Creează un repository nou pe GitHub, de exemplu `athoneli`.
2. Urcă fișierele, **cu tot cu folderul `assets`** și fișierul `.nojekyll`. Ai două variante:
   - din browser: „Add file” → „Upload files” și tragi tot conținutul folderului;
   - din terminal:
     ```bash
     git init
     git add .
     git commit -m "Athoneli portfolio"
     git branch -M main
     git remote add origin https://github.com/UTILIZATORUL-TAU/athoneli.git
     git push -u origin main
     ```
3. În repository mergi la **Settings → Pages**. La „Source” alegi **Deploy from a branch**, apoi branch-ul `main` și folderul `/ (root)`, și salvezi.
4. După 1–2 minute site-ul e live la `https://UTILIZATORUL-TAU.github.io/athoneli/`.

Toate link-urile sunt relative, deci site-ul merge și într-un subfolder, cum e cel de mai sus.

**Domeniul athoneliart.com:** în Settings → Pages → „Custom domain” scrii `athoneliart.com`, iar la firma de unde e cumpărat domeniul pui înregistrările DNS indicate de GitHub. Dacă domeniul e acum legat de Netlify, poți pune și site-ul acesta tot pe Netlify: „Add new site → Deploy manually” și tragi folderul.

**Vercel:** „Add New → Project”, alegi repository-ul, la Framework Preset alegi **Other**, lași Build Command gol și dai Deploy.

## Cum modifici lucrările

Totul e în `assets/js/data.js`. Fiecare lucrare arată așa:

```js
{
  slug: "troja-warhorse",          // numele folderului cu poze + adresa paginii
  title: "Troja Warhorse",
  year: "2025",
  material: "Pentelic marble",
  size: "",                        // ex. "86 × 25 × 30 cm"
  place: "",                       // ex. "Mount Athos, Greece"
  category: "sculpture",           // sculpture, capitals, figures sau paper
  text: "Not a monument to war…",  // descrierea (1–3 propoziții)
  note: "",                        // premiu sau colecție, ex. "Private collection, Romania"
  latest: true,                    // apare la „Latest works” pe prima pagină
  images: [
    { f: '01', w: 1200, h: 1600, sw: 600 },   // 01 = poza principală (coperta)
    ...
  ]
}
```

- **Câmpurile goale nu apar pe site.** Dacă afli anul, dimensiunile sau locul unei lucrări, le completezi și apar singure în fișa lucrării.
- **Categoriile** din filtru sunt: `sculpture` (Sculpture), `capitals` (Capitals & reliefs), `figures` (Portraits & figures) și `paper` (Works on paper).
- **Ordinea** din catalog e ordinea din fișier. Numerotarea Nº 01, Nº 02 … se face automat.
- **„Latest works”** de pe prima pagină arată lucrările care au `latest: true`, în ordinea din fișier. Acum sunt trei: Troja Warhorse, Dominion și Ascendant.

### Ce lucrări apar pe prima pagină

Secțiunea „Selected works” arată 6 lucrări alese de mână. Le schimbi în `index.html`, în atributul `data-picks`:

```html
<div class="collection" id="home-collection" data-picks="simeon-the-stylite,freedom,warrior,capitals-with-evangelists,black-bull,face-of-a-man"></div>
```

Scrii `slug`-urile din `data.js`, separate prin virgulă. Layout-ul e gândit pentru 6 lucrări, dar merge și cu mai multe.

### Cum adaugi o lucrare nouă

1. Creează folderul `assets/img/works/numele-lucrarii/` și pune pozele cu numele `01.jpg`, `02.jpg` și așa mai departe.
   Redimensionează-le înainte la maximum 1600px pe latura lungă, de exemplu cu [squoosh.app](https://squoosh.app).
2. Adaugă în `data.js` un obiect nou, cu `slug: "numele-lucrarii"` și pozele scrise simplu: `{ f: '01' }, { f: '02' }`.
   `w`, `h`, `sw` și fișierele `-sm.jpg` sunt opționale. Ajută doar la viteză pe telefon și la așezarea pozelor în grilă.

## Formularul de contact

Când vizitatorul apasă „Send enquiry”, i se deschide aplicația de email cu mesajul deja completat către `athoneliart@gmail.com`. Nu e nevoie de server.
Din pagina unei lucrări, butonul „Enquire about this work” deschide formularul cu numele lucrării deja scris în mesaj.

Ca să schimbi adresa, modifici `CONTACT_EMAIL` în `assets/js/main.js` și link-urile `mailto:` din fișierele HTML. Numărul de WhatsApp e în link-urile `https://wa.me/306975421099`.

Dacă mai târziu vrei ca mesajele să vină direct, fără să se deschidă aplicația de email, poți folosi Formspree sau Web3Forms. Pui `action` pe formular și scoți handler-ul din `initContact()`.

## După ce ai domeniul

În fiecare fișier HTML înlocuiește `content="assets/img/site/og.jpg"` cu adresa completă, de exemplu `https://athoneliart.com/assets/img/site/og.jpg`. Așa apare poza cu leul când cineva trimite link-ul pe WhatsApp sau Facebook.

## Note

- Textele sunt în engleză și sunt luate de pe athoneliart.com. Câteva lucruri merită verificate cu Irakli:
  - pe site-ul vechi, desenul în pastel cu taurul era pus la „Dominion”; aici Dominion are pozele capitelului cu tauri, iar desenul apare separat, ca „Bull” (Works on paper);
  - la „Family” am trecut Rustavi International Sculpture Symposium, 2017 (după poza de la simpozion);
  - „Wine” e trecut ca desen;
  - unele lucrări nu au an, dimensiuni sau loc.
- Pe site-ul vechi existau și poze suplimentare (de ex. mai multe unghiuri pentru Warrior, Black Bull, Simeon), care nu erau în arhivă. Se pot adăuga oricând după pașii de mai sus.
- Pozele primesc din CSS o ușoară estompare, ca să stea bine pe fundalul negru, și își recapătă culorile la hover.
- Animațiile se opresc automat pentru cei care au „reduce motion” activat în sistem.
- Fonturile sunt sub licența SIL Open Font License (vezi `assets/fonts/LICENSE-*.txt`).
