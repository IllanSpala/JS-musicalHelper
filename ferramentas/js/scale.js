// =============================================
//  SCALE MACHINE (COM SISTEMA MULTILÍNGUE)
// =============================================

const NOTES_SHARP   = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NOTES_FLAT    = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const DISPLAY_ROOTS = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
const FLAT_KEYS     = ['F','Bb','Eb','Ab','Db','Gb'];

// --- ORDEM LÓGICA E NOMES DAS ESCALAS ---
const SCALE_ORDER = [
    'Major (Ionian)', 'Natural Minor', 'Pentatonic Major', 'Pentatonic Minor', 'Blues',
    'Harmonic Minor', 'Melodic Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian',
    'Diminished (HW)', 'Whole Tone'
];

const SCALE_NAMES_PT = {
    'Major (Ionian)': 'Maior (Jônio)', 'Natural Minor': 'Menor Natural',
    'Pentatonic Major': 'Pentatônica Maior', 'Pentatonic Minor': 'Pentatônica Menor',
    'Blues': 'Blues', 'Harmonic Minor': 'Menor Harmônica', 'Melodic Minor': 'Menor Melódica',
    'Dorian': 'Dórico', 'Phrygian': 'Frígio', 'Lydian': 'Lídio', 'Mixolydian': 'Mixolídio',
    'Locrian': 'Lócrio', 'Diminished (HW)': 'Diminuta (Tom/Semitom)', 'Whole Tone': 'Tons Inteiros'
};

const SCALE_NAMES_EN = {
    'Major (Ionian)': 'Major (Ionian)', 'Natural Minor': 'Natural Minor',
    'Pentatonic Major': 'Major Pentatonic', 'Pentatonic Minor': 'Minor Pentatonic',
    'Blues': 'Blues', 'Harmonic Minor': 'Harmonic Minor', 'Melodic Minor': 'Melodic Minor',
    'Dorian': 'Dorian', 'Phrygian': 'Phrygian', 'Lydian': 'Lydian', 'Mixolydian': 'Mixolydian',
    'Locrian': 'Locrian', 'Diminished (HW)': 'Diminished (H/W)', 'Whole Tone': 'Whole Tone'
};

