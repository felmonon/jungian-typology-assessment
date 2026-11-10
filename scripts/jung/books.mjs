// Jung Library: reading guides, reading paths and the life timeline.
// See scripts/jung/README.md for the rules. Publication facts and dates were
// checked against the pages named in `verifiedAt` and in the constants below.
const WP = 'https://en.wikipedia.org/wiki/Carl_Jung';
const WP_RED = 'https://en.wikipedia.org/wiki/The_Red_Book_(Jung)';
const WP_BLACK = 'https://en.wikipedia.org/wiki/Black_Books_(Jung)';
const WP_TOWER = 'https://en.wikipedia.org/wiki/Bollingen_Tower';
const WP_INSTITUTE = 'https://en.wikipedia.org/wiki/C._G._Jung_Institute,_Z%C3%BCrich';
const WP_ERANOS = 'https://en.wikipedia.org/wiki/Eranos';
const WP_MHS = 'https://en.wikipedia.org/wiki/Man_and_His_Symbols';
const WP_MDR = 'https://en.wikipedia.org/wiki/Memories,_Dreams,_Reflections';
const WP_TYPES = 'https://en.wikipedia.org/wiki/Psychological_Types';
const WP_EMMA = 'https://en.wikipedia.org/wiki/Emma_Jung';
const WP_SYNC = 'https://en.wikipedia.org/wiki/Synchronicity';
const WP_JOB = 'https://en.wikipedia.org/wiki/Answer_to_Job';
const WP_GOLDEN = 'https://en.wikipedia.org/wiki/The_Secret_of_the_Golden_Flower';
const WP_PSYUNC = 'https://en.wikipedia.org/wiki/Psychology_of_the_Unconscious';
const MANDALA_PREVIEW = 'https://api.pageplace.de/preview/DT0400.9781400886043_A29559380/preview-9781400886043_A29559380.pdf';

