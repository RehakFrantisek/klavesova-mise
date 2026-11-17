# Klávesová mise – Kurzík a školní výlet

Česká hra pro děti (cca 2. stupeň ZŠ) na procvičení 12 základních klávesových zkratek a pohybu v textu bez myši. Statický web, bez registrace, bez serveru, bez knihoven. Funguje i offline.

## Režimy

### 📖 Příběh: Kurzík a školní výlet
Myšák Kurzík (počítačová myš ze školní počítačovky) potřebuje pomoct třídě 7.B připravit výlet na Karlštejn. Hráč pracuje v simulovaném textovém editoru:

- **označuje text myší** (tažením, dvojklikem, trojklikem),
- **kliká** na blikající místo, kam se má vkládat,
- **mačká zkratky**, které dokument opravdu změní (tučné písmo, vyjmutí, vložení, zpět/znovu, hledání, uložení, tisk…),
- **píše** do vyhledávání,
- v 6. kapitole **ovládá kurzor jen klávesnicí**: šipky (s Ctrl po slovech), Home, End, Shift pro označení, Delete/Backspace a psaní znaků.

Postup ukazuje cesta s kamínky, po které Klik skáče. **Správný krok = posun dopředu. Špatná zkratka = krok zpátky** a dokument se vrátí do stavu před tím krokem. Za špatné označení nebo kliknutí se nepostihuje, jen se zobrazí rada.

| Kapitola | Co se dělá | Zkratky |
|---|---|---|
| 1. Pozvánka na výlet | tučný nadpis, kopírování místa srazu | B, C, V, S |
| 2. Co si zabalit | přesun plavek do „Nechat doma“, Kurzík kýchne a smaže pláštěnku | X, V, Z, U, S |
| 3. Bábovka na jarmark | úprava receptu, vrácení a obnovení kurzívy | U, B, I, Z, Y, S |
| 4. Referát o Karlštejně | hledání slova, zvýraznění, kopírování celého textu | F, B, A, C, S |
| 5. Školní noviny | vložení referátu, titulek, tisk | V, B, U, S, P |
| 6. Bez myši | Kurzík má vybitou baterku: zpráva z výletu se opraví jen klávesnicí – skok na konec a začátek řádku, přeskok po slovech, označení a smazání zdvojeného slova, tečka → vykřičník, označení celé věty a tučně | End, Home, Ctrl+←/→, Shift(+Ctrl)+→, Delete, Backspace, Shift+Home, B, S |

Každá kapitola dává 1–3 hvězdy (0 chyb = 3, max. 2 chyby = 2). Další kapitola se odemkne po dokončení předchozí. V krocích „Jen klávesnice“ se chyby nepočítají – nezáleží na cestě, jen na výsledku; Ctrl + Z vrátí řádek na začátek kroku. Uložený postup z doby, kdy hra měla 5 kapitol, se při načtení doplní o 6. kapitolu (klíč `klavesova-mise-v2` zůstává).

### ⏱️ Trénink zkratek
Všech 12 zkratek, každá jednou, v náhodném pořadí. Běží stopky. 10 bodů za správnou odpověď (+5 do 3 s, +2 do 6 s), −3 za chybu, nápověda = poloviční body. Ukládá se osobní rekord. Výsledek lze zkopírovat pro učitele.

## Ovládání a omezení
- Zkratky se vyhodnocují podle `event.key`, takže respektují české rozložení QWERTZ (Ctrl+Z/Y). Na Macu funguje ⌘.
- Postup (hvězdy) a rekord se ukládají jen do `localStorage` daného prohlížeče. Nic se neodesílá.
- Jde o simulaci, ne o skutečný Word – hra nic netiskne ani neukládá do souborů.

## Spuštění
Otevřete `index.html` v prohlížeči (Chrome/Edge/Firefox). Build není potřeba.

## Test
`test.html` načte hru v iframu a automaticky projde celý příběh (včetně chyby a kroku zpět, kýchnutí + Ctrl+Z, kurzíva Z/Y, hledání, tisk) kapitolu Bez myši (pohyb kurzoru, označení, mazání, psaní) a celý trénink. Je potřeba ho otevřít přes HTTP server (např. `npx serve` nebo `python -m http.server`) a výsledek se vypíše na stránce (`PASS`).