// --- DICIONÁRIOS PT ---
const INTERVAL_NAMES_PT = { '1':'Tônica','b2':'2ª menor','2':'2ª maior','b3':'3ª menor','3':'3ª maior','4':'4ª justa','#4':'4ª aum.','b5':'5ª dim.','5':'5ª justa','#5':'5ª aum.','b6':'6ª menor','6':'6ª maior','b7':'7ª menor','7':'7ª maior' };
const INTERVAL_DETAIL_PT = {
    '1' :{ char:'Âncora', txt:'A tônica é o centro gravitacional. Toda frase repousa nela. No braço, é o ponto de partida e de chegada de qualquer ideia melódica.' },
    'b2':{ char:'Tensão máxima', txt:'O intervalo mais tenso da harmonia ocidental. Define o som phrygiano e flamenco. Um semitom acima da tônica — atrito máximo.' },
    '2' :{ char:'Passagem suave', txt:'A 2ª maior flui naturalmente. É a nota de passagem por excelência entre a tônica e a terça. Cria movimento melódico sem tensão.' },
    'b3':{ char:'Melancolia', txt:'A terça menor define o caráter sombrio. É o intervalo do blues, do rock pesado. Muito expressiva em bends — puxe um semitom para a 3ª maior.' },
    '3' :{ char:'Brilho', txt:'A terça maior dá o caráter luminoso. Junto com a 5ª forma o acorde maior perfeito. Define tonalidades maiores e positivas.' },
    '4' :{ char:'Estabilidade', txt:'A 4ª justa é neutra — estável mas sem definir maior/menor. No pentatônico é pilar do som folk. Cuidado: contra a tônica pode soar "suspenso".' },
    '#4':{ char:'Inquietante', txt:'A 4ª aumentada (trítono). Na escala lídia cria sonoridade etérea e flutuante. O intervalo mais dissonante.' },
    'b5':{ char:'Tensão', txt:'A 5ª diminuta (trítono). No blues é ela que cria a blue note entre o 4 e o 5. No locrian define o acorde diminuto de tônica — instabilidade total.' },
    '5' :{ char:'Força', txt:'A 5ª justa é a nota mais estável depois da tônica. Base dos power chords. Em qualquer escala, é a "segunda âncora".' },
    '#5':{ char:'Etéreo', txt:'A 5ª aumentada aparece na escala de tons inteiros e no acorde aumentado. Sonoridade misteriosa e sem resolução óbvia. Muito usada em jazz modal.' },
    'b6':{ char:'Dramática', txt:'A 6ª menor tem peso emocional. Na menor harmônica cria o intervalo de 2ª aumentada com a 7ª maior — aquele sabor árabe/flamenco característico.' },
    '6' :{ char:'Doce', txt:'A 6ª maior tem sabor doce e melódico. No dórico ela suaviza o som menor. É o intervalo que dá aquele toque de soul e funk às linhas de baixo.' },
    'b7':{ char:'Bluesy', txt:'O coração do blues, rock e funk. Cria o acorde dominante (7). No mixolídio ela impede a resolução clássica.' },
    '7' :{ char:'Alta tensão', txt:'A 7ª maior cria a máxima tensão antes de resolver na tônica. Define o som clássico e jazz.' },
};
const SCALE_INFO_PT = {
    'Major (Ionian)': (r) => `${r} maior é a escala fundamental da música ocidental. Sete notas, todas "felizes" — o intervalo que define tudo é a 3ª maior (${r} até a terceira nota). Ela soa resolvida, luminosa, estável.\n\nOs graus-chave são a 3ª maior e a 7ª maior. A 7ª maior é o que cria a tensão que "pede" para resolver na tônica — a sensação de "conclusão" que ouvimos em música clássica e pop.\n\nComo pensar no braço: encontre a tônica ${r} e toque os cinco shapes do CAGED. Para improvisação, destaque os graus 1, 3 e 5 — eles são o "esqueleto" da escala. Evite pousar na 4ª justa contra um acorde maior — ela cria dissonância não intencional.`,
    'Natural Minor': (r) => `${r} menor natural é a escala "sombria" por excelência. A diferença para a maior são três notas: b3, b6 e b7 — todas rebaixadas um semitom. Esse conjunto de alterações cria o caráter melancólico e pesado que ouvimos no rock, metal e música clássica.\n\nO intervalo mais característico é a b3 (terça menor) — ela é o que separa "triste" de "feliz". A b7 (sétima menor) impede a resolução clássica, dando ao menor natural um sabor mais rude que a menor harmônica.\n\nNo braço: a menor natural de ${r} compartilha as mesmas notas que a maior de seu relativo (três semitons acima). Isso significa que você já sabe dois modos pelo preço de um. Use bends na b3 para subir até a 3ª — o gesto mais expressivo do rock.`,
    'Harmonic Minor': (r) => `A menor harmônica de ${r} é a menor natural com a 7ª maior em vez da 7ª menor. Essa única mudança cria o intervalo de 2ª aumentada entre a b6 e a 7ª — aquele salto tenso que dá o som árabe, flamenco e clássico tardio.\n\nO motivo do nome "harmônica": a 7ª maior cria o acorde dominante V7 natural na tonalidade menor, permitindo a cadência V7→im. Sem ela, a menor natural não tem essa resolução tensa e dramática.\n\nNo braço: a 7ª maior é a "nota surpresa" — ela aparece um semitom abaixo da tônica no shape. Use-a para criar frases que sobem em direção à tônica com tensão máxima. Muito eficaz em solos de neo-clássico e metal técnico de ${r} menor.`,
    'Melodic Minor': (r) => `A menor melódica de ${r} usa b3 com 6ª maior e 7ª maior — essencialmente uma escala maior com terça menor. Esse "híbrido" é a base do jazz moderno e do metal progressivo.\n\nHistoricamente foi criada para facilitar o canto: o salto de 2ª aumentada da harmônica era difícil de cantar, então se suavizou subindo (6ª e 7ª maiores) e se manteve a versão natural descendo. No jazz contemporâneo, usa-se a versão ascendente em ambas as direções.\n\nNo braço: pense nela como maior com b3. Isso dá uma sonoridade "quase maior mas com tensão escondida". Ótima sobre acordes m(maj7). Os modos da menor melódica (como Lídio Dominante e Mixolídio b6) são fundamentais no jazz de ${r}.`,
    'Pentatonic Major': (r) => `A pentatônica maior de ${r} tem cinco notas — remove a 4ª justa e a 7ª maior da escala maior. Resultado: zero notas problemáticas, pura consonância. Por isso é a primeira escala de qualquer guitarrista.\n\nO segredo da pentatônica é que ela funciona sobre qualquer acorde da tonalidade. A ausência da 4ª (que cria dissonância contra acordes maiores) e da 7ª (que cria tensão) deixa você livre para pousar em qualquer nota com segurança.\n\nNo braço de ${r}: os cinco shapes da pentatônica cobrem o braço inteiro. Começe pelo shape 1 na tônica ${r}. A pentatônica maior tem um sabor country, pop e blues leve — bem menos sombria que a menor. Conecte os shapes deslizando na 2ª e 3ª cordas.`,
    'Pentatonic Minor': (r) => `A pentatônica menor de ${r} é a base do blues, rock e metal. Cinco notas: remove a 2ª e a 6ª da menor natural — as notas que mais criavam tensão são eliminadas, deixando só o essencial do rock.\n\nÉ a escala mais tocada no mundo por uma razão: funciona sobre praticamente qualquer progressão de rock e blues em ${r}. A b3 e a b7 criam o som "sujo" e expressivo que define o estilo.\n\nNo braço: domine o shape 1 em ${r} primeiro. Bends na b3 (subindo para a 3ª maior) e na b7 (subindo para a 7ª maior) são os dois gestos mais expressivos do rock. Depois aprenda os outros 4 shapes e conecte-os para cobrir o braço inteiro.`,
    'Blues': (r) => `A escala blues de ${r} é a pentatônica menor com a adição da b5 (blue note). Esse semitom extra — posicionado entre a 4ª e a 5ª — é o que dá o som característicamente "sujo" e expressivo do blues americano.\n\nA blue note (b5) funciona como nota de passagem: você raramente pousa nela, mas desliza por ela. A tensão que ela cria e imediata resolução para a 5ª justa é o gesto harmônico mais reconhecível do blues e do rock clássico.\n\nNo braço de ${r}: no shape 1, a blue note aparece na mesma corda que a 4ª, um traste acima. Pratique o padrão 4→b5→5 em slides e bends. Eric Clapton, BB King e Jimi Hendrix constroem a maioria de suas frases neste movimento específico.`,
    'Dorian': (r) => `O modo dórico de ${r} é como a menor natural, mas com a 6ª maior em vez de b6. Essa única diferença muda tudo: o dórico tem um caráter "menor mas luminoso" — melancólico sem ser pesado, perfeito para funk, soul, jazz e rock progressivo.\n\nA 6ª maior é a nota que define o dórico. Ela suaviza o som menor e permite acordes como o II menor (com 6ª maior natural). "Oye Como Va" de Santana, "Smoke on the Water" e a maioria das improvisações de Carlos Santana são baseadas no dórico.\n\nNo braço: pense no dórico de ${r} como a menor natural com uma nota "brilhante" a mais. Enfatize a 6ª maior para dar o caráter latino/soul. O modo dórico é o segundo modo da escala maior — ${r} dórico compartilha as notas com a escala maior de ${NOTES_FLAT[(NOTES_SHARP.indexOf('A') + NOTES_FLAT.indexOf('A') >= 0 ? 0 : 0)]} (dois semitons abaixo).`,
    'Phrygian': (r) => `O modo frígio de ${r} começa com um movimento de b2 — um semitom acima da tônica. Esse intervalo é o que dá ao frígio seu som denso, misterioso e ibérico. É o modo do flamenco, do metal extremo e da música do Oriente Médio.\n\nA b2 é a nota que define tudo. Ela cria tensão máxima contra a tônica e quando se move de ${r} para a b2 e volta, você já ouviu o "som frígio". O acorde bII maior (construído na b2) é o acorde característico do modo.\n\nNo braço: o frígio de ${r} é o terceiro modo da escala maior. A célula rítmica básica do flamenco é tocar b2-tônica-b2 rapidamente. Em metal, use o trítono (b2 ao b5) para criar riffs máxima dissonância. Pense em Slayer, Sepultura e Metallica "Wherever I May Roam".`,
    'Lydian': (r) => `O modo lídio de ${r} é a escala maior com a 4ª aumentada — uma nota acima do esperado. Essa #4 é o que dá ao lídio seu som etéreo, quase "flutuante". É o modo mais brilhante de todos os sete modos.\n\nA #4 (trítono da tônica) é a nota mágica. Em vez de criar dissonância como em outros contextos, no lídio ela soa como se a música "não quisesse cair" — gravitação musical invertida. John Williams usa lídio em trilhas de ficção científica para criar a sensação de maravilha e imensidão.\n\nNo braço de ${r}: substitua a 4ª justa pela #4 no shape maior que você já conhece. Pousar nessa nota contra um acorde maior de ${r} cria a sonoridade lídio imediatamente. Joe Satriani e Steve Vai usam extensivamente o lídio para frases "aéreas" e expansivas.`,
    'Mixolydian': (r) => `O modo mixolídio de ${r} é a escala maior com b7 em vez de 7ª maior. Essa única mudança remove a tensão clássica da sensível e cria um som ao mesmo tempo familiar e "groove" — a base de todo o blues-rock, rock clássico e funk.\n\nA b7 impede a resolução V→I clássica. O acorde de ${r}7 (dominante) é o acorde do mixolídio — ele contém a b7. AC/DC, Rolling Stones, praticamente todo o blues-rock vive no mixolídio. "Sweet Home Chicago", "Pride and Joy" de Stevie Ray Vaughan — mixolídio.\n\nNo braço: o mixolídio de ${r} é o quinto modo da escala maior. Pense nele como a pentatônica maior de ${r} com a 2ª e a b7 adicionadas. Use a b7 em frases descendentes para dar o sabor "dominante". Perfeito sobre acordes de 7ª (${r}7).`,
    'Locrian': (r) => `O modo lócrio de ${r} é o mais dissonante dos sete modos. Tem b2, b3, b5, b6 e b7 — cinco notas rebaixadas. A b5 é o que o distingue de todos os outros: o acorde de tônica é diminuto, criando instabilidade máxima. Por isso o lócrio raramente é usado como "lar" — ele quer se mover.\n\nO lócrio é o sétimo modo da escala maior. Na prática, é mais comum encontrá-lo como escala para improvisar sobre acordes m7b5 (meio-diminuto) em progressões de jazz e metal progressivo.\n\nNo braço de ${r}: aceite a instabilidade. O lócrio não "resolve" — ele flutua em tensão constante. Usado em metal extremo como cor tonal sombria sobre riffs em trítono. Dream Theater e Meshuggah exploram muito o lócrio. Não busque estabilidade — o desconforto harmônico É o som.`,
    'Whole Tone': (r) => `A escala de tons inteiros de ${r} tem seis notas, todas separadas por um tom inteiro. Sem semitons, sem hierarquia clara entre as notas — resultado: uma sonoridade perfeitamente simétrica e ambígua, que "flutua" sem direção clara.\n\nPor ser simétrica, só existem dois grupos de escalas de tons inteiros que cobrem as 12 notas. A escala de ${r} soa como Debussy, jazz impressionista e trilhas sonoras de sonhos e ilusões. O acorde natural é o aumentado (1-3-#5) — sem 5ª justa, sem ancoragem.\n\nNo braço: o shape da escala de tons inteiros é simples — dois semitons por corda, sempre igual. A beleza é usá-la sobre acordes aumentados e dominantes com #5. Termine frases da escala de tons em qualquer nota da escala — todas soam igualmente "resolvidas" ou igualmente "flutuantes".`,
    'Diminished (HW)': (r) => `A escala diminuta (meio-tom/tom) de ${r} alterna semitons e tons inteiros — oito notas simétricas. Sua simetria a cada três semitons significa que ${r} diminuta, ${NOTES_SHARP[(NOTES_SHARP.indexOf(r.replace('b','').replace('#','')) + 3) % 12]} diminuta e ${NOTES_SHARP[(NOTES_SHARP.indexOf(r.replace('b','').replace('#','')) + 6) % 12]} diminuta têm as mesmas notas.\n\nUsada extensamente em jazz (sobre acordes dim7 e dominantes alterados), metal e música clássica. O som tenso e dissonante vem dos tritonos empilhados — quatro deles dentro de uma escala de 8 notas.\n\nNo braço: o shape da diminuta repete a cada três trastes — aprenda um shape e você tem os outros de graça. A técnica clássica é usar a diminuta sobre o V7 antes de resolver no Im. Em metal, riffs diminu­tos simétricos criam aquele groove maquinal e anguloso que define o thrash técnico.`,
};

