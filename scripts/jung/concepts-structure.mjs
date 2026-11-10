// Jung Library: structure of the psyche. See scripts/jung/README.md for the rules.
// Quotations were checked against Daryl Sharp's Jung Lexicon (LEX) or the
// Psychology Club Zurich terms page (PCZ); each carries where it was verified.
const LEX = 'https://jungpage.org/learn/jung-lexicon';
const PCZ = 'https://www.psychologyclub.ch/en/cg-jung/work/jungian-terms';

export default [
  {
    slug: 'psyche',
    region: 'whole',
    aka: ['the psyche', 'psychic reality'],
    oneLine: 'Jung\'s word for the whole of mental life, conscious and unconscious together.',
    answer: 'For Jung the psyche is the totality of all psychological processes, conscious and unconscious. It is wider than the mind you are aware of and wider than the ego. He treated it as a self-regulating system with its own reality, one that answers what happens to it instead of merely reacting.',
    jung: [
      { text: 'The psyche does not merely react, it gives its own specific answer to the influences at work upon it.', work: 'cw4', essay: 'Some Crucial Points in Psychoanalysis', locator: '§665', verifiedAt: LEX },
      { text: 'The psyche is far from being a homogenous unit—on the contrary, it is a boiling cauldron of contradictory impulses, inhibitions, and affects', work: 'cw9i', essay: 'Psychological Aspects of the Mother Archetype', locator: '§190', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung used psyche for everything psychological: thoughts, feelings, perceptions, memories, instincts, images, and the large part of all this that never becomes conscious. He preferred the word to mind or soul. Mind suggests only the conscious part, and soul carries religious meanings he wanted to keep separate.',
        'He pictured it in layers. The [[ego]] sits at the center of consciousness. Around and beneath it lies the [[personal-unconscious]], made of what one life has forgotten or pushed aside. Deeper still is the [[collective-unconscious]], a shared inheritance structured by [[archetypes]]. The [[self]] is his name for the whole, and for its organizing center.',
      ] },
      { h: 'A system that balances itself', p: [
        'The idea that most separates Jung from his contemporaries is self-regulation. He held that the psyche works like the body and corrects one-sidedness on its own. When consciousness leans too far in one direction, the unconscious produces a counterweight in dreams, moods, symptoms or sudden interests. He called this [[compensation]] and built his whole approach to [[dreams]] on it.',
      ] },
      { h: 'Why psychic reality matters', p: [
        'Jung insisted that psychic events are real in their effects whether or not they match outer facts. A fear, a conviction or an image shapes a life as surely as a physical cause does. This is why he took fantasies, myths and religious experiences seriously as data instead of dismissing them as illusions, while declining to say what lay behind them.',
      ] },
      { h: 'Reading the map', p: [
        'Every other term in this library names a part of the psyche or a movement within it. It helps to keep the whole in view. The parts are ways of speaking about one living system, not separate compartments. Jung warned that psychology has no standpoint outside the psyche from which to observe it, so every model of it, including his own, is provisional. The diagram on each page of this library shows where a term sits in that whole. It is a drawing aid, and Jung drew the psyche differently on different occasions.',
      ] },
    ],
    misread: [
      '"Psyche just means the mind." Jung meant more than the conscious mind. Most of the psyche, in his account, is unconscious.',
      '"The psyche is in the brain, so Jung was doing neuroscience." He described psychological experience in its own terms and left the brain question open.',
      '"The parts are separate things inside you." Ego, shadow and the rest are names for patterns in one system, not objects.',
    ],
    related: ['ego', 'self', 'personal-unconscious', 'collective-unconscious', 'compensation'],
    read: [
      { work: 'cw8', where: '"On the Nature of the Psyche". Dense, but his most complete statement.' },
      { work: 'mhs', where: 'Part 1, "Approaching the Unconscious". Jung\'s own plain introduction.' },
    ],
    cta: { kind: 'read', book: 'man-and-his-symbols', text: 'Jung wrote one introduction for general readers, near the end of his life. It is the easiest way into his picture of the psyche.' },
    faq: [
      { q: 'What is the difference between psyche and mind?', a: 'In Jung\'s usage, mind usually means conscious thinking, while psyche covers the whole of psychological life, including everything unconscious. The psyche is the larger term.' },
      { q: 'What are the parts of the psyche according to Jung?', a: 'Consciousness with the ego at its center, the persona facing the outer world, the personal unconscious with its shadow and complexes, and the collective unconscious with its archetypes. The Self is his name for the whole.' },
    ],
    seo: { title: 'The Psyche in Jungian Psychology: Jung\'s Model | TypeJung', description: 'What Carl Jung meant by the psyche: the whole of mental life, conscious and unconscious, pictured as a self-regulating system. Plain explanation with sources.' },
  },
  {
    slug: 'ego',
    region: 'ego',
    aka: ['ego consciousness', 'the I'],
    oneLine: 'The center of your conscious field: the "I" that knows, chooses and remembers.',
    answer: 'The ego is Jung\'s term for the center of consciousness, the sense of "I" that gives you continuity and identity. It is what a content must be connected to in order to be conscious at all. Jung valued a strong ego but denied that it is the whole personality or its master.',
    jung: [
      { text: 'The ego stands to the self as the moved to the mover, or as object to subject, because the determining factors which radiate out from the self surround the ego on all sides and are therefore supraordinate to it.', work: 'cw11', essay: 'Transformation Symbolism in the Mass', locator: '§391', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung defined the ego as a complex of ideas that forms the center of the field of consciousness and has a high degree of continuity and identity. Nothing is conscious unless it is related to the ego. In that sense it is the gatekeeper of awareness, though it is also only one complex among many. Its view is partial by nature. The ego knows only what is connected to it, so its picture of the personality always feels more complete than it is.',
        'It grows out of the collision between the body and its surroundings, and goes on developing through further collisions with the outer and inner worlds. Jung thought the first half of life rightly belongs to building it: a stable identity, a place in the world, the ability to choose and to hold a course.',
      ] },
      { h: 'Ego and Self', p: [
        'The ego is the center of consciousness. The [[self]] is the center and the whole of the psyche, conscious and unconscious together. Jung compared their relationship to that of the moved to the mover. The ego experiences itself as the author of its life, but much of what it decides is prepared elsewhere. He treated this discovery as humbling and as the start of maturity.',
      ] },
      { h: 'What goes wrong', p: [
        'Two opposite errors interested him. In one, the ego is too weak, and unconscious contents flood it. In the other, the ego identifies with something larger than itself, a role, an idea or an archetype, and swells. He called the second [[inflation]]. Both lose the same thing: a firm, modest standpoint from which to meet what is not ego.',
      ] },
      { h: 'Why it matters', p: [
        'Popular spirituality often treats the ego as the enemy. Jung did not. [[individuation]] requires an ego sturdy enough to face the [[shadow]] and the rest of the unconscious without being swept away or retreating into denial. The aim is a changed relationship, with the ego serving the whole personality instead of ruling it.',
      ] },
    ],
    misread: [
      '"The ego is arrogance." In Jung the ego is simply the conscious "I". Arrogance is closer to what he called inflation.',
      '"The goal is to dissolve the ego." Jung thought a dissolved ego was a danger. He wanted a strong ego in right relation to the Self.',
      '"Jung\'s ego is the same as Freud\'s." They overlap, but Freud\'s ego mediates between id, superego and reality, while Jung\'s is the center of consciousness within a larger psyche that includes a collective layer.',
    ],
    related: ['self', 'persona', 'shadow', 'inflation', 'individuation', 'psyche'],
    read: [
      { work: 'cw9ii', where: 'Chapter I, "The Ego". His late, compact definition.' },
      { work: 'cw7', where: '"The Relations between the Ego and the Unconscious". The classic account of what happens when the two meet.' },
    ],
    cta: { kind: 'map', text: 'The ego prefers certain ways of taking in the world and deciding about it. The free map shows which functions your conscious standpoint seems to lean on, and which one it tends to leave out.' },
    faq: [
      { q: 'What is the ego in Jungian psychology?', a: 'The center of consciousness: the "I" that provides identity and continuity. For Jung a content is conscious only if it is connected to the ego.' },
      { q: 'What is the difference between the ego and the Self?', a: 'The ego is the center of consciousness. The Self is the center and totality of the whole psyche, including the unconscious. Jung described the ego as subordinate to the Self.' },
      { q: 'Did Jung think the ego was bad?', a: 'No. He thought a strong ego was necessary, especially for facing the unconscious. The problem he described was an ego that mistakes itself for the whole personality.' },
    ],
    seo: { title: 'The Ego in Jungian Psychology: Meaning and Role | TypeJung', description: 'What Carl Jung meant by the ego: the center of consciousness, not the whole personality. How it relates to the Self, and why he did not want it dissolved.' },
  },
  {
    slug: 'persona',
    region: 'persona',
    aka: ['social mask', 'the mask'],
    oneLine: 'The face you learn to show the world, useful until you mistake it for yourself.',
    answer: 'The persona is the role or public face a person develops to deal with the world: the professional manner, the family part, the social self. Jung named it after the mask worn by actors in antiquity. It is necessary and useful. Trouble starts when a person identifies with it.',
    jung: [
      { text: 'The persona is that which in reality one is not, but which oneself as well as others think one is.', work: 'cw9i', essay: 'Concerning Rebirth', locator: '§221', verifiedAt: LEX },
      { text: 'A man cannot get rid of himself in favour of an artificial personality without punishment.', work: 'cw7', essay: 'Anima and Animus', locator: '§307', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung described the persona as a compromise between the individual and society about what a person should appear to be. It is assembled from expectations: of a profession, a class, a family, a culture. A doctor is expected to behave like a doctor, and in time the manner becomes second nature.',
        'He called it a segment of the collective psyche because so little of it is personal. The role existed before you took it up. What is individual is the particular choice and shading of the mask.',
      ] },
      { h: 'Why it is needed', p: [
        'A person without a workable persona pays for it. Jung described such people as going from one social blunder to the next, harmless and well meaning but constantly misread. A persona lets strangers cooperate, protects private life, and saves everyone from negotiating each encounter from nothing. He regarded building one as a normal task of youth, part of finding a place in the world.',
      ] },
      { h: 'Identification', p: [
        'The difficulty is identification. Someone who is only the role, the judge at breakfast or the caregiver who is never cared for, loses contact with what the role leaves out. Jung held that the neglected side does not vanish. It gathers in the unconscious and returns as moods, compulsions, sudden weakness or a private life at odds with the public one. He also saw an inner counterpart: the stiffer the persona, the more a person is at the mercy of the [[anima]] or [[animus]].',
      ] },
      { h: 'Working with it', p: [
        'The task is neither to tear the mask off nor to perfect it. It is to know that you are wearing one. A flexible persona can be put on for the occasion and taken off at home, and its wearer knows the difference. Jung treated the collapse of a persona, through failure, illness or a change of role, as painful and as a frequent starting point of [[individuation]], because it forces the question of who is there when the part can no longer be played.',
      ] },
    ],
    misread: [
      '"The persona is fake, so authentic people do not have one." Jung considered a persona necessary. The problem is identifying with it, not having it.',
      '"Persona means personality." It is one part: the outward-facing adaptation. Much of the personality is not in it.',
      '"Dropping the mask is the goal." Jung described people with no workable persona as badly adapted. The aim is flexibility and awareness.',
    ],
    related: ['ego', 'shadow', 'anima', 'animus', 'individuation'],
    read: [
      { work: 'cw7', where: '"The Persona as a Segment of the Collective Psyche" and "Anima and Animus". The fullest treatment.' },
      { work: 'cw6', where: 'Definitions, under "Soul". Where he first defines the persona.' },
    ],
    cta: { kind: 'map', text: 'A persona tends to lean on your most developed function, because that is what gets rewarded. The free map shows which function seems to lead for you, and which one the role is likely to leave out.' },
    faq: [
      { q: 'What is the persona in Jungian psychology?', a: 'The social face or role a person adopts to meet the expectations of the world. Jung took the word from the mask worn by actors in classical theater.' },
      { q: 'Is the persona a bad thing?', a: 'No. Jung thought a persona was necessary for social life. It becomes a problem only when a person believes the role is all they are.' },
      { q: 'What is the difference between the persona and the shadow?', a: 'The persona is what you show. The shadow is what you hide, including from yourself. Jung saw them as compensating each other: the brighter the persona, the darker the shadow tends to be.' },
    ],
    seo: { title: 'The Persona in Jungian Psychology: The Social Mask | TypeJung', description: 'What Carl Jung meant by the persona: the public face you need and must not mistake for yourself. Why identifying with a role costs so much, with sources.' },
  },
  {
    slug: 'shadow',
    region: 'shadow',
    aka: ['shadow self', 'shadow side'],
    oneLine: 'Everything about you that your conscious self-image leaves out, for better and for worse.',
    answer: 'The shadow is Jung\'s name for the parts of your personality that you do not identify with: traits, wishes and capacities that were pushed out of awareness because they did not fit the person you needed to be. It is not evil by definition. It holds what is unlived, including strengths.',
    jung: [
      { text: 'The shadow is a moral problem that challenges the whole ego-personality, for no one can become conscious of the shadow without considerable moral effort.', work: 'cw9ii', essay: 'The Shadow', locator: '§14', verifiedAt: PCZ },
      { text: 'The shadow [is] that hidden, repressed, for the most part inferior and guilt-laden personality whose ultimate ramifications reach back into the realm of our animal ancestors and so comprise the whole historical aspect of the unconscious.', work: 'cw9ii', essay: 'Conclusion', locator: '§422', verifiedAt: PCZ },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung used the word shadow for the part of the personality that the [[ego]] has not accepted as its own. Much of it forms early. A child learns which reactions bring approval and which bring trouble, and the second group goes underground. What is hidden does not disappear. It stays active in the [[personal-unconscious]] and keeps its energy.',
        'He treated the shadow first as a personal problem and only second as an archetypal one. The personal shadow can be known with honest effort, because it is made of your own history. Behind it stands a collective layer, the human capacity for destructiveness, which no individual fully takes in.',
      ] },
      { h: 'How it shows up', p: [
        'The clearest sign is [[projection]]: a quality you cannot see in yourself becomes glaring in someone else. Strong, repeated irritation at one kind of person is the classic clue. The shadow also appears in slips, in what you do when tired or under pressure, in humor that goes too far, and in dreams, where Jung observed that it usually takes the form of a figure of the dreamer\'s own sex.',
        'In typology the [[inferior-function]] is closely tied to the shadow. The least developed function is the easiest door for unconscious contents, which is why a careful thinker can be flooded by raw feeling, or an intuitive can be thrown by a physical detail.',
      ] },
      { h: 'Why it matters', p: [
        'Jung\'s point was practical. A shadow that stays unconscious does not stay quiet. It is lived out indirectly, through blame, moral certainty and sudden reversals, and on a large scale through scapegoating. A shadow that is recognized becomes something you can take responsibility for. He also insisted that it contains value: instinct, spontaneity, anger that protects, ambition that was shamed. Meeting it is the first stage of [[individuation]], and in his account it comes before the encounter with the [[anima]] or [[animus]].',
      ] },
      { h: 'Working with it', p: [
        'Jung did not offer a technique that removes the shadow. He described an attitude: notice the reaction, withdraw the projection, admit the trait without acting it out, and carry the tension that follows. Integration means the ego becomes wider and less brittle. It does not mean the shadow becomes pleasant, or that every impulse deserves expression.',
      ] },
    ],
    misread: [
      '"The shadow is your dark or evil side." Jung described it as mostly inferior, primitive and unadapted rather than wicked, and said it also holds good qualities that were never lived.',
      '"Shadow work is a set of journal prompts that clears it out." For Jung the shadow is never finished. It is a moral problem you return to, and prompts are only a way to start noticing.',
      '"Integrating the shadow means acting on it." He meant becoming conscious of it and owning it. Acting it out is the opposite of integration.',
      '"The shadow is the same as the unconscious." It is one part. The unconscious also holds complexes, the anima or animus, and archetypal material that was never personal.',
    ],
    related: ['projection', 'persona', 'ego', 'personal-unconscious', 'inferior-function', 'individuation'],
    read: [
      { work: 'cw9ii', where: 'Chapter II, "The Shadow". A few pages, and the best place to start.' },
      { work: 'cw11', where: '"Psychology and Religion", on what happens when the shadow is denied.' },
      { work: 'mhs', where: 'Part 3, "The Process of Individuation" by Marie-Louise von Franz, on meeting the shadow in dreams.' },
    ],
    cta: { kind: 'map', text: 'In Jung\'s typology the shadow most often speaks through your least developed function. The free map shows which function that is likely to be for you.' },
    faq: [
      { q: 'Is the shadow the same as the unconscious?', a: 'No. The shadow is the part of the unconscious made of what you have rejected about yourself. Jung also described complexes, the anima and animus, and a collective layer of archetypes that was never personal.' },
      { q: 'Can you get rid of your shadow?', a: 'Jung thought not. Everyone has one, and trying to be rid of it only makes it more unconscious. The aim is to know it and take responsibility for it.' },
      { q: 'How do I recognize my shadow?', a: 'Look at what irritates you out of proportion in other people, what you do under pressure that surprises you, and the same-sex figures who trouble you in dreams. Jung treated these as its usual signs.' },
    ],
    seo: { title: 'The Shadow in Jungian Psychology: What Jung Meant | TypeJung', description: 'What Carl Jung meant by the shadow, in plain words and in his own, with sources. How it shows up, how it is misread, and what working with it involves.' },
  },
  {
    slug: 'anima',
    region: 'anima-animus',
    aka: ['the anima', 'inner feminine'],
    oneLine: 'Jung\'s name for the inner feminine image in a man, and the moods and fascinations it produces.',
    answer: 'The anima is Jung\'s term for the unconscious feminine side of a man, experienced as an inner figure and as moods, attractions and fantasies. He saw it as both a personal complex, shaped by a man\'s history with women, and an archetype. Later Jungians have widened and questioned the idea.',
    jung: [
      { text: 'The anima is the archetype of life itself.', work: 'cw9i', essay: 'Archetypes of the Collective Unconscious', locator: '§66', verifiedAt: LEX },
      { text: 'Though the effects of anima and animus can be made conscious, they themselves are factors transcending consciousness and beyond the reach of perception and volition.', work: 'cw9ii', essay: 'The Syzygy: Anima and Animus', locator: '§40', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung held that every man carries an inner image of woman, formed partly by his own experience, beginning with his mother, and partly by an inherited pattern. Because a man\'s conscious identity is usually built as masculine, the qualities his culture codes as feminine stay undeveloped and unconscious. They gather around this image, which Jung called the anima, using the Latin word for soul.',
        'He described the anima as a bridge. Where the [[persona]] faces the outer world, the anima faces inward and connects the [[ego]] to the unconscious. She shows up as mood, as inspiration, and above all in [[projection]].',
      ] },
      { h: 'How it shows up', p: [
        'The classic sign is fascination: an immediate, magical attraction to someone who seems to carry everything a man lacks. Jung read this as the inner image laid over a real person. He also saw the anima behind unexplained moods, touchiness and sentimentality in men who think of themselves as purely rational. In dreams she appears as an unknown woman, and he proposed that the figure changes as a man matures, from instinctual to romantic to spiritual to wise.',
      ] },
      { h: 'Why it matters', p: [
        'For Jung the meeting with the anima follows the meeting with the [[shadow]] and is harder. He called the first the apprentice-piece and the second the master-piece. The work is to stop being possessed by moods and projections and to relate to the inner figure as a source of feeling, imagination and connection to the depths. He thought a man who loses all contact with her after midlife becomes rigid and joyless.',
      ] },
      { h: 'A contested idea', p: [
        'This is the part of Jung\'s psychology most revised since his death. He tied the anima to men and the [[animus]] to women and filled both with the gender assumptions of his time. Many later Jungians treat them as capacities present in everyone, or speak of an inner other without fixing its gender. It is fair to read his descriptions as observations about his patients and his era, and to keep the core idea: the unconscious often appears as a figure unlike the conscious self.',
      ] },
    ],
    misread: [
      '"The anima is a man\'s feminine side, meaning sensitivity." Jung meant an autonomous inner figure with its own will, not a set of gentle traits.',
      '"Your anima is your ideal woman or your soulmate." The feeling of fated attraction is what he called a projection of the anima. The real person is someone else.',
      '"Anima theory is settled Jungian doctrine." It is debated, and many contemporary Jungians reject its gender assumptions.',
    ],
    related: ['animus', 'projection', 'shadow', 'persona', 'archetypes', 'self'],
    read: [
      { work: 'cw9ii', where: 'Chapter III, "The Syzygy: Anima and Animus". Short and late.' },
      { work: 'cw7', where: '"Anima and Animus". Longer, with more examples.' },
      { work: 'cw9i', where: '"Concerning the Archetypes, with Special Reference to the Anima Concept".' },
    ],
    cta: { kind: 'read', book: 'aion', text: 'Jung\'s shortest account of anima and animus is a single chapter of Aion. The guide explains how to read it without the rest of the book.' },
    faq: [
      { q: 'What is the anima in simple terms?', a: 'In Jung\'s psychology, the unconscious feminine image in a man. It appears as an inner figure in dreams and as moods, attractions and fantasies in waking life.' },
      { q: 'What are the four stages of the anima?', a: 'Jung sketched four levels, which he named after Eve, Helen, Mary and Sophia: instinctual, romantic, spiritual and wise. He offered them as a rough picture of development, not a strict sequence.' },
      { q: 'Do women have an anima?', a: 'Jung said no: he assigned the anima to men and the animus to women. Many later Jungians disagree and treat both as present in everyone.' },
    ],
    seo: { title: 'The Anima in Jung\'s Psychology: Meaning and Stages | TypeJung', description: 'What Carl Jung meant by the anima: the inner feminine image in a man, how it appears in moods and projection, its four stages, and why the idea is debated.' },
  },
  {
    slug: 'animus',
    region: 'anima-animus',
    aka: ['the animus', 'inner masculine'],
    oneLine: 'Jung\'s name for the inner masculine image in a woman, heard as conviction and opinion.',
    answer: 'The animus is Jung\'s term for the unconscious masculine side of a woman, the counterpart of the anima in a man. He described it as a source of unexamined opinions when unconscious and of focus, courage and meaning when related to. It is among his most criticized ideas.',
    jung: [
      { text: 'Thus the animus is a psychopomp, a mediator between the conscious and the unconscious and a personification of the latter.', work: 'cw9ii', essay: 'The Syzygy: Anima and Animus', locator: '§33', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung reasoned by symmetry. If a man\'s unconscious is personified by a feminine figure, a woman\'s must be personified by a masculine one. He called it the animus, Latin for mind or spirit. Like the [[anima]] it is partly personal, shaped by a woman\'s father and the men she has known, and partly archetypal.',
        'Where he linked the anima with mood and relatedness, he linked the animus with word, judgment and principle. He thought that in its unconscious form it speaks as a chorus of ready-made opinions: sweeping statements that feel like convictions but were never thought through.',
      ] },
      { h: 'How it shows up', p: [
        'In Jung\'s descriptions, and in those of his wife Emma Jung, the unrelated animus is argumentative, absolute and critical. It turns outward against others, or inward as a voice that says nothing she does is good enough. In [[projection]] it falls on men who seem to embody authority, intellect or spiritual power. In dreams it tends to appear as a group of men or a single commanding figure.',
      ] },
      { h: 'Its value', p: [
        'Jung insisted that the animus also has a positive side. As a figure related to instead of obeyed, it becomes what he called a psychopomp, a guide between consciousness and the unconscious. In that role it lends the capacity for reflection, deliberate action and commitment to an idea. Emma Jung outlined a development from power, through deed and word, to meaning. Her essay on the animus, first given as a lecture in Zurich in 1931, is the fullest early account by a woman in Jung\'s circle.',
      ] },
      { h: 'A contested idea', p: [
        'No part of Jung\'s work has aged worse. His portraits of animus-ridden women read today as the prejudices of a man of his generation, and the theory assumes that thinking belongs naturally to men and feeling to women. Most contemporary Jungians have dropped that assumption. What many keep is narrower: anyone can be gripped by an inner voice of borrowed certainty, and it helps to learn to question it.',
      ] },
    ],
    misread: [
      '"The animus is a woman\'s inner man, meaning assertiveness." Jung meant an autonomous inner figure and its effects, not a trait.',
      '"Animus possession explains opinionated women." That reading repeats the bias in Jung\'s own text. The useful observation applies to anyone: unexamined convictions that argue instead of think.',
      '"Anima and animus are mirror images." Jung developed the anima from long observation and the animus largely by analogy, a point later Jungians have criticized.',
    ],
    related: ['anima', 'projection', 'shadow', 'archetypes', 'complexes'],
    read: [
      { work: 'cw9ii', where: 'Chapter III, "The Syzygy: Anima and Animus".' },
      { work: 'cw7', where: '"Anima and Animus".' },
      { work: 'other', where: 'Emma Jung, *Animus and Anima* (1957). Two essays, the first a fuller and more sympathetic account than her husband\'s.' },
    ],
    cta: { kind: 'read', book: 'aion', text: 'The chapter on anima and animus in Aion is the place to see what Jung claimed in his own words, and to judge it for yourself.' },
    faq: [
      { q: 'What is the animus in simple terms?', a: 'In Jung\'s psychology, the unconscious masculine image in a woman. He described it as speaking through fixed opinions when unconscious and as a source of focus and meaning when a woman relates to it consciously.' },
      { q: 'What are the stages of the animus?', a: 'Emma Jung described four: power, deed, word and meaning. Like the anima stages, they are a rough sketch of development and not a fixed ladder.' },
      { q: 'Is the animus concept sexist?', a: 'Many readers and many Jungian analysts think Jung\'s account is, because it assumes fixed masculine and feminine natures. Contemporary versions usually separate the idea from gender.' },
    ],
    seo: { title: 'The Animus in Jung\'s Psychology: What It Means | TypeJung', description: 'What Carl Jung meant by the animus: the inner masculine image in a woman, its negative and positive forms, Emma Jung\'s four stages, and why it is criticized.' },
  },
  {
    slug: 'self',
    region: 'self',
    aka: ['the Self', 'wholeness'],
    oneLine: 'The whole of who you are, conscious and unconscious, and the center that organizes it.',
    answer: 'The Self is Jung\'s term for the totality of the personality, conscious and unconscious, and for its organizing center. The ego is only the center of consciousness. The Self is larger, can never be fully known, and is experienced through symbols of wholeness such as the circle or the mandala.',
    jung: [
      { text: 'As an empirical concept, the self designates the whole range of psychic phenomena in man. It expresses the unity of the personality as a whole.', work: 'cw6', essay: 'Definitions', locator: '§789', verifiedAt: LEX },
      { text: 'The self is not only the centre, but also the whole circumference which embraces both conscious and unconscious; it is the centre of this totality, just as the ego is the centre of consciousness.', work: 'cw12', essay: 'Introduction', locator: '§44', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung needed a word for the personality as a whole, including everything the [[ego]] does not know about. He chose Self, following Eastern philosophy, and gave it two meanings at once: the totality of the psyche and the center that orders it. He admitted the paradox and kept it.',
        'Because part of it is unconscious, the Self can never be completely described. It is a border concept, known by its effects. Jung observed that symbols of the Self cannot be told apart from images of God in religious traditions, and insisted that as a psychologist he could say nothing about God as such.',
      ] },
      { h: 'How it shows up', p: [
        'The Self appears in dreams and myths as figures who stand above the ego, such as a king, a wise elder or a divine child, and in abstract forms that suggest totality: the circle, the square, the fourfold pattern, the [[mandala]]. Jung noticed that such images tend to arise in periods of disorientation, as if the psyche were restoring a center. He recorded the same thing in himself. Toward the end of the First World War he sketched a small circular drawing in a notebook each morning, and came to read the drawings as reports on his inner state.',
      ] },
      { h: 'Ego and Self', p: [
        'The relationship between the two is the axis of Jung\'s psychology. An ego cut off from the Self feels empty and arbitrary. An ego that identifies with the Self suffers [[inflation]] and mistakes itself for something godlike. The healthy position is in between: the ego remains itself and learns that it is not the only authority in the house.',
      ] },
      { h: 'Why it matters', p: [
        'Jung called the goal of [[individuation]] the synthesis of the self: becoming over a lifetime the particular whole that one already potentially is. He did not describe it as reaching perfection. Wholeness in his sense includes the [[shadow]] and the tension of [[opposites]], and it is approached, never completed.',
      ] },
    ],
    misread: [
      '"The Self is your best self." Jung meant the whole personality, including what you dislike and do not know. It is not an improved ego.',
      '"The Self is the same as the ego." The ego is the center of consciousness only. Confusing the two is what he called inflation.',
      '"Jung said the Self is God." He said its symbols cannot be distinguished empirically from God-images, and that psychology cannot go further than that.',
    ],
    related: ['ego', 'individuation', 'mandala', 'inflation', 'opposites', 'archetypes'],
    read: [
      { work: 'cw9ii', where: 'Chapter IV, "The Self".' },
      { work: 'cw6', where: 'Definitions, under "Self".' },
      { work: 'cw12', where: 'Part I, the introduction. On the Self as center and circumference.' },
    ],
    cta: { kind: 'read', book: 'memories-dreams-reflections', text: 'Jung\'s own experience of the Self, including the mandalas he drew each morning, is told in his memoir. It is the most readable way into the idea.' },
    faq: [
      { q: 'What is the Self in Jungian psychology?', a: 'The totality of the personality, conscious and unconscious, and the center that organizes it. Jung distinguished it from the ego, which is the center of consciousness only.' },
      { q: 'Why is Self capitalized?', a: 'Jung\'s translators usually wrote it in lower case. Many later writers capitalize it to mark the difference from the everyday word, and from the ego.' },
      { q: 'How do you experience the Self?', a: 'Indirectly, according to Jung: through symbols of wholeness in dreams and imagination, and through moments when life seems ordered by something larger than conscious intention.' },
    ],
    seo: { title: 'The Self in Jung\'s Psychology: The Central Idea | TypeJung', description: 'What Carl Jung meant by the Self: the whole personality and its organizing center, how it differs from the ego, how it appears in symbols, and why it matters.' },
  },
  {
    slug: 'personal-unconscious',
    region: 'personal-unconscious',
    aka: ['the personal unconscious'],
    oneLine: 'What your own life has forgotten, pushed aside or never quite noticed.',
    answer: 'The personal unconscious is the layer of the unconscious that comes from an individual\'s own life: forgotten experiences, repressed memories and wishes, impressions too faint to register, and contents not yet ready for awareness. It is organized in complexes and contains the shadow. Beneath it Jung placed the collective unconscious.',
    jung: [
      { text: 'The personal unconscious contains lost memories, painful ideas that are repressed (i.e., forgotten on purpose), subliminal perceptions, by which are meant sense-perceptions that were not strong enough to reach consciousness, and finally, contents that are not yet ripe for consciousness.', work: 'cw7', essay: 'The Personal and the Collective Unconscious', locator: '§103', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung divided the unconscious into two layers. The upper one is personal. Everything in it was acquired during a lifetime and could in principle have been conscious. It includes what you once knew and forgot, what you took in without noticing, what was too painful to keep in view, and what is still forming and has not yet reached awareness. None of it is foreign to the person. It is the unlived and unremembered part of one particular biography.',
        'This layer corresponds roughly to what Freud meant by the unconscious, with a difference in emphasis. Freud stressed repression. Jung added the merely forgotten, the subliminal and the not yet ripe, so that the personal unconscious is a living margin of consciousness as well as a storehouse of the unwanted.',
      ] },
      { h: 'How it is organized', p: [
        'Its contents are not loose. They cluster around emotionally charged themes into [[complexes]], which Jung discovered through his word association experiments. A complex has its own energy and a degree of independence, and when one is touched a person reacts out of proportion. The [[shadow]] is the part of the personal unconscious that contradicts the conscious self-image.',
      ] },
      { h: 'Why it matters', p: [
        'Jung treated the personal unconscious as the first territory of self-knowledge. Its contents can be recovered and owned, because they are yours. Working through them, he thought, relieves much ordinary suffering and removes a layer of [[projection]]. It also clears the view: only when personal material is recognized as personal can one tell it from contents that come from the deeper [[collective-unconscious]].',
      ] },
      { h: 'Where the line falls', p: [
        'The boundary between the two layers is a working distinction. A person\'s father complex is personal in its details and archetypal at its core, since it forms around a pattern every human inherits. Jung used the distinction to ask a practical question of any dream or symptom: does this come from my own history, or from something older than me? Most material turns out to be both: a personal surface over an older pattern.',
      ] },
    ],
    misread: [
      '"The unconscious is where repressed things go." Repression fills only part of it. Jung also counted the forgotten, the unnoticed and the not yet conscious.',
      '"Personal unconscious and shadow are the same." The shadow is one content of the personal unconscious, the part that conflicts with how you see yourself.',
      '"It is a place in the mind." It is a way of describing mental contents that are not currently conscious, not a location.',
    ],
    related: ['collective-unconscious', 'complexes', 'shadow', 'ego', 'projection', 'psyche'],
    read: [
      { work: 'cw7', where: '"The Personal and the Collective Unconscious". The clearest statement of the two layers.' },
      { work: 'cw8', where: '"A Review of the Complex Theory". How the personal layer is structured.' },
    ],
    cta: { kind: 'practice', practice: 'dream-journal', text: 'Jung thought dreams were the most direct view into the personal unconscious. Keeping a record of them is the simplest way to start looking.' },
    faq: [
      { q: 'What is the personal unconscious?', a: 'In Jung\'s model, the layer of the unconscious made of an individual\'s own forgotten, repressed or unnoticed experience. It is distinct from the collective unconscious, which he held to be inherited and shared.' },
      { q: 'What is the difference between the personal and collective unconscious?', a: 'The personal unconscious comes from your own life and differs from person to person. The collective unconscious, in Jung\'s theory, is common to everyone and is made of inherited patterns called archetypes.' },
    ],
    seo: { title: 'The Personal Unconscious: Jung\'s Definition | TypeJung', description: 'What Carl Jung meant by the personal unconscious: forgotten, repressed and unnoticed contents from your own life, organized in complexes and holding the shadow.' },
  },
  {
    slug: 'collective-unconscious',
    region: 'collective-unconscious',
    aka: ['the collective unconscious', 'objective psyche'],
    oneLine: 'The inherited layer of the psyche that Jung believed all humans share.',
    answer: 'The collective unconscious is Jung\'s hypothesis that beneath the personal unconscious lies a layer of the psyche that is inherited and common to all people. It does not hold memories or ideas. It holds archetypes: inborn patterns that shape how humans typically perceive, feel and imagine.',
    jung: [
      { text: 'The collective unconscious contains the whole spiritual heritage of mankind\'s evolution, born anew in the brain structure of every individual.', work: 'cw8', essay: 'The Structure of the Psyche', locator: '§342', verifiedAt: LEX },
      { text: 'It is not . . . a question of inherited ideas but of inherited possibilities of ideas.', work: 'cw9i', essay: 'Concerning the Archetypes and the Anima Concept', locator: '§136', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung arrived at the idea from two directions. In psychiatric work he met fantasies and delusions that resembled myths the patients were unlikely to have known. In his own dreams and in comparative study of religion, alchemy and folklore he kept finding the same motifs: the hero, the descent, the divine child, the great mother, the circle. He concluded that the psyche, like the body, has an inherited structure.',
        'What is inherited, he stressed, is form and not content. Nobody is born with images of dragons. People are born with a readiness to form certain kinds of images and to respond in typical ways to certain situations, such as birth, death, the mother or the stranger. He called these forms [[archetypes]].',
      ] },
      { h: 'How it shows up', p: [
        'Its contents reach consciousness indirectly. Jung pointed to dreams with an impersonal, mythic quality, to [[symbols]] that carry more feeling than the dreamer can explain, to religious experience, and to the stories cultures tell independently of one another. He also saw it in collective behavior, when a crowd or a nation is seized by an idea.',
      ] },
      { h: 'How to hold the idea', p: [
        'The collective unconscious is not a shared mind, a telepathic field or a record of ancestral memories, though it is often described that way. Jung presented it as a psychological hypothesis and compared archetypes to instincts. It remains outside mainstream academic psychology, which finds it hard to test. It is best read as a framework that made sense of patterns Jung observed, and judged by how well it does that.',
      ] },
      { h: 'Why it matters', p: [
        'The idea changes what counts as personal. In Jung\'s view some of what moves a person, the pull of a role, the terror of a nightmare, the force of falling in love, is not about their biography at all. Recognizing the impersonal element can reduce shame and [[inflation]] alike: the experience is human before it is yours.',
      ] },
    ],
    misread: [
      '"We inherit our ancestors\' memories." Jung said the opposite: what is inherited is the possibility of forming certain images, not the images.',
      '"It means we are all psychically connected." He meant that human psyches share a common structure, as bodies do. He did not mean a group mind.',
      '"It has been proven by science." It has not. It is a hypothesis that most academic psychologists do not use.',
    ],
    related: ['archetypes', 'personal-unconscious', 'symbols', 'dreams', 'self', 'numinous'],
    read: [
      { work: 'cw9i', where: '"Archetypes of the Collective Unconscious" and "The Concept of the Collective Unconscious". The second is the short version.' },
      { work: 'cw8', where: '"The Structure of the Psyche".' },
      { work: 'mhs', where: 'Part 1, "Approaching the Unconscious".' },
    ],
    cta: { kind: 'read', book: 'archetypes-and-the-collective-unconscious', text: 'The volume that carries this idea is long, but two of its essays do most of the work. The guide says which, and in what order.' },
    faq: [
      { q: 'What is the collective unconscious in simple terms?', a: 'Jung\'s idea that part of the unconscious is inherited and the same in everyone, consisting of archetypes: built-in patterns for typical human experiences.' },
      { q: 'Is the collective unconscious real?', a: 'It is a hypothesis. Jung thought the recurrence of similar motifs across cultures and in dreams supported it. Most academic psychology does not accept it as established, and it is difficult to test.' },
      { q: 'What is in the collective unconscious?', a: 'Archetypes, according to Jung: patterns such as the mother, the hero, the shadow and the Self, which have no fixed content until experience fills them in.' },
    ],
    seo: { title: 'The Collective Unconscious: What Jung Meant | TypeJung', description: 'What Carl Jung meant by the collective unconscious: an inherited layer of the psyche made of archetypes. What it is, what it is not, and how to hold the idea.' },
  },
  {
    slug: 'archetypes',
    region: 'archetypes',
    aka: ['Jungian archetypes', 'archetype'],
    oneLine: 'Inherited patterns that shape how humans typically imagine, feel and act.',
    answer: 'Archetypes are, in Jung\'s theory, the inherited structuring patterns of the collective unconscious. They are not images or ideas in themselves. They are tendencies to form certain images and to respond in typical ways to typical situations, such as birth, death, the mother, the hero or the stranger.',
    jung: [
      { text: 'Archetypes are, by definition, factors and motifs that arrange the psychic elements into certain images, characterized as archetypal, but in such a way that they can be recognized only from the effects they produce.', work: 'cw11', essay: 'A Psychological Approach to the Dogma of the Trinity', locator: '§222, note 2', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'Jung distinguished the archetype as such from the archetypal image. The archetype is an inherited form with no content, which he compared to the axial system of a crystal: it determines the structure but has no material existence of its own. The image is what appears when the form is filled by culture and personal experience. The mother archetype is the same everywhere. The images of mothers, goddesses and witches differ.',
        'He often linked archetypes to instincts. An instinct is a typical way of acting, an archetype a typical way of apprehending. He described the archetype as the instinct\'s perception of itself.',
      ] },
      { h: 'How they show up', p: [
        'Archetypes appear in myths, fairy tales and religions, and in the dreams and fantasies of individuals who have never met the parallel material. They are felt before they are understood. An archetypal image has a charge Jung called [[numinous]]: it fascinates, frightens or compels. Figures he described include the [[shadow]], the [[anima]] and [[animus]], the [[great-mother|mother]], the [[wise-old-man]], the [[hero]], the [[trickster]] and the [[self]]. He also counted situations and processes, such as rebirth and the journey.',
      ] },
      { h: 'Jung versus later use', p: [
        'Jung never gave a fixed list and said the number of archetypes was indefinite. The neat sets found online, such as the twelve archetypes used in branding or quizzes that assign you one, come from later authors, notably Carol Pearson and Margaret Mark, and are not his. For Jung an archetype is not a personality type. Everyone has all of them, and at different times any of them may be active.',
      ] },
      { h: 'Why it matters', p: [
        'The practical use of the idea is recognition. When a reaction is far larger than the situation warrants, or a figure in your life seems more than human, Jung would ask which pattern has been activated. Naming it does not explain it away. It separates the person in front of you from the image, and your own life from a role that is living you.',
      ] },
    ],
    misread: [
      '"There are twelve Jungian archetypes." Jung gave no fixed number. The list of twelve is a later invention for marketing and self-help.',
      '"My archetype is the Sage," or any single one. In Jung\'s theory archetypes are shared human patterns, not types of people.',
      '"Archetypes are inherited images." He distinguished the inherited form from the images it produces, which vary by culture and person.',
      '"Archetypes are stereotypes or tropes." A trope is a convention in stories. An archetype, for Jung, is the psychic pattern that makes certain conventions recur.',
    ],
    related: ['collective-unconscious', 'symbols', 'numinous', 'shadow', 'anima', 'self'],
    read: [
      { work: 'cw9i', where: '"Archetypes of the Collective Unconscious". The essential essay.' },
      { work: 'cw8', where: '"On the Nature of the Psyche" and "Instinct and the Unconscious". For the link to instinct.' },
      { work: 'mhs', where: 'Part 1. The plainest account he wrote.' },
    ],
    cta: { kind: 'read', book: 'man-and-his-symbols', text: 'The easiest way to see archetypes at work is in the illustrated book Jung planned for general readers. Start there before the Collected Works.' },
    faq: [
      { q: 'What are the Jungian archetypes?', a: 'Inherited patterns of the collective unconscious that shape typical human experiences. Jung described many, including the shadow, anima and animus, the mother, the hero, the wise old man, the trickster and the Self, and gave no fixed list.' },
      { q: 'How many archetypes did Jung identify?', a: 'He did not count them and said they were indefinite in number. The popular list of twelve comes from later writers, not from Jung.' },
      { q: 'Can I find out which archetype I am?', a: 'Not in Jung\'s sense. He did not treat archetypes as personality types. He thought every person carries all of them, with different ones active at different times.' },
    ],
    seo: { title: 'Jungian Archetypes: What Jung Actually Meant | TypeJung', description: 'What Carl Jung meant by archetypes: inherited patterns, not images or personality types. Why there is no list of twelve, and how to recognize one at work.' },
  },
  {
    slug: 'complexes',
    region: 'complexes',
    aka: ['complex', 'feeling-toned complex'],
    oneLine: 'Emotionally charged clusters in the unconscious that can take over how you react.',
    answer: 'A complex is a cluster of feelings, memories and ideas gathered around a charged theme, such as mother, father, power or inferiority. Complexes are normal and everyone has them. Jung discovered that they behave like small independent personalities, and that the ones we do not recognize are the ones that run us.',
    jung: [
      { text: 'Everyone knows nowadays that people "have complexes." What is not so well known, though far more important theoretically, is that complexes can have us.', work: 'cw8', essay: 'A Review of the Complex Theory', locator: '§200', verifiedAt: LEX },
      { text: 'A complex becomes pathological only when we think we have not got it.', work: 'cw16', essay: 'Psychotherapy and a Philosophy of Life', locator: '§179', verifiedAt: LEX },
    ],
    sections: [
      { h: 'Where the idea came from', p: [
        'The complex was Jung\'s first major discovery, made at the Burghölzli hospital in Zurich in the early 1900s. In his word association experiments a subject answered a list of words with the first word that came to mind. Jung noticed that certain words produced delays, slips, repetitions or bodily reactions. The disturbed responses clustered around themes the person found painful. He called these clusters feeling-toned complexes. The work made his name and led to his contact with Freud.',
      ] },
      { h: 'What Jung meant', p: [
        'A complex has a core, usually an archetypal pattern such as mother or father, and a shell of personal associations gathered through experience. It carries its own emotional energy and a degree of autonomy. When something touches it, it is constellated: it takes over attention, bends perception, and speaks or acts through the person before the [[ego]] can intervene. Jung called complexes splinter psyches and described them as the architects of dreams. He went so far as to say that the complex, and not the dream as Freud thought, is the royal road to the unconscious.',
      ] },
      { h: 'How they show up', p: [
        'Disproportion is the sign. A mild remark produces rage, a routine task produces paralysis, a certain kind of person produces instant devotion or dislike. Afterward people say they do not know what came over them, which Jung took literally. The ego is itself a complex in his theory, the one at the center of consciousness, and the others compete with it. He also called complexes focal points of psychic life that we would not wish to be without, since without them psychic activity would come to a standstill.',
      ] },
      { h: 'Working with them', p: [
        'Jung did not think complexes could or should be eliminated. They are the building blocks of the psyche and the source of much of its energy. The aim is to become conscious of them, so that a reaction can be noticed as it begins and the complex loses its power to act unseen. An unrecognized complex is typically met outside, through [[projection]].',
      ] },
    ],
    misread: [
      '"Having a complex means something is wrong with you." Jung said that everyone has complexes and that having them is not a disorder.',
      '"A complex is a belief you can argue yourself out of." It is an emotional structure with its own energy. Insight helps, but it does not dissolve on command.',
      '"Inferiority complex and Oedipus complex are Jung\'s." The first is associated with Alfred Adler and the second with Freud. Jung supplied the general theory of complexes.',
    ],
    related: ['personal-unconscious', 'archetypes', 'ego', 'projection', 'shadow', 'psychic-energy'],
    read: [
      { work: 'cw8', where: '"A Review of the Complex Theory". Short, clear and late.' },
      { work: 'cw9i', where: '"Psychological Aspects of the Mother Archetype". The most detailed portrait of one complex.' },
    ],
    cta: { kind: 'practice', practice: 'shadow-work', text: 'Complexes are easiest to catch in the moment of overreaction. The shadow practice shows a careful way to use those moments.' },
    faq: [
      { q: 'What is a complex in Jungian psychology?', a: 'A cluster of emotionally charged ideas, memories and feelings organized around a theme. It acts with some independence from conscious will and shapes reactions when it is triggered.' },
      { q: 'How did Jung discover complexes?', a: 'Through word association experiments in the early 1900s. Delays and disturbances in people\'s responses pointed to hidden emotional themes, which he named complexes.' },
      { q: 'Can you get rid of a complex?', a: 'Jung thought not, and did not think it desirable. What changes with awareness is how much a complex controls you.' },
    ],
    seo: { title: 'Complexes in Jung\'s Psychology: Meaning and Origin | TypeJung', description: 'What Carl Jung meant by a complex: an emotionally charged cluster in the unconscious that can take over your reactions. How he found them and what to do.' },
  },
  {
    slug: 'psychic-energy',
    region: 'threshold',
    aka: ['libido', 'psychic energy'],
    oneLine: 'Jung\'s wider meaning of libido: the general energy of mental life, not only sexual drive.',
    answer: 'Jung used libido to mean psychic energy in general: the intensity or value invested in any mental activity, whether hunger, sex, power, creativity or religious feeling. This was his decisive break with Freud, who defined libido as sexual. Jung treated it as a quantity that flows, gets blocked and is transformed.',
    jung: [
      { text: 'The libido has, as it were, a natural penchant: it is like water, which must have a gradient if it is to flow.', work: 'cw5', essay: 'Symbols of the Mother and of Rebirth', locator: '§337', verifiedAt: LEX },
      { text: 'What is it, at this moment and in this individual, that represents the natural urge of life? That is the question.', work: 'cw7', essay: 'The Structure of the Unconscious', locator: '§488', verifiedAt: LEX },
    ],
    sections: [
      { h: 'What Jung meant', p: [
        'In the 1912 book later revised as *Symbols of Transformation*, Jung argued that libido could not be only sexual, because it plainly feeds interests that have nothing to do with sex. He redefined it as a neutral energy, comparable to energy in physics: something known by its effects and measurable only as more or less. The redefinition cost him his friendship with Freud.',
        'He set out the theory in the essay "On Psychic Energy". Its working principle is that energy is conserved. When interest drains from one area of life it does not vanish. It reappears somewhere else, often in the unconscious, where it animates fantasies, symptoms or a new direction.',
      ] },
      { h: 'How it moves', p: [
        'Jung described two movements. Progression is the forward flow of energy into adaptation to the outer world. Regression is its flow back into the unconscious when adaptation fails. He did not treat regression as simply a setback. The backward movement activates neglected contents, including the [[inferior-function]], that the next adaptation may need. Energy also runs between [[opposites]]: no tension, no flow. A useful picture is a river. It runs forward while the channel is open, and backs up to find another outlet when the channel is blocked.',
      ] },
      { h: 'Transformation', p: [
        'Energy cannot be moved by willpower alone. Jung held that it follows a gradient, and that the psyche turns instinctual energy into cultural activity through [[symbols]]. A symbol attracts energy that would otherwise stay tied up in instinct or symptom and gives it a new form. He called this the canalization of libido and saw ritual, art and religion as its great historical examples.',
      ] },
      { h: 'Why it matters', p: [
        'The idea gives a practical question for any stuck period: where has the energy gone? A depression, in this view, is energy withdrawn from conscious life and working below the surface. Jung looked to [[dreams]] and fantasies for the answer, since they show what the energy is now attached to. The energy has not been lost. The task is to find out what it is doing.',
      ] },
    ],
    misread: [
      '"Libido means sex drive." That is the everyday meaning and close to Freud\'s. Jung meant psychic energy of any kind.',
      '"Psychic energy is a physical force that could be measured." Jung used the physics analogy as a model. He was describing psychological intensity and value.',
      '"Regression is always bad." Jung saw it as a necessary phase in which the psyche gathers what was left behind.',
    ],
    related: ['opposites', 'symbols', 'compensation', 'inferior-function', 'complexes', 'dreams'],
    read: [
      { work: 'cw8', where: '"On Psychic Energy". The full theory.' },
      { work: 'cw5', where: 'Part Two, especially "The Concept of Libido" and "The Transformation of Libido".' },
    ],
    cta: { kind: 'read', book: 'symbols-of-transformation', text: 'The book in which Jung first widened the concept of libido is also the one that ended his collaboration with Freud. The guide explains what to read and what to skip.' },
    faq: [
      { q: 'What did Jung mean by libido?', a: 'Psychic energy in general: the amount of interest or intensity attached to any mental process. He did not restrict it to sexuality, as Freud did.' },
      { q: 'How did Jung and Freud differ on libido?', a: 'Freud defined libido as sexual energy. Jung argued that sexuality is one of several channels for a general psychic energy, alongside hunger, power, creativity and religious impulse. The disagreement was central to their break.' },
    ],
    seo: { title: 'Libido and Psychic Energy in Jung: What He Meant | TypeJung', description: 'What Carl Jung meant by libido: general psychic energy, not only sex drive. Progression, regression, the role of symbols, and the break with Freud.' },
  },
];