export const books = [
  {
    slug: 'memories-dreams-reflections',
    title: 'Memories, Dreams, Reflections',
    year: '1962',
    work: 'mdr',
    level: 'start',
    answer: 'Jung\'s memoir, told near the end of his life to his secretary Aniela Jaffé and partly written by him. It is the story of his inner life: childhood dreams, the break with Freud, the years of visions, the tower at Bollingen. It is the most readable book with his name on it.',
    whoFor: 'Anyone who wants to know who Jung was before learning what he thought. It makes the theory make sense, because it shows what the theory was built to explain.',
    sections: [
      { h: 'What is in it', p: [
        'The book was proposed in 1956 by the publisher Kurt Wolff. Jung at first resisted, then began dictating memories to Aniela Jaffé and finally wrote the first three chapters, on his childhood and youth, in his own hand. It appeared in German in 1962, a year after his death, and in English in 1963.',
        'He said at the outset that he could only tell his life as a story of inner events, and the book keeps to that. Outer facts are thin. The chapters on his childhood dreams, on Freud, on the "Confrontation with the Unconscious" and on his travels are the heart of it. A late chapter describes the visions he had after a heart attack in 1944.',
      ] },
      { h: 'How to read it', p: [
        'Read it straight through. If you are impatient, begin with the prologue and Chapter VI, "Confrontation with the Unconscious", which tells how his central ideas came out of a personal crisis between 1913 and 1919. The glossary at the back is a decent first dictionary of his terms.',
        'Treat it as a memoir shaped by an editor. Historians have shown that Jaffé and the publishers cut and arranged the material, and that people important to Jung, including his wife Emma and Toni Wolff, barely appear. Jung did not want it included in his Collected Works. It is his voice, but it is not the whole record.',
      ] },
      { h: 'What it leads to', p: [
        'The memoir explains why the [[mandala]], [[active-imagination]] and [[alchemy]] mattered to him, and it gives [[individuation]] a human face. After it, the essays in *Man and His Symbols* or the *Two Essays* read as answers to questions you have already seen him live through. *The Red Book* is the primary document behind Chapter VI.',
      ] },
    ],
    keyIdeas: ['individuation', 'self', 'mandala', 'active-imagination', 'alchemy', 'numinous'],
    next: ['man-and-his-symbols', 'two-essays-on-analytical-psychology', 'the-red-book'],
    faq: [
      { q: 'Is Memories, Dreams, Reflections an autobiography?', a: 'Partly. Jung wrote the opening chapters and some later sections himself. Most of the rest was recorded and edited by Aniela Jaffé from conversations with him.' },
      { q: 'Should I read Memories, Dreams, Reflections first?', a: 'It is a good first book if you want the person before the ideas. If you want the ideas explained plainly, start with Man and His Symbols and read the memoir second.' },
    ],
    seo: { title: 'Memories, Dreams, Reflections: A Reading Guide | TypeJung', description: 'What is in Carl Jung\'s memoir, how it was written with Aniela Jaffé, which chapters to read first, and what to read after it. A plain guide for new readers.' },
  },
  {
    slug: 'man-and-his-symbols',
    title: 'Man and His Symbols',
    year: '1964',
    work: 'mhs',
    level: 'start',
    answer: 'The one book Jung planned for general readers. He wrote the opening essay himself in English and finished it days before his final illness. Four of his closest colleagues wrote the other parts. It explains dreams, symbols, archetypes and individuation with hundreds of pictures.',
    whoFor: 'The best starting point for most people. It assumes no background and was written to be understood.',
    sections: [
      { h: 'How it came about', p: [
        'After Jung\'s television interview with John Freeman in 1959, a publisher asked him for a book for the ordinary reader. He refused. Then, by the account in the book\'s introduction, he dreamed that he was speaking to a crowd in a public place and that they understood him. He agreed on two conditions: that the book be a joint work with colleagues he chose, and that Freeman coordinate it.',
      ] },
      { h: 'What is in it', p: [
        'There are five parts. Jung\'s own essay, "Approaching the Unconscious", sets out his view of [[dreams]] and [[symbols]] and is his last piece of writing. Joseph Henderson writes on the [[hero]] and on initiation in myth. Marie-Louise von Franz gives the clearest short account of [[individuation]] in print, with chapters on the [[shadow]], the [[anima]] and [[animus]], and the [[self]]. Aniela Jaffé covers symbolism in the visual arts, and Jolande Jacobi follows a single analysis through its dreams.',
      ] },
      { h: 'How to read it', p: [
        'Get the illustrated edition if you can. The small mass-market paperback has the same text and far fewer pictures, and the pictures are part of the argument. Read Part 1 and Part 3 first. Together they are a complete introduction. The other parts can be read in any order.',
      ] },
      { h: 'What it leads to', p: [
        'Because it was written to explain, the book is simpler and more confident than Jung\'s technical work, and it sometimes states as settled what he elsewhere treats as hypothesis. Its presentation of [[archetypes]] and gender belongs to its time. Once you have read it, his memoir gives the life behind the ideas and the *Two Essays* gives them in his own systematic form.',
      ] },
    ],
    keyIdeas: ['dreams', 'symbols', 'archetypes', 'individuation', 'shadow', 'anima'],
    next: ['memories-dreams-reflections', 'two-essays-on-analytical-psychology', 'the-portable-jung'],
    faq: [
      { q: 'Did Jung write all of Man and His Symbols?', a: 'No. He wrote the first of its five parts and planned and supervised the rest, which were written by Joseph Henderson, Marie-Louise von Franz, Aniela Jaffé and Jolande Jacobi.' },
      { q: 'Is Man and His Symbols a good introduction to Jung?', a: 'It is the one he intended as an introduction, and it is usually recommended first. It is illustrated, non-technical and covers his main ideas.' },
    ],
    seo: { title: 'Man and His Symbols: A Reading Guide | TypeJung', description: 'Why Man and His Symbols is the best first book on Carl Jung: how it came about, what each of its five parts covers, which edition to get, and what to read next.' },
  },
  {
    slug: 'modern-man-in-search-of-a-soul',
    title: 'Modern Man in Search of a Soul',
    year: '1933',
    work: 'mmss',
    level: 'start',
    answer: 'A collection of eleven essays and lectures from around 1930, published in English in 1933. It is Jung speaking to educated general audiences about dreams, therapy, the stages of life, his differences with Freud, and the spiritual condition of modern people. It is short, direct and quotable.',
    whoFor: 'Readers who prefer essays to a system, and anyone curious about Jung\'s view of meaning, religion and midlife.',
    sections: [
      { h: 'What is in it', p: [
        'The book was assembled for English readers and translated by W. S. Dell and Cary F. Baynes. Most of the pieces began as lectures, which is why they read easily. The practical essays come first: on the use of dream analysis, on the problems and aims of psychotherapy, and a compact statement of his theory of types.',
        'The second half widens out. "The Stages of Life" compares a life to the course of the sun and argues that the afternoon cannot be lived by the rules of the morning. "Freud and Jung: Contrasts" is his own short account of the disagreement. "Archaic Man", "The Spiritual Problem of Modern Man" and "Psychotherapists or the Clergy" carry his claim that many modern troubles are troubles of meaning.',
      ] },
      { h: 'How to read it', p: [
        'The essays stand alone, so read in any order. Good first choices are "The Stages of Life", "The Aims of Psychotherapy" and "Freud and Jung: Contrasts". Keep the date in mind. Several passages about "primitive" peoples and about national character reflect the assumptions of European writers of the 1920s and read badly now.',
      ] },
      { h: 'What it leads to', p: [
        'This is the book for Jung on [[dreams]] as honest statements, on the second half of life, and on the practical spirit of his therapy: his refusal to force one method on every patient. Most of its essays were later retranslated for the Collected Works. If the themes of meaning and society interest you, *The Undiscovered Self* continues them twenty-five years on. For the structure of his psychology, go next to the *Two Essays*.',
      ] },
    ],
    keyIdeas: ['dreams', 'individuation', 'psychological-types', 'psychic-energy', 'numinous'],
    next: ['the-undiscovered-self', 'two-essays-on-analytical-psychology', 'memories-dreams-reflections'],
    faq: [
      { q: 'What is Modern Man in Search of a Soul about?', a: 'It is a set of eleven essays on dream analysis, psychotherapy, psychological types, the stages of life, Jung\'s differences with Freud, and the loss of meaning in modern life.' },
      { q: 'Is Modern Man in Search of a Soul hard to read?', a: 'No. Most of it began as public lectures. It is among the most approachable books of Jung\'s own writing.' },
    ],
    seo: { title: 'Modern Man in Search of a Soul: Reading Guide | TypeJung', description: 'A guide to Carl Jung\'s 1933 essay collection: what each part covers, which essays to read first, what has dated, and where it leads in his other work.' },
  },
  {
    slug: 'the-undiscovered-self',
    title: 'The Undiscovered Self',
    year: '1957',
    work: 'undiscovered',
    level: 'start',
    answer: 'A short book Jung wrote at eighty-one, in the middle of the Cold War. Its subject is the individual under pressure from mass society, the state and organized belief. His argument is that the only real resistance to mass movements is a person who knows their own psyche, including its shadow.',
    whoFor: 'Readers interested in Jung on politics, conformity and religion, and anyone who wants his late thought in a hundred pages.',
    sections: [
      { h: 'What is in it', p: [
        'The essay appeared in German in 1957 and in English the following year, and is now part of volume 10 of the Collected Works. It has seven brief chapters. Jung begins with the "statistical man": the average that science and the state deal in, which fits no actual person. Where individuals are reduced to units, he argues, they hand responsibility to the collective and become easy to lead.',
        'He then looks at what could give a person an independent footing. Organized religion, in his view, too often offers a creed in place of experience. What is needed is self-knowledge in the full sense, which means knowledge of the unconscious as well as the conscious personality.',
      ] },
      { h: 'The argument', p: [
        'The center of the book is the [[shadow]]. Jung held that the division of the world into hostile camps mirrored a split in the individual, and that each side saw in the other what it could not admit in itself. [[projection]] on a political scale is his explanation for how ordinary people come to take part in catastrophes. The remedy he offers is modest and demanding: enough individuals who have withdrawn their projections.',
      ] },
      { h: 'How to read it', p: [
        'It can be read in an evening and needs no background. It is a polemic by an old man with strong views, and it generalizes freely. Read it for the central idea. The sociology is thin.',
      ] },
      { h: 'What it leads to', p: [
        'For the shadow itself, go to the short chapter in *Aion*. For the religious question he raises here, *Answer to Job* is the full and much stranger treatment. *Modern Man in Search of a Soul* covers nearby ground from an earlier decade.',
      ] },
    ],
    keyIdeas: ['shadow', 'projection', 'individuation', 'self', 'collective-unconscious'],
    next: ['modern-man-in-search-of-a-soul', 'aion', 'answer-to-job'],
    faq: [
      { q: 'What is The Undiscovered Self about?', a: 'The place of the individual in mass society. Jung argues that self-knowledge, including knowledge of one\'s own shadow, is the only reliable defense against collective movements and ideologies.' },
      { q: 'How long is The Undiscovered Self?', a: 'About a hundred pages in most editions, in seven short chapters. It is one of Jung\'s shortest books.' },
    ],
    seo: { title: 'The Undiscovered Self: A Reading Guide | TypeJung', description: 'A guide to Carl Jung\'s short late book on the individual and mass society: what it argues, how the shadow and projection fit in, and what to read after it.' },
  },
  {
    slug: 'the-portable-jung',
    title: 'The Portable Jung',
    year: '1971',
    work: null,
    level: 'core',
    answer: 'A one-volume anthology of Jung\'s own writing, chosen and introduced by Joseph Campbell. It draws on the Collected Works in R. F. C. Hull\'s translation and arranges the selections so that they build on each other. It is the most economical way to read Jung in the original.',
    whoFor: 'Readers who have had an introduction and now want primary texts without buying a shelf of volumes.',
    sections: [
      { h: 'What is in it', p: [
        'Campbell opens with a biographical sketch and a chronology, then orders fifteen selections in three parts. Part I lays out the structure of the psyche: "The Stages of Life", "The Structure of the Psyche", "Instinct and the Unconscious" and "The Concept of the Collective Unconscious", followed by "The Relations between the Ego and the Unconscious", the chapters of *Aion* on the [[ego]], the [[shadow]], and the [[anima]] and [[animus]], an essay on marriage, and a long extract from *Psychological Types*.',
        'Part II shows the ideas at work on particular subjects: "The [[transcendent-function|Transcendent Function]]", poetry, the dream series from *Psychology and Alchemy*, the spiritual problem of modern man, and the difference between Eastern and Western thinking. Part III gives two late works: the short lecture "On [[synchronicity|Synchronicity]]" and *Answer to Job*.',
      ] },
      { h: 'How to read it', p: [
        'Follow Campbell\'s order for Part I, which is where the foundations are laid. After that, choose by interest. "The Transcendent Function" and the chapters from *Aion* repay rereading more than anything else in the volume.',
        'It is still Jung, so it is not easy. Expect long paragraphs, classical references and terms that are defined elsewhere. The glossary in this library can be kept open alongside.',
      ] },
      { h: 'What it leads to', p: [
        'The anthology prints long works at length, so by the end you will have read the second of the *Two Essays*, the opening of *Aion*, and *Answer to Job*. The natural next steps are the complete volumes those pieces come from, starting with *The Archetypes and the Collective Unconscious*.',
      ] },
    ],
    keyIdeas: ['ego', 'shadow', 'anima', 'transcendent-function', 'psychological-types', 'synchronicity'],
    next: ['archetypes-and-the-collective-unconscious', 'aion', 'psychological-types'],
    faq: [
      { q: 'Who edited The Portable Jung?', a: 'Joseph Campbell, the scholar of mythology, who selected the texts and wrote the introduction. It was published by Viking in 1971.' },
      { q: 'Is The Portable Jung good for beginners?', a: 'It is better as a second book. The selections are Jung\'s own technical writing, so most readers do well to read an introduction such as Man and His Symbols first.' },
    ],
    seo: { title: 'The Portable Jung: What Is in It and How to Read It | TypeJung', description: 'A guide to The Portable Jung, the one-volume anthology edited by Joseph Campbell: what it contains, the best order to read it in, and where to go afterward.' },
  },
  {
    slug: 'two-essays-on-analytical-psychology',
    title: 'Two Essays on Analytical Psychology',
    year: '1917/1928',
    work: 'cw7',
    level: 'core',
    answer: 'Volume 7 of the Collected Works: the two essays in which Jung first set out his psychology as a whole. One distinguishes his view from Freud\'s and Adler\'s and introduces the collective unconscious. The other follows what happens when a person begins to meet the unconscious, stage by stage.',
    whoFor: 'Readers who want the theory in Jung\'s own words and in order. It is widely regarded as the best systematic introduction he wrote.',
    sections: [
      { h: 'What is in it', p: [
        'The first essay, "On the Psychology of the Unconscious", goes back to a paper of 1912, became a small book in 1917, and was revised several times until 1943. Jung takes one case and reads it first as Freud would, in terms of sexuality, and then as Adler would, in terms of power. He argues that both are right and that the difference lies in the type of the theorist. From there he introduces the two attitudes, the personal and the [[collective-unconscious]], and the [[archetypes]].',
        'The second essay, "The Relations between the Ego and the Unconscious" (1928), is the core. Its first part describes the effects of the unconscious on consciousness, including the [[persona]] and [[inflation]]. Its second part describes [[individuation]]: the encounter with the [[anima]] and [[animus]], the technique of telling oneself apart from these figures, and the danger he calls the mana-personality.',
      ] },
      { h: 'How to read it', p: [
        'Many readers do better starting with the second essay, which is clearer and more original, and returning to the first for the background. Read slowly. Jung illustrates each step with case material, and the cases are where the abstractions become visible. The appendices hold the earliest versions of both essays and can be skipped.',
      ] },
      { h: 'What it leads to', p: [
        'Almost every later book enlarges something sketched here. *The Archetypes and the Collective Unconscious* fills in the figures. *Aion* restates the structure in its final form. *Psychological Types* develops the passage on attitudes into a full theory. If you read only one volume of the Collected Works, this is the one most often recommended.',
      ] },
    ],
    keyIdeas: ['persona', 'anima', 'animus', 'individuation', 'inflation', 'collective-unconscious'],
    next: ['archetypes-and-the-collective-unconscious', 'aion', 'psychological-types'],
    faq: [
      { q: 'What are the two essays in Two Essays on Analytical Psychology?', a: '"On the Psychology of the Unconscious" and "The Relations between the Ego and the Unconscious". Together they form volume 7 of Jung\'s Collected Works.' },
      { q: 'Which volume of the Collected Works should I read first?', a: 'Volume 7 is the usual recommendation, because it presents the whole of Jung\'s psychology in a connected way and at moderate length.' },
    ],
    seo: { title: 'Two Essays on Analytical Psychology: A Guide | TypeJung', description: 'A guide to volume 7 of Carl Jung\'s Collected Works: what the two essays cover, why to read the second one first, and how the rest of his work builds on them.' },
  },
  {
    slug: 'psychological-types',
    title: 'Psychological Types',
    year: '1921',
    work: 'cw6',
    level: 'core',
    answer: 'The book in which Jung introduced introversion and extraversion and the four functions. It is volume 6 of the Collected Works and the source of every later type system. Most of its length is a history of the type problem in philosophy and literature. The theory itself occupies the last two chapters.',
    whoFor: 'Anyone who came to Jung through personality types and wants to see what he actually wrote. Start with Chapter X.',
    sections: [
      { h: 'What is in it', p: [
        'The book appeared in German in 1921 and in English in 1923. Its first nine chapters trace the opposition of two attitudes through the history of thought: early Christian theology, Schiller\'s letters on aesthetic education, Nietzsche\'s Apollonian and Dionysian, a long study of Carl Spitteler\'s epic *Prometheus and Epimetheus*, psychiatry, aesthetics, and William James\'s tough-minded and tender-minded thinkers.',
        'Chapter X, "General Description of the Types", then describes each of the eight types: the four functions in their extraverted and introverted forms, with the unconscious side of each. Chapter XI, "Definitions", is a lexicon of several dozen of his terms, from abstraction to will, and includes his fullest definitions of [[symbols|symbol]], [[individuation]] and the [[self]].',
      ] },
      { h: 'How to read it', p: [
        'Read Chapter X first. It is under a hundred pages and can be read alone. Use Chapter XI as a reference. The historical chapters are for readers who enjoy the history of ideas, and the one on Schiller and the one on Spitteler contain important passages on the reconciling symbol. The short papers in the appendix, especially "Psychological Typology" from 1936, give his later and simpler statement of the theory.',
      ] },
      { h: 'What it leads to', p: [
        'Readers who know the sixteen four-letter types are often surprised. There are no codes and no questionnaire. Jung describes pure types as extremes that rarely occur, and spends as much time on what each type represses as on what it does well. That emphasis on the [[inferior-function]] is the bridge from typology to the rest of his psychology, which the *Two Essays* sets out.',
      ] },
    ],
    keyIdeas: ['psychological-types', 'four-functions', 'introversion-and-extraversion', 'inferior-function', 'symbols'],
    next: ['two-essays-on-analytical-psychology', 'man-and-his-symbols', 'archetypes-and-the-collective-unconscious'],
    faq: [
      { q: 'Do I need to read all of Psychological Types?', a: 'No. Chapter X contains the descriptions of the types and can be read by itself. Chapter XI is a glossary to consult. The first nine chapters are historical background.' },
      { q: 'Is the Myers-Briggs test in Psychological Types?', a: 'No. The book has no test and no four-letter codes. The Myers-Briggs Type Indicator was created later by Katharine Briggs and Isabel Briggs Myers, using Jung\'s book as a starting point.' },
    ],
    seo: { title: 'Psychological Types by Jung: How to Read It | TypeJung', description: 'A guide to Carl Jung\'s Psychological Types: what the book contains, why to start with Chapter X, how it differs from Myers-Briggs, and what to read next.' },
  },
  {
    slug: 'archetypes-and-the-collective-unconscious',
    title: 'The Archetypes and the Collective Unconscious',
    year: '1934-1954',
    work: 'cw9i',
    level: 'core',
    answer: 'Volume 9, part 1 of the Collected Works: Jung\'s essays on the archetypes, written between 1934 and 1954. It contains his definitions of the collective unconscious and his studies of particular figures, including the mother, the child, the trickster and the wise old man, and it ends with his work on mandalas.',
    whoFor: 'Readers who know the outline of Jung\'s psychology and want the primary texts on archetypes. Read two or three essays first, not the whole volume.',
    sections: [
      { h: 'What is in it', p: [
        'The volume is a collection, not a continuous book. Three essays at the front state the theory: "Archetypes of the Collective Unconscious", "The Concept of the Collective Unconscious", and "Concerning the Archetypes, with Special Reference to the Anima Concept".',
        'The middle section takes single [[archetypes]] in turn: the [[great-mother|mother]], rebirth, the child, the Kore or maiden, the spirit in fairy tales, where the [[wise-old-man]] appears, and the [[trickster]]. The last section turns to [[individuation]], with a long case study told through a patient\'s paintings and the essay "Concerning Mandala Symbolism", illustrated with plates.',
      ] },
      { h: 'How to read it', p: [
        'Start with "The Concept of the Collective Unconscious". It is a lecture of about a dozen pages and the clearest statement he made. Then read "Archetypes of the Collective Unconscious", which moves through the [[shadow]], the [[anima]] and the old man as a sequence. After those two, pick essays by interest. The one on the mother archetype and the one on the child are the richest.',
        'Expect a great deal of mythological comparison. Jung\'s method is to pile up parallels until the pattern shows, which can be tiring. It is fine to skim the examples and hold on to the argument.',
      ] },
      { h: 'What it leads to', p: [
        'Its companion is part 2 of the same volume, *Aion*, which treats the [[self]]. *Symbols of Transformation* is the early, sprawling version of the same material. For the [[mandala]] and its link to alchemy, continue with *Psychology and Alchemy*.',
      ] },
    ],
    keyIdeas: ['archetypes', 'collective-unconscious', 'great-mother', 'trickster', 'wise-old-man', 'mandala'],
    next: ['aion', 'symbols-of-transformation', 'psychology-and-alchemy'],
    faq: [
      { q: 'Which essay on archetypes should I read first?', a: '"The Concept of the Collective Unconscious" (1936). It is short, was written as a lecture, and defines the idea plainly. Follow it with "Archetypes of the Collective Unconscious".' },
      { q: 'Does this book list the twelve archetypes?', a: 'No. Jung never gave a list of twelve. This volume discusses several archetypal figures and states that their number cannot be fixed.' },
    ],
    seo: { title: 'Archetypes and the Collective Unconscious: A Guide | TypeJung', description: 'A guide to volume 9i of Carl Jung\'s Collected Works: which essays state the theory of archetypes, which to read first, and what the rest of the volume holds.' },
  },
  {
    slug: 'aion',
    title: 'Aion: Researches into the Phenomenology of the Self',
    year: '1951',
    work: 'cw9ii',
    level: 'deep',
    answer: 'Volume 9, part 2 of the Collected Works. Its first four chapters are Jung\'s shortest and most exact statements on the ego, the shadow, the anima and animus, and the Self. The rest is a difficult study of the Self as it appears in Christian, Gnostic and alchemical symbolism over two thousand years.',
    whoFor: 'Everyone should read the first four chapters. The remainder is for readers with a strong interest in religion and symbolism.',
    sections: [
      { h: 'What is in it', p: [
        'Jung wrote *Aion* in his mid-seventies and published it in 1951. The opening chapters, each only a few pages, define the [[ego]], the [[shadow]], the syzygy of [[anima]] and [[animus]], and the [[self]]. They are the late, distilled form of ideas he had worked on for thirty years, and they are where many of his best known sentences come from.',
        'From Chapter V, "Christ, a Symbol of the Self", the book changes character. Jung argues that the figure of Christ carried the image of the Self for the Western world but left out its dark side, which returned as the Antichrist. He follows this split through the symbolism of the fish, the astrological age of Pisces, Gnostic texts and alchemy, and closes with a formal model of the Self\'s structure.',
      ] },
      { h: 'How to read it', p: [
        'Read Chapters I to IV, about thirty-five pages, and treat them as a complete short work. Chapter V is worth the effort for his view of good and evil and the tension of [[opposites]]. Most readers can stop there. The middle chapters assume familiarity with early Christian history, astrology and Latin alchemy, and even specialists find them hard.',
      ] },
      { h: 'What it leads to', p: [
        'The first four chapters pair naturally with the second of the *Two Essays*, which tells the same story at greater length with cases. The religious argument is continued, with more feeling and less scholarship, in *Answer to Job*, written immediately afterward. The alchemical side is completed in *Mysterium Coniunctionis*.',
      ] },
    ],
    keyIdeas: ['ego', 'shadow', 'anima', 'animus', 'self', 'opposites'],
    next: ['answer-to-job', 'two-essays-on-analytical-psychology', 'mysterium-coniunctionis'],
    faq: [
      { q: 'Which chapters of Aion should I read?', a: 'The first four: "The Ego", "The Shadow", "The Syzygy: Anima and Animus" and "The Self". They are short and self-contained. Add Chapter V if you want his view of Christ as a symbol of the Self.' },
      { q: 'What does the title Aion mean?', a: 'Aion is a Greek word for an age or era. The book is concerned with the Christian aeon and with how the image of the Self changed over its course.' },
    ],
    seo: { title: 'Aion by Carl Jung: Which Chapters to Read | TypeJung', description: 'A guide to Carl Jung\'s Aion: why the first four chapters on the ego, shadow, anima and Self are essential, what the rest argues, and how to approach it.' },
  },
  {
    slug: 'symbols-of-transformation',
    title: 'Symbols of Transformation',
    year: '1912/1952',
    work: 'cw5',
    level: 'deep',
    answer: 'The book that ended Jung\'s partnership with Freud. First published in 1912 and heavily revised in 1952, it is a long mythological commentary on the fantasies of a young American woman he never met. In it he redefines libido as general psychic energy and interprets the hero myth.',
    whoFor: 'Readers interested in mythology and in the origins of Jung\'s ideas. It is not a first book, and it is not his clearest.',
    sections: [
      { h: 'What is in it', p: [
        'The starting material is slight: a few pages of daydreams and poems by "Miss Frank Miller", which the psychologist Théodore Flournoy had published. Jung treats them as the prelude to a breakdown and amplifies each image with parallels from myth, religion and literature. The result runs to several hundred pages.',
        'Part One argues that there are two kinds of thinking, directed and fantasy thinking, and that fantasy thinking repeats the patterns of myth. Part Two contains the theory. Jung widens libido from sexual drive to [[psychic-energy]] in general, then reads the [[hero]] myth as the struggle of that energy to free itself from the pull of the [[great-mother|mother]], ending in the theme of sacrifice.',
      ] },
      { h: 'Its history', p: [
        'The first version came out in German in 1912 and in English in 1916 under the title *Psychology of the Unconscious*. Its treatment of libido and incest contradicted Freud, and the break between the two men followed. Forty years later Jung rewrote it thoroughly. That version, translated in 1956, is volume 5 of the Collected Works. In the foreword he admits the original was written in haste and under pressure.',
      ] },
      { h: 'How to read it', p: [
        'Read the 1952 foreword first. Then read the chapters "The Concept of Libido" and "The Transformation of Libido" for the theory, and "The Origin of the Hero" and "The Dual Mother" for the myth. The amount of comparative material is overwhelming by design. Skim it and follow the thread.',
      ] },
      { h: 'What it leads to', p: [
        'The ideas appear here in a raw form that he later refined: the [[collective-unconscious]] is present but not yet named. For the finished versions, read "On Psychic Energy" and the essays in *The Archetypes and the Collective Unconscious*.',
      ] },
    ],
    keyIdeas: ['psychic-energy', 'hero', 'great-mother', 'symbols', 'archetypes'],
    next: ['archetypes-and-the-collective-unconscious', 'psychological-types', 'psychology-and-alchemy'],
    faq: [
      { q: 'Is Symbols of Transformation the same as Psychology of the Unconscious?', a: 'They are two versions of one book. Psychology of the Unconscious is the 1916 English translation of the 1912 original. Symbols of Transformation is the translation of Jung\'s 1952 revision.' },
      { q: 'Why did this book cause the break with Freud?', a: 'In it Jung rejected the view that libido is exclusively sexual and reinterpreted the incest theme symbolically. Freud could not accept either change, and their collaboration ended soon after.' },
    ],
    seo: { title: 'Symbols of Transformation: A Reading Guide | TypeJung', description: 'A guide to the book that ended Carl Jung\'s work with Freud: what Symbols of Transformation argues about libido and the hero myth, and which chapters to read.' },
  },
  {
    slug: 'psychology-and-alchemy',
    title: 'Psychology and Alchemy',
    year: '1944',
    work: 'cw12',
    level: 'deep',
    answer: 'Volume 12 of the Collected Works and Jung\'s first full statement on alchemy. It argues that alchemical imagery records a process of psychological transformation, and demonstrates the point with a long series of dreams from a modern scientist, in which the same symbols appear without his knowing their history.',
    whoFor: 'Readers who have the basics and are curious about why alchemy mattered so much to Jung. The introduction can be read by anyone.',
    sections: [
      { h: 'What is in it', p: [
        'The book grew out of two lectures given at the Eranos meetings in the mid-1930s and was published in 1944. It has three parts and several hundred illustrations taken from alchemical manuscripts and prints.',
        'Part I is an introduction to the religious and psychological problems of alchemy. Part II follows the dreams of a young man of scientific training, since identified as the physicist Wolfgang Pauli, and traces the gradual appearance of the [[mandala]] as a symbol of the [[self]]. Jung stresses that he did not treat the dreamer himself, to rule out his own influence. Part III surveys alchemical ideas of the work, the prima materia and the stone, and their parallels with Christian imagery.',
      ] },
      { h: 'How to read it', p: [
        'Read Part I as an essay. It contains some of his plainest writing on the soul, on religion as experience, and on why the West neglects the inner life. Then read Part II for the dreams and their pictures, without worrying about every reference. Part III is a reference work, to be dipped into.',
        'It helps to have read his account of how he came to [[alchemy]] in the memoir first. Without that, the subject can seem arbitrary.',
      ] },
      { h: 'What it leads to', p: [
        'The argument that the alchemists projected the [[individuation]] process into matter is developed in the essays of *Alchemical Studies*, applied to the analytic relationship in "The Psychology of the Transference", and brought to its conclusion in *Mysterium Coniunctionis*.',
      ] },
    ],
    keyIdeas: ['alchemy', 'mandala', 'self', 'individuation', 'dreams', 'projection'],
    next: ['mysterium-coniunctionis', 'aion', 'the-red-book'],
    faq: [
      { q: 'Whose dreams are analyzed in Psychology and Alchemy?', a: 'Those of the physicist Wolfgang Pauli, who is not named in the book. Jung selected the dreams from a much longer series to show mandala symbolism developing spontaneously.' },
      { q: 'Do I need to know alchemy to read it?', a: 'No. Jung explains what he needs as he goes, and the introduction is written for general readers. Some familiarity with his basic concepts is more useful than any knowledge of alchemy.' },
    ],
    seo: { title: 'Psychology and Alchemy by Jung: A Reading Guide | TypeJung', description: 'A guide to Carl Jung\'s Psychology and Alchemy: its three parts, the Pauli dream series, what to read first, and how it leads to Mysterium Coniunctionis.' },
  },
  {
    slug: 'answer-to-job',
    title: 'Answer to Job',
    year: '1952',
    work: 'job',
    level: 'core',
    answer: 'Jung\'s most personal and most disputed book. It is a psychological reading of the God of the Bible, starting from the Book of Job, in which he argues that the God-image itself develops and that Job\'s suffering forces that development. He writes as a psychologist about an image in the psyche.',
    whoFor: 'Readers interested in Jung on religion, evil and the opposites. It is short and passionate, and it offends some readers.',
    sections: [
      { h: 'What is in it', p: [
        'The book appeared in German in 1952 and in English in 1954, and is included in volume 11 of the Collected Works. Jung starts with the story of Job, a just man whom God allows to be tormented. He reads Yahweh as a figure who contains all [[opposites]] without being conscious of them, and Job as the one who sees this and holds to his own integrity.',
        'The rest follows the consequences through the Bible as he reads it: the figure of Wisdom, the incarnation understood as God\'s answer to Job, the violent visions of the Book of Revelation, and finally the papal declaration of the Assumption of Mary in 1950, which he regarded as an event of great psychological significance because it restored a feminine element to the image of God.',
      ] },
      { h: 'How to read it', p: [
        'Read the short preface first, where he says plainly that he is describing how the God-image behaves in human experience and makes no claim about God as such. Without that distinction the book reads as theology, which is how many of its critics took it. He writes with unusual emotion and irony, and he said so himself.',
        'A reader\'s Bible is useful for the Book of Job and Revelation.',
      ] },
      { h: 'What it leads to', p: [
        'This is the place to see what Jung meant by the [[numinous]] and by wholeness as distinct from perfection. It grew directly out of the chapter on Christ in *Aion*, which gives the argument in a cooler form. Its reception cost him friendships, including that with the Dominican theologian Victor White.',
      ] },
    ],
    keyIdeas: ['opposites', 'self', 'shadow', 'numinous', 'individuation'],
    next: ['aion', 'the-undiscovered-self', 'mysterium-coniunctionis'],
    faq: [
      { q: 'What is Answer to Job about?', a: 'It is Jung\'s psychological interpretation of the biblical image of God, centered on the Book of Job. He argues that the God-image contains opposites and becomes more conscious through its encounter with human beings.' },
      { q: 'Was Jung attacking religion in Answer to Job?', a: 'He said not. He stated that he wrote about the God-image as a psychological fact, not about God. Many theologians nonetheless read it as an attack, and the book remains controversial.' },
    ],
    seo: { title: 'Answer to Job by Carl Jung: A Reading Guide | TypeJung', description: 'A guide to Answer to Job, Carl Jung\'s most disputed book: what it argues about the image of God and the problem of evil, and how to read it without misreading.' },
  },
  {
    slug: 'synchronicity',
    title: 'Synchronicity: An Acausal Connecting Principle',
    year: '1952',
    work: 'cw8',
    level: 'core',
    answer: 'The essay in which Jung set out his hypothesis of meaningful coincidence. It was published in 1952 beside a study by the physicist Wolfgang Pauli, and is now in volume 8 of the Collected Works. It is short, speculative and often misrepresented, and a still shorter lecture summarizes it.',
    whoFor: 'Readers who want to know what Jung actually claimed about synchronicity. Start with the lecture "On Synchronicity".',
    sections: [
      { h: 'What is in it', p: [
        'Jung had used the word since about 1930, and he first set the idea out in full in a lecture at the Eranos meeting of 1951. The full essay followed in 1952 in a volume titled *The Interpretation of Nature and the Psyche*, which also contained Pauli\'s essay on archetypal ideas in the work of the astronomer Kepler.',
        'The essay has four chapters. The first presents the problem and the famous case of the scarab. The second reports an astrological experiment on the horoscopes of married couples, which Jung acknowledges did not give a statistically meaningful result. The third reviews forerunners of the idea, from Chinese thought to Leibniz and Schopenhauer. The fourth states his conclusion: that alongside cause and effect there may be a principle that connects events by meaning.',
      ] },
      { h: 'How to read it', p: [
        'Read "On Synchronicity" first. It is the 1951 lecture, about a dozen pages, printed as an appendix in most editions, and it gives the whole argument without the statistics. In the main essay, read the first and last chapters closely and the middle two lightly.',
        'Read it as he offered it: as a tentative proposal about rare events. He does not say that coincidences are messages, and he does not say that thoughts cause things to happen.',
      ] },
      { h: 'What it leads to', p: [
        'The essay shows the late Jung speculating about a common ground of psyche and matter, a theme he took further in *Mysterium Coniunctionis*. The experiences behind it are told in the memoir. The page on [[synchronicity]] in this library sets out the claim and the objections.',
      ] },
    ],
    keyIdeas: ['synchronicity', 'archetypes', 'numinous', 'collective-unconscious'],
    next: ['memories-dreams-reflections', 'answer-to-job', 'mysterium-coniunctionis'],
    faq: [
      { q: 'Where did Jung write about synchronicity?', a: 'Mainly in the 1952 essay "Synchronicity: An Acausal Connecting Principle" and the 1951 lecture "On Synchronicity". Both are in volume 8 of the Collected Works and in a separate paperback.' },
      { q: 'What role did Wolfgang Pauli play?', a: 'Pauli, a Nobel laureate in physics, discussed the idea with Jung over many years of correspondence, and his essay on Kepler was published in the same volume as Jung\'s.' },
    ],
    seo: { title: 'Jung\'s Synchronicity Essay: A Reading Guide | TypeJung', description: 'A guide to Carl Jung\'s essay on synchronicity: what its four chapters contain, why to read the short lecture first, and what he did and did not claim.' },
  },
  {
    slug: 'the-red-book',
    title: 'The Red Book: Liber Novus',
    year: '2009',
    work: 'redbook',
    level: 'deep',
    answer: 'The illuminated manuscript in which Jung recorded and worked over the visions of his crisis years. He made it between about 1914 and 1930 and did not publish it. It appeared in 2009, edited by Sonu Shamdasani. It is the raw material of his later psychology, written as visionary narrative with paintings.',
    whoFor: 'Readers who already know Jung\'s ideas and want to see where they came from. It is a hard and strange book, and a poor introduction.',
    sections: [
      { h: 'What it is', p: [
        'From late 1913 Jung deliberately let fantasies arise and wrote them down in a series of notebooks, the Black Books. From 1915 he copied the material, with long commentaries, in calligraphy into a large volume bound in red leather, and added paintings. He stopped around 1930, and in 1959 he added a brief epilogue.',
        'The text has three parts: Liber Primus, Liber Secundus and a later section called Scrutinies. In it "I" descends into an underworld, loses and recovers his soul, and meets a succession of figures, among them Elijah and Salome and the old man Philemon. The episodes are followed by passages in which he tries to understand what he has seen.',
      ] },
      { h: 'Its history', p: [
        'Jung showed the book to few people. After his death it stayed with his family and was later kept in a bank vault in Zurich. It was published by W. W. Norton in 2009 as a full-size facsimile with an English translation, a long introduction and more than 1,500 notes. A smaller reader\'s edition without the facsimile followed in 2012, and the Black Books themselves in 2020.',
      ] },
      { h: 'How to read it', p: [
        'Read Chapter VI of *Memories, Dreams, Reflections* first, then Shamdasani\'s introduction, which explains the circumstances and the method. Read the text in short stretches. It does not argue. It is closer to a dream journal written in the style of scripture, and Jung himself called it the material from which everything later was derived.',
        'It is a record of [[active-imagination]] by a man with a strong hold on ordinary life. It was never meant as a program for readers to follow.',
      ] },
      { h: 'What it leads to', p: [
        'The figures here became the concepts of the [[anima]], the [[wise-old-man]] and the [[self]]. To see how he turned the experience into psychology, read the *Two Essays*. For the next stage of his search, read *Psychology and Alchemy*.',
      ] },
    ],
    keyIdeas: ['active-imagination', 'wise-old-man', 'anima', 'self', 'mandala', 'individuation'],
    next: ['memories-dreams-reflections', 'two-essays-on-analytical-psychology', 'psychology-and-alchemy'],
    faq: [
      { q: 'What is The Red Book?', a: 'A manuscript Jung created between about 1914 and 1930, recording his inner visions in calligraphic text and paintings. It was first published in 2009.' },
      { q: 'Should I read The Red Book first?', a: 'No. It assumes you know why Jung undertook the experiment and what he made of it. Read his memoir and at least one introductory work before it.' },
      { q: 'What are the Black Books?', a: 'Seven private notebooks, kept mainly between 1913 and 1932, in which Jung first recorded the fantasies he later reworked in The Red Book. They were published in 2020.' },
    ],
    seo: { title: 'Jung\'s Red Book: What It Is and How to Read It | TypeJung', description: 'A guide to Carl Jung\'s Red Book: what the manuscript is, how it was made and published, why it is not a first read, and how to approach it when you are ready.' },
  },
  {
    slug: 'mysterium-coniunctionis',
    title: 'Mysterium Coniunctionis',
    year: '1955-56',
    work: 'cw14',
    level: 'deep',
    answer: 'Jung\'s last major work, finished in his eightieth year and now volume 14 of the Collected Works. Its subject is the separation and union of psychic opposites as pictured in alchemy. It is the summit of his late thought and his most demanding book.',
    whoFor: 'Committed readers who have read Psychology and Alchemy. Others can read its final chapter, which stands partly alone.',
    sections: [
      { h: 'What is in it', p: [
        'The book appeared in German in two parts in 1955 and 1956, and in English in 1963. Its six sections follow the alchemical imagery of the coniunctio, the conjunction. The first sections set out the pairs that have to be united and the paradoxes the alchemists used to describe them. The long third section personifies the [[opposites]] as Sol and Luna, sulphur and salt. Two further sections treat the king and queen and the figures of Adam and Eve.',
        'The last section, "The Conjunction", draws the psychology together. Using the three stages described by the sixteenth-century alchemist Gerhard Dorn, Jung describes first a union within the mind, then of mind with body, and finally of the whole person with what Dorn called the unus mundus, the one world.',
      ] },
      { h: 'How to read it', p: [
        'Begin at the end. "The Conjunction" contains his most detailed account of [[active-imagination]], his clearest statement of how self-knowledge works, and his final view of the [[self]]. It can be read with profit by anyone who knows his basic ideas.',
        'The earlier sections are dense with Latin and Greek quotation and assume the argument of *Psychology and Alchemy*. Read them slowly, or consult them through the index. Few people read the book straight through.',
      ] },
      { h: 'Why it matters', p: [
        'Jung regarded this book as the completion of his work: the place where [[alchemy]] gave his psychology its historical footing. Its central claim is that wholeness is a union of opposites that remain distinct. He did not mean a blend of them. The same thought runs through *Aion* and *Answer to Job*, written in the years just before it.',
      ] },
    ],
    keyIdeas: ['opposites', 'alchemy', 'active-imagination', 'self', 'individuation'],
    next: ['aion', 'answer-to-job'],
    faq: [
      { q: 'What does Mysterium Coniunctionis mean?', a: 'Latin for "the mystery of the conjunction". In alchemy the conjunction is the union of opposite substances. Jung read it as an image of the union of opposites in the psyche.' },
      { q: 'Is Mysterium Coniunctionis Jung\'s hardest book?', a: 'It is usually considered so. It depends on a long study of alchemical texts and quotes them at length. Its last section is the most accessible part.' },
    ],
    seo: { title: 'Mysterium Coniunctionis: How to Approach It | TypeJung', description: 'A guide to Carl Jung\'s last major work: what Mysterium Coniunctionis is about, why to begin with its final chapter, and what to read before attempting it.' },
  },
];

