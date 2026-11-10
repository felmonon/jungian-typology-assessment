// Jung Library: psychological types, symbols and sources, archetypal figures.
// See scripts/jung/README.md for the rules. Each quotation carries the page
// where its wording and source were checked.
const LEX = 'https://jungpage.org/learn/jung-lexicon';
const WQ = 'https://en.wikiquote.org/wiki/Carl_Jung';
const MANDALA_PREVIEW = 'https://api.pageplace.de/preview/DT0400.9781400886043_A29559380/preview-9781400886043_A29559380.pdf';
const MDR_TEXT = 'https://archive.org/stream/MemoriesDreamsReflectionsCarlJung_201811/Memories,%20Dreams,%20Reflections%20-%20Carl%20Jung_djvu.txt';
const CW9I_TEXT = 'https://www.jungiananalysts.org.uk/wp-content/uploads/2018/07/C.-G.-Jung-Collected-Works-Volume-9i_-The-Archetypes-of-the-Collective-Unconscious.pdf';

export default [
  {
    slug: 'psychological-types',
    region: 'types',
    aka: ['Jungian typology', 'Jung\'s eight types'],
    oneLine: 'Jung\'s account of the habitual ways people orient themselves: two attitudes and four functions.',
    answer: 'Psychological types is Jung\'s theory that people differ in a regular way: in the direction of their interest, inward or outward, and in which of four functions they rely on most. He published it in 1921. Every later type system, including the sixteen four-letter types, descends from it and departs from it.',
    jung: [
      { text: 'Secondly, a typology is a great help in understanding the wide variations that occur among individuals, and it also furnishes a clue to the fundamental differences in the psychological theories now current.', work: 'cw6', essay: 'Psychological Typology', locator: '§986', verifiedAt: LEX },
      { text: '[The] function-types, which one can call the thinking, feeling, sensation, and intuitive types, may be divided into two classes according to the quality of the basic function, i.e., into the rational and the irrational.', work: 'cw6', essay: 'Definitions', locator: '§835', verifiedAt: LEX },
    ],
    sections: [
      { h: 'Where the idea came from', p: [
        'Jung began with a puzzle. Freud and Adler looked at the same patients and built opposite theories. He concluded that each theory was true to its author\'s own psychology, and that psychology needed an account of the observer\'s standpoint, which he called the personal equation. He first spoke on the subject at the Munich congress in 1913, shortly before his break with Freud, and spent the following years on the book. *Psychological Types* appeared in German in 1921 and in English in 1923.',
      ] },
      { h: 'What Jung meant', p: [
        'The model has two parts. The attitudes, [[introversion-and-extraversion]], describe where psychic energy habitually flows: toward the outer object or toward the inner subject. The [[four-functions]] describe how a person takes things in and judges them: by thinking, feeling, sensation or intuition. One function usually leads and one attitude usually prevails, which gives eight basic types, such as the introverted thinking type or the extraverted intuitive type.',
        'Jung treated a type as a habit of consciousness. He did not treat it as a fixed essence. The preferred function is developed and trusted, while its opposite, the [[inferior-function]], stays undeveloped and largely unconscious. The theory is therefore also a theory of what each person leaves out.',
      ] },
      { h: 'Jung versus later use', p: [
        'The four-letter types came later. During the Second World War, Katharine Briggs and her daughter Isabel Briggs Myers built a questionnaire on Jung\'s book, added a fourth scale for judging and perceiving, and arrived at sixteen types. Jung had no part in it. The ordered stacks of eight "cognitive functions" used online today are a further development by later writers.',
        'Jung\'s own stance was more cautious. He said that sorting people into categories was not the point and would be fairly pointless in itself. He described typology as a critical tool: a way to understand differences, to check one\'s own bias, and to see why sincere people misunderstand each other.',
      ] },
      { h: 'How to hold the idea', p: [
        'Academic psychology has largely moved to trait models, and questionnaires based on types are criticized for uneven reliability. Jung\'s typology is best used the way he used it, as a language for self-observation. It is not a measurement. It is most useful where it is least flattering: in pointing to the function you avoid.',
      ] },
    ],
    misread: [
      '"Jung created the sixteen personality types." He described eight. The sixteen types and their four-letter codes were developed by Briggs and Myers.',
      '"Your type is fixed for life." Jung described a habitual preference that can be falsified by upbringing and that changes in emphasis as neglected functions develop.',
      '"A type tells you what you are good at." It describes where your attention goes by habit. Skill is a separate matter.',
      '"Typology puts people in boxes." Jung said classification was not its purpose. He meant it as a tool for understanding differences.',
    ],
    related: ['introversion-and-extraversion', 'four-functions', 'inferior-function', 'compensation', 'individuation', 'opposites'],
    read: [
      { work: 'cw6', where: 'Chapter X, "General Description of the Types", and Chapter XI, "Definitions". Most readers can begin with Chapter X.' },
      { work: 'cw6', where: 'The 1936 lecture "Psychological Typology", in the appendix. Short, late and clear.' },
    ],
    cta: { kind: 'map', text: 'The free map applies this model directly. It reads 42 answers as a pattern across the eight function-attitudes and names your likely dominant and inferior functions.' },
    faq: [
      { q: 'What are Jung\'s eight psychological types?', a: 'Each of the four functions in each of the two attitudes: extraverted and introverted thinking, feeling, sensation and intuition. A type is named for the function and attitude a person habitually leads with.' },
      { q: 'Is Myers-Briggs the same as Jungian typology?', a: 'No. The Myers-Briggs Type Indicator was built on Jung\'s book by Katharine Briggs and Isabel Briggs Myers, who added a fourth scale and sixteen types. Jung was not involved and held the theory more loosely.' },
      { q: 'Did Jung think types were scientific fact?', a: 'He presented them as an empirical scheme drawn from clinical observation and historical study, useful for orientation. He warned against treating the scheme as a rigid classification of people.' },
    ],
    seo: { title: 'Psychological Types: Jung\'s Original Theory | TypeJung', description: 'What Carl Jung meant by psychological types: two attitudes and four functions, eight types in all. How his theory differs from Myers-Briggs and how to use it.' },
  },
  {
    slug: 'introversion-and-extraversion',
    region: 'types',
    aka: ['introvert and extravert', 'attitude types'],
    oneLine: 'The direction your interest flows by habit: toward the outer object or the inner subject.',
    answer: 'Jung introduced introversion and extraversion to describe two attitudes of consciousness. In extraversion, interest moves toward the outer world and takes its bearings from it. In introversion, interest moves inward and takes its bearings from the subject\'s own response. He was describing the direction of psychic energy. He was not describing shyness or sociability.',
    jung: [
      { text: 'Everyone whose attitude is introverted thinks, feels, and acts in a way that clearly demonstrates that the subject is the prime motivating factor and that the object is of secondary importance.', work: 'cw6', essay: 'Definitions', locator: '§769', verifiedAt: LEX },
      { text: 'His retreat into himself is not a final renunciation of the world, but a search for quietude, where alone it is possible for him to make his contribution to the life of the community.', work: 'cw6', essay: 'Psychological Typology', locator: '§979', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Both words are Jung\'s contribution to psychology. He defined them by the movement of [[psychic-energy]]. The extraverted attitude is oriented by the object: by what is happening, what others think, what the situation requires. The introverted attitude is oriented by the subject: by the impression the object makes, and by ideas and values that come from within. In his summary, the object is all-important in the one case and the subject in the other.',
        'He considered both attitudes normal and both present in everyone. One is habitual and conscious. The other is less developed and works from the unconscious.',
      ] },
      { h: 'How it shows up', p: [
        'In Jung\'s portraits the extravert adapts quickly, forms attachments easily and tends to trust what is generally accepted. The introvert hesitates, reflects, guards a private standpoint and needs to understand before joining in. He stressed that these are tendencies of orientation. An introvert may be warm and talkative with people who matter to them, and an extravert may be reserved. What differs is where the deciding weight falls.',
      ] },
      { h: 'The other side', p: [
        'Because of [[compensation]], each attitude has an unconscious counterpart. Jung observed that the more one-sidedly extraverted a person is, the more self-centered and childish their unconscious demands become, breaking out in symptoms or sudden selfishness. The one-sided introvert, who holds the outer world at a distance, becomes secretly dependent on it and oversensitive to it. He treated these reversals as signals that the neglected attitude needs a place.',
      ] },
      { h: 'Jung versus later use', p: [
        'Trait psychology kept the words and changed the meaning. In models such as the Big Five, extraversion is a measurable dimension made of sociability, assertiveness and positive emotion, and most people fall near the middle. That concept is well supported, and it is a different one. Jung was describing the direction of interest. He was not measuring how outgoing someone is. He also wrote extraversion with an a, which is why both spellings exist.',
      ] },
    ],
    misread: [
      '"Introverts are shy and extraverts are confident." Jung was describing where attention is anchored. Social ease is a separate question.',
      '"Introversion means recharging alone." That is a modern rule of thumb. Jung\'s definition concerns orientation by the subject or by the object.',
      '"You are either one or the other." He held that everyone has both attitudes, one dominant in consciousness and the other in the unconscious.',
    ],
    related: ['psychological-types', 'four-functions', 'inferior-function', 'psychic-energy', 'compensation'],
    read: [
      { work: 'cw6', where: 'Chapter X, "General Description of the Types". The classic portraits of both attitudes.' },
      { work: 'cw7', where: '"The Problem of the Attitude-Type". A shorter account, using Freud and Adler as the example.' },
    ],
    cta: { kind: 'map', text: 'In Jung\'s model every function is used in one direction or the other. The free map shows the attitude of each of your functions, which is more specific than a single introvert or extravert label.' },
    faq: [
      { q: 'Did Jung invent the terms introvert and extravert?', a: 'He introduced them into psychology in their modern sense, in a lecture in 1913 and at length in Psychological Types in 1921.' },
      { q: 'What is the difference between Jung\'s introversion and the Big Five trait?', a: 'Jung meant an orientation of interest toward the inner subject. The Big Five trait of low extraversion measures behavior such as lower sociability and assertiveness. They overlap, but they are not the same concept.' },
      { q: 'Can a person be both introverted and extraverted?', a: 'In Jung\'s view everyone is both. One attitude is habitual and conscious, and the other operates less consciously and tends to appear under pressure.' },
    ],
    seo: { title: 'Introversion and Extraversion: What Jung Meant | TypeJung', description: 'What Carl Jung meant by introversion and extraversion: the direction of interest, not shyness or sociability. How his idea differs from the modern trait.' },
  },
  {
    slug: 'four-functions',
    region: 'types',
    aka: ['the four functions of consciousness', 'cognitive functions'],
    oneLine: 'Thinking, feeling, sensation and intuition: the four ways consciousness gets its bearings.',
    answer: 'Jung described four functions of consciousness. Sensation registers what is there. Thinking says what it is. Feeling judges what it is worth. Intuition senses where it came from and where it is going. Everyone uses all four, but one is usually developed far more than the others, and it shapes the personality.',
    jung: [
      { text: 'Sensation establishes what is actually present, thinking enables us to recognize its meaning, feeling tells us its value, and intuition points to possibilities as to whence it came and whither it is going in a given situation.', work: 'cw6', essay: 'A Psychological Theory of Types', locator: '§958', verifiedAt: LEX },
      { text: 'The superior function is always an expression of the conscious personality, of its aims, will, and general performance, whereas the less differentiated functions fall into the category of things that simply "happen" to one.', work: 'cw6', essay: 'General Description of the Types', locator: '§575', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung compared the four functions to the four points of a compass: an arbitrary but indispensable means of orientation. He sorted them into two pairs. Thinking and feeling are rational, because both judge, one by logic and one by value. Sensation and intuition are irrational, by which he meant only that they perceive without judging, one through the senses and one by way of the unconscious.',
        'Feeling is the term most often misunderstood. Jung did not mean emotion. He meant a function of evaluation that says whether something is agreeable, important or right, and that can be as discriminating as thought.',
      ] },
      { h: 'One leads, one lags', p: [
        'The two functions in each pair exclude each other. A person cannot weigh something by logic and by personal value in the same moment, or attend to the facts and to the possibilities at once. So one function becomes the most differentiated, the superior or dominant function, and the one opposite it stays the least developed. That is the [[inferior-function]]. A second function from the other pair usually serves as an auxiliary, which is why a thinking type is helped by either sensation or intuition, and never by feeling.',
      ] },
      { h: 'Eight function-attitudes', p: [
        'Each function can be used in either attitude (see [[introversion-and-extraversion]]), which gives eight forms. The abbreviations used online, such as Ni for [[/functions/ni|introverted intuition]] or Fe for [[/functions/fe|extraverted feeling]], are shorthand for them. The phrase cognitive functions and the fixed stacks assigned to sixteen types come from later writers. Jung\'s own descriptions are in Chapter X of *Psychological Types*, and they read as portraits more than as a system.',
      ] },
      { h: 'Why it matters', p: [
        'For Jung the practical point was one-sidedness. Society rewards the function a person does best, so it is overused, and the rest are left behind. He connected much ordinary trouble, between people and within them, to that imbalance. Development means that the neglected functions gradually gain a voice, which he saw as part of [[individuation]].',
      ] },
    ],
    misread: [
      '"Feeling types are emotional and thinking types are cold." Feeling in Jung\'s sense is a rational function of valuing. Thinking types have emotions, often less managed ones.',
      '"Irrational means unreasonable." Jung meant that sensation and intuition perceive without judging. Nothing more is implied.',
      '"Intuition is a psychic gift." He defined it as perception by way of the unconscious: seeing where something is heading without knowing how you know.',
      '"Jung laid out the cognitive function stacks." The stacks for sixteen types were built later. Jung described a leading function, an auxiliary and an inferior.',
    ],
    related: ['psychological-types', 'inferior-function', 'introversion-and-extraversion', 'opposites', 'individuation'],
    read: [
      { work: 'cw6', where: 'Chapter X, "General Description of the Types". Each function in each attitude.' },
      { work: 'cw6', where: '"A Psychological Theory of Types" (1931), in the appendix. The compass passage.' },
      { work: 'mhs', where: 'Part 1, where Jung explains the four functions for general readers.' },
    ],
    cta: { kind: 'map', text: 'The free map shows how strongly each of the eight function-attitudes appears in your answers, with the likely dominant and inferior functions marked.' },
    faq: [
      { q: 'What are the four functions in Jungian psychology?', a: 'Thinking, feeling, sensation and intuition. Thinking and feeling judge. Sensation and intuition perceive. Jung held that one of the four usually dominates a person\'s conscious life.' },
      { q: 'What is the difference between sensation and intuition?', a: 'Sensation perceives what is concretely present through the senses. Intuition perceives possibilities and connections that are not given in the facts, by way of the unconscious.' },
      { q: 'Are the eight cognitive functions from Jung?', a: 'The eight function-attitudes are his: each of four functions in an introverted or extraverted form. The name cognitive functions and the letter codes were added by later typologists.' },
    ],
    seo: { title: 'The Four Functions: Jung on Thinking and Feeling | TypeJung', description: 'What Carl Jung meant by the four functions: thinking, feeling, sensation and intuition. Why one leads and one lags, and where the eight functions come from.' },
  },
  {
    slug: 'inferior-function',
    region: 'types',
    aka: ['the fourth function', 'the inferior'],
    oneLine: 'Your least developed function: slow, touchy, and the place where the unconscious gets in.',
    answer: 'The inferior function is the least developed of a person\'s four functions and the opposite of the one they rely on most. It stays partly unconscious, so it is slow, awkward and easily upset. Jung saw it as a weak point and as the opening through which neglected life returns.',
    jung: [
      { text: 'The inferior function is practically identical with the dark side of the human personality.', work: 'cw9i', essay: 'Concerning Rebirth', locator: '§222', verifiedAt: LEX },
      { text: 'And yet it is necessary for the development of character that we should allow the other side, the inferior function, to find expression.', work: 'cw7', essay: 'The Problem of the Attitude-Type', locator: '§86', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'If one of the [[four-functions]] is developed until it is fast, reliable and under conscious control, its opposite pays the price. A thinking type\'s feeling stays undeveloped. A sensation type\'s intuition does, and the reverse holds in each case. Jung called the neglected one the inferior function. He was describing its level of development and passed no judgment on its worth.',
        'Because it has never been differentiated, it remains mixed with the unconscious. It is archaic, all-or-nothing and beyond the reach of the will. In his words, the other functions are things a person does, while the inferior function is something that happens to them.',
      ] },
      { h: 'How it shows up', p: [
        'The signs are slowness, touchiness and disproportion. A person reacts to criticism in this area far more than elsewhere, and avoids it where possible. Under fatigue, illness or strain, the leading function gives out and the inferior one takes over in a crude form: the precise thinker flooded by sentiment or resentment, the warm feeling type seized by cold, negative judgments, the practical sensation type haunted by dark forebodings, the intuitive undone by a bodily detail or a sudden obsession with facts. Jung tied these episodes closely to the [[shadow]], and to [[projection]] onto people who use that function well.',
      ] },
      { h: 'Why it matters', p: [
        'Jung did not regard the inferior function as a flaw to be fixed. Because it is close to the unconscious, it carries what the conscious personality lacks: freshness, depth and a link to the instincts. Marie-Louise von Franz, who gave the fullest account of it, called it the door through which the figures of the unconscious enter. The pressure to attend to it usually grows in the second half of life and is part of what he meant by [[individuation]].',
      ] },
      { h: 'Working with it', p: [
        'He warned against trying to train the inferior function directly, which he said the leading function will not allow. The way is indirect: through the auxiliary functions, in small doses, in low-stakes settings, and with patience for being a beginner. The aim is a working relationship in which the weak side has a place. Parity with the dominant function is not expected. A [[/jung/practice/inferior-function-practice|short practice]] describes one careful way to start.',
      ] },
    ],
    misread: [
      '"The inferior function is the one you are bad at." It is the one you have least developed. It often carries intense interest and energy.',
      '"You should strengthen it until it is as good as your dominant." Jung thought that impossible. The aim is relationship and room. Equal skill is out of reach.',
      '"It only matters when you are stressed." Stress makes it visible. It also shapes what you avoid, envy and idealize in ordinary life.',
    ],
    related: ['four-functions', 'psychological-types', 'shadow', 'compensation', 'individuation', 'enantiodromia'],
    read: [
      { work: 'cw6', where: 'Definitions, under "Inferior Function", and Chapter X on the unconscious side of each type.' },
      { work: 'cw7', where: '"The Problem of the Attitude-Type".' },
      { work: 'other', where: 'Marie-Louise von Franz, "The Inferior Function", in *Lectures on Jung\'s Typology* (1971). The standard account.' },
    ],
    cta: { kind: 'map', text: 'The free map names the function your answers suggest is least developed, alongside the one that leads. For most people that pairing is the most useful part of the result.' },
    faq: [
      { q: 'What is the inferior function?', a: 'In Jung\'s typology, the least differentiated of a person\'s four functions, opposite to the dominant one. It is largely unconscious and tends to show itself in clumsy, emotional or exaggerated ways.' },
      { q: 'How do I find my inferior function?', a: 'It is the opposite of your dominant function: thinking opposes feeling, and sensation opposes intuition, in the opposite attitude. Look for the area where you are slowest, most defensive and most easily thrown.' },
      { q: 'Can the inferior function be developed?', a: 'Partly, and slowly. Jung held that it can be given a place in life and brought closer to consciousness, usually by way of the auxiliary functions. It does not become as reliable as the dominant.' },
    ],
    seo: { title: 'The Inferior Function: Jung\'s Fourth Function | TypeJung', description: 'What Carl Jung meant by the inferior function: your least developed function, how it erupts under stress, why it matters, and how to approach it carefully.' },
  },
  {
    slug: 'mandala',
    region: 'self',
    aka: ['mandala symbolism', 'the magic circle'],
    oneLine: 'A circular image that Jung read as the psyche\'s picture of its own wholeness and center.',
    answer: 'Mandala is the Sanskrit word for circle. Jung used it for circular images, often divided into four and organized around a center, that appear in religious art and, spontaneously, in dreams and drawings. He interpreted them as symbols of the Self: the psyche representing its own order, especially in times of confusion.',
    jung: [
      { text: 'I sketched every morning in a notebook a small circular drawing, a mandala, which seemed to correspond to my inner situation at the time.', work: 'mdr', essay: 'Confrontation with the Unconscious', locator: 'ch. VI', verifiedAt: MANDALA_PREVIEW },
      { text: 'The symbol of the mandala has exactly this meaning of a holy place, a temenos, to protect the centre. And it is a symbol which is one of the most important motifs in the objectivation of unconscious images.', work: 'cw18', essay: 'The Tavistock Lectures', locator: '§410', verifiedAt: LEX },
    ],
    sections: [
      { h: 'Where the idea came from', p: [
        'Jung met the mandala in himself before he met it in books. He painted his first in 1916 without understanding it. In 1918 and 1919, while commanding a camp for interned British soldiers at Château d\'Oex, he drew a small circle in a notebook each morning and noticed that the drawings tracked his inner state: a disturbed mood produced a broken circle. He came to see them as images of the [[self]], and wrote that he then had to give up the idea that the ego holds the highest position.',
        'The confirmation came in 1928, when the sinologist Richard Wilhelm sent him a Chinese alchemical text, *The Secret of the Golden Flower*. Jung found his private discovery described in a tradition he had not known.',
      ] },
      { h: 'What Jung meant', p: [
        'In Tibetan Buddhism and Hinduism a mandala is a ritual diagram used in meditation. Jung borrowed the word for a wider class: any image of a circle, a square or a fourfold pattern arranged around a midpoint. He regarded the motif as archetypal, since it occurs in cultures with no contact, and he collected examples from his patients over many years before publishing on the subject.',
      ] },
      { h: 'How it shows up', p: [
        'Jung noticed that mandalas tend to appear in dreams and spontaneous drawings during disorientation, conflict or psychic overload. He read them as [[compensation]]: the psyche answers disorder with an image of order and a protected center. He was careful about what this proves. Such images, he wrote, are often no more than a temporary counterweight to chaos, and do not mean that wholeness has been reached.',
      ] },
      { h: 'Working with it', p: [
        'Jung did not prescribe drawing mandalas as a technique, and he warned Westerners against imitating Eastern meditation forms from outside. What he valued was the spontaneous image. If one appears in a dream or a doodle, his approach was to draw it carefully, notice what stands at the center and what is excluded, and take it as a statement about the present state of [[individuation]]. It records the state. It does not accomplish the work.',
      ] },
    ],
    misread: [
      '"Jung taught people to color mandalas to relax." He studied images that arose on their own. Coloring a printed design is a later, unrelated practice.',
      '"Drawing a mandala means you have found your center." He said such images often simply compensate confusion. They mark a need as much as an achievement.',
      '"Jung took the idea from Eastern religion." He borrowed the word. He had already drawn the images for years before he read the Eastern sources.',
    ],
    related: ['self', 'symbols', 'individuation', 'compensation', 'alchemy', 'archetypes'],
    read: [
      { work: 'cw9i', where: '"Concerning Mandala Symbolism" and "A Study in the Process of Individuation". With plates.' },
      { work: 'mdr', where: 'Chapter VI, "Confrontation with the Unconscious".' },
      { work: 'cw12', where: 'Part II, where mandala motifs are traced through a long series of dreams.' },
    ],
    cta: { kind: 'read', book: 'memories-dreams-reflections', text: 'Jung tells the story of his own mandalas in his memoir, including the moment he understood what they were. It is the place to start.' },
    faq: [
      { q: 'What does a mandala symbolize in Jungian psychology?', a: 'The Self: the wholeness of the personality and its ordering center. Jung read spontaneous circular images as the psyche\'s own representation of that order.' },
      { q: 'Why did Jung draw mandalas?', a: 'During 1918 and 1919 he sketched one each morning and found that the drawings reflected his inner condition from day to day. This led him to his concept of the Self.' },
      { q: 'What does it mean if I dream of a mandala?', a: 'Jung would look at the context. He often saw circular or fourfold images arise in periods of confusion as a compensating picture of order. He did not treat them as proof of anything achieved.' },
    ],
    seo: { title: 'The Mandala: Jung\'s Symbol of the Self | TypeJung', description: 'What the mandala meant to Carl Jung: a circular image of the Self and its center. How he discovered it in his own drawings, and what it does and does not mean.' },
  },
  {
    slug: 'alchemy',
    region: 'axis',
    aka: ['Jung and alchemy', 'psychology and alchemy'],
    oneLine: 'Why Jung spent his last thirty years reading alchemists, and what he thought they had found.',
    answer: 'Jung read medieval and Renaissance alchemy as an unwitting psychology. He argued that the alchemists, working on substances they did not understand, projected their own unconscious processes into matter, so that their strange images describe the stages of inner transformation. He treated alchemy as the historical forerunner of his psychology of individuation.',
    jung: [
      { text: 'The experiences of the alchemists were, in a sense, my experiences, and their world was my world.', work: 'mdr', essay: 'The Work', locator: 'ch. VII', verifiedAt: MDR_TEXT },
      { text: 'Even a moderately comprehensive knowledge of the shadow can cause a good deal of confusion and mental darkness, since it gives rise to personality problems which one had never remotely imagined before.', work: 'cw14', essay: 'The Conjunction', locator: '§741', verifiedAt: LEX },
    ],
    sections: [
      { h: 'Where the idea came from', p: [
        'After his years of inner experiment Jung wanted evidence that what he had found was not private to him. He looked first to the Gnostics and found them too remote. In 1928 Richard Wilhelm sent him *The Secret of the Golden Flower*, a Chinese alchemical text, and he recognized his own material in it. He then began collecting and deciphering Latin alchemical books, a task he said absorbed him for more than a decade. His major works on the subject are *Psychology and Alchemy* (1944), "The Psychology of the Transference" (1946) and *Mysterium Coniunctionis* (1955-56).',
      ] },
      { h: 'What Jung meant', p: [
        'The alchemists described their work, the opus, as the transformation of a worthless starting material, the prima materia, into the philosophers\' stone or gold. Jung\'s thesis was that the chemistry was real but that something else was going on as well. Faced with the darkness of matter, the adept filled it with contents of the [[collective-unconscious]] by [[projection]]. The texts are therefore a record of [[symbols]] produced by the psyche over many centuries, with little conscious tampering.',
      ] },
      { h: 'The stages', p: [
        'He read the phases of the opus as a map of [[individuation]]. The nigredo, or blackening, corresponds to the disorienting encounter with the [[shadow]]. The albedo, or whitening, is a first clarity. The rubedo, or reddening, is the return of that insight into lived life. The coniunctio, the marriage of king and queen or sun and moon, pictures the union of [[opposites]], and the stone is an image of the [[self]]. He used the same imagery to describe what happens between analyst and patient.',
      ] },
      { h: 'How to hold the idea', p: [
        'Jung made no claim that alchemy works, and the common picture of him as a believer in gold-making is wrong. Historians of science, for their part, have criticized his reading as too narrow, pointing out that many alchemists were doing practical laboratory chemistry and that he chose texts that suited his thesis. Both points can be held together. His interpretation is a psychological reading of one strand of a large tradition, and its value lies in the images it makes usable.',
      ] },
    ],
    misread: [
      '"Jung believed in turning lead into gold." He treated alchemical gold as a symbol and the texts as psychological documents.',
      '"Alchemy was only spiritual, never chemical." Jung did not say so, and historians have shown how much practical chemistry it involved.',
      '"You need to study alchemy to understand Jung." His central ideas were formed before he read the alchemists. Alchemy gave him historical parallels and a richer vocabulary.',
    ],
    related: ['individuation', 'opposites', 'symbols', 'projection', 'self', 'shadow'],
    read: [
      { work: 'mdr', where: 'Chapter VII, "The Work". His own short account of why alchemy mattered to him.' },
      { work: 'cw12', where: 'Part I, the introduction. The clearest statement of the thesis.' },
      { work: 'cw16', where: '"The Psychology of the Transference". The stages illustrated by a series of woodcuts.' },
    ],
    cta: { kind: 'read', book: 'psychology-and-alchemy', text: 'Psychology and Alchemy is long, but its introduction can be read on its own. The guide explains which parts to read and in what order.' },
    faq: [
      { q: 'Why was Jung interested in alchemy?', a: 'He believed alchemical texts recorded, in projected form, the same processes of psychological transformation he observed in his patients and himself. Alchemy gave his psychology a historical basis.' },
      { q: 'What do nigredo, albedo and rubedo mean?', a: 'Blackening, whitening and reddening: three stages of the alchemical work. Jung read them as the confrontation with the shadow, a first illumination, and the integration of insight into life.' },
      { q: 'Did Jung practice alchemy?', a: 'No. He collected and studied alchemical books as a scholar and interpreted their imagery psychologically. He did not do laboratory work.' },
    ],
    seo: { title: 'Jung and Alchemy: What He Saw in the Alchemists | TypeJung', description: 'Why Carl Jung studied alchemy: he read its images as a projected record of psychological transformation. The stages, the key books, and what critics say.' },
  },
  {
    slug: 'hero',
    region: 'archetypes',
    aka: ['the hero archetype', 'hero myth'],
    oneLine: 'The pattern of leaving, struggling and winning something of value, read as the growth of consciousness.',
    answer: 'The hero is an archetypal figure found in myths everywhere: the one who leaves home, faces a monster and wins a treasure. Jung interpreted the pattern as an image of consciousness freeing itself from unconsciousness, and of the ego\'s struggle to become independent. He also held that the heroic attitude must eventually be outgrown.',
    jung: [
      { text: 'The hero\'s main feat is to overcome the monster of darkness: it is the long-hoped-for and expected triumph of consciousness over the unconscious.', work: 'cw9i', essay: 'The Psychology of the Child Archetype', locator: '§284', verifiedAt: LEX },
      { text: 'In myths the hero is the one who conquers the dragon, not the one who is devoured by it. And yet both have to deal with the same dragon.', work: 'cw14', essay: 'The Conjunction', locator: '§756', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung studied hero myths at length in the 1912 book later revised as *Symbols of Transformation*. He noticed a recurring outline: a miraculous or humble birth, early proofs of strength, a journey, a fight with a dragon or sea monster, often a period inside the monster\'s belly, and a return with a prize that is hard to obtain. He read the whole as a drama of [[psychic-energy]]. The monster is the pull back toward unconsciousness, which he associated with the devouring side of the [[great-mother|mother archetype]]. The victory is the birth of an independent consciousness.',
      ] },
      { h: 'How it shows up', p: [
        'In individual life the pattern belongs above all to youth: leaving the parents, proving oneself, establishing an [[ego]] that can stand on its own. It appears in dreams of battles, quests and rescues, and in the heroes a person admires. Jung added that the dragon is real for everyone. In the passage quoted above, the difference between the hero and the victim is the outcome of the fight. Both have to face the same dragon.',
      ] },
      { h: 'The limit of the hero', p: [
        'Jung did not hold up the hero as a model for a whole life. A person who identifies with the figure is inflated (see [[inflation]]), and an ego that must always conquer cannot relate to the unconscious, which is the task of later life. He recorded a dream from December 1913 in which he took part in killing Siegfried, the Germanic hero, and understood it to mean that his own heroic attitude, the will to prevail, had to be sacrificed. [[individuation]] asks the hero to give way to something larger than the ego.',
      ] },
      { h: 'Jung versus later use', p: [
        'The "hero\'s journey" as a set of stages comes from Joseph Campbell\'s *The Hero with a Thousand Faces* (1949), which drew on Jung and was later simplified into a formula for screenwriters. Erich Neumann developed the theme in another direction, as a history of consciousness. Jung\'s own interest was narrower and more psychological: what the myth shows about the cost of becoming conscious.',
      ] },
    ],
    misread: [
      '"The hero\'s journey is Jung\'s model." The staged journey is Joseph Campbell\'s. Jung supplied the psychological reading that Campbell built on.',
      '"The goal is to become the hero of your own life." Jung saw identification with the hero as inflation, and thought the heroic stance had to be given up in the second half of life.',
      '"The dragon is an outside enemy." In his reading it is one\'s own inertia and unconsciousness.',
    ],
    related: ['archetypes', 'great-mother', 'ego', 'inflation', 'individuation', 'psychic-energy'],
    read: [
      { work: 'cw5', where: 'Part Two, especially "The Origin of the Hero" and "The Dual Mother".' },
      { work: 'cw9i', where: '"The Psychology of the Child Archetype", on the child-hero.' },
      { work: 'mhs', where: 'Part 2, "Ancient Myths and Modern Man" by Joseph L. Henderson. The most accessible treatment.' },
    ],
    cta: { kind: 'read', book: 'symbols-of-transformation', text: 'The hero myth is the subject of the book that ended Jung\'s partnership with Freud. The guide shows a way through it.' },
    faq: [
      { q: 'What is the hero archetype in Jungian psychology?', a: 'A universal pattern of struggle and victory that Jung read as the ego\'s emergence from unconsciousness. It is most active in the first half of life, when independence has to be won.' },
      { q: 'Is the hero\'s journey from Jung or Campbell?', a: 'The stage-by-stage hero\'s journey is Joseph Campbell\'s, published in 1949. Campbell was strongly influenced by Jung\'s earlier work on hero myths.' },
    ],
    seo: { title: 'The Hero Archetype: Jung\'s Reading of the Myth | TypeJung', description: 'What the hero meant to Carl Jung: an image of consciousness winning independence from the unconscious, and a stance that has to be outgrown later in life.' },
  },
  {
    slug: 'trickster',
    region: 'shadow',
    aka: ['the trickster archetype'],
    oneLine: 'The fool and rule-breaker of myth, read by Jung as an image of the collective shadow.',
    answer: 'The trickster is a figure in myth and folklore who cheats, blunders, changes shape and upsets every order, and who sometimes brings a gift by accident. Jung saw in him a collective image of the shadow: a memory of an earlier, less conscious state of mind that survives in everyone.',
    jung: [
      { text: '[The trickster] is a forerunner of the saviour . . . . He is both subhuman and superhuman, a bestial and divine being, whose chief and most alarming characteristic is his unconsciousness.', work: 'cw9i', essay: 'On the Psychology of the Trickster-Figure', locator: '§472', verifiedAt: LEX },
      { text: 'The so-called civilized man has forgotten the trickster. He remembers him only figuratively and metaphorically, when, irritated by his own ineptitude, he speaks of fate playing tricks on him or of things being bewitched.', work: 'cw9i', essay: 'On the Psychology of the Trickster-Figure', locator: '§478', verifiedAt: LEX },
    ],
    sections: [
      { h: 'Where the idea came from', p: [
        'Jung wrote his essay on the trickster in 1954 as a commentary for the anthropologist Paul Radin\'s study of the Winnebago trickster cycle, a set of Native American tales about a wandering figure whose body parts quarrel with each other and whose schemes keep backfiring. Jung set the figure beside European parallels: the medieval feast of fools, carnival, the clown, the poltergeist, and the alchemical Mercurius, who is cunning, two-faced and indispensable.',
      ] },
      { h: 'What Jung meant', p: [
        'He read the trickster as a psychologem: an old and widespread structure of the psyche. In his account it preserves the memory of a state in which consciousness was barely separated from instinct. The trickster is stupid and clever, cruel and comic, at once below and above the human level. Jung called him a collective [[shadow]] figure, a sum of the inferior traits of character in individuals.',
        'The myth is also a story of development. Over the cycle the trickster slowly becomes less senseless and more useful, and in many traditions he ends as a culture-bringer. That is why Jung could call him a forerunner of the savior. Something of value comes out of the mess.',
      ] },
      { h: 'How it shows up', p: [
        'In an individual the trickster is the shadow in its playful and sabotaging form: the slip at the worst possible moment, the appointment forgotten, the joke that reveals too much, the plan undone by one\'s own hand. Jung noted that modern people meet him without recognizing him and blame fate or bad luck. He appears in dreams as a clown, a thief, a mischievous child or an animal.',
      ] },
      { h: 'Why it matters', p: [
        'The trickster is a reminder that the shadow is foolish as well as dark, and that it cannot be reasoned out of existence. Jung thought a culture that forgets the figure loses a safety valve, and that the forgotten content returns in a more dangerous, collective form. Taken with some humor, the trickster in oneself punctures [[inflation]] and brings a stuck situation back into motion.',
      ] },
    ],
    misread: [
      '"The trickster is a villain." He is amoral more than evil, and in many myths he brings fire, food or knowledge as a side effect of his schemes.',
      '"The trickster is a personality type." Jung treated him as a pattern present in everyone, most visible when conscious control slips.',
      '"Jung based the idea on one mythology." He used the Winnebago cycle as the occasion and drew parallels from European folklore, religion and alchemy.',
    ],
    related: ['shadow', 'archetypes', 'collective-unconscious', 'inflation', 'alchemy'],
    read: [
      { work: 'cw9i', where: '"On the Psychology of the Trickster-Figure". A short essay and the only extended statement.' },
      { work: 'cw13', where: '"The Spirit Mercurius", for the trickster\'s alchemical relative.' },
    ],
    cta: { kind: 'read', book: 'archetypes-and-the-collective-unconscious', text: 'The trickster essay is one of the shorter pieces in the volume on archetypes. The guide lists the essays worth reading first.' },
    faq: [
      { q: 'What is the trickster archetype?', a: 'A mythic figure of disorder, cunning and foolishness. Jung interpreted it as a collective image of the shadow, carrying traces of an earlier and less differentiated stage of consciousness.' },
      { q: 'What are examples of trickster figures?', a: 'Jung discussed the Winnebago trickster, the alchemical Mercurius, and European clowns and carnival fools. Scholars of myth also point to figures such as Hermes, Loki, Coyote and Anansi.' },
    ],
    seo: { title: 'The Trickster Archetype: Jung\'s Interpretation | TypeJung', description: 'What the trickster meant to Carl Jung: a collective image of the shadow, foolish and cunning at once. Where the idea came from and how it shows up in life.' },
  },
  {
    slug: 'great-mother',
    region: 'archetypes',
    aka: ['the great mother', 'mother complex'],
    oneLine: 'The inherited pattern behind every experience of mothering, nourishing and devouring alike.',
    answer: 'The mother archetype is, in Jung\'s theory, the inborn pattern that shapes how humans experience mothering and everything that resembles it: care, shelter, origin, and also engulfment. It has a nourishing side and a devouring side. A person\'s mother complex forms where this pattern meets their actual mother.',
    jung: [
      { text: 'The qualities associated with it are maternal solicitude and sympathy; the magic authority of the female; the wisdom and spiritual exaltation that transcend reason…', work: 'cw9i', essay: 'Psychological Aspects of the Mother Archetype', locator: '§158', verifiedAt: CW9I_TEXT },
      { text: '…that primordial and eternal image of the mother for whose sake everything that embraces, protects, nourishes, and helps assumes maternal form, from the Alma Mater of the university to the personification of cities, countries, sciences and ideals.', work: 'cw13', essay: 'Paracelsus as a Spiritual Phenomenon', verifiedAt: WQ },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung set out the idea in the essay "Psychological Aspects of the Mother Archetype". Like every one of the [[archetypes]], the mother is an empty form that experience fills. It appears first in the personal mother and grandmother, then in any woman with whom a relationship of dependence exists, and beyond persons in images: the goddess, the Church, the homeland, the earth, the sea, the garden, the cave, the vessel.',
        'He stressed that it has two faces. On one side are care, sympathy, fertility and a wisdom deeper than reasoning. On the other are whatever is secret and dark: the abyss, what devours, seduces and holds fast. He spoke of the loving and the terrible mother as one figure.',
      ] },
      { h: 'The mother complex', p: [
        'Jung made a claim that surprised his contemporaries. Much of the power a mother has over a child\'s psyche comes from the archetype projected onto her, and only part comes from her as a person. That is why the mothers of memory and fantasy are so often larger than life, as fairy godmothers or witches. The [[complexes|complex]] that results can work positively or negatively, and he described its typical forms in sons and in daughters at length. Those descriptions carry the assumptions of his period about men, women and sexuality and are among the most dated pages he wrote.',
      ] },
      { h: 'Why it matters', p: [
        'The practical use is a distinction. Separating the human mother from the archetype lets a person see her at her actual size, and take back what was [[projection]]. The archetype itself does not go away. Jung thought the need for what it represents, belonging and containment, simply moves to other carriers: an institution, a cause, a partner, an idea. In the [[hero]] myth the same figure is the dragon that must be fought for the sake of independence.',
      ] },
      { h: 'Jung versus later use', p: [
        'The phrase Great Mother was made famous by Jung\'s student Erich Neumann, whose book of that name appeared in 1955. Later writers went further and described a single prehistoric religion of the Goddess. That historical claim goes well beyond Jung, who was describing a pattern in the psyche. It is disputed by archaeologists.',
      ] },
    ],
    misread: [
      '"The mother archetype means mothers are to blame." Jung argued the reverse: much of what is attributed to the personal mother belongs to the archetype projected onto her.',
      '"It is the image of the ideal, loving mother." He described it as two-sided, with a devouring aspect as real as the nourishing one.',
      '"Jung proved an ancient Great Goddess religion." He made a psychological claim about a recurring image. The historical theory is later and contested.',
    ],
    related: ['archetypes', 'complexes', 'anima', 'hero', 'projection', 'collective-unconscious'],
    read: [
      { work: 'cw9i', where: '"Psychological Aspects of the Mother Archetype". The primary source.' },
      { work: 'cw5', where: 'Part Two, "Symbols of the Mother and of Rebirth" and "The Dual Mother".' },
    ],
    cta: { kind: 'read', book: 'archetypes-and-the-collective-unconscious', text: 'Jung\'s essay on the mother archetype is in the volume on archetypes. The guide explains where it fits and what to read alongside it.' },
    faq: [
      { q: 'What is the mother archetype?', a: 'In Jung\'s psychology, the inherited pattern that structures the experience of mothering and of everything that nourishes, contains or engulfs. It has both a positive and a negative aspect.' },
      { q: 'What is a mother complex?', a: 'The cluster of feelings, memories and expectations that forms around a person\'s experience of mother, with the mother archetype at its core. Jung held that everyone has one and that it may work for good or ill.' },
      { q: 'Is the Great Mother Jung\'s term?', a: 'Jung wrote of the mother archetype and used "Great Mother" as one of its images. The term became a title through Erich Neumann\'s 1955 book.' },
    ],
    seo: { title: 'The Mother Archetype in Jung\'s Psychology | TypeJung', description: 'What Carl Jung meant by the mother archetype: the two-sided pattern behind mothering, the mother complex it forms, and how the Great Mother idea grew later.' },
  },
  {
    slug: 'wise-old-man',
    region: 'archetypes',
    aka: ['the senex', 'archetype of meaning'],
    oneLine: 'The figure of insight and guidance who appears when the conscious mind has run out of answers.',
    answer: 'The wise old man is Jung\'s name for the archetype of spirit and meaning, personified as a sage, teacher, magician or grandfather. In dreams and stories he appears when someone is stuck and needs an insight they cannot produce by will. Jung regarded the figure as helpful, ambiguous, and dangerous to identify with.',
    jung: [
      { text: 'The wise old man appears in dreams in the guise of a magician, doctor, priest, teacher, professor, grandfather, or any person possessing authority.', work: 'cw9i', essay: 'The Phenomenology of the Spirit in Fairytales', locator: '§398', verifiedAt: LEX },
      { text: 'The mana-personality is a dominant of the collective unconscious, the well-known archetype of the mighty man in the form of hero, chief, magician, medicine-man, saint, the ruler of men and spirits, the friend of God.', work: 'cw7', essay: 'The Mana-Personality', locator: '§377', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung described the figure most fully in a study of fairy tales. In those stories the old man turns up at the moment the hero is in a hopeless situation, asks who, why and where, and gives a piece of advice or a magic object. Jung read him as the personification of a psychic function: the capacity for reflection and insight that arises from the unconscious when conscious resources are exhausted. He called this factor spirit, and the old man its typical image.',
      ] },
      { h: 'Jung\'s own figure', p: [
        'The idea was not only theoretical. During the fantasies he recorded from 1913 onward, Jung met an old man with the wings of a kingfisher, whom he named Philemon and painted in *The Red Book*. He wrote in his memoir that Philemon taught him that there are things in the psyche that he did not produce, which have their own life. He treated the figure as a kind of inner teacher. He did not take him for a spirit in the literal sense.',
      ] },
      { h: 'Its two sides', p: [
        'Like all [[archetypes]] the wise old man is double. In fairy tales he can be a wicked magician as well as a helper, and his advice sometimes tests the hero more than it rescues him. Jung placed the figure late in the sequence of [[individuation]], behind the [[anima]], as the meaning hidden within the chaos of life. For women he described a parallel figure of the wise old woman or great mother.',
      ] },
      { h: 'The danger of identification', p: [
        'The chief risk is [[inflation]]. A person who has gained some real insight may begin to feel that they are the sage: the one who knows, the guru, the healer. Jung called this identification the mana-personality and thought it a regular hazard at a certain stage of development. The same archetype is easily projected onto teachers, doctors and leaders, who are then credited with a wisdom no human being has. The task in both cases is to tell the human being from the image.',
      ] },
    ],
    misread: [
      '"The wise old man is always good." Jung noted the archetype\'s dark form, the sorcerer who misleads.',
      '"Having an inner guide means its advice should be followed." He treated such figures as parts of the psyche to be questioned and weighed. They are not authorities to be obeyed.',
      '"It is a mentor character from fiction." The character is one of its images. Jung meant the psychic source of meaning that such characters personify.',
    ],
    related: ['archetypes', 'anima', 'inflation', 'self', 'active-imagination', 'numinous'],
    read: [
      { work: 'cw9i', where: '"The Phenomenology of the Spirit in Fairytales".' },
      { work: 'cw7', where: '"The Mana-Personality", on identifying with the figure.' },
      { work: 'mdr', where: 'Chapter VI, for Philemon.' },
    ],
    cta: { kind: 'read', book: 'the-red-book', text: 'Philemon, Jung\'s own wise old man, is a central presence in The Red Book. The guide explains what the book is and how to approach it.' },
    faq: [
      { q: 'What is the wise old man archetype?', a: 'An archetypal image of spirit, knowledge and meaning, appearing as a sage, teacher or magician. Jung saw it as personifying insight that comes from the unconscious when it is needed.' },
      { q: 'Who was Philemon?', a: 'A figure who appeared in Jung\'s fantasies from 1913 on: an old man with kingfisher wings. Jung regarded him as an inner teacher and as evidence that the psyche produces contents independent of the ego.' },
    ],
    seo: { title: 'The Wise Old Man Archetype in Jung\'s Psychology | TypeJung', description: 'What Carl Jung meant by the wise old man: the archetype of spirit and meaning, his own figure Philemon, its dark side, and the danger of identifying with it.' },
  },
  {
    slug: 'puer-aeternus',
    region: 'archetypes',
    aka: ['the eternal child', 'puella aeterna', 'Peter Pan syndrome'],
    oneLine: 'The eternal youth: a divine child in myth, and a name for the adult who cannot land in life.',
    answer: 'Puer aeternus is Latin for eternal boy. In myth it names a youthful god who never ages. In Jungian psychology it describes both an archetype of renewal and a pattern in adults who stay emotionally adolescent, living provisionally and avoiding commitment. Most of the familiar portrait comes from Marie-Louise von Franz, who built on Jung.',
    jung: [
      { text: 'The "eternal child" in man is an indescribable experience, an incongruity, a handicap, and a divine prerogative; an imponderable that determines the ultimate worth or worthlessness of a personality.', work: 'cw9i', essay: 'The Psychology of the Child Archetype', locator: '§300', verifiedAt: LEX },
      { text: '[The world] makes demands on the masculinity of a man, on his ardour, above all on his courage and resolution when it comes to throwing his whole being into the scales.', work: 'cw9ii', essay: 'The Syzygy: Anima and Animus', locator: '§22', verifiedAt: LEX },
    ],
    sections: [
      { h: 'Where the term comes from', p: [
        'The phrase is from Ovid\'s *Metamorphoses*, where it is addressed to a child-god. Jung used it in his writing on the child archetype and on the mother complex. For him the divine child is a symbol of potential: the beginning that is also an anticipation of wholeness, small and exposed and yet unstoppable.',
      ] },
      { h: 'The psychological pattern', p: [
        'The portrait of the puer as a kind of person was drawn mainly by Marie-Louise von Franz in lectures given in Zurich in 1959 and 1960. She described a man, often gifted and charming, who remains tied to the mother and cannot accept an ordinary, limited life. Each job or relationship is not yet the real thing. He lives what the analyst H. G. Baynes had called the provisional life, keeps his options open, is drawn to flying, heights and risk, and dreads being pinned down. The parallel in a woman is the puella aeterna.',
        'Jung had described the core of it in *Aion*: the son who looks for a world and a happiness that will be given to him as a gift, without the effort of commitment. Von Franz reported that Jung\'s remedy was a single word: work. She meant the plain, repeated work that a person does not feel like doing.',
      ] },
      { h: 'Its value', p: [
        'The figure is not only a problem. Jung\'s sentence above calls the eternal child both a handicap and a divine prerogative. The puer carries spontaneity, imagination and openness to the new, which a personality loses at its peril. His opposite is the senex, the old man: order, discipline and limit, which without the puer hardens into rigidity. James Hillman later argued that the two belong together and that the puer should not simply be trained out of a person.',
      ] },
      { h: 'How to hold the idea', p: [
        'Peter Pan syndrome and similar popular labels are descendants of this idea, and none of them is a recognized condition. The Jungian account is a description of a pattern, tinged with the moral tone of its period. It is most useful as a mirror. The question it puts is where a person is still waiting for real life to begin.',
      ] },
    ],
    misread: [
      '"Puer aeternus is a disorder Jung identified." It is an archetypal image and a descriptive pattern. The detailed portrait is von Franz\'s, and it has no clinical standing.',
      '"The puer is just immaturity to be outgrown." Jung also saw the eternal child as a source of renewal. The aim is to ground it without killing it.',
      '"It only applies to men." The same pattern in women is called the puella aeterna.',
    ],
    related: ['archetypes', 'great-mother', 'complexes', 'anima', 'individuation', 'hero'],
    read: [
      { work: 'cw9i', where: '"The Psychology of the Child Archetype".' },
      { work: 'cw9ii', where: 'Chapter III, paragraphs 20 to 24, on the son and the mother.' },
      { work: 'other', where: 'Marie-Louise von Franz, *The Problem of the Puer Aeternus* (1970). The source of the popular picture.' },
    ],
    cta: { kind: 'read', book: 'aion', text: 'The few paragraphs in Aion on the mother-bound son are among the most quoted Jung wrote on this theme. The guide shows where they sit in the book.' },
    faq: [
      { q: 'What does puer aeternus mean?', a: 'Latin for "eternal boy". In Jungian psychology it refers to the archetype of the divine child and to adults who remain psychologically adolescent, avoiding commitment and limits.' },
      { q: 'Is puer aeternus the same as Peter Pan syndrome?', a: 'They describe a similar pattern. Peter Pan syndrome is a popular term from the 1980s. Puer aeternus is the older Jungian concept, developed chiefly by Marie-Louise von Franz. Neither is a recognized clinical category.' },
      { q: 'What did Jung say helps the puer?', a: 'According to von Franz, he answered: work. She meant steady, ordinary effort that ties a person to reality, especially when it is not inspiring.' },
    ],
    seo: { title: 'Puer Aeternus: The Eternal Child in Jung | TypeJung', description: 'What puer aeternus means in Jungian psychology: the divine child archetype and the adult who lives provisionally. What Jung said and what von Franz added.' },
  },
  {
    slug: 'wounded-healer',
    region: 'archetypes',
    aka: ['the wounded physician', 'Chiron'],
    oneLine: 'The idea that a healer\'s capacity to help is rooted in their own wound, and limited by it.',
    answer: 'The wounded healer is the archetypal image, drawn from Greek myth, of a healer who carries an incurable wound. Jung used it for a fact of therapeutic work: an analyst can help only as far as they have dealt with their own suffering, and remains exposed to being affected by the patient\'s.',
    jung: [
      { text: 'It is no loss, either, if he feels that the patient is hitting him, or even scoring off him: it is his own hurt that gives the measure of his power to heal. This, and nothing else, is the meaning of the Greek myth of the wounded physician.', work: 'cw16', essay: 'Fundamental Questions of Psychotherapy', locator: '§239', verifiedAt: LEX },
    ],
    sections: [
      { h: 'Where the image comes from', p: [
        'In Greek myth the centaur Chiron, teacher of heroes and of the physician Asclepius, was struck by a poisoned arrow and could neither heal the wound nor die of it. The image of a healer who suffers what he treats is found in many traditions, including the figure of the shaman who is initiated through illness. Jung\'s own phrase was the wounded physician. The now familiar wording, wounded healer, spread through later Jungian and pastoral writing.',
      ] },
      { h: 'What Jung meant', p: [
        'Jung made the point in a 1951 paper on the fundamentals of psychotherapy. He wrote that a good half of every deep treatment consists in the doctor examining himself, because he can put right in the patient only what he has put right in himself. The analyst is not a neutral instrument. Patient and analyst affect each other, and the analyst\'s own unresolved places are exactly where the patient\'s problems will touch him.',
        'This was a practical position as much as a mythic one. Jung was among the first to insist that anyone who analyzes others must first be analyzed, a requirement that became standard in the training of analysts.',
      ] },
      { h: 'How it shows up', p: [
        'In practice the archetype works in both directions. The helper\'s experience of suffering is the ground of real empathy, and people in helping professions are often drawn to the work by their own history. The same wound makes them liable to what Jung called psychic infection: taking on the patient\'s state, or reacting from their own complex. In the Jungian account the patient also has an inner healer, and treatment succeeds when that is activated instead of remaining projected onto the professional.',
      ] },
      { h: 'The danger', p: [
        'The idea is easily turned into a credential. Jung did not say that being hurt qualifies a person to treat others. He meant that the wound has to be known, worked on and kept in view, and that the work is never finished. A helper who identifies with the healer and forgets the wound is in a state of [[inflation]], and one who identifies with the wound cannot help anyone. Later analysts, notably Adolf Guggenbühl-Craig, wrote about how this split feeds the misuse of power in the helping professions.',
      ] },
    ],
    misread: [
      '"My suffering makes me a healer." Jung\'s point was that an unexamined wound makes a helper dangerous. What counts is the work done on it.',
      '"The wounded healer has overcome their wound." In the myth the wound never closes. The image is of someone who goes on carrying it consciously.',
      '"It only concerns therapists." Jung wrote about analysts, but the dynamic applies wherever one person takes the role of helper to another.',
    ],
    related: ['archetypes', 'projection', 'inflation', 'shadow', 'complexes', 'individuation'],
    read: [
      { work: 'cw16', where: '"Fundamental Questions of Psychotherapy" and "The Psychology of the Transference".' },
      { work: 'mdr', where: 'Chapter IV, "Psychiatric Activities", where Jung reflects on what his patients did to him.' },
    ],
    cta: { kind: 'read', book: 'memories-dreams-reflections', text: 'Jung\'s memoir shows the idea in practice: how his own crises shaped the way he worked with patients.' },
    faq: [
      { q: 'What is the wounded healer archetype?', a: 'The pattern of a healer whose ability to help comes from their own experience of being wounded. Jung applied it to psychotherapy, where the analyst\'s self-knowledge sets the limit of what they can do for a patient.' },
      { q: 'Did Jung coin the term wounded healer?', a: 'He wrote of the "wounded physician" and referred to the Greek myth. The phrase "wounded healer" became common in later Jungian and pastoral writing based on his idea.' },
      { q: 'Who is Chiron?', a: 'A centaur in Greek mythology, renowned as a teacher and healer, who suffered an incurable wound from a poisoned arrow. He is the classic image of the wounded healer.' },
    ],
    seo: { title: 'The Wounded Healer: Jung on the Wounded Physician | TypeJung', description: 'What the wounded healer meant to Carl Jung: a helper can heal only as far as they have faced their own wound. The Chiron myth, the idea, and its dangers.' },
  },
];
