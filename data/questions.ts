import { Question, FunctionDescription } from '../types';

// Comprehensive assessment with ~130 situational questions
// Categories: A = adaptive/healthy, B = grip/stress, C = attitude (E/I)
export const questions: Question[] = [
  // ============================================
  // Te (Extraverted Thinking) - 11 A, 4 B
  // ============================================
  { id: 'te_1', category: 'A', target: 'Te', text: 'When evaluating options, you prioritize objective criteria and measurable outcomes over personal feelings.' },
  { id: 'te_2', category: 'A', target: 'Te', text: 'You naturally organize information into systems, frameworks, or processes that others can follow.' },
  { id: 'te_3', category: 'A', target: 'Te', text: 'You find satisfaction in optimizing systems for maximum efficiency.' },
  { id: 'te_4', category: 'A', target: 'Te', text: 'When given a new project, you immediately create a timeline and delegate tasks.' },
  { id: 'te_5', category: 'A', target: 'Te', text: 'In meetings, you focus on action items and next steps rather than open-ended discussion.' },
  { id: 'te_6', category: 'A', target: 'Te', text: 'When someone presents a plan, you quickly identify inefficiencies and suggest improvements.' },
  { id: 'te_7', category: 'A', target: 'Te', text: 'If a process is taking too long, you naturally restructure it to save time.' },
  { id: 'te_8', category: 'A', target: 'Te', text: 'When making decisions, you rely on data, metrics, and logical analysis over gut feelings.' },
  { id: 'te_9', category: 'A', target: 'Te', text: 'In group settings, you often take charge to ensure tasks get completed on schedule.' },
  { id: 'te_10', category: 'A', target: 'Te', text: 'When solving problems, you focus on what works in practice rather than theoretical ideals.' },
  { id: 'te_11', category: 'A', target: 'Te', text: 'You prefer clear hierarchies and defined roles over ambiguous team structures.' },
  { id: 'te_inf_1', category: 'B', target: 'Te', text: 'You become paralyzed by demands for efficiency and feel your careful process is dismissed.' },
  { id: 'te_inf_2', category: 'B', target: 'Te', text: 'Under stress, you become obsessed with controlling every minor detail of others\' work.' },
  { id: 'te_inf_3', category: 'B', target: 'Te', text: 'When overwhelmed, you feel compelled to create rigid rules and schedules that leave no room for flexibility.' },
  { id: 'te_inf_4', category: 'B', target: 'Te', text: 'In crisis situations, you become harsh and critical, issuing ultimatums and ignoring others\' feelings.' },

  // ============================================
  // Ti (Introverted Thinking) - 11 A, 4 B
  // ============================================
  { id: 'ti_1', category: 'A', target: 'Ti', text: 'You often spend time mentally deconstructing how systems work, even with no practical purpose.' },
  { id: 'ti_2', category: 'A', target: 'Ti', text: 'Internal consistency of thought is more important to you than external efficiency.' },
  { id: 'ti_3', category: 'A', target: 'Ti', text: 'You seek precise definitions and distinctions when analyzing a problem.' },
  { id: 'ti_4', category: 'A', target: 'Ti', text: 'When learning something new, you need to understand the underlying principles before applying them.' },
  { id: 'ti_5', category: 'A', target: 'Ti', text: 'In discussions, you often find yourself correcting imprecise language or flawed logic.' },
  { id: 'ti_6', category: 'A', target: 'Ti', text: 'When presented with a popular opinion, you instinctively question its logical foundation.' },
  { id: 'ti_7', category: 'A', target: 'Ti', text: 'You enjoy building mental models and frameworks that explain complex phenomena.' },
  { id: 'ti_8', category: 'A', target: 'Ti', text: 'If an explanation has even one logical flaw, you struggle to accept the rest of it.' },
  { id: 'ti_9', category: 'A', target: 'Ti', text: 'When troubleshooting, you systematically eliminate possibilities rather than guessing.' },
  { id: 'ti_10', category: 'A', target: 'Ti', text: 'You prefer to figure things out independently rather than asking others for help.' },
  { id: 'ti_11', category: 'A', target: 'Ti', text: 'In conversations, you focus on accuracy and truth over diplomacy or social harmony.' },
  { id: 'ti_inf_1', category: 'B', target: 'Ti', text: 'You grasp for logical explanations that don\'t quite hold together, becoming rigid under stress.' },
  { id: 'ti_inf_2', category: 'B', target: 'Ti', text: 'Under pressure, you become obsessed with how others perceive you and desperately seek approval.' },
  { id: 'ti_inf_3', category: 'B', target: 'Ti', text: 'When stressed, you make uncharacteristic emotional outbursts or public scenes.' },
  { id: 'ti_inf_4', category: 'B', target: 'Ti', text: 'In crisis, you feel overwhelmed by social demands and desperately need validation from others.' },

  // ============================================
  // Fe (Extraverted Feeling) - 11 A, 4 B
  // ============================================
  { id: 'fe_1', category: 'A', target: 'Fe', text: 'You naturally attune to the emotional atmosphere of a room and adjust your behavior accordingly.' },
  { id: 'fe_2', category: 'A', target: 'Fe', text: 'You make decisions by considering the impact on social harmony and shared values.' },
  { id: 'fe_3', category: 'A', target: 'Fe', text: 'You feel responsible for ensuring everyone in a group feels included.' },
  { id: 'fe_4', category: 'A', target: 'Fe', text: 'When someone is upset, you naturally want to comfort them and restore their well-being.' },
  { id: 'fe_5', category: 'A', target: 'Fe', text: 'In social situations, you instinctively smooth over conflicts to maintain group harmony.' },
  { id: 'fe_6', category: 'A', target: 'Fe', text: 'When planning events, you consider what would make everyone comfortable and happy.' },
  { id: 'fe_7', category: 'A', target: 'Fe', text: 'You often know what others need emotionally before they express it.' },
  { id: 'fe_8', category: 'A', target: 'Fe', text: 'In disagreements, you tend to prioritize maintaining the relationship over being right.' },
  { id: 'fe_9', category: 'A', target: 'Fe', text: 'You feel energized when you can help others and contribute to group well-being.' },
  { id: 'fe_10', category: 'A', target: 'Fe', text: 'When meeting new people, you naturally build rapport and put them at ease.' },
  { id: 'fe_11', category: 'A', target: 'Fe', text: 'You consider how your decisions will affect others\' feelings before acting.' },
  { id: 'fe_inf_1', category: 'B', target: 'Fe', text: 'You feel disconnected from others\' emotional states and may say things that inadvertently hurt.' },
  { id: 'fe_inf_2', category: 'B', target: 'Fe', text: 'Under stress, you become coldly critical and find fault with everyone around you.' },
  { id: 'fe_inf_3', category: 'B', target: 'Fe', text: 'When overwhelmed, you develop paranoid thoughts that others are ungrateful or have hidden motives.' },
  { id: 'fe_inf_4', category: 'B', target: 'Fe', text: 'In crisis, you reduce relationships to cynical transactions, dismissing genuine emotional bonds.' },

  // ============================================
  // Fi (Introverted Feeling) - 11 A, 4 B
  // ============================================
  { id: 'fi_1', category: 'A', target: 'Fi', text: 'You have strong inner convictions that you may struggle to articulate but won\'t compromise.' },
  { id: 'fi_2', category: 'A', target: 'Fi', text: 'Being authentic to your inner self is more important than fitting in.' },
  { id: 'fi_3', category: 'A', target: 'Fi', text: 'You evaluate worth based on a private, internal system of values.' },
  { id: 'fi_4', category: 'A', target: 'Fi', text: 'When something violates your core values, you feel it as a visceral, physical reaction.' },
  { id: 'fi_5', category: 'A', target: 'Fi', text: 'In situations where others compromise their principles, you find it difficult to do the same.' },
  { id: 'fi_6', category: 'A', target: 'Fi', text: 'You form deep emotional bonds with select individuals rather than maintaining many casual friendships.' },
  { id: 'fi_7', category: 'A', target: 'Fi', text: 'When making decisions, you consult your internal sense of what feels right or wrong.' },
  { id: 'fi_8', category: 'A', target: 'Fi', text: 'You are drawn to causes that align with your personal values, even if they are unpopular.' },
  { id: 'fi_9', category: 'A', target: 'Fi', text: 'In group settings, you quietly maintain your position even when others disagree.' },
  { id: 'fi_10', category: 'A', target: 'Fi', text: 'When someone acts against their stated values, you notice immediately and feel uncomfortable.' },
  { id: 'fi_11', category: 'A', target: 'Fi', text: 'You prefer expressing emotions through creative work or actions rather than direct verbal expression.' },
  { id: 'fi_inf_1', category: 'B', target: 'Fi', text: 'You lose touch with what you actually value and feel inauthentic or hollow under pressure.' },
  { id: 'fi_inf_2', category: 'B', target: 'Fi', text: 'Under stress, you become obsessed with organizing and controlling the external world.' },
  { id: 'fi_inf_3', category: 'B', target: 'Fi', text: 'When overwhelmed, you issue harsh judgments and ultimatums that seem out of character.' },
  { id: 'fi_inf_4', category: 'B', target: 'Fi', text: 'In crisis, you fixate obsessively on facts and efficiency while ignoring your deeper feelings.' },

  // ============================================
  // Se (Extraverted Sensation) - 11 A, 4 B
  // ============================================
  { id: 'se_1', category: 'A', target: 'Se', text: 'You feel most alive when fully immersed in intense, immediate sensory experiences.' },
  { id: 'se_2', category: 'A', target: 'Se', text: 'You prefer to take immediate action rather than spending a long time planning.' },
  { id: 'se_3', category: 'A', target: 'Se', text: 'You notice aesthetic details and physical changes in your environment instantly.' },
  { id: 'se_4', category: 'A', target: 'Se', text: 'When opportunities arise, you seize them in the moment rather than waiting.' },
  { id: 'se_5', category: 'A', target: 'Se', text: 'In emergencies, you respond quickly and practically without overthinking.' },
  { id: 'se_6', category: 'A', target: 'Se', text: 'You enjoy physical activities, sports, or experiences that engage your body fully.' },
  { id: 'se_7', category: 'A', target: 'Se', text: 'When something exciting is happening, you want to be there experiencing it firsthand.' },
  { id: 'se_8', category: 'A', target: 'Se', text: 'You are highly attuned to fashion, design, and the visual appeal of your surroundings.' },
  { id: 'se_9', category: 'A', target: 'Se', text: 'In conversations, you prefer discussing concrete, real-world topics over abstract theories.' },
  { id: 'se_10', category: 'A', target: 'Se', text: 'You learn best by doing rather than reading or hearing about something.' },
  { id: 'se_11', category: 'A', target: 'Se', text: 'When bored, you seek out new experiences, thrills, or stimulating environments.' },
  { id: 'se_inf_1', category: 'B', target: 'Se', text: 'You become clumsy, lose track of physical surroundings, or overindulge in sensory escape when stressed.' },
  { id: 'se_inf_2', category: 'B', target: 'Se', text: 'Under pressure, you become obsessed with dark premonitions about the future.' },
  { id: 'se_inf_3', category: 'B', target: 'Se', text: 'When overwhelmed, you see ominous signs and hidden meanings in everyday events.' },
  { id: 'se_inf_4', category: 'B', target: 'Se', text: 'In crisis, you withdraw from action and become paralyzed by paranoid visions of what might go wrong.' },

  // ============================================
  // Si (Introverted Sensation) - 11 A, 4 B
  // ============================================
  { id: 'si_1', category: 'A', target: 'Si', text: 'Certain sensory experiences (smells, textures) transport you vividly to past memories.' },
  { id: 'si_2', category: 'A', target: 'Si', text: 'You value established methods and traditions that have proven reliable over time.' },
  { id: 'si_3', category: 'A', target: 'Si', text: 'You compare the present situation detailedly against your rich internal database of past experiences.' },
  { id: 'si_4', category: 'A', target: 'Si', text: 'When learning a new skill, you prefer step-by-step instructions and established procedures.' },
  { id: 'si_5', category: 'A', target: 'Si', text: 'In familiar environments, you notice immediately when something has changed or is out of place.' },
  { id: 'si_6', category: 'A', target: 'Si', text: 'You find comfort in routines, rituals, and predictable patterns in daily life.' },
  { id: 'si_7', category: 'A', target: 'Si', text: 'When making decisions, you rely heavily on what worked well in similar past situations.' },
  { id: 'si_8', category: 'A', target: 'Si', text: 'You have a strong memory for specific details of past events and experiences.' },
  { id: 'si_9', category: 'A', target: 'Si', text: 'In unfamiliar situations, you look for patterns that resemble something you\'ve experienced before.' },
  { id: 'si_10', category: 'A', target: 'Si', text: 'You prefer tried-and-true approaches over experimental or untested methods.' },
  { id: 'si_11', category: 'A', target: 'Si', text: 'When recounting events, you recall sensory details vividly—what you saw, heard, or felt.' },
  { id: 'si_inf_1', category: 'B', target: 'Si', text: 'You obsess over minor bodily symptoms or become trapped in negative past memories.' },
  { id: 'si_inf_2', category: 'B', target: 'Si', text: 'Under stress, you imagine catastrophic possibilities and worst-case scenarios.' },
  { id: 'si_inf_3', category: 'B', target: 'Si', text: 'When overwhelmed, you become paralyzed by all the things that could go wrong.' },
  { id: 'si_inf_4', category: 'B', target: 'Si', text: 'In crisis, you make impulsive, out-of-character decisions or wild accusations.' },

  // ============================================
  // Ne (Extraverted Intuition) - 11 A, 4 B
  // ============================================
  { id: 'ne_1', category: 'A', target: 'Ne', text: 'You frequently see connections between seemingly unrelated ideas or domains.' },
  { id: 'ne_2', category: 'A', target: 'Ne', text: 'You become energized by novel possibilities and "what could be."' },
  { id: 'ne_3', category: 'A', target: 'Ne', text: 'You prefer keeping options open rather than committing to a single definitive path.' },
  { id: 'ne_4', category: 'A', target: 'Ne', text: 'When brainstorming, you generate many ideas rapidly, building on others\' contributions.' },
  { id: 'ne_5', category: 'A', target: 'Ne', text: 'In conversations, you often jump from topic to topic following interesting tangents.' },
  { id: 'ne_6', category: 'A', target: 'Ne', text: 'You are drawn to unconventional approaches and question "the way things have always been done."' },
  { id: 'ne_7', category: 'A', target: 'Ne', text: 'When starting a new project, you are most excited during the initial creative phase.' },
  { id: 'ne_8', category: 'A', target: 'Ne', text: 'You notice patterns and possibilities that others seem to miss.' },
  { id: 'ne_9', category: 'A', target: 'Ne', text: 'In routine situations, you look for ways to innovate or do things differently.' },
  { id: 'ne_10', category: 'A', target: 'Ne', text: 'You enjoy playing devil\'s advocate or exploring ideas from multiple perspectives.' },
  { id: 'ne_11', category: 'A', target: 'Ne', text: 'When faced with constraints, you instinctively look for creative workarounds.' },
  { id: 'ne_inf_1', category: 'B', target: 'Ne', text: 'You become convinced of a single negative possibility and can\'t see alternatives.' },
  { id: 'ne_inf_2', category: 'B', target: 'Ne', text: 'Under stress, you become fixated on bodily symptoms and health concerns.' },
  { id: 'ne_inf_3', category: 'B', target: 'Ne', text: 'When overwhelmed, you dwell obsessively on past failures and negative memories.' },
  { id: 'ne_inf_4', category: 'B', target: 'Ne', text: 'In crisis, you overindulge in food, drink, or sensory pleasures as escape.' },

  // ============================================
  // Ni (Introverted Intuition) - 11 A, 4 B
  // ============================================
  { id: 'ni_1', category: 'A', target: 'Ni', text: 'Solutions or insights often come to you fully formed, without conscious step-by-step reasoning.' },
  { id: 'ni_2', category: 'A', target: 'Ni', text: 'You are drawn to symbolic meaning and the underlying archetypal patterns of events.' },
  { id: 'ni_3', category: 'A', target: 'Ni', text: 'You often have a singular vision of the future that you feel compelled to realize.' },
  { id: 'ni_4', category: 'A', target: 'Ni', text: 'When making decisions, you trust your gut instincts even without concrete evidence.' },
  { id: 'ni_5', category: 'A', target: 'Ni', text: 'In complex situations, you perceive the deeper meaning or hidden dynamics at play.' },
  { id: 'ni_6', category: 'A', target: 'Ni', text: 'You often know how things will unfold before they happen.' },
  { id: 'ni_7', category: 'A', target: 'Ni', text: 'When pursuing a goal, you maintain focus on the long-term vision despite distractions.' },
  { id: 'ni_8', category: 'A', target: 'Ni', text: 'You see metaphors and symbols in everyday life that others don\'t notice.' },
  { id: 'ni_9', category: 'A', target: 'Ni', text: 'In conversations, you often cut to the essential point that others are circling around.' },
  { id: 'ni_10', category: 'A', target: 'Ni', text: 'You have difficulty explaining your insights because they come without clear logical steps.' },
  { id: 'ni_11', category: 'A', target: 'Ni', text: 'When planning, you focus on the ultimate destination rather than the specific route.' },
  { id: 'ni_inf_1', category: 'B', target: 'Ni', text: 'You feel ominous about the future but can\'t articulate why, leading to vague dread.' },
  { id: 'ni_inf_2', category: 'B', target: 'Ni', text: 'Under stress, you become obsessed with physical details or sensory indulgences.' },
  { id: 'ni_inf_3', category: 'B', target: 'Ni', text: 'When overwhelmed, you engage in impulsive or excessive eating, shopping, or physical activities.' },
  { id: 'ni_inf_4', category: 'B', target: 'Ni', text: 'In crisis, you become hypersensitive to your physical environment or develop fixations on objects.' },

  // ============================================
  // Attitude (E/I) - 12 total (6 E, 6 I)
  // ============================================
  { id: 'att_1', category: 'C', target: 'E', text: 'You process your thoughts best by discussing them with others or taking action.' },
  { id: 'att_2', category: 'C', target: 'I', text: 'After intense social interaction, you need solitude to restore your energy.' },
  { id: 'att_3', category: 'C', target: 'E', text: 'At social gatherings, you tend to work the room and meet many new people.' },
  { id: 'att_4', category: 'C', target: 'I', text: 'You prefer deep one-on-one conversations over group discussions.' },
  { id: 'att_5', category: 'C', target: 'E', text: 'When facing a problem, you prefer to talk it through with others immediately.' },
  { id: 'att_6', category: 'C', target: 'I', text: 'You need time alone to fully process your thoughts before sharing them.' },
  { id: 'att_7', category: 'C', target: 'E', text: 'In group settings, you often speak first and think later.' },
  { id: 'att_8', category: 'C', target: 'I', text: 'You find small talk exhausting and prefer meaningful conversations.' },
  { id: 'att_9', category: 'C', target: 'E', text: 'You feel energized and alive when surrounded by people and activity.' },
  { id: 'att_10', category: 'C', target: 'I', text: 'Too much external stimulation leaves you feeling drained and overwhelmed.' },
  { id: 'att_11', category: 'C', target: 'E', text: 'When excited about something, you want to share it with others right away.' },
  { id: 'att_12', category: 'C', target: 'I', text: 'You often feel that others don\'t give you enough time to think before responding.' },
];