// --- DICIONÁRIOS EN ---
const INTERVAL_NAMES_EN = { '1':'Root','b2':'Minor 2nd','2':'Major 2nd','b3':'Minor 3rd','3':'Major 3rd','4':'Perfect 4th','#4':'Aug 4th','b5':'Dim 5th','5':'Perfect 5th','#5':'Aug 5th','b6':'Minor 6th','6':'Major 6th','b7':'Minor 7th','7':'Major 7th' };
const INTERVAL_DETAIL_EN = {
    '1' :{ char:'Anchor', txt:'The root is the gravitational center. The starting and ending point of any melodic idea.' },
    'b2':{ char:'Max tension', txt:'The most tense interval in Western harmony. Defines the Phrygian and Flamenco sound.' },
    '2' :{ char:'Smooth pass', txt:'Flows naturally. Excellent passing note between the root and the third.' },
    'b3':{ char:'Melancholy', txt:'Defines the dark character. Essential for blues and heavy rock. Great for bending up to the major 3rd.' },
    '3' :{ char:'Brightness', txt:'Provides the bright, positive character. Forms the perfect major chord along with the 5th.' },
    '4' :{ char:'Stability', txt:'Neutral and stable, but does not define major or minor. Can sound "suspended" against the root.' },
    '#4':{ char:'Unsettling', txt:'The tritone. Creates an ethereal, floating sound in the Lydian mode. Highly dissonant.' },
    'b5':{ char:'Tension', txt:'The tritone. In blues, it creates the famous "blue note". Defines Locrian total instability.' },
    '5' :{ char:'Power', txt:'Most stable note after the root. The basis of power chords. Does not vary between major/minor.' },
    '#5':{ char:'Ethereal', txt:'Mysterious sound with no obvious resolution. Appears in whole tone scales and augmented chords.' },
    'b6':{ char:'Dramatic', txt:'Emotional weight. In harmonic minor, it creates the Arabic/Flamenco flavor alongside the major 7th.' },
    '6' :{ char:'Sweet', txt:'Sweet and melodic. Softens the minor sound in Dorian. Gives soul and funk flavors.' },
    'b7':{ char:'Bluesy', txt:'The heart of blues, rock, and funk. Creates the dominant 7 chord. Prevents classical resolution.' },
    '7' :{ char:'High tension', txt:'Creates maximum tension before resolving to the root. Defines classical and jazz sounds in maj7 chords.' },
};
const SCALE_INFO_EN = {
    'Major (Ionian)': (r) => `${r} Major is the fundamental scale of Western music. Seven notes, all "happy" — the defining interval is the major 3rd. It sounds resolved, bright, and stable.\n\nKey degrees are the major 3rd and major 7th. The major 7th creates the tension that "asks" to resolve to the root — the sense of "conclusion" we hear in classical and pop music.\n\nOn the fretboard: find the ${r} root and play the five CAGED shapes. For improvisation, highlight degrees 1, 3, and 5 — they are the "skeleton" of the scale. Avoid landing on the perfect 4th against a major chord as it creates unintended dissonance.`,
    'Natural Minor': (r) => `${r} Natural Minor is the quintessential dark scale. The difference from the major scale lies in three notes: b3, b6, and b7. This set of alterations creates the melancholic and heavy character heard in rock, metal, and classical music.\n\nThe most characteristic interval is the b3 (minor third) — it separates "sad" from "happy". The b7 (minor seventh) prevents classical resolution, giving it a rougher flavor than harmonic minor.\n\nOn the fretboard: ${r} natural minor shares the same notes as its relative major (three semitones up). Use bends on the b3 to reach the 3rd — rock's most expressive gesture.`,
    'Harmonic Minor': (r) => `${r} Harmonic Minor is the natural minor with a major 7th instead of a minor 7th. This single change creates an augmented 2nd interval between the b6 and the 7th — that tense leap giving it an Arabic, Flamenco, and late-classical sound.\n\nThe reason for the name "harmonic": the major 7th creates a natural V7 dominant chord in a minor key, allowing for the dramatic V7→im cadence.\n\nOn the fretboard: the major 7th is the "surprise note" — it appears one semitone below the root in the shape. Use it to create lines ascending towards the root with maximum tension. Highly effective in neo-classical solos.`,
    'Melodic Minor': (r) => `${r} Melodic Minor uses a b3 with a major 6th and major 7th — essentially a major scale with a minor third. This "hybrid" is the foundation of modern jazz and progressive metal.\n\nHistorically created to ease singing by smoothing out the harmonic minor's augmented 2nd leap ascending, while using natural minor descending. In contemporary jazz, the ascending version is used in both directions.\n\nOn the fretboard: think of it as major with a b3. This gives an "almost major but with hidden tension" sound. Excellent over m(maj7) chords.`,
    'Pentatonic Major': (r) => `${r} Major Pentatonic has five notes — it removes the perfect 4th and major 7th from the major scale. Result: zero problematic notes, pure consonance. That's why it's usually a guitarist's first scale.\n\nThe secret of the pentatonic is that it works over almost any chord in the key. The absence of the 4th and 7th leaves you free to land safely anywhere.\n\nOn the fretboard: the five shapes cover the entire neck. Start with shape 1 at the ${r} root. It has a light country, pop, and blues flavor.`,
    'Pentatonic Minor': (r) => `${r} Minor Pentatonic is the backbone of blues, rock, and metal. Five notes: it removes the 2nd and 6th from the natural minor — the notes that created the most tension are gone, leaving only the essentials of rock.\n\nIt's the most played scale in the world for a reason: it works over virtually any rock and blues progression in ${r}. The b3 and b7 create the dirty, expressive sound that defines the style.\n\nOn the fretboard: master shape 1 in ${r} first. Bending the b3 (up to the major 3rd) and the b7 (up to the major 7th) are the two most expressive gestures in rock.`,
    'Blues': (r) => `The ${r} Blues scale is the minor pentatonic with the addition of the b5 (blue note). This extra semitone — placed between the 4th and 5th — provides the characteristic "dirty" and expressive sound of American blues.\n\nThe blue note (b5) functions as a passing note: you rarely land on it, but rather slide through it. The tension it creates and its immediate resolution to the perfect 5th is the most recognizable harmonic gesture in classic rock and blues.\n\nOn the fretboard: practice the 4→b5→5 pattern in slides and bends.`,
    'Dorian': (r) => `${r} Dorian is like the natural minor, but with a major 6th instead of a b6. This single difference changes everything: Dorian has a "minor but bright" character — melancholic without being heavy, perfect for funk, soul, jazz, and prog rock.\n\nThe major 6th is the defining note. It softens the minor sound and allows for chords like the minor II. "Oye Como Va" by Santana and "Smoke on the Water" are based heavily on Dorian.\n\nOn the fretboard: emphasize the major 6th to bring out the Latin/soul character.`,
    'Phrygian': (r) => `${r} Phrygian starts with a b2 movement — one semitone above the root. This interval gives Phrygian its dense, mysterious, and Iberian sound. It's the mode of flamenco, extreme metal, and Middle Eastern music.\n\nThe b2 is the defining note. It creates maximum tension against the root, and when you move from ${r} to the b2 and back, you've heard the "Phrygian sound".\n\nOn the fretboard: the basic rhythmic cell of flamenco is playing b2-root-b2 rapidly. In metal, use the tritone (b2 to b5) to create maximally dissonant riffs. Think Slayer, Sepultura, and Metallica "Wherever I May Roam".`,
    'Lydian': (r) => `${r} Lydian is the major scale with an augmented 4th — one note higher than expected. This #4 gives Lydian its ethereal, almost "floating" sound. It is the brightest of all seven modes.\n\nThe #4 (tritone from the root) is the magic note. Instead of creating dissonance as in other contexts, in Lydian it sounds as if the music "doesn't want to fall" — inverted musical gravity.\n\nOn the fretboard: replace the perfect 4th with the #4 in the major shape you already know. Landing on this note against an ${r} major chord instantly creates the Lydian sonority.`,
    'Mixolydian': (r) => `${r} Mixolydian is the major scale with a b7 instead of a major 7th. This single change removes the classical leading-tone tension and creates a sound that is both familiar and "groovy" — the foundation of all blues-rock, classic rock, and funk.\n\nThe b7 prevents the classic V→I resolution. The ${r}7 (dominant) chord is the chord of Mixolydian. AC/DC, Rolling Stones, almost all blues-rock lives in Mixolydian.\n\nOn the fretboard: think of it as the ${r} major pentatonic with an added 2nd and b7. Use the b7 in descending phrases to give it the "dominant" flavor.`,
    'Locrian': (r) => `${r} Locrian is the most dissonant of the seven modes. It has b2, b3, b5, b6, and b7. The b5 is what sets it apart: the tonic chord is diminished, creating maximum instability. That's why Locrian is rarely used as a "home" — it wants to move.\n\nIn practice, it's most commonly found as a scale to improvise over m7b5 (half-diminished) chords in jazz and progressive metal progressions.\n\nOn the fretboard: embrace the instability. Locrian does not "resolve" — it floats in constant tension. Used in extreme metal as a dark tonal color over tritone riffs. Meshuggah explores Locrian heavily.`,
    'Whole Tone': (r) => `The ${r} Whole Tone scale has six notes, all separated by a whole step. No semitones, no clear hierarchy between notes — result: a perfectly symmetrical and ambiguous sonority that "floats" with no clear direction.\n\nBecause it's symmetrical, there are only two groups of whole tone scales that cover all 12 notes. It sounds like Debussy, impressionist jazz, and dream sequences. The natural chord is the augmented (1-3-#5) — no perfect 5th, no anchor.\n\nOn the fretboard: the shape is simple — two frets per string, always the same. Finish whole tone phrases on any note of the scale — they all sound equally "resolved" or equally "floating".`,
    'Diminished (HW)': (r) => `The ${r} Diminished (Half-Whole) scale alternates semitones and whole tones — eight symmetrical notes. Its symmetry every three semitones means that ${r} diminished, ${NOTES_SHARP[(NOTES_SHARP.indexOf(r.replace('b','').replace('#','')) + 3) % 12]} diminished, and ${NOTES_SHARP[(NOTES_SHARP.indexOf(r.replace('b','').replace('#','')) + 6) % 12]} diminished all share the exact same notes.\n\nUsed extensively in jazz (over dim7 and altered dominant chords), metal, and classical music. The tense sound comes from stacked tritones.\n\nOn the fretboard: the shape repeats every three frets. In metal, symmetrical diminished riffs create that mechanical and angular groove defining technical thrash.`,
};

