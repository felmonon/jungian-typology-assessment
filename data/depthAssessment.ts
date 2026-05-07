export type FunctionChannel = 'thinking' | 'feeling' | 'sensation' | 'intuition';
export type AttitudeDirection = 'introverted' | 'extraverted';
export type DepthLayer = 'behavioral' | 'inferior' | 'somatic' | 'attitude';

export interface DepthAnswerOption {
  id: string;
  label: string;
  channel?: FunctionChannel;
  inferior?: FunctionChannel;
  attitude?: AttitudeDirection;
  weight?: number;
}

export interface DepthQuestion {
  id: string;
  layer: DepthLayer;
  domain: string;
  prompt: string;
  context?: string;
  options: DepthAnswerOption[];
}

export const FUNCTION_LABELS: Record<FunctionChannel, string> = {
  thinking: 'Thinking',
  feeling: 'Feeling',
  sensation: 'Sensation',
  intuition: 'Intuition',
};

export const FUNCTION_SHORT_LABELS: Record<FunctionChannel, string> = {
  thinking: 'T',
  feeling: 'F',
  sensation: 'S',
  intuition: 'N',
};

export const ATTITUDE_LABELS: Record<AttitudeDirection, string> = {
  introverted: 'Introverted',
  extraverted: 'Extraverted',
};

const noneOption: DepthAnswerOption = {
  id: 'none',
  label: 'None of these fits closely enough',
  weight: 0,
};

const options = {
  thinking: (label: string, id = 'thinking'): DepthAnswerOption => ({ id, label, channel: 'thinking' }),
  feeling: (label: string, id = 'feeling'): DepthAnswerOption => ({ id, label, channel: 'feeling' }),
  sensation: (label: string, id = 'sensation'): DepthAnswerOption => ({ id, label, channel: 'sensation' }),
  intuition: (label: string, id = 'intuition'): DepthAnswerOption => ({ id, label, channel: 'intuition' }),
  inferiorThinking: (label: string, id = 'inferior-thinking'): DepthAnswerOption => ({ id, label, inferior: 'thinking', weight: 1.35 }),
  inferiorFeeling: (label: string, id = 'inferior-feeling'): DepthAnswerOption => ({ id, label, inferior: 'feeling', weight: 1.35 }),
  inferiorSensation: (label: string, id = 'inferior-sensation'): DepthAnswerOption => ({ id, label, inferior: 'sensation', weight: 1.35 }),
  inferiorIntuition: (label: string, id = 'inferior-intuition'): DepthAnswerOption => ({ id, label, inferior: 'intuition', weight: 1.35 }),
  introverted: (label: string, id = 'introverted'): DepthAnswerOption => ({ id, label, attitude: 'introverted' }),
  extraverted: (label: string, id = 'extraverted'): DepthAnswerOption => ({ id, label, attitude: 'extraverted' }),
};

export const depthLayerMeta: Record<DepthLayer, { label: string; shortLabel: string; description: string }> = {
  behavioral: {
    label: 'Behavioral evidence',
    shortLabel: 'Behavior',
    description: 'Scenario questions that look at what you notice first and what you do when external pressure is low.',
  },
  inferior: {
    label: 'Inferior function detection',
    shortLabel: 'Inferior',
    description: 'Stress and relationship triggers that reveal where energy becomes primitive, reactive, or hard to control.',
  },
  somatic: {
    label: 'Somatic indicators',
    shortLabel: 'Body',
    description: 'Body-based questions that track where engagement, threat, and grounding show up physically.',
  },
  attitude: {
    label: 'Energy direction',
    shortLabel: 'Attitude',
    description: 'Questions that separate Jungian introversion and extraversion from social stereotypes.',
  },
};