export const FUNCTION_DESCRIPTIONS: Record<string, FunctionDescription> = {
  Te: {
    title: "Extraverted Thinking",
    desc: "Organizes the external world through logical systems, objective criteria, and empirical facts. The extraverted thinker elevates objective reality and the 'intellectual formula' to the ruling principle of existence. Their life is governed by a dominating positive formula derived from objective facts or collective ideals.",
    quote: "The man who refuses to obey the formula is wrong... he is unreasonable, immoral.",
    positive: "Efficient, clear-headed, just, productive. Excellent at organizing resources, leading execution, and bringing environments into alignment with logical principles. The reformers, prosecutors, and organizers of society.",
    negative: "Dogmatic, tyrannical, dismissive of personal values. Because feeling is repressed, it becomes archaic and highly personal—manifesting as hidden sentimentality, explosive anger, or sudden mystical attachments that contradict their logical exterior."
  },
  Ti: {
    title: "Introverted Thinking",
    desc: "Oriented by the subjective factor, seeking the depth of the idea rather than the breadth of facts. They collect facts only as evidence for their internal premises. Kant is the prototype, contrasting with the 'Darwinian' extraverted thinker.",
    quote: "Formulates questions and creates theories; opens up prospects and yields insight, but with respect to facts its attitude is one of reserve.",
    positive: "Precise, analytical, independent thinker. Master of troubleshooting and deep theoretical understanding. They seek intellectual intensity and trust the power of the idea itself, not pressing their views on others.",
    negative: "Reserved, often impractical, indifferent to the object. Their repressed feeling is objective, primitive, and anxious—they may have a naive sensitivity to public opinion or be easily manipulated by emotional appeals they do not understand."
  },
  Fe: {
    title: "Extraverted Feeling",
    desc: "Oriented by objective emotional values and traditional standards. Their feeling aligns with the object: 'I love you because you are lovable' (objective reason), not merely 'because I like you.' They call a thing beautiful because it is collectively valued as such.",
    quote: "Feeling is determined chiefly by the objective factor... it adapts itself entirely to the objective situation.",
    positive: "Harmonious, empathetic, socially graceful. They are the social glue—accommodating, warm, and vital for community. Excellent at building consensus, smoothing over conflicts, and maintaining rapport.",
    negative: "Their thinking is repressed, infantile, and often negative. When feeling adaptation fails, inferior thinking emerges as cynical 'nothing but' judgments, reducing the object to its basest components. Prone to paranoia and projection."
  },
  Fi: {
    title: "Introverted Feeling",
    desc: "Governed by subjective feeling tones. Their motto is 'Still waters run deep.' They do not seek to influence the object but to secure the inner harmony of the subject. Their values are often archetypal (God, Freedom) but rarely articulated.",
    quote: "It is determined by the subjective factor... they neither shine nor reveal themselves.",
    positive: "Authentic, principled, deeply compassionate. Silent inner intensity. Loyal to inner truth regardless of pressure, capable of profound empathy that is expressed through action rather than words.",
    negative: "Silent, inaccessible, often appearing cold or melancholic because feeling does not flow outward. Their repressed thinking is concrete, factual, and tyrannical—manifesting as ruthless drives to execute facts or monomania over single objective details."
  },
  Se: {
    title: "Extraverted Sensation",
    desc: "The type of the 'extreme realist.' No other type equals their capacity for perceiving the concrete world. They are oriented toward the strongest objective stimulus—sensation is the 'fullness of life.' They accumulate actual experiences.",
    quote: "No other human type can equal the extraverted sensation type in realism.",
    positive: "Realistic, observant, adaptable, aesthetically attuned. The aesthetes, the lovers of good food, fashion, and physical experiences. Fully present in the moment, pragmatic and grounded in reality.",
    negative: "Repressed intuition takes on a 'dark' and archaic quality. They project evil possibilities onto the environment, developing phobias, jealous fantasies, or superstitious fears about the future or others' intentions."
  },
  Si: {
    title: "Introverted Sensation",
    desc: "Guided by the subjective intensity of the sense impression. Not the object itself, but the impression the object makes on the subject. A 'rainy day' is not just weather; it is a subjective atmosphere loaded with personal meaning—a mirror world of impressions.",
    quote: "It is an unrelatedness to the object... the subject's perception of the object is the decisive factor.",
    positive: "Reliable, thorough, detail-oriented, grounded. May appear passive but internally processes a rich world. Often has an artistic or impressionistic relation to reality. Excellent at preserving traditions and learning from the past.",
    negative: "Repressed intuition is projected outward as fear of the unknown. They perceive the world as chaotic and threatening, seeing 'danger' in every new possibility. They cling to the familiar to ward off 'demonic' novelty."
  },
  Ne: {
    title: "Extraverted Intuition",
    desc: "Seeks possibilities in the objective world. They are the 'initiators' with a 'keen nose' for what is in the making. They seize a situation with enthusiasm but abandon it as soon as the potential is exhausted—'the harvest is nothing.'",
    quote: "The intuitive is never to be found among the generally recognized reality values, but always where possibilities exist.",
    positive: "Innovative, inspiring, adaptable, quick-witted. Entrepreneurs, speculators, and inspirers who see potential where others see dead ends. Energized by the new, the future, and 'what could be.'",
    negative: "Their sensation is suppressed, leading to neglect of the body and physical reality. This results in physical exhaustion, hypochondria, or sudden compulsive indulgences in sensory pleasure as the starved body demands attention."
  },
  Ni: {
    title: "Introverted Intuition",
    desc: "Directs intuition toward the inner objects (archetypes). The 'mystical dreamers' who perceive the background processes of consciousness—the 'slow processes' of the collective unconscious. Often have difficulty communicating their vision.",
    quote: "It directs itself to the inner object... the contents of the unconscious.",
    positive: "Visionary, insightful, synthesizing, determined. 'The voice of one crying in the wilderness.' Artists, prophets, capable of profound foresight and realizing complex goals through singular vision.",
    negative: "Their link to reality is weak. Inferior sensation manifests as impulsive, raw sensuality or compulsive ties to specific persons or objects (fetishism). May be completely helpless in the physical world."
  }
};