export const paths = [
  {
    slug: 'first-contact',
    title: 'If you have never read Jung',
    who: 'You know the name and a few terms. You want to understand what he was saying without a background in psychology.',
    steps: [
      { book: 'man-and-his-symbols', why: 'Written to be understood. Read Jung\'s own essay and von Franz\'s part on individuation, and you have the outline.' },
      { book: 'memories-dreams-reflections', why: 'The life behind the outline. It shows what experiences the ideas were meant to explain.' },
      { book: 'modern-man-in-search-of-a-soul', why: 'Short essays in his own voice, on dreams, therapy and the stages of life.' },
      { book: 'the-undiscovered-self', why: 'A hundred pages on why any of it matters outside the consulting room.' },
    ],
  },
  {
    slug: 'the-theory-in-order',
    title: 'If you want the theory in order',
    who: 'You have had an introduction and now want Jung\'s psychology in his own words, built up step by step.',
    steps: [
      { book: 'two-essays-on-analytical-psychology', why: 'The whole structure in one volume. Start with the second essay.' },
      { book: 'archetypes-and-the-collective-unconscious', why: 'The two theoretical essays at the front, then the figures that interest you.' },
      { book: 'aion', why: 'Chapters I to IV: the ego, shadow, anima and animus, and Self in their final form.' },
      { book: 'psychological-types', why: 'Chapter X, for how the same psychology accounts for differences between people.' },
    ],
  },
  {
    slug: 'from-personality-types',
    title: 'If you came from personality types',
    who: 'You know your four letters or your function stack and want to see what Jung meant before the systems were built.',
    steps: [
      { book: 'psychological-types', why: 'Chapter X is the source. Note how much of it is about the unconscious side of each type.' },
      { book: 'man-and-his-symbols', why: 'Places the functions inside the larger picture of dreams, shadow and individuation.' },
      { book: 'two-essays-on-analytical-psychology', why: 'Shows what typology was for: understanding the standpoint you look from.' },
      { book: 'aion', why: 'The short chapter on the shadow, which is where the inferior function leads.' },
    ],
  },
  {
    slug: 'the-inner-experiment',
    title: 'If you want Jung\'s own experience',
    who: 'You are drawn to the visions, the mandalas and the tower, and want the first-hand record.',
    steps: [
      { book: 'memories-dreams-reflections', why: 'Chapter VI tells the story of the crisis years in plain prose. Read it first.' },
      { book: 'the-red-book', why: 'The primary document. Read the editor\'s introduction, then the text in short stretches.' },
      { book: 'psychology-and-alchemy', why: 'What he did next: the search for a historical parallel to what he had been through.' },
    ],
  },
  {
    slug: 'the-late-work',
    title: 'If you want the late work',
    who: 'You know the foundations and want the books of his last decade, on religion, synchronicity and the union of opposites.',
    steps: [
      { book: 'aion', why: 'Chapter V, on Christ as a symbol of the Self, opens the late themes.' },
      { book: 'answer-to-job', why: 'The same argument, written with feeling. Read the preface carefully.' },
      { book: 'synchronicity', why: 'The short lecture first, then the essay. His most speculative idea, in his own cautious terms.' },
      { book: 'mysterium-coniunctionis', why: 'Begin with the last section, "The Conjunction".' },
    ],
  },
];