let INTERVAL_NAMES, INTERVAL_DETAIL, SCALE_INFO, SCALE_NAMES;

function setScaleDictionaries() {
    if (typeof currentLang === 'undefined' || currentLang === 'pt') {
        INTERVAL_NAMES = INTERVAL_NAMES_PT; INTERVAL_DETAIL = INTERVAL_DETAIL_PT; 
        SCALE_INFO = SCALE_INFO_PT; SCALE_NAMES = SCALE_NAMES_PT;
    } else {
        INTERVAL_NAMES = INTERVAL_NAMES_EN; INTERVAL_DETAIL = INTERVAL_DETAIL_EN; 
        SCALE_INFO = SCALE_INFO_EN; SCALE_NAMES = SCALE_NAMES_EN;
    }
}
setScaleDictionaries();


const SCALES = {
    'Major (Ionian)':   { intervals:[0,2,4,5,7,9,11],   degrees:['1','2','3','4','5','6','7'] },
    'Natural Minor':    { intervals:[0,2,3,5,7,8,10],   degrees:['1','2','b3','4','5','b6','b7'] },
    'Harmonic Minor':   { intervals:[0,2,3,5,7,8,11],   degrees:['1','2','b3','4','5','b6','7'] },
    'Melodic Minor':    { intervals:[0,2,3,5,7,9,11],   degrees:['1','2','b3','4','5','6','7'] },
    'Pentatonic Major': { intervals:[0,2,4,7,9],         degrees:['1','2','3','5','6'] },
    'Pentatonic Minor': { intervals:[0,3,5,7,10],        degrees:['1','b3','4','5','b7'] },
    'Blues':            { intervals:[0,3,5,6,7,10],      degrees:['1','b3','4','b5','5','b7'] },
    'Dorian':           { intervals:[0,2,3,5,7,9,10],    degrees:['1','2','b3','4','5','6','b7'] },
    'Phrygian':         { intervals:[0,1,3,5,7,8,10],    degrees:['1','b2','b3','4','5','b6','b7'] },
    'Lydian':           { intervals:[0,2,4,6,7,9,11],    degrees:['1','2','3','#4','5','6','7'] },
    'Mixolydian':       { intervals:[0,2,4,5,7,9,10],    degrees:['1','2','3','4','5','6','b7'] },
    'Locrian':          { intervals:[0,1,3,5,6,8,10],    degrees:['1','b2','b3','4','b5','b6','b7'] },
    'Whole Tone':       { intervals:[0,2,4,6,8,10],      degrees:['1','2','3','#4','#5','b7'] },
    'Diminished (HW)':  { intervals:[0,1,3,4,6,7,9,10], degrees:['1','b2','b3','3','b5','5','6','b7'] },
};

const TUNINGS = {
    guitar: {
        'Standard (E A D G B E)': [40,45,50,55,59,64],
        'Drop D (D A D G B E)':   [38,45,50,55,59,64],
        'Open G (D G D G B D)':   [38,43,50,55,59,62],
        'Open D (D A D F# A D)':  [38,45,50,54,57,62],
        'DADGAD':                 [38,45,50,55,57,62],
        'Half Step Down (Eb)':    [39,44,49,54,58,63],
        'Full Step Down (D)':     [38,43,48,53,57,62],
    },
    bass: {
        'Standard (E A D G)':     [28,33,38,43],
        'Drop D (D A D G)':       [26,33,38,43],
        '5-string (B E A D G)':   [23,28,33,38,43],
        'Half Step Down (Eb)':    [27,32,37,42],
        'Full Step Down (D)':     [26,31,36,41],
    }
};

function getChugMidi() {
    const midis = state._customMidis
        ? [...state._customMidis]
        : [...TUNINGS[state.instrument][state.tuningName]];
    return midis[0] - 5; 
}

const THEME_DOT_A_DARK = [false, true, false, false];
const THEME_DOT_B_DARK = [true, false, true, true];

let state = {
    instrument: 'guitar',
    tuningName: 'Standard (E A D G B E)',
    root: 'A',
    scaleName: 'Major (Ionian)',
    frets: 22,
    chugActive: false,
    _customMidis: null,
    _chugMidiOverride: null, 
    currentTheme: 0,
};

let expandedDegree = null;

// --- AUDIO ---
let audioCtx = null;
function playNote(midiNote) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now  = audioCtx.currentTime;
    [[1,0.55],[2,0.28],[3,0.14],[4,0.06]].forEach(([h, amp]) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = h <= 2 ? 'triangle' : 'sine';
        osc.frequency.value = freq * h;
        gain.gain.setValueAtTime(amp, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.7);
    });
}

// --- HELPERS ---
function getNoteName(semitone, root) {
    return FLAT_KEYS.includes(root) ? NOTES_FLAT[semitone] : NOTES_SHARP[semitone];
}
function getRootSemitone(root) {
    const si = NOTES_SHARP.indexOf(root);
    return si !== -1 ? si : NOTES_FLAT.indexOf(root);
}

// --- ENHARMONIC SPELLING ---
// Each scale note is given a unique letter (no "A and A#" — it becomes "A and Bb")
const _LETTERS = ['C','D','E','F','G','A','B'];
const _LETTER_SEMITONE = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};

function _spellNote(semitone, letter) {
    // Returns the note name for `semitone` using `letter`, or null if > 1 accidental needed
    const base = _LETTER_SEMITONE[letter];
    const diff = ((semitone - base) + 12) % 12;
    if (diff === 0)  return letter;
    if (diff === 1)  return letter + '#';
    if (diff === 11) return letter + 'b';
    return null;
}