export const ATTITUDE_DESCRIPTIONS = {
  E: {
    title: "Extraversion",
    positive: "Action-oriented, confident, sociable, adaptable to the environment.",
    negative: "Dependent on external stimulation, flighty, shallow, fear of solitude.",
    desc: "In the extraverted attitude, libido flows outward from the subject to the object. The object (external reality, people, norms, things) acts as a magnet, drawing interest outward. The extravert expends energy, is prolific, propagating their nature into the world, forming attachments easily, and venturing with confidence into the unknown.",
    biologicalAnalogy: "High fertility, high energy expenditure, low individual defense (r-selection). The species survives by propagating widely."
  },
  I: {
    title: "Introversion",
    positive: "Reflective, self-contained, deep concentration, independent of public opinion.",
    negative: "Withdrawn, secretive, socially anxious, prone to inertia.",
    desc: "In the introverted attitude, libido flows inward, withdrawing from the object back to the subject. The introvert interposes a subjective view between themselves and the world. The object is viewed with caution; the goal is to prevent the object from gaining power over the subject. They conserve energy and secure the 'inner fortress.'",
    biologicalAnalogy: "Low fertility, energy conservation, high individual defense (K-selection). The species survives by protecting the individual unit."
  }
};

// Stack Position Archetypes - The hierarchy of psychic functions
export const STACK_POSITIONS = {
  dominant: {
    name: "Dominant",
    archetype: "The Hero",
    description: "The Superior Function—the most differentiated and most frequently used tool of the conscious personality. This is the primary instrument of adaptation, the function you identify your character with. Development of this function is the 'Faustian bargain' of civilization: proficiency at the cost of wholeness.",
    development: "Fully conscious and under direction of the will. Developed in childhood and adolescence through natural aptitude and environmental reinforcement.",
    shadow: "One-sidedness. Over-reliance leads to neglect of other functions and eventual enantiodromia (reversal into the opposite)."
  },
  auxiliary: {
    name: "Auxiliary",
    archetype: "The Good Parent",
    description: "The second differentiated function that assists the Superior. Because absolute sovereignty of a single function would leave one unable to cope with reality, a secondary mode of adaptation is required. This function must be of opposite rationality to the Dominant.",
    development: "Develops in young adulthood as a bridge between the superior function and the rest of the psyche. Provides balance and a secondary mode of adaptation.",
    shadow: "May be mistaken for the dominant in some individuals. When underdeveloped, the personality remains rigid and one-dimensional."
  },
  tertiary: {
    name: "Tertiary",
    archetype: "The Eternal Child (Puer/Puella)",
    description: "Less differentiated than the auxiliary and lies closer to the unconscious. Possesses 'infantile' or childlike qualities—playful but also defensive. It often serves as a 'trap' or a 'gift,' luring the ego toward the inferior function.",
    development: "Emerges in mid-life as part of the individuation process. Carries the attitude opposite to the dominant. The first step into the 'underworld' of the unconscious stack.",
    shadow: "Can manifest defensively when the ego is threatened. May become a source of regression rather than growth if not properly integrated."
  },
  inferior: {
    name: "Inferior",
    archetype: "The Anima/Animus (Soul Image)",
    description: "The doorway to the unconscious. This function remains archaic, undifferentiated, and largely unconscious. It is the carrier of the 'dark side' of personality—slow, heavy, and charged with primitive affect. Where the ego is most vulnerable and where the wounds of personality reside.",
    development: "The 'treasure hard to attain' and the catalyst for individuation. Despite its troublesome nature, it is the bridge to the Self. Integration begins in the second half of life through confrontation with the Shadow.",
    shadow: "Operates autonomously—it 'happens' to the subject rather than being willed. Under stress, it erupts primitively (The Grip). The function you are 'seized' by, not the one you use."
  }
};

