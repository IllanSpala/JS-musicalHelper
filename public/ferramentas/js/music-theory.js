/**
 * music-theory.js — Algoritmo Musical Puro | JoJoTools - Motor de Composição
 * ============================================================================
 * Este módulo é PURO (zero DOM, zero áudio). Ele expõe apenas funções
 * matemáticas de teoria musical. Pode ser importado/testado isoladamente.
 *
 * Arquitetura: biblioteca funcional, exportada como namespace global `MT`.
 *
 * CONCEITOS-CHAVE:
 * ─────────────────
 * • Pitch Class (PC): inteiro 0–11 que representa a ALTURA sem oitava.
 *   C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11.
 *   Analogia: é como o "módulo 12" — um relógio de 12 horas onde a meia-
 *   noite equivale ao Dó de qualquer oitava.
 *
 * • Intervalo Cromático: distância em semitons entre dois PCs.
 *   Intervalo(C, G) = 7 (quinta justa).
 *
 * • Fórmula de Acorde: array de intervalos em semitons a partir da RAIZ.
 *   ex: maj7 = [0, 4, 7, 11] (raiz, terça maior, quinta, sétima maior).
 *
 * • Voice Leading Score: soma dos menores saltos entre todas as vozes
 *   do Acorde A para o Acorde B (problema de matching ótimo, aqui resolvido
 *   por força bruta O(n!) dado que acordes têm no máx. 5 vozes).
 */

'use strict';