function getScaleNotes(root, scaleName) {
    const rootSemitone = getRootSemitone(root);
    if (rootSemitone === -1) return [];
    const intervals = SCALES[scaleName].intervals;
    const degrees   = SCALES[scaleName].degrees;
    const rootLetter    = root[0];
    const rootLetterIdx = _LETTERS.indexOf(rootLetter);
    const usedLetters   = new Set([rootLetter]);

    return intervals.map((interval, i) => {
        const semitone = (rootSemitone + interval) % 12;

        if (i === 0) {
            return { note: root, semitone, degree: degrees[i], intervalName: INTERVAL_NAMES[degrees[i]] || '' };
        }

        // Try letters in ascending order from root (so spelling is "natural" — no skipping)
        let chosenNote = null;
        for (let offset = 1; offset <= 6; offset++) {
            const letter = _LETTERS[(rootLetterIdx + offset) % 7];
            if (usedLetters.has(letter)) continue;
            const name = _spellNote(semitone, letter);
            if (name !== null) {
                usedLetters.add(letter);
                chosenNote = name;
                break;
            }
        }

        // Fallback (e.g. double-accidental edge case in some exotic enharmonic combos)
        if (!chosenNote) {
            chosenNote = FLAT_KEYS.includes(root) ? NOTES_FLAT[semitone] : NOTES_SHARP[semitone];
        }

        return { note: chosenNote, semitone, degree: degrees[i], intervalName: INTERVAL_NAMES[degrees[i]] || '' };
    });
}

// Returns true if two note names sound the same (enharmonic equivalents)
function sameSound(a, b) {
    if (!a || !b) return false;
    const semi = n => {
        const si = NOTES_SHARP.indexOf(n);
        return si !== -1 ? si : NOTES_FLAT.indexOf(n);
    };
    const sa = semi(a), sb = semi(b);
    return sa !== -1 && sb !== -1 && sa === sb;
}

// All note options for practice selects (both # and b)
const ALL_PRAC_NOTES = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];
function noteOptions(selectedNote = '') {
    return ALL_PRAC_NOTES.map(n =>
        `<option value="${n}"${(n === selectedNote || sameSound(n, selectedNote)) ? ' selected' : ''}>${n}</option>`
    ).join('');
}
function getCurrentMidis() {
    let midis = state._customMidis
        ? [...state._customMidis]
        : [...TUNINGS[state.instrument][state.tuningName]];
    if (state.chugActive) {
        const chugMidi = state._chugMidiOverride !== null
            ? state._chugMidiOverride
            : getChugMidi();
        midis = [chugMidi, ...midis];
    }
    return midis;
}

// --- THEME ---
function applyThemeToBody(idx) {
    state.currentTheme = idx;
    document.body.dataset.theme = idx;
    document.body.classList.toggle('dot-a-dark', THEME_DOT_A_DARK[idx]);
    document.body.classList.toggle('dot-b-dark', THEME_DOT_B_DARK[idx]);
}

// --- RENDER FRETBOARD ---
function renderFretboard() {
    const scaleNotes   = getScaleNotes(state.root, state.scaleName);
    const rootSemitone = getRootSemitone(state.root);
    const scaleMap     = {};
    scaleNotes.forEach(n => { scaleMap[n.semitone] = n; });

    const midis   = getCurrentMidis();
    const strings = [...midis].reverse();

    const DOT_FRETS   = [3,5,7,9,12,15,17,19,21,24];
    const DOUBLE_DOTS = [12,24];

    let html = '<div class="fretboard-inner">';

    html += '<div class="fret-numbers"><div class="nut-spacer"></div>';
    for (let f = 1; f <= state.frets; f++) {
        const hasDot   = DOT_FRETS.includes(f);
        const isDouble = DOUBLE_DOTS.includes(f);
        html += `<div class="fret-num${hasDot ? ' has-dot' : ''}">
            ${f}
            ${isDouble ? '<span class="dot-marker double">●●</span>'
              : hasDot  ? '<span class="dot-marker">●</span>' : ''}
        </div>`;
    }
    html += '</div>';

    strings.forEach((openMidi, strDisplayIdx) => {
        const totalStrings = strings.length;
        const isChug = state.chugActive && strDisplayIdx === totalStrings - 1;
        const openSemitone = openMidi % 12;
        const openMatch    = scaleMap[openSemitone];
        const openIsRoot   = openSemitone === rootSemitone;
        const openName     = getNoteName(openSemitone, state.root);

        html += `<div class="string-row${isChug ? ' chug-string' : ''}">`;
        html += `<div class="open-note${openMatch ? ' scale-note' : ''}${openIsRoot ? ' root-note' : ''}"
                      data-midi="${openMidi}">${openName}</div>`;
        html += `<div class="frets-container">
            <div class="string-line${isChug ? ' chug-line' : ''}"></div>`;
        for (let f = 1; f <= state.frets; f++) {
            const midi     = openMidi + f;
            const semitone = midi % 12;
            const match    = scaleMap[semitone];
            const isRoot   = semitone === rootSemitone;
            // Use the scale-spelled name (e.g. Bb instead of A#) when the note is in the scale
            const noteName = match ? match.note : getNoteName(semitone, state.root);
            html += `<div class="fret-cell">
                <div class="fret-line"></div>
                ${match ? `<div class="note-dot${isRoot ? ' root' : ''}" data-midi="${midi}">
                    <span class="note-name">${noteName}</span>
                </div>` : ''}
            </div>`;
        }
        html += `</div></div>`;
    });

    html += '</div>';

    const scrollEl = document.getElementById('fretboard-scroll');
    const prevLeft = scrollEl ? scrollEl.scrollLeft : 0;
    document.getElementById('fretboard').innerHTML = html;
    if (scrollEl) scrollEl.scrollLeft = prevLeft;

    renderLegend(scaleNotes);
    buildCustomTuning();
    renderFormula(scaleNotes);
}

// --- SCALE FORMULA ---
function getStepIntervals(scaleName) {
    const ints = SCALES[scaleName].intervals;
    const steps = [];
    for (let i = 0; i < ints.length; i++) {
        const next = i === ints.length - 1 ? 12 : ints[i + 1];
        steps.push(next - ints[i]);
    }
    return steps;
}

function stepLabel(semis) {
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
    if (semis === 1) return lang === 'en' ? 'H'   : 'ST';
    if (semis === 2) return lang === 'en' ? 'W'   : 'T';
    if (semis === 3) return lang === 'en' ? 'W+H' : 'T½';
    return String(semis);
}

function renderFormula(scaleNotes) {
    const container = document.getElementById('scale-formula');
    if (!container) return;
    if (!scaleNotes) scaleNotes = getScaleNotes(state.root, state.scaleName);
    const steps = getStepIntervals(state.scaleName);
    const lang  = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
    const rootSemi = getRootSemitone(state.root);

    const labelEl = document.getElementById('formula-section-label');
    if (labelEl) labelEl.textContent = lang === 'en' ? 'Scale formula — click a note to hear it' : 'Fórmula da escala — clique para ouvir';

    let html = '<div class="formula-chain">';
    scaleNotes.forEach((n, i) => {
        const isRoot = i === 0;
        // MIDI: build ascending from C4 area
        let midi = 48 + n.semitone;
        if (n.semitone < rootSemi) midi += 12;
        html += `<div class="formula-item">
            <div class="fn-box${isRoot ? ' fn-root' : ''} fn-playable" data-midi="${midi}" title="${n.note} — ${n.intervalName}">
                <span class="fn-name">${n.note}</span>
                <span class="fn-deg">${n.degree}</span>
            </div>
            <div class="fn-step">
                <span class="fn-step-badge">${stepLabel(steps[i])}</span>
                <span class="fn-step-arrow">→</span>
            </div>
        </div>`;
    });
    // Return to root
    const rootMidi = 48 + rootSemi + 12;
    html += `<div class="formula-item last">
        <div class="fn-box fn-root fn-playable" data-midi="${rootMidi}" title="${scaleNotes[0].note} — octave">
            <span class="fn-name">${scaleNotes[0].note}</span>
            <span class="fn-deg">8</span>
        </div>
    </div></div>`;

    container.innerHTML = html;

    // Click to play
    container.querySelectorAll('.fn-playable').forEach(el => {
        el.addEventListener('click', () => {
            const midi = parseInt(el.dataset.midi);
            playNote(midi);
            el.classList.add('fn-flash');
            setTimeout(() => el.classList.remove('fn-flash'), 350);
        });
    });
}

// =============================================
//  PRACTICE MODE — 4 modos
// =============================================
let practiceData   = null;
let practiceMode   = 'complete'; // 'complete' | 'degree' | 'note' | 'listen'
let listenAnswer   = null;

const PRACTICE_MODES = {
    complete: { pt: '📝 Complete a Fórmula',  en: '📝 Complete the Formula'  },
    degree:   { pt: '🎯 Grau → Nota',          en: '🎯 Degree → Note'         },
    note:     { pt: '🔍 Nota → Grau',           en: '🔍 Note → Degree'         },
    listen:   { pt: '👂 Ouça e Identifique',   en: '👂 Listen & Identify'     },
};