// The Grip - Inferior Function Pathology Under Stress
export const THE_GRIP = {
  Te: {
    inferiorFunction: "Introverted Feeling (Fi)",
    normalState: "Efficient, logical, objective, focused on external systems and results.",
    gripDescription: "When an Te-dominant is in The Grip, the repressed Fi erupts. They become hypersensitive, taking everything personally. They may withdraw into wounded silence, become uncharacteristically emotional, or develop intense but irrational attachments to people. They feel misunderstood and undervalued.",
    triggers: "Feeling dismissed, unappreciated, or when their competence is questioned. Lack of control over environment.",
    recovery: "Solitude to process emotions. Acknowledgment of personal values. Physical activity or familiar routines."
  },
  Ti: {
    inferiorFunction: "Extraverted Feeling (Fe)",
    normalState: "Analytical, precise, internally consistent, seeking theoretical depth.",
    gripDescription: "When a Ti-dominant is in The Grip, the repressed Fe erupts. They become desperate for social connection but express it clumsily—either overreacting emotionally to perceived slights or becoming obsessed with how others view them. They may make public emotional scenes or become blindly devoted to another person.",
    triggers: "Exclusion from groups. Feeling intellectually inadequate. Overwhelming social demands.",
    recovery: "Low-pressure social interaction. Logical analysis of the situation. Time alone to regain perspective."
  },
  Fe: {
    inferiorFunction: "Introverted Thinking (Ti)",
    normalState: "Harmonious, empathetic, attuned to social dynamics, values-oriented.",
    gripDescription: "When an Fe-dominant is in The Grip, the repressed Ti emerges as cold, obsessive logic. They become hyper-critical, finding fault with everything and everyone. They may develop paranoid thoughts, cynically reduce relationships to 'nothing but' transactions, and obsess over 'the truth' that others are hiding.",
    triggers: "Betrayal of trust. Conflict that cannot be smoothed over. Feeling that others are ungrateful.",
    recovery: "Logical problem-solving with trusted friend. Physical exercise. Acknowledging own needs vs. others' needs."
  },
  Fi: {
    inferiorFunction: "Extraverted Thinking (Te)",
    normalState: "Authentic, principled, governed by deep personal values, inner-directed.",
    gripDescription: "When an Fi-dominant is in The Grip, the repressed Te erupts as tyrannical external action. They become obsessed with organizing, controlling, and 'fixing' the external world. They may make harsh judgments, issue ultimatums, become ruthlessly efficient, or fixate obsessively on objective facts and details.",
    triggers: "Violation of core values. Feeling inauthentic. Being pressured to conform.",
    recovery: "Creative expression. Time in nature. Reconnection with personal values through meaningful activity."
  },
  Se: {
    inferiorFunction: "Introverted Intuition (Ni)",
    normalState: "Present, realistic, action-oriented, attuned to immediate sensory experience.",
    gripDescription: "When an Se-dominant is in The Grip, the repressed Ni erupts as dark inner visions. They become convinced of dire future possibilities, develop paranoid interpretations, see 'signs' everywhere, and may become obsessed with a single negative symbolic meaning. They withdraw from the outer world into gloomy internal prophecies.",
    triggers: "Inability to take action. Being physically confined. Loss of stimulation.",
    recovery: "Physical activity. Returning to present-moment awareness. Talking through fears with a trusted person."
  },
  Si: {
    inferiorFunction: "Extraverted Intuition (Ne)",
    normalState: "Thorough, detail-oriented, grounded in experience, respecting tradition.",
    gripDescription: "When an Si-dominant is in The Grip, the repressed Ne erupts as catastrophic possibilities. They see danger everywhere, imagine worst-case scenarios, and become paralyzed by all the things that could go wrong. They may become uncharacteristically impulsive or make wild, unfounded accusations.",
    triggers: "Too much novelty. Disruption of routines. Pressure to adapt quickly to change.",
    recovery: "Return to familiar routines. Focusing on concrete present details. Step-by-step problem solving."
  },
  Ne: {
    inferiorFunction: "Introverted Sensation (Si)",
    normalState: "Innovative, possibility-oriented, adaptable, seeking patterns and potential.",
    gripDescription: "When an Ne-dominant is in The Grip, the repressed Si erupts as obsessive focus on the body and past. They become hypochondriacal, fixating on physical symptoms. They may become depressed about the past, obsessively recall negative experiences, or compulsively overindulge in sensory pleasures (food, drink, etc.).",
    triggers: "Too many possibilities with no closure. Feeling scattered. Physical exhaustion ignored too long.",
    recovery: "Rest and physical self-care. Completing one concrete task. Returning to trusted routines."
  },
  Ni: {
    inferiorFunction: "Extraverted Sensation (Se)",
    normalState: "Visionary, synthesizing, focused on inner patterns and singular insights.",
    gripDescription: "When an Ni-dominant is in The Grip, the repressed Se erupts as raw sensory indulgence. They may become obsessed with physical details, overeat, over-exercise, or engage in impulsive sensory experiences. They can develop fetishistic attachments to specific objects or become completely overwhelmed by sensory stimuli.",
    triggers: "Vision not being realized. Feeling misunderstood. Overwhelming external demands.",
    recovery: "Controlled sensory experiences (massage, nature). Returning to the vision. Creative expression of inner insights."
  }
};

