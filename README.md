# Klávesová mise – Klik a školní výlet

Česká hra pro děti (cca 2. stupeň ZŠ) na procvičení 12 základních klávesových zkratek. Statický web, bez registrace, bez serveru, bez knihoven. Funguje i offline.

## Režimy

### 📖 Příběh: Klik a školní výlet
Myšák Klik (počítačová myš ze školní počítačovky) potřebuje pomoct třídě 7.B připravit výlet na Karlštejn. Hráč pracuje v simulovaném textovém editoru:

- **označuje text myší** (tažením, dvojklikem, trojklikem),
- **kliká** na blikající místo, kam se má vkládat,
- **mačká zkratky**, které dokument opravdu změní (tučné písmo, vyjmutí, vložení, zpět/znovu, hledání, uložení, tisk…),
- **píše** do vyhledávání.

Postup ukazuje cesta s kamínky, po které Klik skáče. **Správný krok = posun dopředu. Špatná zkratka = krok zpátky** a dokument se vrátí do stavu před tím krokem. Za špatné označení nebo kliknutí se nepostihuje, jen se zobrazí rada.

| Kapitola | Co se dělá | Zkratky |
|---|---|---|
| 1. Pozvánka na výlet | tučný nadpis, kopírování místa srazu | B, C, V, S |
| 2. Co si zabalit | přesun plavek do „Nechat doma“, Klik kýchne a smaže pláštěnku | X, V, Z, U, S |
| 3. Bábovka na jarmark | úprava receptu, vrácení a obnovení kurzívy | U, B, I, Z, Y, S |
| 4. Referát o Karlštejně | hledání slova, zvýraznění, kopírování celého textu | F, B, A, C, S |
| 5. Školní noviny | vložení referátu, titulek, tisk | V, B, U, S, P |

Každá kapitola dává 1–3 hvězdy (0 chyb = 3, max. 2 chyby = 2). Další kapitola se odemkne po dokončení předchozí.

### ⏱️ Trénink zkratek
Všech 12 zkratek, každá jednou, v náhodném pořadí. Běží stopky. 10 bodů za správnou odpověď (+5 do 3 s, +2 do 6 s), −3 za chybu, nápověda = poloviční body. Ukládá se osobní rekord. Výsledek lze zkopírovat pro učitele.

## Ovládání a omezení
- Zkratky se vyhodnocují podle `event.key`, takže respektují české rozložení QWERTZ (Ctrl+Z/Y). Na Macu funguje ⌘.
- Postup (hvězdy) a rekord se ukládají jen do `localStorage` daného prohlížeče. Nic se neodesílá.
- Jde o simulaci, ne o skutečný Word – hra nic netiskne ani neukládá do souborů.

## Spuštění
Otevřete `index.html` v prohlížeči (Chrome/Edge/Firefox). Build není potřeba.

## Test
`test.html` načte hru v iframu a automaticky projde celý příběh (včetně chyby a kroku zpět, kýchnutí + Ctrl+Z, kurzíva Z/Y, hledání, tisk) a celý trénink. Je potřeba ho otevřít přes HTTP server (např. `npx serve` nebo `python -m http.server`) a výsledek se vypíše na stránce (`PASS`).