function initPractice() {
    const openBtn = document.getElementById('practice-btn');
    if (openBtn) openBtn.addEventListener('click', openPracticeOverlay);

    document.getElementById('prac-close-btn').addEventListener('click', closePractice);

    // Mode tabs
    document.querySelectorAll('.prac-mode-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            practiceMode = tab.dataset.mode;
            document.querySelectorAll('.prac-mode-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // Restore verify button (listen mode hides it)
            document.getElementById('prac-verify-btn').style.display = '';
            generateExercise();
        });
    });

    document.getElementById('prac-verify-btn').addEventListener('click', verifyPractice);
    document.getElementById('prac-new-btn').addEventListener('click', generateExercise);
}

function openPracticeOverlay() {
    document.getElementById('practice-overlay').classList.remove('hidden');
    generateExercise();
}

function closePractice() {
    document.getElementById('practice-overlay').classList.add('hidden');
    listenAnswer = null;
}

function generateExercise() {
    document.getElementById('prac-result').innerHTML = '';
    // pick random root + scale
    const randomRoot  = DISPLAY_ROOTS[Math.floor(Math.random() * DISPLAY_ROOTS.length)];
    const randomScale = SCALE_ORDER[Math.floor(Math.random() * SCALE_ORDER.length)];
    const sNotes = getScaleNotes(randomRoot, randomScale);
    const steps  = getStepIntervals(randomScale);
    const lang   = (typeof currentLang !== 'undefined') ? currentLang : 'pt';

    practiceData = { sNotes, steps, randomRoot, randomScale };
    listenAnswer = null;

    const scaleName = SCALE_NAMES[randomScale];
    document.getElementById('prac-title').textContent = `${randomRoot} ${scaleName}`;

    const wrap = document.getElementById('prac-exercise-wrap');

    if (practiceMode === 'complete') renderModeComplete(wrap, sNotes, steps, lang);
    else if (practiceMode === 'degree') renderModeDegree(wrap, sNotes, lang);
    else if (practiceMode === 'note')   renderModeNote(wrap, sNotes, lang);
    else if (practiceMode === 'listen') renderModeListen(wrap, sNotes, lang);

    // Restore verify button visibility for non-listen modes
    if (practiceMode !== 'listen') {
        document.getElementById('prac-verify-btn').style.display = '';
    }

    // Update verify button label
    const vBtn = document.getElementById('prac-verify-btn');
    vBtn.textContent = lang === 'en' ? 'Check' : 'Verificar';
}

// ── MODE 1: Complete the formula ──────────────────────────────
function renderModeComplete(wrap, sNotes, steps, lang) {
    wrap.innerHTML = '';
    const tip = document.createElement('p');
    tip.className = 'prac-tip';
    tip.textContent = lang === 'en'
        ? 'Fill in the missing notes using the intervals as guide.'
        : 'Preencha as notas faltantes usando os intervalos como guia.';
    wrap.appendChild(tip);

    let html = '<div class="prac-chain-scroll"><div class="prac-chain">';
    // Root shown
    html += buildRevealedNote(sNotes[0], stepLabel(steps[0]));
    for (let i = 1; i < sNotes.length; i++) {
        const hasStep = i < steps.length;
        html += `<div class="prac-item">
            <div class="prac-note prac-blank" id="prac-slot-${i}">
                <select class="prac-sel" data-idx="${i}" data-correct-semi="${sNotes[i].semitone}" data-correct="${sNotes[i].note}">
                    <option value="">?</option>
                    ${noteOptions()}
                </select>
                <span class="prac-degree">${sNotes[i].degree}</span>
            </div>
            ${hasStep ? `<div class="prac-step">
                <span class="prac-step-lbl">${stepLabel(steps[i])}</span>
                <span class="prac-arrow">→</span>
            </div>` : ''}
        </div>`;
    }
    html += buildRevealedNote(sNotes[0], null, true);
    html += '</div></div>';
    wrap.insertAdjacentHTML('beforeend', html);
}

function buildRevealedNote(n, stepLbl, isOctave = false) {
    const label = isOctave ? '8' : n.degree;
    return `<div class="prac-item">
        <div class="prac-note prac-revealed">
            <span class="prac-notename">${n.note}</span>
            <span class="prac-degree">${label}</span>
        </div>
        ${stepLbl ? `<div class="prac-step">
            <span class="prac-step-lbl">${stepLbl}</span>
            <span class="prac-arrow">→</span>
        </div>` : ''}
    </div>`;
}

// ── MODE 2: Degree → Name the note ───────────────────────────
function renderModeDegree(wrap, sNotes, lang) {
    wrap.innerHTML = '';
    // Pick 3-5 random notes from the scale to quiz
    const shuffled = [...sNotes].sort(() => Math.random() - 0.5).slice(0, Math.min(5, sNotes.length));
    practiceData.quizItems = shuffled;

    const tip = document.createElement('p');
    tip.className = 'prac-tip';
    tip.textContent = lang === 'en'
        ? 'Given the degree, name the correct note for this scale.'
        : 'Dado o grau, diga qual é a nota correta nesta escala.';
    wrap.appendChild(tip);

    const grid = document.createElement('div');
    grid.className = 'prac-quiz-grid';
    shuffled.forEach((n, qi) => {
        grid.insertAdjacentHTML('beforeend', `
            <div class="prac-quiz-row" id="prac-qrow-${qi}">
                <div class="prac-quiz-label">
                    <span class="prac-qlbl-deg">${n.degree}</span>
                    <span class="prac-qlbl-name">${INTERVAL_NAMES[n.degree] || ''}</span>
                </div>
                <span class="prac-quiz-arrow">→</span>
                <select class="prac-sel" data-idx="${qi}" data-correct="${n.note}" data-correct-semi="${n.semitone}">
                    <option value="">?</option>
                    ${noteOptions()}
                </select>
                <span class="prac-feedback" id="prac-fb-${qi}"></span>
            </div>`);
    });
    wrap.appendChild(grid);
}

// ── MODE 3: Note → identify the degree ───────────────────────
function renderModeNote(wrap, sNotes, lang) {
    wrap.innerHTML = '';
    const shuffled = [...sNotes].sort(() => Math.random() - 0.5).slice(0, Math.min(5, sNotes.length));
    practiceData.quizItems = shuffled;

    const tip = document.createElement('p');
    tip.className = 'prac-tip';
    tip.textContent = lang === 'en'
        ? 'Given the note name, identify its degree/interval in this scale.'
        : 'Dada a nota, identifique seu grau/intervalo nesta escala.';
    wrap.appendChild(tip);

    const allDegrees = SCALES[practiceData.randomScale].degrees;
    const grid = document.createElement('div');
    grid.className = 'prac-quiz-grid';
    shuffled.forEach((n, qi) => {
        grid.insertAdjacentHTML('beforeend', `
            <div class="prac-quiz-row" id="prac-qrow-${qi}">
                <div class="prac-quiz-label">
                    <span class="prac-qlbl-note">${n.note}</span>
                </div>
                <span class="prac-quiz-arrow">→</span>
                <select class="prac-sel" data-idx="${qi}" data-correct="${n.degree}">
                    <option value="">?</option>
                    ${allDegrees.map(d => `<option value="${d}">${d} — ${INTERVAL_NAMES[d] || d}</option>`).join('')}
                </select>
                <span class="prac-feedback" id="prac-fb-${qi}"></span>
            </div>`);
    });
    wrap.appendChild(grid);
}