// Eight Type Phenomenology - Detailed Type Portraits
export const TYPE_PHENOMENOLOGY: Record<string, {
  typeName: string;
  focus: string;
  behavior: string;
  neurosis: string;
  historicalExample: string;
}> = {
  Te: {
    typeName: "The Extraverted Thinking Type",
    focus: "Universal Formula—their life is governed by a 'dominating positive formula' derived from objective facts or collective ideals (Justice, Efficiency, Progress).",
    behavior: "The reformers, prosecutors, and organizers. They strive to bring the environment into alignment with the formula. Confident, decisive, results-oriented.",
    neurosis: "Dogmatism, emotional outbursts. The 'tyranny' of the formula suppresses personal emotional life, causing the unconscious feeling to exact revenge through neurosis.",
    historicalExample: "Darwin (collecting facts for objective theory), industrial organizers, efficiency consultants."
  },
  Ti: {
    typeName: "The Introverted Thinking Type",
    focus: "Inner Idea—seeks the depth of the idea rather than the breadth of facts. Creates theories and systems.",
    behavior: "Reserved, often impractical, the 'absent-minded professor.' Does not press views on others, trusting the power of the idea itself.",
    neurosis: "Isolation, participation mystique. Hidden naive sensitivity to public opinion. Can be manipulated by emotional appeals they don't understand.",
    historicalExample: "Kant (contrasting with Darwin), theoretical physicists, philosophers of pure reason."
  },
  Fe: {
    typeName: "The Extraverted Feeling Type",
    focus: "Social Harmony—feeling aligns with objective values. 'Beautiful' because collectively valued, not because personally preferred.",
    behavior: "The social glue—accommodating, warm, vital for community. Smooths over conflicts to maintain rapport. Fashion-conscious, tradition-respecting.",
    neurosis: "'Hollow' personality, paranoia. When adaptation fails, inferior thinking emerges as cynical 'nothing but' judgments.",
    historicalExample: "Social leaders, diplomats, those who embody collective emotional values."
  },
  Fi: {
    typeName: "The Introverted Feeling Type",
    focus: "Inner Value—'Still waters run deep.' Values often archetypal (God, Freedom) but rarely articulated.",
    behavior: "Silent, inaccessible, often melancholic. May appear cold because feeling doesn't flow outward. 'They neither shine nor reveal themselves.'",
    neurosis: "Melancholy, tyrannical logic. Repressed Te manifests as ruthless drives to execute facts or monomania.",
    historicalExample: "Mystics, contemplatives, those with 'silent inner fires.'"
  },
  Se: {
    typeName: "The Extraverted Sensation Type",
    focus: "Concrete Experience—no other type equals their capacity for perceiving the concrete world. Sensation is 'fullness of life.'",
    behavior: "The aesthetes, lovers of good food, fashion, physical experiences. Grounded, pragmatic, oriented to strongest stimulus.",
    neurosis: "Phobias, obsessive jealousy. Repressed Ni projects 'evil' possibilities—superstitious fears about future or others' intentions.",
    historicalExample: "Connoisseurs, athletes, those fully alive in sensory experience."
  },
  Si: {
    typeName: "The Introverted Sensation Type",
    focus: "Subjective Impression—not the object itself, but the impression it makes. 'Rainy day' is subjective atmosphere, not weather.",
    behavior: "May appear passive but processes rich 'mirror world' internally. Artistic or impressionistic relation to reality.",
    neurosis: "Fear of novelty, exhaustion. Repressed Ne sees chaos and danger in every new possibility; clings to familiar.",
    historicalExample: "Impressionist artists, archivists, keepers of subjective tradition."
  },
  Ne: {
    typeName: "The Extraverted Intuitive Type",
    focus: "Possibility/Change—'keen nose' for what is in the making. 'The harvest is nothing'—abandons when potential exhausted.",
    behavior: "The 'initiators'—entrepreneurs, speculators, inspirers. Seize situations with enthusiasm for the new.",
    neurosis: "Physical neglect, instability. Suppressed Si leads to exhaustion, hypochondria, or compulsive sensory indulgence.",
    historicalExample: "Entrepreneurs, venture capitalists, those who see potential everywhere."
  },
  Ni: {
    typeName: "The Introverted Intuitive Type",
    focus: "Archetypal Vision—perceives the 'slow processes' of collective unconscious. 'Voice crying in the wilderness.'",
    behavior: "Mystical dreamers, difficulty communicating vision. Artists, prophets, or socially awkward eccentrics.",
    neurosis: "Reality detachment, sensual compulsion. Inferior Se manifests as impulsive raw sensuality or fetishism; helpless in physical world.",
    historicalExample: "Prophets, visionary artists, those who perceive what others cannot."
  }
};