export const depthQuestions: DepthQuestion[] = [
  {
    id: 'behavior_01',
    layer: 'behavioral',
    domain: 'Relationships',
    prompt: 'You walk into a room where two friends are having a tense conversation. What do you notice first?',
    options: [
      options.thinking('Whether the argument is logically consistent and where the claims break down'),
      options.feeling('Who is being hurt and what the emotional temperature of the room feels like'),
      options.sensation('Who is standing where, their posture, facial tension, and the physical details in the room'),
      options.intuition('What the fight is really about underneath and where the pattern is heading'),
      noneOption,
    ],
  },
  {
    id: 'behavior_02',
    layer: 'behavioral',
    domain: 'Leisure',
    prompt: 'You have a completely free Saturday with no obligations. What do you actually drift toward?',
    options: [
      options.thinking('Researching something, organizing information, improving a system, or solving a problem'),
      options.feeling('Spending meaningful time with people or doing something that feels personally significant'),
      options.sensation('Cooking, moving, making something with your hands, or seeking a concrete sensory experience'),
      options.intuition('Exploring ideas, reading, imagining possibilities, or starting a creative thread'),
      noneOption,
    ],
  },
  {
    id: 'behavior_03',
    layer: 'behavioral',
    domain: 'Work',
    prompt: 'A new problem lands on your desk with incomplete information. Your first useful move is usually to:',
    options: [
      options.thinking('Define the problem, separate assumptions from facts, and build a clear frame'),
      options.feeling('Ask who is affected and what outcome would preserve what matters'),
      options.sensation('Look at the concrete constraints, available resources, and immediate next step'),
      options.intuition('Step back until the hidden pattern or future implication becomes visible'),
      noneOption,
    ],
  },
  {
    id: 'behavior_04',
    layer: 'behavioral',
    domain: 'Conflict',
    prompt: 'In a group conflict, the thing you cannot ignore is:',
    options: [
      options.thinking('Contradictions, unclear standards, or people refusing to follow an argument'),
      options.feeling('The relational damage, exclusion, or loss of mutual regard'),
      options.sensation('What was actually said and done, not what everyone is implying'),
      options.intuition('The larger pattern repeating itself beneath the surface issue'),
      noneOption,
    ],
  },
  {
    id: 'behavior_05',
    layer: 'behavioral',
    domain: 'Learning',
    prompt: 'When learning an unfamiliar subject, you feel oriented once you have:',
    options: [
      options.thinking('A model of the underlying principles and definitions'),
      options.feeling('A reason it matters and a sense of its human value'),
      options.sensation('Examples, demonstrations, and concrete steps you can repeat'),
      options.intuition('The central pattern that connects the details into a larger meaning'),
      noneOption,
    ],
  },
  {
    id: 'behavior_06',
    layer: 'behavioral',
    domain: 'Planning',
    prompt: 'You are planning a trip. Your attention naturally goes first to:',
    options: [
      options.thinking('Budget, timing, constraints, and the most efficient route'),
      options.feeling('Who will enjoy what, how the experience will feel, and what matters to each person'),
      options.sensation('Lodging, food, weather, walking distance, and practical comfort'),
      options.intuition('The mood, theme, and possibilities the trip could open up'),
      noneOption,
    ],
  },
  {
    id: 'behavior_07',
    layer: 'behavioral',
    domain: 'Creativity',
    prompt: 'Someone asks for feedback on a creative project. Your first response tends to track:',
    options: [
      options.thinking('Structure, coherence, weak logic, and whether the parts support the aim'),
      options.feeling('The emotional honesty, value, and whether the work reaches someone'),
      options.sensation('Craft, pacing, texture, polish, and what is concretely present'),
      options.intuition('The symbolic thread, hidden potential, and what the work is trying to become'),
      noneOption,
    ],
  },
  {
    id: 'behavior_08',
    layer: 'behavioral',
    domain: 'Advice',
    prompt: 'A friend asks what they should do about a difficult decision. You instinctively help by:',
    options: [
      options.thinking('Clarifying tradeoffs and testing the decision against consistent criteria'),
      options.feeling('Helping them hear what they value and what outcome they can live with'),
      options.sensation('Bringing them back to facts, timing, money, energy, and real constraints'),
      options.intuition('Pointing out the likely direction of the story if they choose each path'),
      noneOption,
    ],
  },
  {
    id: 'behavior_09',
    layer: 'behavioral',
    domain: 'Meetings',
    prompt: 'A meeting has no agenda and keeps circling. What bothers you most?',
    options: [
      options.thinking('No one is defining terms, deciding criteria, or resolving contradictions'),
      options.feeling('People are talking past each other and ignoring the relational tension'),
      options.sensation('There are no concrete facts, owners, deadlines, or next actions'),
      options.intuition('Everyone is stuck on surface items and missing the real pattern'),
      noneOption,
    ],
  },
  {
    id: 'behavior_10',
    layer: 'behavioral',
    domain: 'Solitude',
    prompt: 'During a quiet evening alone, you most often restore yourself by:',
    options: [
      options.thinking('Reading, writing, analyzing, or putting mental material into order'),
      options.feeling('Returning to music, memory, art, prayer, or something that reconnects you with value'),
      options.sensation('Bathing, stretching, cleaning, cooking, or settling the body and space'),
      options.intuition('Letting the mind wander until an image, idea, or direction starts to form'),
      noneOption,
    ],
  },
  {
    id: 'behavior_11',
    layer: 'behavioral',
    domain: 'Change',
    prompt: 'Plans suddenly change at the last minute. Your automatic response is to:',
    options: [
      options.thinking('Recalculate the plan and decide what still makes sense'),
      options.feeling('Check how people are reacting and whether anyone feels dismissed'),
      options.sensation('Look for the immediate practical adjustment that keeps things moving'),
      options.intuition('Sense what new possibility or hidden risk the change creates'),
      noneOption,
    ],
  },
  {
    id: 'behavior_12',
    layer: 'behavioral',
    domain: 'Career',
    prompt: 'Two job options look similar on paper. What becomes decisive fastest?',
    options: [
      options.thinking('Which role has clearer leverage, better systems, and stronger strategic logic'),
      options.feeling('Which role aligns with your values and the people you want to become responsible to'),
      options.sensation('Which role has the better conditions, daily rhythm, commute, pay, and concrete fit'),
      options.intuition('Which role points toward the future you can already sense forming'),
      noneOption,
    ],
  },
  {
    id: 'behavior_13',
    layer: 'behavioral',
    domain: 'Projects',
    prompt: 'At the beginning of a project, the part that energizes you most is:',
    options: [
      options.thinking('Designing the structure and rules that will make the work hold together'),
      options.feeling('Understanding who the work is for and why it matters'),
      options.sensation('Gathering materials, making the first concrete version, and testing it in reality'),
      options.intuition('Seeing the concept, possibility, or long-range shape of what it could become'),
      noneOption,
    ],
  },
  {
    id: 'behavior_14',
    layer: 'behavioral',
    domain: 'Reading',
    prompt: 'When reading a dense book, you are most likely to mark:',
    options: [
      options.thinking('Definitions, distinctions, claims, and arguments'),
      options.feeling('Lines that name a value, wound, longing, or moral truth'),
      options.sensation('Concrete examples, images, descriptions, and usable practices'),
      options.intuition('Patterns, symbols, future implications, and unexpected connections'),
      noneOption,
    ],
  },
  {
    id: 'behavior_15',
    layer: 'behavioral',
    domain: 'Trust',
    prompt: 'Someone breaks a promise. What registers first?',
    options: [
      options.thinking('The broken agreement and what rule or expectation failed'),
      options.feeling('The violation of trust and what it says about care or respect'),
      options.sensation('The specific action they did or did not take'),
      options.intuition('The pattern this reveals about the person or relationship'),
      noneOption,
    ],
  },
  {
    id: 'behavior_16',
    layer: 'behavioral',
    domain: 'Exploration',
    prompt: 'You arrive in a new city with no plan. You tend to orient by:',
    options: [
      options.thinking('Mapping options, comparing routes, and making a workable plan'),
      options.feeling('Finding places with a mood, story, or human warmth that draws you in'),
      options.sensation('Walking, noticing streets, smells, food, sounds, and what is physically near'),
      options.intuition('Following hints, symbols, side streets, and emerging possibilities'),
      noneOption,
    ],
  },
  {
    id: 'behavior_17',
    layer: 'behavioral',
    domain: 'Disagreement',
    prompt: 'During disagreement, you most want the other person to:',
    options: [
      options.thinking('Be precise, consistent, and willing to test their argument'),
      options.feeling('Acknowledge impact, respect, and what matters emotionally'),
      options.sensation('Stay concrete and talk about what actually happened'),
      options.intuition('See the larger pattern instead of defending the surface event'),
      noneOption,
    ],
  },
  {
    id: 'behavior_18',
    layer: 'behavioral',
    domain: 'Social',
    prompt: 'At a party or gathering, your attention is most naturally caught by:',
    options: [
      options.thinking('Interesting claims, debates, expertise, or systems people are describing'),
      options.feeling('Connection, exclusion, emotional tone, and who feels safe with whom'),
      options.sensation('Lighting, music, food, movement, clothing, and the physical atmosphere'),
      options.intuition('Subtext, hidden motives, emerging alliances, and where the night is going'),
      noneOption,
    ],
  },
  {
    id: 'behavior_19',
    layer: 'behavioral',
    domain: 'Routine',
    prompt: 'When routine starts to feel dead, your first way out is usually:',
    options: [
      options.thinking('Redesigning the system so it makes more sense'),
      options.feeling('Returning to the personal meaning or relational reason behind the routine'),
      options.sensation('Changing the physical setup, rhythm, materials, or immediate environment'),
      options.intuition('Opening a new possibility, experiment, or direction'),
      noneOption,
    ],
  },
  {
    id: 'behavior_20',
    layer: 'behavioral',
    domain: 'Failure',
    prompt: 'After a failure, you most quickly look for:',
    options: [
      options.thinking('The error in reasoning, process, or decision criteria'),
      options.feeling('What the failure means for identity, trust, and what is worth repairing'),
      options.sensation('The concrete cause and the specific thing to do differently next time'),
      options.intuition('The lesson, pattern, or future redirection hidden inside the failure'),
      noneOption,
    ],
  },
  {
    id: 'inferior_01',
    layer: 'inferior',
    domain: 'Stress',
    prompt: 'Under extreme stress, which reaction feels most alien or out of proportion?',
    options: [
      options.inferiorThinking('Becoming coldly critical about competence or intelligence'),
      options.inferiorFeeling('Becoming hypersensitive to slights and convinced people do not value you'),
      options.inferiorSensation('Becoming fixated on physical symptoms, food, comfort, or small sensory details'),
      options.inferiorIntuition('Catastrophizing about hidden dangers and dark future possibilities'),
      noneOption,
    ],
  },
  {
    id: 'inferior_02',
    layer: 'inferior',
    domain: 'Romance',
    prompt: 'You are often drawn to people who carry a quality you admire but struggle to embody. Which one fits best?',
    options: [
      options.inferiorThinking('Brilliantly analytical people who can cut through confusion with logic'),
      options.inferiorFeeling('Emotionally rich, warm, relationally gifted people'),
      options.inferiorSensation('Grounded, physical, present, earthy people'),
      options.inferiorIntuition('Visionary, unpredictable people full of possibility and depth'),
      noneOption,
    ],
  },
  {
    id: 'inferior_03',
    layer: 'inferior',
    domain: 'Embarrassment',
    prompt: 'Which loss of control would feel most embarrassing to admit?',
    options: [
      options.inferiorThinking('I can become rigidly logical in a way that is not actually clear thinking'),
      options.inferiorFeeling('I can be flooded by need, shame, or sensitivity I usually keep hidden'),
      options.inferiorSensation('I can lose contact with my body or get captured by comfort and symptoms'),
      options.inferiorIntuition('I can become irrationally convinced something bad is coming'),
      noneOption,
    ],
  },
  {
    id: 'inferior_04',
    layer: 'inferior',
    domain: 'Projection',
    prompt: 'When you are reactive, what do you most often project onto others?',
    options: [
      options.inferiorThinking('They are incompetent, irrational, or refusing obvious logic'),
      options.inferiorFeeling('They do not care, do not value me, or are emotionally unsafe'),
      options.inferiorSensation('They are careless with concrete reality, health, timing, or resources'),
      options.inferiorIntuition('They have hidden motives, secret plans, or threatening possibilities around them'),
      noneOption,
    ],
  },
  {
    id: 'inferior_05',
    layer: 'inferior',
    domain: 'Pressure',
    prompt: 'When pressure gets high, the function you have the hardest time using cleanly is:',
    options: [
      options.inferiorThinking('Clear analysis without harshness or brittle certainty'),
      options.inferiorFeeling('Direct value judgment without shame, need, or defensiveness'),
      options.inferiorSensation('Steady contact with the body, facts, and what is physically present'),
      options.inferiorIntuition('Trust in possibility and pattern without fear or superstition'),
      noneOption,
    ],
  },
  {
    id: 'inferior_06',
    layer: 'inferior',
    domain: 'Conflict',
    prompt: 'In your worst conflicts, you are most likely to get captured by:',
    options: [
      options.inferiorThinking('Sharp verdicts, arguments, or explanations that simplify too much'),
      options.inferiorFeeling('Feeling unwanted, unchosen, unappreciated, or morally wounded'),
      options.inferiorSensation('Bodily agitation, exhaustion, appetite shifts, or sensory irritability'),
      options.inferiorIntuition('A dark story about what this means and what will happen next'),
      noneOption,
    ],
  },
  {
    id: 'inferior_07',
    layer: 'inferior',
    domain: 'Admiration',
    prompt: 'Which competence in others feels both attractive and slightly intimidating?',
    options: [
      options.inferiorThinking('The ability to name the truth cleanly and argue it without wavering'),
      options.inferiorFeeling('The ability to know what matters and express warmth without self-consciousness'),
      options.inferiorSensation('The ability to be in the body, handle real things, and stay present'),
      options.inferiorIntuition('The ability to sense invisible patterns and trust a future nobody else sees'),
      noneOption,
    ],
  },
  {
    id: 'inferior_08',
    layer: 'inferior',
    domain: 'Defensiveness',
    prompt: 'You become most defensive when someone demands that you:',
    options: [
      options.inferiorThinking('Explain your reasoning with exactness while emotions are high'),
      options.inferiorFeeling('Say what you value or need without analyzing it first'),
      options.inferiorSensation('Attend to your body, limits, and concrete follow-through right now'),
      options.inferiorIntuition('Make room for an unseen possibility that is not yet provable'),
      noneOption,
    ],
  },
  {
    id: 'inferior_09',
    layer: 'inferior',
    domain: 'Collapse',
    prompt: 'When you finally run out of capacity, your collapse usually looks like:',
    options: [
      options.inferiorThinking('Sudden harsh judgments, arguments, rules, or intellectual contempt'),
      options.inferiorFeeling('Emotional volatility, shame, longing, or needing proof that you matter'),
      options.inferiorSensation('Exhaustion, clumsiness, appetite swings, or fixation on bodily comfort'),
      options.inferiorIntuition('Dread, paranoia, ominous meanings, or one terrible future taking over'),
      noneOption,
    ],
  },
  {
    id: 'inferior_10',
    layer: 'inferior',
    domain: 'Recovery',
    prompt: 'After one of these episodes, the hardest part to integrate is:',
    options: [
      options.inferiorThinking('That there was a real need for clean thought underneath the criticism'),
      options.inferiorFeeling('That there was a real value or wound underneath the sensitivity'),
      options.inferiorSensation('That the body was carrying information I had been ignoring'),
      options.inferiorIntuition('That the future fear may have been a distorted signal, not pure nonsense'),
      noneOption,
    ],
  },
  {
    id: 'somatic_01',
    layer: 'somatic',
    domain: 'Engagement',
    prompt: 'When you are deeply engaged in work that matters, where do you feel it most?',
    options: [
      options.thinking('Head, forehead, jaw, or a mental intensity that feels like a focused buzz'),
      options.feeling('Chest, heart area, warmth, ache, expansion, or a felt sense of value'),
      options.sensation('Hands, gut, breath, posture, muscles, or the whole physical body'),
      options.intuition('It is hard to locate; the signal feels diffuse, imaginal, or like just knowing'),
      noneOption,
    ],
  },
  {
    id: 'somatic_02',
    layer: 'somatic',
    domain: 'Anxiety',
    prompt: 'When anxiety hits, where does it usually appear first?',
    options: [
      options.thinking('Throat, jaw, temples, or pressure around speech and thought'),
      options.feeling('Chest constriction, heart racing, or a relational ache'),
      options.sensation('Stomach drop, sweating, shaking, muscle tension, or whole-body activation'),
      options.intuition('Head pressure, scattered mental images, future dread, or inability to land'),
      noneOption,
    ],
  },
  {
    id: 'somatic_03',
    layer: 'somatic',
    domain: 'Grounding',
    prompt: 'What calms you down most reliably?',
    options: [
      options.thinking('Writing thoughts out, listing variables, analyzing the problem'),
      options.feeling('Talking with someone who cares or reconnecting to what matters'),
      options.sensation('Movement, showering, cooking, cleaning, breathing, or touching something textured'),
      options.intuition('Changing context, reading something unrelated, or letting images and ideas move'),
      noneOption,
    ],
  },
  {
    id: 'somatic_04',
    layer: 'somatic',
    domain: 'Overload',
    prompt: 'When overloaded, what do you need before you can function again?',
    options: [
      options.thinking('A clear frame, a written plan, or one coherent explanation'),
      options.feeling('Emotional acknowledgment, repair, or the sense that the situation has meaning'),
      options.sensation('Food, rest, stillness, movement, warmth, or a less stimulating environment'),
      options.intuition('Space for the deeper pattern to surface without immediate demands'),
      noneOption,
    ],
  },
  {
    id: 'somatic_05',
    layer: 'somatic',
    domain: 'Yes signal',
    prompt: 'When something is a real yes, the body signal is closest to:',
    options: [
      options.thinking('Mental click, clean focus, and a sense that the structure locks into place'),
      options.feeling('Warmth, opening, tenderness, or a strong sense of rightness'),
      options.sensation('Physical energy, steadier breath, readiness to move or make'),
      options.intuition('A quiet image, inner pull, symbolic fit, or future line becoming visible'),
      noneOption,
    ],
  },
  {
    id: 'somatic_06',
    layer: 'somatic',
    domain: 'Threat',
    prompt: 'A situation feels wrong before you can explain why. The first signal is usually:',
    options: [
      options.thinking('A contradiction, category error, or phrase that does not make sense'),
      options.feeling('A value alarm, relational coldness, or sudden loss of trust'),
      options.sensation('Tight stomach, changed breathing, sensory irritation, or a concrete detail out of place'),
      options.intuition('A pattern recognition signal that something unseen is moving underneath'),
      noneOption,
    ],
  },
  {
    id: 'attitude_01',
    layer: 'attitude',
    domain: 'Processing',
    prompt: 'After an intense social event, how do you evaluate what happened?',
    options: [
      options.introverted('I need to process internally before I know what it meant', 'introverted-private-processing'),
      options.introverted('I compare it to my own inner framework first', 'introverted-framework'),
      options.extraverted('I understand it through continued engagement and feedback', 'extraverted-engagement'),
      options.extraverted('I know what I think by testing it against the people and facts involved', 'extraverted-feedback'),
      noneOption,
    ],
  },
  {
    id: 'attitude_02',
    layer: 'attitude',
    domain: 'Ideas',
    prompt: 'When you encounter a new idea, your first move is usually to:',
    options: [
      options.introverted('Relate it to an inner model I already carry', 'introverted-model'),
      options.introverted('Hold it privately until its meaning settles', 'introverted-settle'),
      options.extraverted('Test it against examples, people, data, or the outer world', 'extraverted-test'),
      options.extraverted('Talk or act with it and see what reality gives back', 'extraverted-act'),
      noneOption,
    ],
  },
  {
    id: 'attitude_03',
    layer: 'attitude',
    domain: 'Speech',
    prompt: 'When discussing something important, which pattern is more common?',
    options: [
      options.introverted('I usually know my position before I discuss it', 'introverted-before'),
      options.introverted('I need quiet first so I do not betray the nuance of my view', 'introverted-nuance'),
      options.extraverted('I discover my position while speaking with someone', 'extraverted-through-talk'),
      options.extraverted('My thinking sharpens through interaction and challenge', 'extraverted-challenge'),
      noneOption,
    ],
  },
  {
    id: 'attitude_04',
    layer: 'attitude',
    domain: 'Decision',
    prompt: 'When making a decision, what carries more weight at first?',
    options: [
      options.introverted('How I relate to it and what it means inside my own framework', 'introverted-subjective'),
      options.introverted('Whether it fits the private standard I trust', 'introverted-standard'),
      options.extraverted('What the external data, norms, or real-world constraints say', 'extraverted-objective'),
      options.extraverted('What happens when the option is tested outside my head', 'extraverted-consequence'),
      noneOption,
    ],
  },
  {
    id: 'attitude_05',
    layer: 'attitude',
    domain: 'Conflict',
    prompt: 'In conflict, your energy tends to move:',
    options: [
      options.introverted('Inward, toward clarifying my own relation to the conflict', 'introverted-clarify'),
      options.introverted('Away from the object until I can recover my center', 'introverted-center'),
      options.extraverted('Outward, toward direct engagement with the person or situation', 'extraverted-direct'),
      options.extraverted('Toward changing the external conditions that are producing the conflict', 'extraverted-conditions'),
      noneOption,
    ],
  },
  {
    id: 'attitude_06',
    layer: 'attitude',
    domain: 'Momentum',
    prompt: 'A project becomes real for you when:',
    options: [
      options.introverted('The inner image, principle, or value becomes coherent', 'introverted-coherent'),
      options.introverted('I can protect enough solitude to let the work gather force', 'introverted-solitude'),
      options.extraverted('It meets users, materials, feedback, deadlines, or visible traction', 'extraverted-traction'),
      options.extraverted('Other people and external stakes pull it into motion', 'extraverted-stakes'),
      noneOption,
    ],
  },
];