// ── MODE 4: Listen & Identify ─────────────────────────────────
function renderModeListen(wrap, sNotes, lang) {
    wrap.innerHTML = '';
    const rootSemi = getRootSemitone(practiceData.randomRoot);
    // pick a random note (not root)
    const candidates = sNotes.filter(n => n.degree !== '1');
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    let midi = 48 + target.semitone;
    if (target.semitone < rootSemi) midi += 12;
    listenAnswer = { degree: target.degree, note: target.note, midi };
    practiceData.listenTarget = target;

    const tip = document.createElement('p');
    tip.className = 'prac-tip';
    tip.textContent = lang === 'en'
        ? 'Press ▶ to hear a note from this scale. Then identify which degree it is.'
        : 'Pressione ▶ para ouvir uma nota desta escala. Depois identifique qual grau é.';
    wrap.appendChild(tip);

    const allDegrees = SCALES[practiceData.randomScale].degrees;

    wrap.insertAdjacentHTML('beforeend', `
        <div class="prac-listen-area">
            <button class="prac-play-btn" id="prac-play-note">▶ ${lang === 'en' ? 'Play note' : 'Tocar nota'}</button>
            <div class="prac-listen-options">
                ${allDegrees.map(d => `
                    <button class="prac-deg-btn" data-degree="${d}" data-correct="${d === target.degree}">
                        <span class="pdeg-sym">${d}</span>
                        <span class="pdeg-name">${INTERVAL_NAMES[d] || d}</span>
                    </button>`).join('')}
            </div>
            <div id="prac-listen-result" class="prac-listen-result"></div>
        </div>`);

    document.getElementById('prac-play-note').addEventListener('click', () => {
        playNote(listenAnswer.midi);
    });

    wrap.querySelectorAll('.prac-deg-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.answered) return;
            wrap.querySelectorAll('.prac-deg-btn').forEach(b => { b.dataset.answered = '1'; });
            const correct = btn.dataset.correct === 'true';
            btn.classList.add(correct ? 'pdeg-correct' : 'pdeg-wrong');
            if (!correct) {
                wrap.querySelectorAll('.prac-deg-btn').forEach(b => {
                    if (b.dataset.correct === 'true') b.classList.add('pdeg-correct');
                });
            }
            const res = document.getElementById('prac-listen-result');
            res.innerHTML = correct
                ? `<span class="prac-win">✅ ${lang === 'en' ? 'Correct! It was' : 'Correto! Era'} ${target.note} (${target.degree})</span>`
                : `<span class="prac-miss">${lang === 'en' ? 'Not quite — it was' : 'Não foi — era'} ${target.note} (${target.degree})</span>`;
        });
    });

    // Hide verify btn for listen mode (self-verifying)
    document.getElementById('prac-verify-btn').style.display = 'none';
    return;
}

// ── VERIFY (modes 1-3) ────────────────────────────────────────
function verifyPractice() {
    if (!practiceData) return;
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
    let allOk = true;

    if (practiceMode === 'listen') return;

    if (practiceMode === 'complete') {
        document.querySelectorAll('.prac-sel').forEach(sel => {
            const idx     = parseInt(sel.dataset.idx);
            const correct = sel.dataset.correct;         // spelled note e.g. "Bb"
            const correctSemi = parseInt(sel.dataset.correctSemi);
            const val     = sel.value;
            const slot    = document.getElementById(`prac-slot-${idx}`);
            slot.classList.remove('prac-correct','prac-wrong');
            const oldHint = slot.querySelector('.prac-hint');
            if (oldHint) oldHint.remove();
            // Accept enharmonic equivalents (C# == Db)
            const ok = val !== '' && sameSound(val, correct);
            if (ok) {
                slot.classList.add('prac-correct');
            } else {
                slot.classList.add('prac-wrong');
                allOk = false;
                // Show both names if enharmonic exists
                const enh = NOTES_SHARP[correctSemi] !== NOTES_FLAT[correctSemi]
                    ? `${NOTES_SHARP[correctSemi]} / ${NOTES_FLAT[correctSemi]}`
                    : correct;
                slot.insertAdjacentHTML('beforeend', `<span class="prac-hint">${enh}</span>`);
            }
        });
    } else {
        // modes degree / note
        document.querySelectorAll('.prac-sel').forEach(sel => {
            const qi      = parseInt(sel.dataset.idx);
            const correct = sel.dataset.correct;
            const correctSemi = sel.dataset.correctSemi ? parseInt(sel.dataset.correctSemi) : -1;
            const val     = sel.value;
            const fb      = document.getElementById(`prac-fb-${qi}`);
            const row     = document.getElementById(`prac-qrow-${qi}`);
            row.classList.remove('qrow-ok','qrow-err');

            // For note answers (mode degree): accept enharmonics
            // For degree answers (mode note): exact match
            const ok = practiceMode === 'degree'
                ? (val !== '' && sameSound(val, correct))
                : (val === correct);

            if (ok) {
                row.classList.add('qrow-ok');
                if (fb) fb.textContent = '✓';
            } else {
                row.classList.add('qrow-err');
                allOk = false;
                if (practiceMode === 'degree' && correctSemi !== -1) {
                    const enh = NOTES_SHARP[correctSemi] !== NOTES_FLAT[correctSemi]
                        ? `${NOTES_SHARP[correctSemi]} / ${NOTES_FLAT[correctSemi]}`
                        : correct;
                    if (fb) fb.textContent = `✗ ${enh}`;
                } else {
                    if (fb) fb.textContent = `✗ ${correct}`;
                }
            }
        });
    }

    const res = document.getElementById('prac-result');
    res.innerHTML = allOk
        ? `<span class="prac-win">✅ ${lang === 'en' ? 'Perfect! All correct!' : 'Perfeito! Tudo certo!'}</span>`
        : `<span class="prac-miss">${lang === 'en' ? 'Review the highlighted answers.' : 'Revise as respostas destacadas.'}</span>`;
}

// --- LEGEND: small cards, expand on click with dropdown ---
function renderLegend(scaleNotes) {
    const container = document.getElementById('scale-legend');
    container.innerHTML = scaleNotes.map((n, i) => {
        const det   = INTERVAL_DETAIL[n.degree] || { char:'', txt: n.intervalName };
        const isOpen = expandedDegree === n.degree;
        return `<div class="legend-note${i === 0 ? ' is-root' : ''}${isOpen ? ' expanded' : ''}"
                     data-degree="${n.degree}">
            <div class="legend-note-top">
                <span class="legend-note-name">${n.note}</span>
                <span class="legend-interval">${n.intervalName}</span>
                <span class="legend-degree">${n.degree}</span>
            </div>
            ${isOpen ? `<div class="legend-dropdown">
                <div class="legend-char">${det.char}</div>
                <div class="legend-txt">${det.txt}</div>
            </div>` : ''}
        </div>`;
    }).join('');

    container.querySelectorAll('.legend-note').forEach(card => {
        card.addEventListener('click', () => {
            const deg = card.dataset.degree;
            expandedDegree = expandedDegree === deg ? null : deg;
            renderLegend(scaleNotes);

            const n = scaleNotes.find(sn => sn.degree === deg);
            if (n) {
                const rootSemi = getRootSemitone(state.root);
                let midi = 48 + n.semitone; 
                if (n.semitone < rootSemi) midi += 12; 
                playNote(midi);
            }
        });
    });
}

// --- TUNING DROPDOWN ---
function buildTuningDropdown() {
    const tunings = TUNINGS[state.instrument];
    const sel     = document.getElementById('tuning-select');
    sel.innerHTML = '';
    const keys = Object.keys(tunings);
    if (!tunings[state.tuningName]) state.tuningName = keys[0];
    keys.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name; opt.textContent = name;
        if (name === state.tuningName) opt.selected = true;
        sel.appendChild(opt);
    });
}

// --- CUSTOM TUNING EDITOR ---
function buildCustomTuning() {
    const baseMidis = state._customMidis
        ? [...state._customMidis]
        : [...TUNINGS[state.instrument][state.tuningName]];

    const chugMidi = state.chugActive
        ? (state._chugMidiOverride !== null ? state._chugMidiOverride : getChugMidi())
        : null;

    const wrapper = document.getElementById('custom-tuning');
    wrapper.innerHTML = '';

    const displayMidis = chugMidi !== null ? [chugMidi, ...baseMidis] : [...baseMidis];

    [...displayMidis].reverse().forEach((midi, displayIdx) => {
        const stringNumber = displayMidis.length - displayIdx; 
        const isChugStr = chugMidi !== null && displayIdx === displayMidis.length - 1;
        const semitone  = midi % 12;
        const noteName  = NOTES_SHARP[semitone];

        const div = document.createElement('div');
        div.className = `custom-string${isChugStr ? ' chug-custom' : ''}`;
        
        div.innerHTML = `<span class="string-num">${stringNumber}</span>
            <select class="string-note" data-is-chug="${isChugStr}" data-original-idx="${displayMidis.length - 1 - displayIdx}" data-base-midi="${midi}">
                ${NOTES_SHARP.map(n => `<option value="${n}"${n === noteName ? ' selected' : ''}>${n}</option>`).join('')}
            </select>`;
        wrapper.appendChild(div);
    });

    wrapper.querySelectorAll('.string-note').forEach(sel => {
        sel.addEventListener('change', () => {
            const isChug   = sel.dataset.isChug === 'true';
            const baseMidi = parseInt(sel.dataset.baseMidi);
            const octave   = Math.floor(baseMidi / 12);
            const newMidi  = octave * 12 + NOTES_SHARP.indexOf(sel.value);

            if (isChug) {
                state._chugMidiOverride = newMidi;
            } else {
                if (!state._customMidis) state._customMidis = [...TUNINGS[state.instrument][state.tuningName]];
                const idx = parseInt(sel.dataset.originalIdx) - (state.chugActive ? 1 : 0);
                state._customMidis[idx] = newMidi;
            }
            renderFretboard();
        });
    });
}