// Individuation Process - The Path to Wholeness
export const INDIVIDUATION_GUIDANCE = {
  intro: "Individuation is the process of differentiating the individual personality from the collective psychology, integrating conscious and unconscious aspects into a new center: The Self. It is not about becoming 'balanced' in all functions, but about acknowledging and integrating the neglected aspects of the psyche.",
  stages: [
    {
      name: "1. Differentiation of the Ego",
      description: "The first half of life establishes the Superior Function and Persona (social mask) for worldly adaptation.",
      task: "Develop competence with your dominant function. Build a functional ego capable of meeting life's demands."
    },
    {
      name: "2. The Midlife Transition",
      description: "The one-sidedness of the superior function becomes a liability. The unconscious (Shadow/Inferior) presses for recognition.",
      task: "Recognize the limitations of your dominant approach. Notice recurring failures and frustrations as signals from the unconscious."
    },
    {
      name: "3. Confrontation with the Shadow",
      description: "The ego must acknowledge the dark, inferior parts of personality—the 'Other' within.",
      task: "Engage with your inferior function, not to master it, but to honor it. Allow yourself to be clumsy, slow, and primitive in this realm."
    },
    {
      name: "4. The Transcendent Function",
      description: "When tension between opposites is held (not repressed), the psyche produces a living symbol that transcends both.",
      task: "Practice active imagination. Dialogue with unconscious figures. Allow symbols to emerge that unite conscious and unconscious."
    },
    {
      name: "5. Realization of the Self",
      description: "The center of identity shifts from the Ego to the Self—the archetype of wholeness, the 'God-image' within.",
      task: "This is not an achievement but an ongoing process. The Self is approached asymptotically, never fully attained."
    }
  ],
  inferiorFunctionWork: "The inferior function is not meant to become a second superior function. It remains the doorway to the unconscious—archaic, slow, and charged with numinous energy. The goal is relationship, not mastery. Through the inferior, we touch the collective unconscious and the possibility of transformation.",
  transcendentFunction: "The Transcendent Function acts like a mathematical function of real and imaginary numbers. It facilitates the transition from one psychological attitude to another, producing the 'third thing' that contains both thesis and antithesis but transcends them.",
  warning: "Beware of Inflation—identifying with the god-image—or the Mana-Personality—identifying with the wise magician. The goal is dialogue with these figures, not possession by them."
};