const MT = (() => {

    /* ================================================================
       1. DICIONÁRIOS FUNDAMENTAIS
       ================================================================ */

    /** Mapa de nome de nota → Pitch Class (0–11) */
    const NOTE_TO_PC = {
        'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,
        'E':4,'Fb':4,'F':5,'E#':5,'F#':6,'Gb':6,
        'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,
        'B':11,'Cb':11,'B#':0
    };

    /** Pitch Class → nome de nota (notação preferida em sustenidos) */
    const PC_TO_NOTE = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

    /**
     * Fórmulas intervalares de cada qualidade de acorde.
     * Representadas como array de semitons a partir da raiz.
     * Analogia: a fórmula é como um "carimbo de forma" — aplicamos
     * o mesmo molde sobre qualquer raiz para construir o acorde.
     */
    const CHORD_FORMULAS = {
        'maj':    [0, 4, 7],
        'min':    [0, 3, 7],
        'dim':    [0, 3, 6],
        'aug':    [0, 4, 8],
        '5':      [0, 7],
        'sus2':   [0, 2, 7],
        'sus4':   [0, 5, 7],
        'maj7':   [0, 4, 7, 11],
        'dom7':   [0, 4, 7, 10],   // dominante (alias '7')
        '7':      [0, 4, 7, 10],
        'm7':     [0, 3, 7, 10],
        'mM7':    [0, 3, 7, 11],   // menor com sétima maior
        'm7b5':   [0, 3, 6, 10],   // semidim (ø)
        'dim7':   [0, 3, 6, 9],    // diminuto total
        'maj9':   [0, 4, 7, 11, 14],
        '9':      [0, 4, 7, 10, 14],
        'm9':     [0, 3, 7, 10, 14],
        'add9':   [0, 4, 7, 14],
        'madd9':  [0, 3, 7, 14],
        '6':      [0, 4, 7, 9],
        'm6':     [0, 3, 7, 9],
        '6/9':    [0, 4, 7, 9, 14],
        'maj7#11':[0, 4, 7, 11, 6], // Lídio
        '7b9':    [0, 4, 7, 10, 13],
        '7#9':    [0, 4, 7, 10, 15],
        '7#11':   [0, 4, 7, 10, 6],
        '7b13':   [0, 4, 7, 10, 20],
        'alt':    [0, 4, 10, 13, 15, 20], // dominante alterado
    };

    /**
     * Escalas como array de intervalos (em semitons) a partir da tônica.
     * Usadas para calcular o campo harmônico de partida.
     */
    const SCALE_INTERVALS = {
        'major':      [0, 2, 4, 5, 7, 9, 11],
        'minor':      [0, 2, 3, 5, 7, 8, 10],
        'dorian':     [0, 2, 3, 5, 7, 9, 10],
        'mixolydian': [0, 2, 4, 5, 7, 9, 10],
        'lydian':     [0, 2, 4, 6, 7, 9, 11],
        'phrygian':   [0, 1, 3, 5, 7, 8, 10],
        'locrian':    [0, 1, 3, 5, 6, 8, 10],
    };


    /* ================================================================
       2. UTILITÁRIOS DE PITCH CLASS
       ================================================================ */

    /**
     * Converte nome de nota em Pitch Class (PC).
     * @param {string} noteName — ex: "C#", "Bb"
     * @returns {number} PC 0–11, ou null se inválido.
     */
    function nameToPC(noteName) {
        const key = noteName.trim();
        return NOTE_TO_PC[key] ?? null;
    }

    /**
     * Converte Pitch Class em nome de nota.
     * @param {number} pc — inteiro 0–11
     * @returns {string}
     */
    function pcToName(pc) {
        return PC_TO_NOTE[((pc % 12) + 12) % 12];
    }

    /**
     * Reduz qualquer inteiro ao espaço [0, 11] (mod 12 positivo).
     * Análogo ao operador "módulo de relógio".
     */
    function mod12(n) { return ((n % 12) + 12) % 12; }

    /**
     * Distância cromática mínima entre dois PCs.
     * Em teoria de conjuntos, é o "intervalo de classe" (ic).
     *
     * Analogia: num relógio de 12h, a menor distância entre as 2h e as 10h
     * é 4h (indo para trás), não 8h (indo para frente).
     *
     * @returns {number} 0–6
     */
    function pitchClassDistance(pcA, pcB) {
        const diff = mod12(pcB - pcA);
        return Math.min(diff, 12 - diff);
    }

    /**
     * Converte um PC + oitava em frequência Hz.
     * Fórmula: f = 440 * 2^((midi - 69) / 12)
     * A MIDI note 69 = A4 = 440 Hz é o nosso ponto de ancoragem.
     *
     * @param {number} pc   — Pitch Class 0–11
     * @param {number} oct  — oitava (4 = oitava central)
     * @returns {number} frequência em Hz
     */
    function pcToFreq(pc, oct = 4) {
        const midiNote = pc + (oct + 1) * 12;
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }


    /* ================================================================
       3. CONSTRUÇÃO DE ACORDES
       ================================================================ */

    /**
     * Constrói um objeto Acorde a partir de nome e qualidade.
     *
     * @param {string} rootName — nome da raiz (ex: "C", "F#")
     * @param {string} quality  — qualidade (ex: "maj7", "m7")
     * @returns {{ name, root, quality, pcs, notes, formula }}
     */
    function buildChord(rootName, quality) {
        const rootPC = nameToPC(rootName);
        if (rootPC === null) return null;
        const formula = CHORD_FORMULAS[quality] ?? CHORD_FORMULAS['maj7'];

        // Aplica o "carimbo" da fórmula sobre a raiz — operação de módulo 12.
        // Ex: C(0) + [0,4,7,11] → [0,4,7,11] → C,E,G,B
        // Ex: F#(6) + [0,4,7,11] → [6,10,1,5] → F#,A#,C#,F
        const pcs = formula.map(interval => mod12(rootPC + interval));
        const notes = pcs.map(pcToName);

        const qualSuffix = quality === 'maj' ? '' : quality === 'min' ? 'm' : quality;
        const displayName = `${rootName}${qualSuffix}`;

        return { name: displayName, root: rootName, rootPC, quality, pcs, notes, formula };
    }

    /**
     * Parseia uma string de cifra completa em { root, quality }.
     * Suporta: C, Cm, Cmaj7, F#m7b5, Bb7, Dbmaj7#11, etc.
     *
     * Estratégia: extrai primeiro a raiz (com possível # ou b),
     * depois testa os sufixos do maior para o menor.
     *
     * @param {string} chordStr — ex: "Cmaj7", "F#m7b5"
     * @returns {{ root:string, quality:string }|null}
     */
    function parseChordString(chordStr) {
        if (!chordStr || typeof chordStr !== 'string') return null;
        const s = chordStr.trim();

        // Captura raiz: letra + # ou b opcionais
        const rootMatch = s.match(/^([A-G][#b]?)/);
        if (!rootMatch) return null;
        const root = rootMatch[1];

        let suffix = s.slice(root.length).trim() || 'maj';

        // Normaliza abreviações comuns
        const normalize = {
            'M7': 'maj7', 'M': 'maj', 'Maj7': 'maj7', 'Maj': 'maj',
            'ø': 'm7b5', 'ø7': 'm7b5', '°': 'dim', '°7': 'dim7',
            'dom7': '7', 'dom': '7', '': 'maj',
            'm': 'min', 'mi': 'min', 'minor': 'min',
        };
        if (normalize[suffix] !== undefined) suffix = normalize[suffix];

        // Verifica se a qualidade é suportada; fallback para maj7
        const quality = CHORD_FORMULAS[suffix] ? suffix : 'maj7';
        return { root, quality };
    }


    /* ================================================================
       4. VOICE LEADING — ANÁLISE DE SUAVIDADE
       ================================================================ */

    /**
     * Calcula o Score de Voice Leading entre dois acordes.
     *
     * ALGORITMO — Matching ótimo entre vozes:
     * Imagine cada nota do Acorde A como um músico numa cadeira, e cada
     * nota do Acorde B como uma cadeira nova. O VL Score é o custo total
     * do "menor deslocamento" de todos os músicos até suas novas cadeiras.
     *
     * Formalmente: este é o problema de Atribuição (Assignment Problem).
     * Aqui usamos força bruta via permutações (n ≤ 5 vozes = no máx. 120
     * combinações possíveis), o que é performático para acordes reais.
     *
     * Cada "passo" é medido pelo pitchClassDistance (intervalo de classe),
     * que mede a distância MAIS CURTA no espaço cromático circular (analogia
     * ao relógio de 12h mencionada acima).
     *
     * Resultado: quanto menor o VLScore, mais suave o movimento de vozes.
     * VLScore = 0  → todos as notas são iguais (mesma harmonia).
     * VLScore > 8  → movimento abrupto (saltos de quarta ou mais).
     *
     * @param {number[]} pcsA — Pitch Classes do Acorde A
     * @param {number[]} pcsB — Pitch Classes do Acorde B
     * @returns {number} score de voice leading (0 = perfeito, ∞ = máximo salto)
     */
    function voiceLeadingScore(pcsA, pcsB) {
        // Normaliza para arrays de mesmo tamanho (duplica notas se necessário)
        const a = [...pcsA];
        const b = [...pcsB];

        // Equaliza tamanhos: o menor repete suas vozes internas
        while (a.length < b.length) a.push(a[Math.floor(a.length / 2)]);
        while (b.length < a.length) b.push(b[Math.floor(b.length / 2)]);

        // Gera todas as permutações de `b` para testar contra `a`
        const perms = permutations(b);
        let minScore = Infinity;

        for (const perm of perms) {
            // Soma dos pitchClassDistance entre cada voz correspondente
            let score = 0;
            for (let i = 0; i < a.length; i++) {
                score += pitchClassDistance(a[i], perm[i]);
            }
            if (score < minScore) minScore = score;
        }

        return minScore;
    }

    /**
     * Gera todas as permutações de um array (algoritmo de Heap iterativo).
     * Complexidade: O(n!) — seguro para n ≤ 5.
     * @param {any[]} arr
     * @returns {any[][]}
     */
    function permutations(arr) {
        const results = [];
        const a = [...arr];
        const n = a.length;
        const c = new Array(n).fill(0);
        results.push([...a]);
        let i = 0;
        while (i < n) {
            if (c[i] < i) {
                if (i % 2 === 0) { [a[0], a[i]] = [a[i], a[0]]; }
                else             { [a[c[i]], a[i]] = [a[i], a[c[i]]]; }
                results.push([...a]);
                c[i]++;
                i = 0;
            } else {
                c[i] = 0;
                i++;
            }
        }
        return results;
    }

    /**
     * Conta quantas notas (Pitch Classes) são comuns entre dois acordes.
     * Voice Leading "estático" — notas que ficam sem mover-se.
     *
     * @returns {number} quantidade de notas em comum (0 – min(|A|,|B|))
     */
    function commonNoteCount(pcsA, pcsB) {
        const setA = new Set(pcsA.map(pc => mod12(pc)));
        return pcsB.filter(pc => setA.has(mod12(pc))).length;
    }

    /**
     * Classifica a suavidade do voice leading em três categorias.
     * Estas categorias determinam a aparência das linhas SVG no grafo.
     *
     * Thresholds derivados empiricamente da prática da harmonia funcional:
     * • 0–3: movimentos por semitom ou notas comuns → "smooth"
     * • 4–7: saltos de terça/quarta → "moderate"
     * • 8+ : saltos de quinta ou maior → "rough"
     *
     * @param {number} score — resultado de voiceLeadingScore()
     * @returns {'smooth'|'moderate'|'rough'}
     */
    function classifyVoiceLeading(score) {
        if (score <= 3) return 'smooth';
        if (score <= 7) return 'moderate';
        return 'rough';
    }


    /* ================================================================
       5. ROTAS HARMÔNICAS — EXPANSÃO PROCEDURAL
       ================================================================ */

    /**
     * Gera sugestões de acordes a partir de um Acorde de origem,
     * divididas em três rotas funcionais:
     *
     * ── ROTA VERDE: Resolução (dominante → tônica) ──────────────────
     * Acorde destino tem raiz a uma 4ª justa ascendente (+5 semitons)
     * ou V7 → I (raiz a 7 semitons acima). Simula o movimento de
     * maior "gravidade" na tonalidade — o círculo das quintas.
     *
     * ── ROTA LARANJA: Tensão / Empréstimo Modal ──────────────────────
     * Acordes do modo paralelo (ex: Cmaj → Abmaj, que pertence ao
     * campo de Dó menor) e acordes de modo substituto (tritone subs,
     * secundárias). Cria a sensação de "saída da tonalidade".
     *
     * ── ROTA AZUL: Retenção de Voz ──────────────────────────────────
     * Acordes onde 2+ notas do Acorde A aparecem no Acorde B, enquanto
     * as outras se movem por semitom. Selecionamos candidatos com
     * VLScore ≤ 4 e pelo menos 2 notas comuns.
     *
     * @param {object}  sourceChord — objeto Acorde (saída de buildChord)
     * @param {string}  quality     — qualidade padrão dos acordes gerados
     * @param {object}  options     — { showResolution, showTension, showVoice }
     * @returns {Array<{ chord, route, vlScore, vlClass, commonNotes, label }>}
     */
    function expandChord(sourceChord, quality = 'maj7', options = {}) {
        const { showResolution = true, showTension = true, showVoice = true } = options;
        const suggestions = [];
        const seen = new Set();

        const addSuggestion = (chordObj, route, label, tooltipFn = '') => {
            if (!chordObj || seen.has(chordObj.name)) return;
            seen.add(chordObj.name);
            const vlScore = voiceLeadingScore(sourceChord.pcs, chordObj.pcs);
            const vlClass = classifyVoiceLeading(vlScore);
            const common  = commonNoteCount(sourceChord.pcs, chordObj.pcs);
            suggestions.push({ chord: chordObj, route, vlScore, vlClass, common, label, tooltipFn });
        };

        const rPC = sourceChord.rootPC;

        /* ── Rota de Resolução (verde) — movimento "cadencial" ── */
        if (showResolution) {
            // 4ª justa ascendente → Subdominante (IV)
            addSuggestion(buildChord(pcToName(mod12(rPC + 5)), quality), 'resolution', 'IV', 'Subdominante natural');
            // V7 → dominante clássico que resolve na tônica
            addSuggestion(buildChord(pcToName(mod12(rPC + 7)), '7'), 'resolution', 'V7', 'Dominante — máxima tensão resolutiva');
            // VIm → relativa menor (repouso alternativo)
            addSuggestion(buildChord(pcToName(mod12(rPC + 9)), 'm7'), 'resolution', 'VIm7', 'Relativa menor — repouso alternativo');
            // IIm7 → pré-dominante (II-V-I)
            addSuggestion(buildChord(pcToName(mod12(rPC + 2)), 'm7'), 'resolution', 'IIm7', 'Pré-dominante — prepara o V7');
        }

        /* ── Rota de Tensão / Empréstimo Modal (laranja) ── */
        if (showTension) {
            // bVIImaj7 — modo Mixolídio/Dórico (empréstimo mais comum no rock)
            addSuggestion(buildChord(pcToName(mod12(rPC - 2)), quality), 'tension', 'bVII', 'Empréstimo do modo Mixolídio/Eólio');
            // bVImaj7 — modo Eólio / paralelo menor
            addSuggestion(buildChord(pcToName(mod12(rPC - 4)), quality), 'tension', 'bVI', 'Empréstimo do modo Eólio paralelo');
            // SubV7 — substituto de trítono do V7
            addSuggestion(buildChord(pcToName(mod12(rPC + 6)), '7'), 'tension', 'SubV', 'Substituto de trítono — compartilha 3ª e 7ª com V7');
            // bIImaj — Napolitano (bII) — movimento cromático descendente
            addSuggestion(buildChord(pcToName(mod12(rPC + 1)), 'maj'), 'tension', 'bII', 'Acorde Napolitano — movimento frigio');
            // ivm7 — IV menor paralelo (tão frequente no pop/soul)
            addSuggestion(buildChord(pcToName(mod12(rPC + 5)), 'm7'), 'tension', 'ivm7', 'IV menor — empréstimo modal expressivo');
            // V7/V — dominante secundário (dominante do dominante)
            addSuggestion(buildChord(pcToName(mod12(rPC + 2)), '7'), 'tension', 'V7/V', 'Dominante secundário — aponta para V');
        }

        /* ── Rota de Retenção de Voz (azul) ── */
        if (showVoice) {
            const qualityCandidates = [quality, 'm7', 'dim7', 'm7b5', '7', 'maj7'];
            for (let targetPC = 0; targetPC < 12; targetPC++) {
                if (targetPC === rPC) continue;
                for (const q of qualityCandidates) {
                    const candidate = buildChord(pcToName(targetPC), q);
                    if (!candidate || seen.has(candidate.name)) continue;
                    const vl = voiceLeadingScore(sourceChord.pcs, candidate.pcs);
                    const common = commonNoteCount(sourceChord.pcs, candidate.pcs);
                    if (vl <= 4 && common >= 2) {
                        addSuggestion(candidate, 'voice', `${common}NC`, `${common} notas comuns — voice leading suave`);
                        break;
                    }
                }
            }
        }

        // Max 4 por rota para não sobrecarregar o layout
        return [
            ...suggestions.filter(s => s.route === 'resolution').slice(0, 4),
            ...suggestions.filter(s => s.route === 'tension').slice(0, 4),
            ...suggestions.filter(s => s.route === 'voice').slice(0, 4),
        ];
    }


    /* ================================================================
       6. POSICIONAMENTO RADIAL
       ================================================================ */
    function radialPositions(cx, cy, radius, count, startAngleDeg = -90, spanDeg = 300) {
        if (count === 0) return [];
        const positions = [];
        const startRad = (startAngleDeg * Math.PI) / 180;
        const spanRad  = (spanDeg * Math.PI) / 180;
        const step = count > 1 ? spanRad / (count - 1) : 0;
        for (let i = 0; i < count; i++) {
            const angle = startRad + i * step;
            positions.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), angle });
        }
        return positions;
    }

    /* ================================================================
       7. CAGED — SHAPES DE GUITARRA/VIOLÃO
       Cada shape é relativo ao fret da raiz. O sistema transpõe
       automaticamente pela posição da raiz no braço.

       Estrutura de cada shape:
         cagedLetter  — letra do sistema CAGED ('C','A','G','E','D')
         rootFretOffset — semitons da posição "aberta" do shape até a raiz
         dots  — [ [string 1–6, fret relativo], ... ]
                 string 1 = Mi grave, 6 = Mi agudo
         barre — { fret relativo, strFrom, strTo } ou null
         muted — strings abafadas [array de números 1–6]
       ================================================================ */

    /**
     * Shapes base para acorde MAIOR (5 posições CAGED).
     * Frets são RELATIVOS à raiz: 0 = fret onde está a raiz naquela corda.
     * O JS calcula o fret absoluto somando rootFret (posição da raiz na 6ª corda).
     */
    // CAGED_MAJOR: notação (string, fret_relativo_ao_shape_base)
    // Em - Mi grave=1, La=2, Re=3, Sol=4, Si=5, Mi agudo=6
    // Frets relativos ao template aberto de C (baseShape para C):
    //   La(2):3=C, Re(3):2=E, Sol(4):0=G, Si(5):1=C, MiAg(6):0=E → C-E-G-C-E ✓
    const CAGED_MAJOR = [
        // C-shape aberto em C: x-3-2-0-1-0
        { cagedLetter:'C', rootString:2, rootFretOffset:3,
          dots:[[2,3],[3,2],[4,0],[5,1],[6,0]], barre:null, muted:[1] },
        // A-shape: barre + 3ª no G e Si → notas: R-5-R-3-5
        // Am aberto: x-0-2-2-2-0 (Em C: x-3-5-5-5-3 via barre)
        { cagedLetter:'A', rootString:2, rootFretOffset:0,
          dots:[[2,0],[3,2],[4,2],[5,2],[6,0]], barre:null, muted:[1] },
        // G-shape: raiz em MiGrave(1) e MiAgudo(6)
        // G aberto: 3-2-0-0-0-3 → R-3-5-R-3-R
        { cagedLetter:'G', rootString:1, rootFretOffset:3,
          dots:[[1,3],[2,2],[3,0],[4,0],[5,0],[6,3]], barre:null, muted:[] },
        // E-shape: barre clássico. E aberto: 0-2-2-1-0-0 → R-5-R-3-5-R
        { cagedLetter:'E', rootString:1, rootFretOffset:0,
          dots:[[1,0],[2,2],[3,2],[4,1],[5,0],[6,0]], barre:null, muted:[] },
        // D-shape: raiz em Re(3). D aberto: x-x-0-2-3-2 → R-5-R-3
        { cagedLetter:'D', rootString:3, rootFretOffset:0,
          dots:[[3,0],[4,2],[5,3],[6,2]], barre:null, muted:[1,2] },
    ];

    // CAGED_MINOR7: baseados nas posições abertas de Am e Em
    // Am aberto: x-0-2-2-1-0 → R-5-b3-R-5 (notas: R,5ª,b3ª ✓)
    const CAGED_MINOR7 = [
        // Am-shape: raiz na corda La (2)
        { cagedLetter:'A', rootString:2, rootFretOffset:0,
          dots:[[2,0],[3,2],[4,2],[5,1],[6,0]], barre:null, muted:[1] },
        // Em-shape: raiz na MiGrave (1). Em aberto: 0-2-2-0-0-0 → R-5-b3-R-5
        { cagedLetter:'E', rootString:1, rootFretOffset:0,
          dots:[[1,0],[2,2],[3,2],[4,0],[5,0],[6,0]], barre:null, muted:[] },
        // Dm-shape: raiz no Re (3). Dm aberto: x-x-0-2-3-1 → R-5-b3-R
        { cagedLetter:'D', rootString:3, rootFretOffset:0,
          dots:[[3,0],[4,2],[5,3],[6,1]], barre:null, muted:[1,2] },
        // Cm-shape: barre na La (2) — baseado no Am transposto
        { cagedLetter:'C', rootString:2, rootFretOffset:3,
          dots:[[2,3],[3,5],[4,5],[5,4],[6,3]], barre:{ fret:3, strFrom:2, strTo:6 }, muted:[1] },
        // Gm-shape: barre na MiGrave (1)
        { cagedLetter:'G', rootString:1, rootFretOffset:3,
          dots:[[1,3],[2,5],[3,5],[4,3],[5,3],[6,3]], barre:{ fret:3, strFrom:1, strTo:6 }, muted:[] },
    ];

    /**
     * Retorna as 5 posições CAGED para um dado acorde.
     * Translada os frets base pela posição real da raiz no braço.
     *
     * Cálculo da transposição:
     * A raiz de C na 6ª corda (Mi) está no fret 8.
     * Formula: rootFret = (rootPC - openStringPC + 12) % 12
     * Para a 5ª corda (La): openStringPC = 9 (A)
     * Para a 6ª corda (Mi): openStringPC = 4 (E)
     *
     * @param {string} rootName   — ex: "F#"
     * @param {string} quality    — ex: "maj7", "m7", "min"
     * @returns {Array} — 5 shapes com frets absolutos
     */
    function getCagedShapes(rootName, quality) {
        const rootPC = nameToPC(rootName);
        if (rootPC === null) return [];

        const isMinor = ['min','m7','m7b5','mM7','m9','m6','madd9','dim','dim7'].includes(quality);
        const baseShapes = isMinor ? CAGED_MINOR7 : CAGED_MAJOR;

        // Afinação padrão: string 1=E2(4), 2=A2(9), 3=D3(2), 4=G3(7), 5=B3(11), 6=E4(4)
        const openPC = { 1:4, 2:9, 3:2, 4:7, 5:11, 6:4 };

        return baseShapes.map(shape => {
            const openP  = openPC[shape.rootString];
            // Fret onde a raiz aparece nessa corda (mínimo 1 para evitar corda solta como raiz)
            let baseFret = mod12(rootPC - openP);
            if (baseFret === 0) baseFret = 12;

            // Translada: fret absoluto = baseFret + (relFret - rootFretOffset)
            const translatedDots = shape.dots.map(([str, relFret]) => {
                if (relFret === 0) return [str, 0]; // corda solta — não translada
                const absFret = baseFret + (relFret - shape.rootFretOffset);
                return [str, Math.max(1, absFret)];
            });

            // capoFret = menor fret pressionado (para mostrar posição no braço)
            const pressedFrets = translatedDots.filter(d => d[1] > 0).map(d => d[1]);
            const capoFret = pressedFrets.length ? Math.min(...pressedFrets) : 1;

            return {
                cagedLetter: shape.cagedLetter,
                capoFret,
                dots: translatedDots,
                barre: shape.barre
                    ? { fret: capoFret, strFrom: shape.barre.strFrom, strTo: shape.barre.strTo }
                    : null,
                muted: shape.muted,
                fretWindow: [capoFret, capoFret + 4],
            };
        });
    }

    /* ================================================================
       8. ACORDE DIATÔNICO ALEATÓRIO
       ================================================================ */

    /**
     * Retorna um acorde aleatório do campo harmônico da escala/modo dado.
     * @param {string} rootName — tônica (ex: "C")
     * @param {string} mode     — modo (ex: "major", "dorian")
     * @param {string} quality  — qualidade preferida
     */
    function randomDiatonicChord(rootName, mode, quality = 'maj7') {
        const rootPC   = nameToPC(rootName) ?? 0;
        const intervals = SCALE_INTERVALS[mode] ?? SCALE_INTERVALS['major'];
        const idx       = Math.floor(Math.random() * intervals.length);
        const notePC    = mod12(rootPC + intervals[idx]);
        return buildChord(pcToName(notePC), quality);
    }

    /* ================================================================
       9. API PÚBLICA DO MÓDULO
       ================================================================ */
    return {
        NOTE_TO_PC, PC_TO_NOTE, CHORD_FORMULAS, SCALE_INTERVALS,
        nameToPC, pcToName, mod12, pcToFreq,
        buildChord, parseChordString,
        voiceLeadingScore, commonNoteCount, classifyVoiceLeading,
        expandChord, radialPositions,
        getCagedShapes, randomDiatonicChord,
    };

})();