export const timeline = [
  { year: 1875, date: '26 July 1875', title: 'Born in Kesswil', text: 'Carl Gustav Jung is born in Kesswil, in the Swiss canton of Thurgau, the son of a country pastor.', related: [], verifiedAt: WP },
  { year: 1895, title: 'Medical studies in Basel', text: 'He begins to study medicine at the University of Basel. His father dies the following year, leaving the family with little money.', related: [], verifiedAt: WP },
  { year: 1900, date: 'December 1900', title: 'The Burghölzli', text: 'He moves to Zurich and starts work at the Burghölzli psychiatric hospital under Eugen Bleuler.', related: ['complexes'], verifiedAt: WP },
  { year: 1903, title: 'Marriage to Emma Rauschenbach', text: 'He marries Emma Rauschenbach, who later becomes an analyst and author in her own right.', related: ['animus'], verifiedAt: WP },
  { year: 1906, title: 'Word association and Freud', text: 'He sends Sigmund Freud a copy of his *Studies in Word Association*, the research that established the theory of complexes. Their correspondence begins.', related: ['complexes', 'personal-unconscious'], verifiedAt: WP },
  { year: 1907, date: '3 March 1907', title: 'First meeting with Freud', text: 'Jung visits Freud in Vienna. By Jung\'s account they talked almost without a break for thirteen hours.', related: [], verifiedAt: WP },
  { year: 1909, title: 'Küsnacht and America', text: 'He leaves the Burghölzli for private practice at his home in Küsnacht, and travels with Freud to lecture at Clark University in Massachusetts.', related: [], verifiedAt: WP },
  { year: 1910, title: 'President of the psychoanalytic association', text: 'At Freud\'s proposal he becomes president of the newly formed International Psychoanalytical Association.', related: [], verifiedAt: WP },
  { year: 1912, title: 'The book that divided them', text: 'He publishes the work later revised as *Symbols of Transformation*, in which libido is treated as general psychic energy. It leads to the break with Freud.', related: ['psychic-energy', 'hero'], verifiedAt: WP_PSYUNC },
  { year: 1913, date: 'September 1913', title: 'Break with Freud', text: 'The two men meet for the last time at the psychoanalytic congress in Munich, where Jung lectures on psychological types. A period of isolation follows.', related: ['psychological-types', 'introversion-and-extraversion'], verifiedAt: WP },
  { year: 1913, date: '12 November 1913', title: 'The inner experiment begins', text: 'He starts the notebooks now known as the Black Books, recording the fantasies he later called his confrontation with the unconscious.', related: ['active-imagination'], verifiedAt: WP_RED },
  { year: 1916, title: 'Seven Sermons and the first mandala', text: 'He prints the *Seven Sermons to the Dead* privately and paints his first mandala. The essay "The Transcendent Function" also dates from this year.', related: ['mandala', 'transcendent-function'], verifiedAt: MANDALA_PREVIEW },
  { year: 1918, title: 'The daily mandalas', text: 'While commanding a camp for interned British soldiers at Château d\'Oex in 1918 and 1919, he sketches a mandala each morning and arrives at his idea of the Self.', related: ['mandala', 'self'], verifiedAt: MANDALA_PREVIEW },
  { year: 1921, title: 'Psychological Types', text: 'He publishes *Psychological Types*, introducing introversion, extraversion and the four functions. The English translation follows in 1923.', related: ['psychological-types', 'four-functions', 'inferior-function'], verifiedAt: WP_TYPES },
  { year: 1923, title: 'The tower at Bollingen', text: 'On land bought the year before, he builds a round stone tower on the upper lake of Zurich. He adds to it over the next three decades.', related: ['self'], verifiedAt: WP_TOWER },
  { year: 1925, title: 'Journeys to New Mexico and East Africa', text: 'After visiting Taos Pueblo in the winter of 1924 to 1925, he sets out in October 1925 on an expedition to East Africa.', related: ['collective-unconscious'], verifiedAt: WP },
  { year: 1928, title: 'The Golden Flower and the turn to alchemy', text: 'Richard Wilhelm sends him the Chinese text *The Secret of the Golden Flower*. Jung\'s commentary appears with Wilhelm\'s translation in 1929, and his long study of alchemy begins.', related: ['alchemy', 'mandala'], verifiedAt: WP_GOLDEN },
  { year: 1930, title: 'The Red Book set aside', text: 'After some sixteen years he stops work on the illuminated manuscript of *The Red Book*, leaving it unfinished.', related: ['active-imagination'], verifiedAt: WP_RED },
  { year: 1933, title: 'Eranos, and a contested presidency', text: 'The Eranos meetings begin at Ascona, where he lectures for many years. In the same year he becomes president of the General Medical Society for Psychotherapy. His conduct in that role and remarks he published in 1934 have been criticized ever since.', related: [], verifiedAt: WP },
  { year: 1937, title: 'Yale and India', text: 'He gives the Terry Lectures at Yale, published as *Psychology and Religion*, and travels to India in 1937 and 1938.', related: ['numinous'], verifiedAt: WP },
  { year: 1944, title: 'Illness and Psychology and Alchemy', text: 'He suffers a heart attack and resigns the professorship at Basel that he had taken up the year before. *Psychology and Alchemy* is published.', related: ['alchemy'], verifiedAt: WP },
  { year: 1948, title: 'The C. G. Jung Institute', text: 'The C. G. Jung Institute is founded in Zurich to train analysts and carry on research.', related: [], verifiedAt: WP_INSTITUTE },
  { year: 1951, title: 'Aion', text: 'He publishes *Aion*, with his final definitions of the ego, the shadow, the anima and animus, and the Self.', related: ['self', 'shadow', 'anima'], verifiedAt: WP },
  { year: 1952, title: 'Answer to Job and synchronicity', text: '*Answer to Job* appears, and his essay on synchronicity is published alongside a study by the physicist Wolfgang Pauli.', related: ['synchronicity', 'opposites'], verifiedAt: WP_SYNC },
  { year: 1955, date: '27 November 1955', title: 'Death of Emma Jung', text: 'His wife Emma dies after fifty-two years of marriage. The first part of *Mysterium Coniunctionis*, his last major work, is published the same year.', related: ['alchemy', 'opposites'], verifiedAt: WP_EMMA },
  { year: 1957, title: 'The Undiscovered Self', text: 'He publishes *The Undiscovered Self*. Work is also under way with Aniela Jaffé on the memoir that the publisher Kurt Wolff had proposed the year before.', related: ['shadow', 'projection'], verifiedAt: WP_MDR },
  { year: 1959, title: 'Face to Face', text: 'The BBC broadcasts John Freeman\'s interview with him, filmed at his home. Asked whether he believes in God, he answers that he does not need to believe.', related: ['numinous'], verifiedAt: WP },
  { year: 1961, date: '6 June 1961', title: 'Death at Küsnacht', text: 'He dies at home after a short illness, shortly after finishing his essay for *Man and His Symbols*.', related: ['dreams', 'symbols'], verifiedAt: WP_MHS },
  { year: 1962, title: 'Memories, Dreams, Reflections', text: 'The memoir recorded and edited by Aniela Jaffé is published in German. The English translation follows in 1963.', related: ['individuation'], verifiedAt: WP_MDR },
  { year: 1964, title: 'Man and His Symbols', text: 'The illustrated introduction he planned for general readers is published, with his own essay and four parts by colleagues.', related: ['symbols', 'archetypes'], verifiedAt: WP_MHS },
  { year: 2009, date: 'October 2009', title: 'The Red Book is published', text: 'Nearly eighty years after he set it aside, *The Red Book* is published in facsimile with a translation, edited by Sonu Shamdasani.', related: ['active-imagination', 'wise-old-man'], verifiedAt: WP_RED },
  { year: 2020, title: 'The Black Books are published', text: 'The seven notebooks in which he first recorded his fantasies, kept mainly between 1913 and 1932, are published.', related: ['active-imagination'], verifiedAt: WP_BLACK },
];