export const RELATIONSHIPS_INSIGHTS: Record<string, {
  strengths: string;
  challenges: string;
  idealPartners: string;
  growthInRelationships: string;
}> = {
  Te: {
    strengths: "Clear communication, reliability, problem-solving approach to conflicts. You bring structure and follow-through to relationships, ensuring promises are kept and plans executed.",
    challenges: "May prioritize efficiency over emotional connection. Can appear dismissive of partner's feelings when focused on 'fixing' rather than listening.",
    idealPartners: "Those who appreciate directness and can balance your logic with emotional depth (Fi or Fe types). Partners who value competence and share your drive for improvement.",
    growthInRelationships: "Practice listening without immediately offering solutions. Allow space for emotions that don't require fixing. Your hidden Fi yearns for deep, authentic connection—let it breathe."
  },
  Ti: {
    strengths: "Intellectual depth, consistency, independence that gives partners space. You bring analytical clarity and won't make hasty emotional decisions.",
    challenges: "May withdraw into analysis when emotions are needed. Can appear detached or overly critical. Struggles to express warmth directly.",
    idealPartners: "Those who value intellectual connection and respect your need for solitude. Partners who can draw you out socially without overwhelming you (Fe types often complement well).",
    growthInRelationships: "Recognize that emotional attunement is its own form of precision. Your inferior Fe craves connection—practice small acts of expressed warmth."
  },
  Fe: {
    strengths: "Natural empathy, social grace, ability to create harmony. You intuitively sense what others need and work to meet those needs. Excellent at maintaining relationship networks.",
    challenges: "May lose yourself in others' needs. Can struggle to identify and express your own desires. May avoid necessary conflict to preserve harmony.",
    idealPartners: "Those who encourage your self-expression and can hold space for your needs (Ti or Te types provide grounding). Partners who value emotional connection as much as you do.",
    growthInRelationships: "Practice identifying what YOU want, separate from others. Healthy conflict is part of authentic relationship. Your inferior Ti can help you set logical boundaries."
  },
  Fi: {
    strengths: "Deep loyalty, authentic presence, capacity for profound emotional connection. You love with unwavering commitment to your values.",
    challenges: "May struggle to articulate feelings despite their depth. Can withdraw when hurt rather than communicating. High standards may be hard for partners to meet.",
    idealPartners: "Those who respect your values and can be patient with your need to process internally. Partners who value authenticity over social convention (Te types can help externalize your vision).",
    growthInRelationships: "Practice externalizing your inner world—others cannot read your depths. Your inferior Te can help you communicate needs directly rather than hoping partners intuit them."
  },
  Se: {
    strengths: "Present, attentive, spontaneous. You bring excitement and fully engage with shared experiences. Physical affection and tangible acts of love come naturally.",
    challenges: "May struggle with long-term planning or delayed gratification. Can become restless when relationships settle into routine. May avoid deeper emotional processing.",
    idealPartners: "Those who enjoy adventure and physical presence but can also help you slow down (Ni types provide depth). Partners who appreciate your zest for life.",
    growthInRelationships: "Practice sitting with emotional complexity rather than seeking distraction. Your inferior Ni invites you to explore the meaning beneath the surface of experiences."
  },
  Si: {
    strengths: "Reliable, loyal, attentive to partner's preferences and history. You remember important details and create comforting rituals and traditions.",
    challenges: "May resist change in relationships or cling to how things 'should' be. Can become trapped in past hurts. May struggle with partners who desire novelty.",
    idealPartners: "Those who value stability and can gently introduce healthy change (Ne types balance well). Partners who appreciate tradition and consistency.",
    growthInRelationships: "Practice embracing positive change as growth, not threat. Your inferior Ne offers the gift of seeing new possibilities in your relationship—let it surprise you."
  },
  Ne: {
    strengths: "Playful, creative, keeps relationships fresh with new ideas and possibilities. You bring optimism and can see potential even in difficult times.",
    challenges: "May struggle with commitment or follow-through. Can become distracted by new possibilities rather than deepening existing bonds. May avoid routine intimacy.",
    idealPartners: "Those who enjoy intellectual play and can help ground your ideas (Si types provide stability). Partners who appreciate your creativity without feeling neglected.",
    growthInRelationships: "Practice presence and completion—staying with one experience deeply. Your inferior Si invites you to find richness in the familiar and routine."
  },
  Ni: {
    strengths: "Deep insight into relationship dynamics, ability to envision long-term partnership, profound loyalty to your vision of the relationship.",
    challenges: "May be so focused on the ideal that you miss present realities. Can appear distant or 'elsewhere.' May struggle with day-to-day practical needs.",
    idealPartners: "Those who can share or support your vision while grounding you in reality (Se types complement well). Partners who appreciate depth over surface interaction.",
    growthInRelationships: "Practice being fully present in the moment with your partner. Your inferior Se invites you to enjoy simple physical pleasures and spontaneous experiences together."
  }
};