// --- CHUG ---
function initChug() {
    const btn = document.getElementById('chug-btn');
    btn.addEventListener('click', () => {
        state.chugActive = !state.chugActive;
        if (state.chugActive) state._chugMidiOverride = null;
        btn.classList.toggle('active', state.chugActive);
        if (state.chugActive) {
            playNote(getChugMidi());
        }
        updateChugLabel();
        renderFretboard();
    });
}

function updateChugLabel() {
    const label = document.getElementById('chug-label');
    if (!label) return;
    const chugMidi   = state._chugMidiOverride !== null ? state._chugMidiOverride : getChugMidi();
    const chugNote   = NOTES_SHARP[chugMidi % 12];
    
    const langVar = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
    const stringName = state.instrument === 'bass' 
        ? translations[langVar]['str_5'] 
        : translations[langVar]['str_7'];

    label.textContent = `${stringName} ${chugNote}`;
}

// --- SCALE INFO (offline) ---
function initScaleInfo() {
    const btn   = document.getElementById('scale-info-btn');
    const panel = document.getElementById('scale-info-panel');

    btn.addEventListener('click', () => {
        if (panel.classList.contains('open')) {
            panel.classList.remove('open');
            return;
        }
        
        panel.classList.add('open');
        
        const fn   = SCALE_INFO[state.scaleName];
        const text = fn ? fn(state.root) : `Escala ${state.root} ${SCALE_NAMES[state.scaleName]}.`;
        const paragraphs = text.trim().split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');
        
        const langVar = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
        const closeBtnTxt = translations[langVar]['btn_close'];

        panel.innerHTML = `<div class="info-content">
            <h3 class="info-title">${state.root} ${SCALE_NAMES[state.scaleName]}</h3>
            <div class="info-text">${paragraphs}</div>
            <button class="info-close" id="info-close-btn">${closeBtnTxt}</button>
        </div>`;
        document.getElementById('info-close-btn').addEventListener('click', () => {
            panel.classList.remove('open');
        });
    });
}

// --- SELECTS ---
function populateSelects() {
    const rootSel = document.getElementById('root-select');
    rootSel.innerHTML = '';
    DISPLAY_ROOTS.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n; opt.textContent = n;
        if (n === state.root) opt.selected = true;
        rootSel.appendChild(opt);
    });
    
    const scaleSel = document.getElementById('scale-select');
    scaleSel.innerHTML = '';
    SCALE_ORDER.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name; 
        opt.textContent = SCALE_NAMES[name]; 
        if (name === state.scaleName) opt.selected = true;
        scaleSel.appendChild(opt);
    });
}

// Atualiza o texto dos selects em tempo real quando o idioma muda
function updateScaleSelectTranslations() {
    const scaleSel = document.getElementById('scale-select');
    Array.from(scaleSel.options).forEach(opt => {
        opt.textContent = SCALE_NAMES[opt.value];
    });
}

// --- CONTROLS ---
function initControls() {
    document.querySelectorAll('.theme-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => applyThemeToBody(i));
    });
    
    // Lê o tema salvo ou usa o 2 como padrão para a página de escalas
    const savedTheme = localStorage.getItem('appTheme');
    const initialTheme = savedTheme !== null ? parseInt(savedTheme) : 2;
    applyThemeToBody(initialTheme);

    document.querySelectorAll('.instrument-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.instrument-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.instrument    = btn.dataset.instrument;
            state._customMidis  = null;
            state._chugMidiOverride = null;
            buildTuningDropdown();
            updateChugLabel();
            renderFretboard();
        });
    });

    document.getElementById('root-select').addEventListener('change', e => {
        state.root = e.target.value; expandedDegree = null;
        state._customMidis = null;
        renderFretboard();
    });

    document.getElementById('scale-select').addEventListener('change', e => {
        state.scaleName = e.target.value; expandedDegree = null;
        state._customMidis = null;
        
        document.getElementById('scale-info-panel').classList.remove('open');
        renderFretboard();
    });

    document.getElementById('tuning-select').addEventListener('change', e => {
        state.tuningName    = e.target.value;
        state._customMidis  = null;
        state._chugMidiOverride = null;
        updateChugLabel();
        renderFretboard();
    });

    document.getElementById('fret-count').addEventListener('input', e => {
        state.frets = parseInt(e.target.value);
        document.getElementById('fret-count-label').textContent = e.target.value;
        renderFretboard();
    });

    document.getElementById('fretboard').addEventListener('click', e => {
        const el = e.target.closest('[data-midi]');
        if (el) playNote(parseInt(el.dataset.midi));
    });

    // Random Scale Generator
    const randomBtn = document.getElementById('random-scale-btn');
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            const rSel = document.getElementById('root-select');
            const sSel = document.getElementById('scale-select');
            
            if (rSel.options.length > 0) {
                const randR = Math.floor(Math.random() * rSel.options.length);
                rSel.selectedIndex = randR;
                state.root = rSel.options[randR].value;
            }
            if (sSel.options.length > 0) {
                const randS = Math.floor(Math.random() * sSel.options.length);
                sSel.selectedIndex = randS;
                state.scaleName = sSel.options[randS].value;
            }
            
            expandedDegree = null;
            state._customMidis = null;
            document.getElementById('scale-info-panel').classList.remove('open');
            renderFretboard();
        });
    }

    // Play Scale Logic
    const playScaleBtn = document.getElementById('play-scale-btn');
    let scalePlayTimeout = null;
    let isPlayingScale = false;
    
    if (playScaleBtn) {
        playScaleBtn.addEventListener('click', () => {
            if (isPlayingScale) {
                clearTimeout(scalePlayTimeout);
                isPlayingScale = false;
                playScaleBtn.innerHTML = '<i class="fas fa-play"></i>';
                playScaleBtn.classList.remove('active');
                return;
            }
            
            isPlayingScale = true;
            playScaleBtn.innerHTML = '<i class="fas fa-square"></i>';
            playScaleBtn.classList.add('active');
            
            const rootSemi = getRootSemitone(state.root);
            const sNotes = getScaleNotes(state.root, state.scaleName);
            const midisToPlay = sNotes.map(n => {
                let m = 48 + n.semitone;
                if (n.semitone < rootSemi) m += 12;
                return m;
            });
            midisToPlay.push(48 + rootSemi + 12); // octave
            
            let i = 0;
            const playNext = () => {
                if (!isPlayingScale) return;
                if (i >= midisToPlay.length) {
                    isPlayingScale = false;
                    playScaleBtn.innerHTML = '<i class="fas fa-play"></i>';
                    playScaleBtn.classList.remove('active');
                    return;
                }
                
                if (typeof playNote === 'function') {
                    playNote(midisToPlay[i]);
                }
                
                const formulaBoxes = document.querySelectorAll('.fn-playable');
                if (formulaBoxes && formulaBoxes[i]) {
                    formulaBoxes[i].classList.add('fn-flash');
                    setTimeout(() => { if (formulaBoxes[i]) formulaBoxes[i].classList.remove('fn-flash'); }, 300);
                }
                
                i++;
                scalePlayTimeout = setTimeout(playNext, 450);
            };
            
            playNext();
        });
    }
}

window.addEventListener('languageChanged', () => {
    setScaleDictionaries();
    updateScaleSelectTranslations();
    updateChugLabel();
    renderFretboard(); // also calls renderFormula()
    const lang = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
    const pbtn = document.getElementById('practice-btn');
    if (pbtn) pbtn.textContent = lang === 'en' ? '🎯 Practice Scale' : '🎯 Praticar Escala';
    document.getElementById('scale-info-panel').classList.remove('open');
    document.getElementById('practice-overlay').classList.add('hidden');
});

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    populateSelects();
    buildTuningDropdown();
    initControls();
    initChug();
    initScaleInfo();
    initPractice();
    updateChugLabel();
    renderFretboard(); // also calls renderFormula()
});