export const CAREER_GUIDANCE: Record<string, {
  naturalStrengths: string;
  idealEnvironments: string;
  roles: string[];
  watchOutFor: string;
}> = {
  Te: {
    naturalStrengths: "Organizing systems, leading teams, optimizing processes, making data-driven decisions, executing plans efficiently. You excel at bringing order to chaos and achieving measurable results.",
    idealEnvironments: "Structured organizations with clear metrics, leadership opportunities, environments that reward competence and results. Avoid overly political or sentiment-driven cultures.",
    roles: ["Executive/Manager", "Management Consultant", "Operations Director", "Project Manager", "Systems Analyst", "Prosecutor/Judge", "Military Officer", "Entrepreneur"],
    watchOutFor: "Burnout from over-optimization. Alienating colleagues by dismissing emotional factors. Your repressed Fi may erupt as sudden frustration when values are violated—integrate it consciously instead."
  },
  Ti: {
    naturalStrengths: "Deep analysis, troubleshooting complex systems, theoretical work, independent research, finding logical inconsistencies. You excel where precision of thought matters more than speed of execution.",
    idealEnvironments: "Autonomous roles with minimal bureaucracy, research settings, technical fields. Avoid roles requiring constant social performance or superficial networking.",
    roles: ["Research Scientist", "Software Architect", "Philosopher", "Technical Writer", "Data Analyst", "Forensic Specialist", "Systems Theorist", "Academic Professor"],
    watchOutFor: "Isolation that cuts you off from needed feedback. Paralysis by over-analysis. Your inferior Fe may make you naive about office politics—find a trusted ally to help navigate."
  },
  Fe: {
    naturalStrengths: "Building consensus, team facilitation, conflict resolution, client relations, reading group dynamics. You excel at creating harmonious, productive environments.",
    idealEnvironments: "Collaborative teams, people-oriented organizations, roles with meaningful human connection. Avoid isolated work or purely analytical cultures.",
    roles: ["Human Resources Director", "Therapist/Counselor", "Diplomat", "Event Coordinator", "Public Relations", "Teacher", "Social Worker", "Community Organizer"],
    watchOutFor: "Burnout from absorbing others' emotions. Losing your own direction while serving others. Your inferior Ti may emerge as harsh criticism when stressed—develop your logical side proactively."
  },
  Fi: {
    naturalStrengths: "Authentic creative expression, ethics and values work, one-on-one connection, staying true to mission under pressure. You excel where personal conviction and moral compass are essential.",
    idealEnvironments: "Mission-driven organizations, creative fields, autonomous roles aligned with your values. Avoid corporate cultures that require compromising principles.",
    roles: ["Writer/Artist", "Therapist", "Non-profit Director", "Ethics Officer", "Veterinarian", "Musician", "Activist", "Spiritual Director"],
    watchOutFor: "Difficulty in environments that require self-promotion. Frustration when organizational values clash with yours. Your inferior Te may emerge as harsh judgments—develop it to express your vision effectively."
  },
  Se: {
    naturalStrengths: "Quick response to changing situations, hands-on problem solving, physical/aesthetic awareness, crisis management. You excel in dynamic environments requiring immediate action.",
    idealEnvironments: "Fast-paced, varied work; roles with physical engagement or aesthetic elements. Avoid desk-bound, theoretical, or overly routine positions.",
    roles: ["Emergency Responder", "Chef", "Athlete/Trainer", "Photographer", "Pilot", "Surgeon", "Sales Executive", "Event Producer"],
    watchOutFor: "Boredom in stable environments. Neglecting long-term consequences for immediate rewards. Your inferior Ni may cause vague anxiety about the future—develop strategic thinking gradually."
  },
  Si: {
    naturalStrengths: "Detailed execution, preserving institutional knowledge, quality control, following established procedures. You excel where reliability, accuracy, and respect for precedent are valued.",
    idealEnvironments: "Structured organizations with clear procedures, roles utilizing accumulated expertise. Avoid chaotic startups or environments with constant, arbitrary change.",
    roles: ["Accountant", "Archivist", "Quality Assurance", "Healthcare Administrator", "Historian", "Editor", "Compliance Officer", "Skilled Tradesperson"],
    watchOutFor: "Resistance to necessary change. Over-reliance on 'how we've always done it.' Your inferior Ne may manifest as anxiety about novel situations—embrace small doses of healthy change."
  },
  Ne: {
    naturalStrengths: "Generating ideas, seeing connections, adapting to change, entrepreneurial vision, brainstorming solutions. You excel in innovation-oriented roles requiring creative thinking.",
    idealEnvironments: "Dynamic, idea-friendly cultures; startup environments; roles with variety and intellectual stimulation. Avoid rigid, unchanging, detail-heavy positions.",
    roles: ["Entrepreneur", "Creative Director", "Venture Capitalist", "Journalist", "Inventor", "Marketing Strategist", "Consultant", "Comedy Writer"],
    watchOutFor: "Difficulty with follow-through and implementation. Scattered energy across too many projects. Your inferior Si may manifest as neglected health or finances—build supporting routines."
  },
  Ni: {
    naturalStrengths: "Long-term vision, pattern recognition, strategic planning, synthesizing complex information. You excel where deep insight and future-orientation are required.",
    idealEnvironments: "Roles allowing deep focus and independent vision; strategic positions; creative or prophetic fields. Avoid detail-heavy, purely operational roles.",
    roles: ["Strategic Planner", "Researcher", "Author", "Psychotherapist (depth work)", "Futurist", "Art Director", "Spiritual Teacher", "Investment Analyst"],
    watchOutFor: "Difficulty communicating your vision to others. Frustration when reality doesn't match your inner picture. Your inferior Se may manifest as neglect of physical needs—build in sensory grounding."
  }
};

export const ACTIVE_IMAGINATION_PROMPTS = [
  {
    title: "Meeting Your Shadow",
    prompt: "Find a quiet space and close your eyes. Imagine yourself walking down a path that leads into a dark forest. At a clearing, you encounter a figure—someone who embodies everything you reject about yourself. Don't flee. Ask them: 'What do you want from me?' 'What gift do you carry that I have refused?' Listen without judgment. Write what emerges."
  },
  {
    title: "Dialogue with Your Inferior Function",
    prompt: "Visualize your inferior function as a person or creature. What does it look like? Is it young, old, wounded, wild? Approach it with curiosity. Ask: 'Why do you frighten me?' 'What would you teach me if I let you?' Remember—this function holds the treasure hard to attain. Its clumsiness contains your wholeness."
  },
  {
    title: "The Inner Guide",
    prompt: "Imagine descending stairs into the depths of your psyche. At the bottom, you find a wise figure waiting—perhaps an old person, an animal, or something unexpected. This is a manifestation of the Self. Ask for guidance on your current life situation. Don't force an answer; let images and words arise naturally. Record everything."
  },
  {
    title: "The Unlived Life",
    prompt: "Picture a door marked 'The Life Not Lived.' Open it and step through. What version of yourself exists here—the one who made different choices, developed different aspects? Meet this alternate self. Ask: 'What did you gain that I lost?' 'What did you lose that I gained?' This figure carries your unrealized potential."
  },
  {
    title: "The Ancestral Voice",
    prompt: "Allow an ancestor—known or unknown—to appear in your imagination. This may be someone from your family or a symbolic ancestor. Ask: 'What patterns have you passed to me?' 'What wisdom did you fail to pass on?' 'How can I heal what remained unhealed in you?' The personal unconscious connects to the collective."
  }
];

export const DREAM_JOURNALING_TEMPLATE = {
  intro: "Jung viewed dreams as the 'royal road to the unconscious'—natural, spontaneous products of the psyche that compensate for the one-sidedness of conscious attitude. Dreams speak in symbols, not signs; they point beyond themselves to meanings that cannot be fully captured in words.",
  questions: [
    "What was the overall emotional tone or atmosphere of the dream?",
    "Who appeared in the dream? (Remember: all figures may represent aspects of yourself)",
    "What was your role—observer, participant, victim, hero?",
    "Where did the dream take place? What is your personal association with this setting?",
    "What action or transformation occurred?",
    "What is the dream's relationship to your current life situation?",
    "If this dream were trying to compensate for something in your waking life, what would it be?"
  ],
  symbolsToNotice: [
    "Water (unconscious, emotions, the maternal)",
    "Houses/Buildings (the psyche, different floors = different levels)",
    "Animals (instincts, often shadow aspects or helpers)",
    "Vehicles (how you move through life, ego control)",
    "Unknown rooms (undiscovered aspects of self)",
    "Pursuer/Monster (shadow, repressed content seeking integration)",
    "Children (new developments, the inner child, potential)",
    "The Contrasexual Figure (anima/animus, soul-image)"
  ],
  jungianTip: "Avoid interpreting dreams too quickly or literally. Sit with the images. Ask what FEELING they evoke. The unconscious often presents truths that the ego resists. If a dream disturbs you, it may be exactly what you need to hear. Return to significant dreams over weeks—their meaning unfolds gradually."
};