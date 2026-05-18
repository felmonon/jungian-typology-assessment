// Comprehensive SEO data for all pages

export const functionData = {
  ni: {
    code: 'Ni',
    name: 'Introverted Intuition',
    nickname: 'The Pattern Seer',
    description: 'Synthesizes information into unified visions and insights. Operates unconsciously, delivering "aha" moments with deep conviction.',
    dominantTypes: ['INFJ', 'INTJ'],
    auxiliaryTypes: ['ENFJ', 'ENTJ'],
    keywords: ['pattern recognition', 'future vision', 'unconscious insight', 'convergent thinking', 'symbolic understanding'],
    characteristics: [
      'Sees patterns beneath the surface that others miss',
      'Experiences sudden insights and "knowing" without conscious reasoning',
      'Focused on a single, unified vision of how things will unfold',
      'Trusts gut feelings and hunches that prove accurate over time',
      'Thinks in symbols, metaphors, and abstract patterns',
      'Often described as "prophetic" or having strong intuition',
    ],
    strengths: ['Strategic foresight', 'Pattern synthesis', 'Long-term planning', 'Insight generation'],
    challenges: ['Difficulty explaining intuitions', 'May seem disconnected from present', 'Can be seen as mysterious'],
  },
  ne: {
    code: 'Ne',
    name: 'Extraverted Intuition',
    nickname: 'The Possibility Explorer',
    description: 'Explores possibilities and connections in the external world. Generates ideas rapidly, seeing multiple angles simultaneously.',
    dominantTypes: ['ENFP', 'ENTP'],
    auxiliaryTypes: ['INFP', 'INTP'],
    keywords: ['brainstorming', 'possibilities', 'connections', 'novelty', 'divergent thinking'],
    characteristics: [
      'Generates multiple ideas and possibilities rapidly',
      'Sees connections between seemingly unrelated concepts',
      'Energized by brainstorming and exploring "what if" scenarios',
      'Constantly scanning the environment for new opportunities',
      'Enjoys novelty and gets bored with routine',
      'Natural at seeing things from multiple perspectives simultaneously',
    ],
    strengths: ['Idea generation', 'Adaptability', 'Innovation', 'Seeing potential'],
    challenges: ['May struggle with follow-through', 'Can be scattered', 'Difficulty choosing one path'],
  },
  si: {
    code: 'Si',
    name: 'Introverted Sensing',
    nickname: 'The Detail Keeper',
    description: 'Stores and recalls detailed sensory impressions from past experiences. Creates a rich internal library of "how things are."',
    dominantTypes: ['ISFJ', 'ISTJ'],
    auxiliaryTypes: ['ESFJ', 'ESTJ'],
    keywords: ['memory', 'tradition', 'detail', 'consistency', 'past experience'],
    characteristics: [
      'Has detailed, vivid memories of past experiences',
      'Compares present situations to past experiences for guidance',
      'Values tradition, consistency, and proven methods',
      'Notices when things are different from how they "should" be',
      'Builds expertise through repeated experience and practice',
      'Creates and maintains reliable systems and routines',
    ],
    strengths: ['Attention to detail', 'Reliability', 'Institutional memory', 'Quality assurance'],
    challenges: ['May resist change', 'Can be overly focused on the past', 'May miss new possibilities'],
  },
  se: {
    code: 'Se',
    name: 'Extraverted Sensing',
    nickname: 'The Present Moment Master',
    description: 'Engages directly with the present moment through the five senses. Attuned to aesthetics, physical environment, and immediate opportunities.',
    dominantTypes: ['ESFP', 'ESTP'],
    auxiliaryTypes: ['ISFP', 'ISTP'],
    keywords: ['present moment', 'sensory experience', 'action', 'aesthetics', 'physical awareness'],
    characteristics: [
      'Fully present and engaged with the immediate environment',
      'Highly attuned to sensory details—sights, sounds, textures, tastes',
      'Quick to notice and respond to changes in the environment',
      'Energized by action and physical experiences',
      'Natural sense of aesthetics and style',
      'Thrives in high-stimulus, fast-paced situations',
    ],
    strengths: ['Quick reflexes', 'Aesthetic sense', 'Crisis response', 'Physical awareness'],
    challenges: ['May struggle with long-term planning', 'Can be impulsive', 'May overlook abstract implications'],
  },
  ti: {
    code: 'Ti',
    name: 'Introverted Thinking',
    nickname: 'The Logic Architect',
    description: 'Builds precise internal logical frameworks. Seeks to understand how things work at a fundamental level.',
    dominantTypes: ['INTP', 'ISTP'],
    auxiliaryTypes: ['ENTP', 'ESTP'],
    keywords: ['logic', 'analysis', 'frameworks', 'precision', 'understanding'],
    characteristics: [
      'Builds comprehensive internal models of how systems work',
      'Values logical consistency and precision above all',
      'Constantly refining understanding and categorizations',
      'Questions assumptions and seeks root causes',
      'Prefers understanding principles over following procedures',
      'Independent thinker who trusts internal analysis',
    ],
    strengths: ['Analytical depth', 'Problem-solving', 'System understanding', 'Logical precision'],
    challenges: ['May seem detached', 'Can over-analyze', 'May struggle communicating complex ideas'],
  },
  te: {
    code: 'Te',
    name: 'Extraverted Thinking',
    nickname: 'The Efficiency Expert',
    description: 'Organizes the external world for efficiency and results. Values measurable outcomes, clear processes, and getting things done.',
    dominantTypes: ['ENTJ', 'ESTJ'],
    auxiliaryTypes: ['INTJ', 'ISTJ'],
    keywords: ['efficiency', 'organization', 'results', 'systems', 'leadership'],
    characteristics: [
      'Naturally organizes people, processes, and resources for efficiency',
      'Focuses on measurable results and objective criteria',
      'Creates clear systems, procedures, and hierarchies',
      'Makes decisions based on logic and external evidence',
      'Drives toward goals with determination and directness',
      'Natural at delegation and project management',
    ],
    strengths: ['Organization', 'Leadership', 'Goal achievement', 'Systematic thinking'],
    challenges: ['May overlook feelings', 'Can be seen as controlling', 'May dismiss subjective factors'],
  },
  fi: {
    code: 'Fi',
    name: 'Introverted Feeling',
    nickname: 'The Values Guardian',
    description: 'Evaluates everything against a deep internal value system. Attuned to authenticity, personal meaning, and emotional integrity.',
    dominantTypes: ['INFP', 'ISFP'],
    auxiliaryTypes: ['ENFP', 'ESFP'],
    keywords: ['values', 'authenticity', 'meaning', 'integrity', 'personal ethics'],
    characteristics: [
      'Has a deeply personal, nuanced internal value system',
      'Immediately senses when something violates personal values',
      'Seeks authenticity in self and others',
      'Processes emotions internally and privately',
      'Strong sense of personal identity and integrity',
      'Advocates for causes aligned with deep values',
    ],
    strengths: ['Authenticity', 'Moral clarity', 'Empathy', 'Personal integrity'],
    challenges: ['May struggle expressing feelings', 'Can be seen as stubborn', 'May take criticism personally'],
  },
  fe: {
    code: 'Fe',
    name: 'Extraverted Feeling',
    nickname: 'The Harmony Weaver',
    description: 'Focused on social harmony and group dynamics. Reads and responds to the emotional atmosphere and meets others\' emotional needs.',
    dominantTypes: ['ENFJ', 'ESFJ'],
    auxiliaryTypes: ['INFJ', 'ISFJ'],
    keywords: ['harmony', 'connection', 'social dynamics', 'emotional atmosphere', 'group needs'],
    characteristics: [
      'Naturally reads and responds to the emotional atmosphere of groups',
      'Prioritizes maintaining harmony and positive relationships',
      'Skilled at meeting others\' emotional needs',
      'Values social norms and appropriate behavior',
      'Creates connection and brings people together',
      'Expresses emotions openly and encourages others to share',
    ],
    strengths: ['Social intelligence', 'Diplomacy', 'Team building', 'Emotional support'],
    challenges: ['May neglect own needs', 'Can be people-pleasing', 'May avoid necessary conflict'],
  },
};

export const typeData = {
  intj: {
    code: 'INTJ',
    name: 'The Architect',
    stack: 'Ni-Te-Fi-Se',
    description: 'Strategic visionaries who see the world as a chess board. They combine long-term vision with systematic execution to build complex systems and achieve ambitious goals.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Ni', description: 'Introverted Intuition provides strategic vision and pattern recognition' },
      { position: 'Auxiliary', function: 'Te', description: 'Extraverted Thinking executes plans with efficiency and logic' },
      { position: 'Tertiary', function: 'Fi', description: 'Introverted Feeling guides personal values and authenticity' },
      { position: 'Inferior', function: 'Se', description: 'Extraverted Sensing connects to present-moment experience' },
    ],
    keywords: ['strategic', 'independent', 'analytical', 'determined', 'innovative'],
    strengths: ['Strategic planning', 'Systems thinking', 'Independence', 'High standards', 'Innovation'],
    challenges: ['Impatience with inefficiency', 'May seem cold or arrogant', 'Perfectionism', 'Difficulty with small talk'],
    famousExamples: ['Elon Musk', 'Isaac Newton', 'Nikola Tesla', 'Michelle Obama'],
    careers: ['Engineer', 'Scientist', 'Strategist', 'Architect', 'Executive', 'Professor'],
  },
  intp: {
    code: 'INTP',
    name: 'The Logician',
    stack: 'Ti-Ne-Si-Fe',
    description: 'Analytical problem-solvers who love exploring theoretical frameworks. They seek to understand how things work at the deepest level.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Ti', description: 'Introverted Thinking builds precise logical frameworks' },
      { position: 'Auxiliary', function: 'Ne', description: 'Extraverted Intuition explores possibilities and connections' },
      { position: 'Tertiary', function: 'Si', description: 'Introverted Sensing provides memory and attention to detail' },
      { position: 'Inferior', function: 'Fe', description: 'Extraverted Feeling navigates social harmony' },
    ],
    keywords: ['analytical', 'curious', 'logical', 'inventive', 'independent'],
    strengths: ['Logical analysis', 'Innovation', 'Problem-solving', 'Abstract thinking', 'Objectivity'],
    challenges: ['Social situations', 'Emotional expression', 'Following through', 'Practical details'],
    famousExamples: ['Albert Einstein', 'Bill Gates', 'Marie Curie', 'Charles Darwin'],
    careers: ['Scientist', 'Philosopher', 'Software Developer', 'Engineer', 'Mathematician', 'Writer'],
  },
  entj: {
    code: 'ENTJ',
    name: 'The Commander',
    stack: 'Te-Ni-Se-Fi',
    description: 'Bold, strategic leaders who mobilize resources and people toward ambitious goals. Natural executives who create order from chaos.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Te', description: 'Extraverted Thinking organizes and executes efficiently' },
      { position: 'Auxiliary', function: 'Ni', description: 'Introverted Intuition provides strategic vision' },
      { position: 'Tertiary', function: 'Se', description: 'Extraverted Sensing engages with immediate reality' },
      { position: 'Inferior', function: 'Fi', description: 'Introverted Feeling connects to personal values' },
    ],
    keywords: ['decisive', 'ambitious', 'strategic', 'efficient', 'commanding'],
    strengths: ['Leadership', 'Strategic planning', 'Efficiency', 'Confidence', 'Organization'],
    challenges: ['May seem domineering', 'Impatience', 'Difficulty with emotions', 'Work-life balance'],
    famousExamples: ['Steve Jobs', 'Margaret Thatcher', 'Napoleon Bonaparte', 'Gordon Ramsay'],
    careers: ['Executive', 'Entrepreneur', 'Lawyer', 'Consultant', 'Manager', 'Politician'],
  },
  entp: {
    code: 'ENTP',
    name: 'The Debater',
    stack: 'Ne-Ti-Fe-Si',
    description: 'Quick-witted innovators who love intellectual challenges. They see possibilities everywhere and enjoy exploring ideas through debate.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Ne', description: 'Extraverted Intuition generates possibilities and connections' },
      { position: 'Auxiliary', function: 'Ti', description: 'Introverted Thinking analyzes and refines ideas' },
      { position: 'Tertiary', function: 'Fe', description: 'Extraverted Feeling engages with social dynamics' },
      { position: 'Inferior', function: 'Si', description: 'Introverted Sensing grounds in past experience' },
    ],
    keywords: ['innovative', 'clever', 'entrepreneurial', 'resourceful', 'outspoken'],
    strengths: ['Innovation', 'Debate', 'Problem-solving', 'Adaptability', 'Big-picture thinking'],
    challenges: ['Follow-through', 'Routine tasks', 'Sensitivity to others', 'Argumentativeness'],
    famousExamples: ['Thomas Edison', 'Mark Twain', 'Leonardo da Vinci', 'Socrates'],
    careers: ['Entrepreneur', 'Lawyer', 'Consultant', 'Inventor', 'Marketing', 'Journalist'],
  },
  infj: {
    code: 'INFJ',
    name: 'The Advocate',
    stack: 'Ni-Fe-Ti-Se',
    description: 'Insightful idealists driven to help others. They combine deep intuition with genuine care for people to create meaningful change.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Ni', description: 'Introverted Intuition provides deep insight and vision' },
      { position: 'Auxiliary', function: 'Fe', description: 'Extraverted Feeling connects with others\' needs' },
      { position: 'Tertiary', function: 'Ti', description: 'Introverted Thinking provides analytical framework' },
      { position: 'Inferior', function: 'Se', description: 'Extraverted Sensing engages with the physical world' },
    ],
    keywords: ['insightful', 'principled', 'compassionate', 'private', 'visionary'],
    strengths: ['Deep insight', 'Empathy', 'Dedication', 'Writing/creativity', 'Counseling'],
    challenges: ['Burnout', 'Perfectionism', 'Over-sensitivity', 'Difficulty with conflict'],
    famousExamples: ['Martin Luther King Jr.', 'Nelson Mandela', 'Carl Jung', 'Mother Teresa'],
    careers: ['Counselor', 'Writer', 'Psychologist', 'Teacher', 'Healthcare', 'Non-profit work'],
  },
  infp: {
    code: 'INFP',
    name: 'The Mediator',
    stack: 'Fi-Ne-Si-Te',
    description: 'Imaginative idealists guided by their own values and beliefs. They seek meaning and authenticity in everything they do.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Fi', description: 'Introverted Feeling guides deep personal values' },
      { position: 'Auxiliary', function: 'Ne', description: 'Extraverted Intuition explores possibilities' },
      { position: 'Tertiary', function: 'Si', description: 'Introverted Sensing connects to meaningful memories' },
      { position: 'Inferior', function: 'Te', description: 'Extraverted Thinking organizes and executes' },
    ],
    keywords: ['idealistic', 'creative', 'empathetic', 'authentic', 'reserved'],
    strengths: ['Creativity', 'Empathy', 'Writing', 'Deep thinking', 'Authenticity'],
    challenges: ['Practical matters', 'Criticism sensitivity', 'Self-isolation', 'Idealism vs reality'],
    famousExamples: ['William Shakespeare', 'J.R.R. Tolkien', 'Princess Diana', 'Edgar Allan Poe'],
    careers: ['Writer', 'Artist', 'Counselor', 'Psychologist', 'Teacher', 'Musician'],
  },
  enfj: {
    code: 'ENFJ',
    name: 'The Protagonist',
    stack: 'Fe-Ni-Se-Ti',
    description: 'Charismatic leaders who inspire others toward growth. They combine genuine care for people with a vision for what they can become.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Fe', description: 'Extraverted Feeling creates harmony and connection' },
      { position: 'Auxiliary', function: 'Ni', description: 'Introverted Intuition provides vision and insight' },
      { position: 'Tertiary', function: 'Se', description: 'Extraverted Sensing engages with the moment' },
      { position: 'Inferior', function: 'Ti', description: 'Introverted Thinking provides logical analysis' },
    ],
    keywords: ['charismatic', 'empathetic', 'inspiring', 'organized', 'diplomatic'],
    strengths: ['Leadership', 'Empathy', 'Communication', 'Inspiration', 'Organization'],
    challenges: ['Over-involvement', 'Approval-seeking', 'Neglecting own needs', 'Conflict avoidance'],
    famousExamples: ['Barack Obama', 'Oprah Winfrey', 'Martin Luther King Jr.', 'Abraham Lincoln'],
    careers: ['Teacher', 'Coach', 'Counselor', 'HR Manager', 'Public Relations', 'Politics'],
  },
  enfp: {
    code: 'ENFP',
    name: 'The Campaigner',
    stack: 'Ne-Fi-Te-Si',
    description: 'Enthusiastic, creative spirits who see life as full of possibilities. They inspire others with their energy and authenticity.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Ne', description: 'Extraverted Intuition explores endless possibilities' },
      { position: 'Auxiliary', function: 'Fi', description: 'Introverted Feeling guides authentic values' },
      { position: 'Tertiary', function: 'Te', description: 'Extraverted Thinking helps execute ideas' },
      { position: 'Inferior', function: 'Si', description: 'Introverted Sensing grounds in experience' },
    ],
    keywords: ['enthusiastic', 'creative', 'sociable', 'optimistic', 'free-spirited'],
    strengths: ['Creativity', 'Enthusiasm', 'Communication', 'Empathy', 'Adaptability'],
    challenges: ['Focus', 'Follow-through', 'Overthinking', 'Practical details'],
    famousExamples: ['Robin Williams', 'Walt Disney', 'Mark Twain', 'Oscar Wilde'],
    careers: ['Writer', 'Actor', 'Counselor', 'Journalist', 'Marketing', 'Entrepreneur'],
  },
  istj: {
    code: 'ISTJ',
    name: 'The Logistician',
    stack: 'Si-Te-Fi-Ne',
    description: 'Responsible and thorough individuals who value tradition and reliability. They are the backbone of institutions.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Si', description: 'Introverted Sensing stores detailed experience' },
      { position: 'Auxiliary', function: 'Te', description: 'Extraverted Thinking organizes and executes' },
      { position: 'Tertiary', function: 'Fi', description: 'Introverted Feeling guides personal values' },
      { position: 'Inferior', function: 'Ne', description: 'Extraverted Intuition considers possibilities' },
    ],
    keywords: ['responsible', 'thorough', 'dependable', 'traditional', 'practical'],
    strengths: ['Reliability', 'Organization', 'Attention to detail', 'Commitment', 'Practical skills'],
    challenges: ['Rigidity', 'Change resistance', 'Emotional expression', 'Seeing alternatives'],
    famousExamples: ['George Washington', 'Queen Elizabeth II', 'Warren Buffett', 'Angela Merkel'],
    careers: ['Accountant', 'Lawyer', 'Military', 'Administrator', 'Engineer', 'Manager'],
  },
  isfj: {
    code: 'ISFJ',
    name: 'The Defender',
    stack: 'Si-Fe-Ti-Ne',
    description: 'Caring protectors who remember details about the people they care for. They quietly ensure others are looked after.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Si', description: 'Introverted Sensing recalls personal details' },
      { position: 'Auxiliary', function: 'Fe', description: 'Extraverted Feeling cares for others\' needs' },
      { position: 'Tertiary', function: 'Ti', description: 'Introverted Thinking provides logical analysis' },
      { position: 'Inferior', function: 'Ne', description: 'Extraverted Intuition explores possibilities' },
    ],
    keywords: ['supportive', 'reliable', 'patient', 'observant', 'loyal'],
    strengths: ['Reliability', 'Patience', 'Care for others', 'Memory', 'Practical support'],
    challenges: ['Overworking', 'Difficulty saying no', 'Change resistance', 'Neglecting self'],
    famousExamples: ['Mother Teresa', 'Queen Elizabeth II', 'Rosa Parks', 'Kate Middleton'],
    careers: ['Nurse', 'Teacher', 'Administrator', 'Social Worker', 'Librarian', 'Healthcare'],
  },
  estj: {
    code: 'ESTJ',
    name: 'The Executive',
    stack: 'Te-Si-Ne-Fi',
    description: 'Organized leaders who value order, tradition, and getting things done. They excel at managing people and processes.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Te', description: 'Extraverted Thinking organizes and directs' },
      { position: 'Auxiliary', function: 'Si', description: 'Introverted Sensing values proven methods' },
      { position: 'Tertiary', function: 'Ne', description: 'Extraverted Intuition considers alternatives' },
      { position: 'Inferior', function: 'Fi', description: 'Introverted Feeling connects to values' },
    ],
    keywords: ['organized', 'logical', 'assertive', 'practical', 'direct'],
    strengths: ['Organization', 'Leadership', 'Dedication', 'Reliability', 'Directness'],
    challenges: ['Inflexibility', 'Impatience', 'Emotional sensitivity', 'Work-life balance'],
    famousExamples: ['Henry Ford', 'Judge Judy', 'John D. Rockefeller', 'Lyndon B. Johnson'],
    careers: ['Manager', 'Administrator', 'Military', 'Lawyer', 'Business Owner', 'Judge'],
  },
  esfj: {
    code: 'ESFJ',
    name: 'The Consul',
    stack: 'Fe-Si-Ne-Ti',
    description: 'Warm, social connectors who create harmony in their communities. They remember personal details and care deeply about others.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Fe', description: 'Extraverted Feeling creates social harmony' },
      { position: 'Auxiliary', function: 'Si', description: 'Introverted Sensing remembers personal details' },
      { position: 'Tertiary', function: 'Ne', description: 'Extraverted Intuition considers possibilities' },
      { position: 'Inferior', function: 'Ti', description: 'Introverted Thinking provides logical analysis' },
    ],
    keywords: ['caring', 'sociable', 'traditional', 'loyal', 'organized'],
    strengths: ['Social skills', 'Loyalty', 'Practical care', 'Organization', 'Reliability'],
    challenges: ['Approval-seeking', 'Conflict sensitivity', 'Change resistance', 'Self-neglect'],
    famousExamples: ['Taylor Swift', 'Bill Clinton', 'Jennifer Garner', 'Sally Field'],
    careers: ['Teacher', 'Nurse', 'Administrator', 'Social Worker', 'Event Planner', 'Healthcare'],
  },
  istp: {
    code: 'ISTP',
    name: 'The Virtuoso',
    stack: 'Ti-Se-Ni-Fe',
    description: 'Cool-headed problem-solvers who excel with hands-on challenges. They understand how systems work and troubleshoot effectively.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Ti', description: 'Introverted Thinking analyzes how things work' },
      { position: 'Auxiliary', function: 'Se', description: 'Extraverted Sensing engages with physical reality' },
      { position: 'Tertiary', function: 'Ni', description: 'Introverted Intuition provides insight' },
      { position: 'Inferior', function: 'Fe', description: 'Extraverted Feeling navigates social situations' },
    ],
    keywords: ['practical', 'observant', 'analytical', 'reserved', 'adaptable'],
    strengths: ['Problem-solving', 'Crisis response', 'Technical skills', 'Adaptability', 'Calm under pressure'],
    challenges: ['Emotional expression', 'Long-term planning', 'Commitment', 'Social conventions'],
    famousExamples: ['Steve Jobs', 'Bruce Lee', 'Clint Eastwood', 'Michael Jordan'],
    careers: ['Engineer', 'Mechanic', 'Pilot', 'Surgeon', 'Forensics', 'Craftsperson'],
  },
  isfp: {
    code: 'ISFP',
    name: 'The Adventurer',
    stack: 'Fi-Se-Ni-Te',
    description: 'Gentle artists who live in the present and express themselves through action. They have strong values and aesthetic sense.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Fi', description: 'Introverted Feeling guides personal values' },
      { position: 'Auxiliary', function: 'Se', description: 'Extraverted Sensing engages with beauty and experience' },
      { position: 'Tertiary', function: 'Ni', description: 'Introverted Intuition provides insight' },
      { position: 'Inferior', function: 'Te', description: 'Extraverted Thinking organizes and executes' },
    ],
    keywords: ['artistic', 'sensitive', 'helpful', 'flexible', 'quiet'],
    strengths: ['Artistic expression', 'Sensitivity', 'Present-moment awareness', 'Loyalty', 'Aesthetic sense'],
    challenges: ['Long-term planning', 'Self-assertion', 'Dealing with conflict', 'Structure'],
    famousExamples: ['Bob Dylan', 'Rihanna', 'David Bowie', 'Frida Kahlo'],
    careers: ['Artist', 'Musician', 'Photographer', 'Chef', 'Veterinarian', 'Physical Therapist'],
  },
  estp: {
    code: 'ESTP',
    name: 'The Entrepreneur',
    stack: 'Se-Ti-Fe-Ni',
    description: 'Energetic risk-takers who thrive on action and live in the moment. They read situations quickly and act decisively.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Se', description: 'Extraverted Sensing engages with immediate reality' },
      { position: 'Auxiliary', function: 'Ti', description: 'Introverted Thinking analyzes and problem-solves' },
      { position: 'Tertiary', function: 'Fe', description: 'Extraverted Feeling reads social situations' },
      { position: 'Inferior', function: 'Ni', description: 'Introverted Intuition considers long-term implications' },
    ],
    keywords: ['energetic', 'perceptive', 'direct', 'rational', 'bold'],
    strengths: ['Quick thinking', 'Negotiation', 'Crisis response', 'Persuasion', 'Adaptability'],
    challenges: ['Long-term planning', 'Patience', 'Sensitivity to others', 'Following rules'],
    famousExamples: ['Donald Trump', 'Ernest Hemingway', 'Madonna', 'Bruce Willis'],
    careers: ['Entrepreneur', 'Sales', 'Paramedic', 'Sports', 'Marketing', 'Police'],
  },
  esfp: {
    code: 'ESFP',
    name: 'The Entertainer',
    stack: 'Se-Fi-Te-Ni',
    description: 'Spontaneous entertainers who bring joy and energy to every situation. They love people and new experiences.',
    cognitiveStack: [
      { position: 'Dominant', function: 'Se', description: 'Extraverted Sensing engages with the world' },
      { position: 'Auxiliary', function: 'Fi', description: 'Introverted Feeling guides personal values' },
      { position: 'Tertiary', function: 'Te', description: 'Extraverted Thinking helps with practical matters' },
      { position: 'Inferior', function: 'Ni', description: 'Introverted Intuition considers deeper meaning' },
    ],
    keywords: ['spontaneous', 'energetic', 'friendly', 'playful', 'practical'],
    strengths: ['Social skills', 'Optimism', 'Practical problem-solving', 'Adaptability', 'Present-focus'],
    challenges: ['Long-term planning', 'Focus', 'Serious topics', 'Delayed gratification'],
    famousExamples: ['Marilyn Monroe', 'Elvis Presley', 'Jamie Oliver', 'Adele'],
    careers: ['Entertainer', 'Sales', 'Teacher', 'Event Planner', 'Healthcare', 'Hospitality'],
  },
};

export const pageData = {
  '/': {
    title: 'TypeJung - Jungian Energy Map Assessment',
    description: 'Take a free depth-based Jungian assessment that maps cognitive functions, energy flow, and inferior-function stress for educational self-reflection.',
  },
  '/assessment': {
    title: 'Take the Free Jungian Cognitive Function Assessment | TypeJung',
    description: 'Start your free 42-question Jungian cognitive function assessment. Measures all 8 functions, inferior-function pressure, somatic signals, and attitude direction.',
  },
  '/results': {
    title: 'Your Results | TypeJung',
    description: 'View your Jungian energy map with function scores, dominant-inferior axis, stress-edge context, and growth guidance.',
  },
  '/learn': {
    title: 'Learn Jungian Typology | TypeJung',
    description: 'Understand Carl Jung\'s theory of psychological types, the 8 cognitive functions, and how they shape personality.',
  },
  '/pricing': {
    title: 'Pricing Plans | TypeJung',
    description: 'Choose your TypeJung plan: Free, Insight (CA$19), or Mastery (CA$39). One-time CAD upgrades add deeper interpretation, practice guidance, and coaching support.',
  },
  '/privacy': {
    title: 'Privacy Policy | TypeJung',
    description: 'TypeJung\'s privacy policy explains how we collect, use, and protect your personal information.',
  },
  '/terms': {
    title: 'Terms of Service | TypeJung',
    description: 'Terms and conditions for using the TypeJung cognitive function assessment platform.',
  },
  '/jungian-test': {
    title: 'Jungian Test - Measure Your Cognitive Functions | TypeJung',
    description: 'Take a Jungian test that maps all 8 cognitive functions, shows your likely type pattern, and supports educational self-reflection.',
  },
  '/mbti-alternative': {
    title: 'MBTI Alternative - Function-Based Personality Test | TypeJung',
    description: 'Looking for an MBTI alternative? TypeJung measures all 8 Jungian cognitive functions instead of forcing binary personality letters.',
  },
  '/inferior-function-test': {
    title: 'Inferior Function Test - Find Your Stress Pattern | TypeJung',
    description: 'Find your likely inferior function and understand how it can show up under stress with TypeJung\'s cognitive function assessment.',
  },
  '/cognitive-function-test': {
    title: 'Cognitive Function Test - Measure All 8 Functions | TypeJung',
    description: 'Take a cognitive function test that scores Ni, Ne, Si, Se, Ti, Te, Fi, and Fe independently and maps your full Jungian profile.',
  },
};

export const seoLandingPages = [
  {
    slug: 'jungian-test',
    query: 'Jungian test',
    title: 'Jungian Test - Measure Your Cognitive Functions | TypeJung',
    description: 'Take a Jungian test that maps all 8 cognitive functions, shows your likely type pattern, and supports educational self-reflection.',
    keywords: ['Jungian test', 'Carl Jung personality test', 'Jungian personality test', 'Jung cognitive functions'],
    eyebrow: 'Jungian test',
    h1: 'A Jungian test that goes beyond a four-letter label',
    intro: [
      'TypeJung is a Jungian self-assessment for people who want more than a quick type label. It measures how you use all 8 cognitive functions, then turns that profile into an educational map of attention, decision-making, and stress patterns.',
      'The free assessment takes about 12 to 16 minutes. Paid reports are optional one-time CAD upgrades: Insight for CA$19 and Mastery for CA$39.',
    ],
    intent: {
      bestFor: 'Searchers who want a Jungian test with visible cognitive-function evidence, not only a fast type label.',
      measures: 'All 8 function-attitudes, dominant-inferior tension, behavioral scenarios, stress signals, somatic cues, and attitude direction.',
      privacy: 'The free assessment can be started before paying. Account features are for saved history and paid report access.',
    },
    sections: [
      {
        heading: 'What a Jungian test should show',
        body: [
          'Carl Jung described psychological type through patterns of perception and judgment. A useful Jungian test should therefore look at the function pattern behind the result, not only the final type code.',
          'TypeJung scores the intuitive, sensing, thinking, and feeling functions in both introverted and extraverted attitudes. That creates a richer profile than a simple either-or quiz and helps explain why nearby type labels can both feel partly true.',
        ],
        bullets: [
          'Perceiving functions: Ni, Ne, Si, and Se',
          'Judging functions: Ti, Te, Fi, and Fe',
          'Likely dominant, auxiliary, tertiary, and inferior patterns',
          'Stress signals connected to the inferior function',
          'A result you can inspect as a hypothesis rather than memorize as an identity',
        ],
        links: [
          { href: '/cognitive-functions', label: 'Read the guide to all 8 cognitive functions' },
          { href: '/jungian-cognitive-functions-test', label: 'Compare the full Jungian cognitive functions test' },
        ],
      },
      {
        heading: 'How TypeJung is different from a quick personality quiz',
        body: [
          'Many personality quizzes ask direct identity questions such as whether you are organized, emotional, intuitive, or social. Those answers can change with role, mood, age, stress, and what you want to believe about yourself.',
          'TypeJung uses scenario evidence instead. It asks how your attention behaves, how decisions get made, what happens when pressure rises, and where your body registers engagement or threat. That gives the result more texture than a label-only quiz.',
        ],
        table: {
          headers: ['What searchers need', 'Quick label quiz', 'TypeJung approach'],
          rows: [
            ['Result format', 'A single type code', 'Function map plus likely type pattern'],
            ['Jungian depth', 'Usually light or implied', 'Function-attitude and dominant-inferior interpretation'],
            ['Stress insight', 'Generic advice', 'Inferior-function and grip pattern context'],
            ['Payment path', 'Often pay before depth is clear', 'Free core map first, optional one-time upgrades later'],
          ],
        },
      },
      {
        heading: 'How to read your Jungian test result',
        body: [
          'Your result is best read as a working hypothesis. The strongest scores show the functions you may rely on most. The lower or less stable scores can point toward the parts of the psyche that need patience, context, and development.',
          'Use the free result to orient yourself, then use the Learn section to compare your pattern with the 8 functions and 16 type profiles.',
        ],
        bullets: [
          'Start with the top two functions, because they often explain what feels natural and trusted',
          'Then study the likely inferior function, because that is where stress and growth usually become visible',
          'Compare your likely type page with the function scores instead of forcing a result that does not fit',
        ],
        links: [
          { href: '/types/infj', label: 'Example type guide: INFJ' },
          { href: '/types/intp', label: 'Example type guide: INTP' },
          { href: '/learn', label: 'Learn how to interpret the result' },
        ],
      },
      {
        heading: 'When a paid report helps',
        body: [
          'The free assessment gives you the core map. Insight adds developmental edge analysis, a stress pattern map, relationship triggers, personalized practice guidance, and lifetime unlocked result access for a one-time CA$19 payment. Mastery adds the AI Type Coach, an individuation roadmap, reassessment tracking, a practice library, and priority support for a one-time CA$39 payment.',
          'The best path is to take the free test first. Upgrade only if the function map feels accurate enough to make deeper interpretation useful.',
        ],
        links: [
          { href: '/pricing', label: 'Compare Free, Insight, and Mastery pricing' },
          { href: '/assessment', label: 'Start the free Jungian assessment' },
        ],
      },
    ],
    faqs: [
      {
        question: 'Is TypeJung a clinical Jungian test?',
        answer: 'No. TypeJung is for education and self-exploration. It is not a medical, psychological, or clinical diagnostic tool.',
      },
      {
        question: 'How long does the Jungian test take?',
        answer: 'Most people complete the free 42-question assessment in about 12 to 16 minutes.',
      },
      {
        question: 'Does TypeJung give me an MBTI type?',
        answer: 'TypeJung can suggest a likely type pattern, but the main value is the full cognitive function profile behind the type.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/jungian-typology', label: 'Jungian typology guide' },
      { href: '/cognitive-functions', label: 'Cognitive functions guide' },
      { href: '/learn', label: 'Learn Jungian typology' },
      { href: '/pricing', label: 'Compare Free, Insight, and Mastery' },
    ],
  },
  {
    slug: 'mbti-alternative',
    query: 'MBTI alternative',
    title: 'MBTI Alternative - Function-Based Personality Test | TypeJung',
    description: 'Looking for an MBTI alternative? TypeJung measures all 8 Jungian cognitive functions instead of forcing binary personality letters.',
    keywords: ['MBTI alternative', 'alternative to MBTI', 'function based personality test', 'Jungian typology'],
    eyebrow: 'MBTI alternative',
    h1: 'An MBTI alternative built around cognitive functions',
    intro: [
      'If MBTI-style tests keep giving you different four-letter results, the problem may be the format. Many tests force binary choices, then compress your answers into a label before you can see the underlying pattern.',
      'TypeJung is an MBTI alternative that scores all 8 Jungian cognitive functions independently. The result is a profile you can inspect, question, and use for development.',
    ],
    intent: {
      bestFor: 'People who like type language but want a more inspectable MBTI alternative with cognitive-function evidence.',
      measures: 'Independent function scores, likely type pattern, inferior-function pressure, and context for why MBTI results change.',
      privacy: 'Start free without paying first. Upgrade only after the function profile feels useful.',
    },
    sections: [
      {
        heading: 'Why people look for an alternative',
        body: [
          'Four-letter personality tests can be useful shorthand, but they often hide the most important information: which functions are actually strong, weak, balanced, or under stress.',
          'A person who receives INFP on one test and INFJ on another may not need another label. They may need to see the relative strength of Fi, Fe, Ni, Ne, Si, Se, Ti, and Te.',
        ],
        bullets: [
          'No forced choice between intuition and sensing as if one removes the other',
          'No assumption that everyone inside a type has the same function development',
          'More visibility into stress patterns and inferior-function tension',
          'A result that lets you inspect nearby type possibilities instead of hiding close scores',
        ],
        links: [
          { href: '/mbti-keeps-changing', label: 'Why your MBTI result keeps changing' },
          { href: '/infj-vs-infp-test', label: 'Compare INFJ vs INFP through function evidence' },
        ],
      },
      {
        heading: 'TypeJung versus a typical MBTI-style quiz',
        body: [
          'TypeJung still speaks the language of Jungian type, but it treats type as an interpretation of a function profile. That makes the result more useful for people who already know the basics and want a clearer self-assessment.',
          'This matters for searchers who are deciding whether to take another personality test. If your main goal is a quick social label, a simple quiz may be enough. If your goal is to understand the pattern behind the label, function evidence is more useful.',
        ],
        table: {
          headers: ['Question', 'Typical MBTI-style quiz', 'TypeJung'],
          rows: [
            ['What gets measured?', 'Four broad preference pairs', 'All 8 cognitive functions'],
            ['How are results shown?', 'A four-letter type label', 'Function scores plus likely type pattern'],
            ['What is the development angle?', 'General type advice', 'Dominant, auxiliary, inferior, stress, and development themes'],
            ['What is free?', 'Usually a basic type result', 'A free 42-question assessment and core profile'],
            ['How are close results handled?', 'Often hidden behind a final label', 'Shown as a profile you can compare'],
          ],
        },
      },
      {
        heading: 'When TypeJung is the better alternative',
        body: [
          'TypeJung is strongest when the question is not simply "what type am I?" but "why do I keep getting this result, and what pattern does it point toward?"',
          'Use it when you want to compare function pairs, see stress-edge evidence, or understand whether a result is stable enough to build self-reflection around.',
        ],
        bullets: [
          'You keep testing between two nearby types',
          'You want the cognitive functions behind a four-letter code',
          'You care about growth, stress, and relationship triggers',
          'You want a free first result before deciding whether a deeper report is worth it',
        ],
      },
      {
        heading: 'What to do after your result',
        body: [
          'Start with the free assessment, then compare your strongest and weakest functions in the Learn section. If you want a deeper written interpretation, the Insight and Mastery reports are optional one-time CAD purchases.',
        ],
        links: [
          { href: '/assessment', label: 'Take the free TypeJung assessment' },
          { href: '/cognitive-function-test', label: 'See the cognitive function test page' },
          { href: '/blog/best-mbti-alternative-tests', label: 'Read the MBTI alternatives guide' },
        ],
      },
    ],
    faqs: [
      {
        question: 'Is TypeJung the same as MBTI?',
        answer: 'No. TypeJung uses Jungian type language, but it focuses on independent cognitive function scoring rather than only a four-letter result.',
      },
      {
        question: 'Can TypeJung help if my MBTI result changes?',
        answer: 'Yes. Seeing your full function profile can explain why nearby type labels may compete, especially when two functions score close together.',
      },
      {
        question: 'Is the MBTI alternative free?',
        answer: 'The core TypeJung assessment is free. Deeper Insight and Mastery reports are optional one-time CAD upgrades.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/blog/singer-loomis-vs-mbti', label: 'Singer-Loomis vs MBTI' },
      { href: '/jungian-typology', label: 'Jungian typology guide' },
      { href: '/learn', label: 'Explore all 8 functions' },
      { href: '/pricing', label: 'View one-time pricing' },
    ],
  },
  {
    slug: 'inferior-function-test',
    query: 'inferior function test',
    title: 'Inferior Function Test - Find Your Stress Pattern | TypeJung',
    description: 'Find your likely inferior function and understand how it can show up under stress with TypeJung\'s cognitive function assessment.',
    keywords: ['inferior function test', 'inferior cognitive function', 'the grip Jungian', 'stress personality test'],
    eyebrow: 'Inferior function test',
    h1: 'Find your likely inferior function and stress pattern',
    intro: [
      'Your inferior function is often the least conscious part of your Jungian function stack. It can feel awkward, compelling, or strangely powerful under stress.',
      'TypeJung estimates inferior-function patterns by measuring the whole cognitive profile first. That matters because the inferior function is not just the lowest number. It sits in relationship to the dominant function and the rest of the stack.',
    ],
    intent: {
      bestFor: 'People who want to understand stress patterns, grip reactions, and the growth edge behind a Jungian type result.',
      measures: 'Dominant-inferior tension, pressure responses, function imbalance, attraction and avoidance signals, and recovery themes.',
      privacy: 'Educational self-reflection only. It is not a mental health diagnosis, and severe distress belongs with a qualified professional.',
    },
    sections: [
      {
        heading: 'Why the inferior function matters',
        body: [
          'In Jungian typology, the inferior function often marks a growth edge. It may show up as avoidance in everyday life and as overreaction during pressure. Learning the pattern gives you a way to notice stress before it takes over.',
          'A good inferior function test should not simply ask what you are bad at. It should compare the whole function profile and look at the tension between what feels controlled and what becomes reactive.',
        ],
        bullets: [
          'Ni-dominant patterns often struggle with inferior Se under stress',
          'Ne-dominant patterns often struggle with inferior Si under stress',
          'Ti-dominant patterns often struggle with inferior Fe under stress',
          'Fi-dominant patterns often struggle with inferior Te under stress',
          'Fe-dominant patterns often struggle with inferior Ti under stress',
          'Te-dominant patterns often struggle with inferior Fi under stress',
        ],
        links: [
          { href: '/blog/what-is-the-inferior-function', label: 'Read: what is the inferior function?' },
          { href: '/blog/what-does-it-mean-to-be-in-the-grip', label: 'Read: what it means to be in the grip' },
        ],
      },
      {
        heading: 'What the test looks for',
        body: [
          'A useful inferior-function test needs more than a single question about weakness. TypeJung looks at how you attend, decide, respond to pressure, and distribute energy across the 8 functions.',
          'The result helps you compare likely dominant and inferior poles, then gives you a language for recovery and development.',
        ],
        table: {
          headers: ['Signal', 'What it can reveal', 'Why it matters'],
          rows: [
            ['Stress reaction', 'What takes over when control weakens', 'Often points toward inferior-function material'],
            ['Avoidance pattern', 'What you postpone, dismiss, or overcompensate for', 'Shows where development may be needed'],
            ['Attraction or envy', 'What feels powerful in others but hard to own', 'Can mark a less conscious function'],
            ['Recovery need', 'What helps you regain balance', 'Turns insight into practical self-observation'],
          ],
        },
      },
      {
        heading: 'Inferior function examples',
        body: [
          'If the likely inferior function is Se, stress may involve sensory overwhelm, impulsive action, or difficulty staying grounded in the present. If the likely inferior function is Fe, stress may involve social over-reading, rejection sensitivity, or awkward attempts to repair harmony.',
          'These examples are not diagnoses. They are prompts for observation: what appears repeatedly, under what conditions, and what helps you return to choice?',
        ],
        links: [
          { href: '/functions/se', label: 'Learn Introverted Intuition vs Extraverted Sensing patterns' },
          { href: '/functions/fe', label: 'Learn Introverted Thinking vs Extraverted Feeling patterns' },
          { href: '/shadow-work-test', label: 'Explore the Jungian shadow work test' },
        ],
      },
      {
        heading: 'Use your result carefully',
        body: [
          'Inferior-function language can be clarifying, but it should not become a self-criticism tool. Treat the result as a map for observation. If stress feels severe or persistent, work with a qualified professional.',
          'The best next step is to take the free assessment, read the inferred dominant-inferior axis, then compare it against real situations for a few weeks before turning it into a fixed identity.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is the inferior function just my weakest function?',
        answer: 'Not always. The inferior function is understood in relation to the dominant function and the whole stack, so TypeJung interprets the broader pattern.',
      },
      {
        question: 'What is the grip?',
        answer: 'The grip is a Jungian term for a stress state where the inferior function can show up in a reactive or exaggerated way.',
      },
      {
        question: 'Will the test diagnose my stress?',
        answer: 'No. TypeJung offers educational personality insight. It does not diagnose stress, trauma, anxiety, or any mental health condition.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/shadow-work-test', label: 'Jungian self-observation test' },
      { href: '/blog/understanding-the-grip', label: 'Read about the grip' },
      { href: '/learn', label: 'Learn the function stack' },
    ],
  },
  {
    slug: 'cognitive-function-test',
    query: 'cognitive function test',
    title: 'Cognitive Function Test - Measure All 8 Functions | TypeJung',
    description: 'Take a cognitive function test that scores Ni, Ne, Si, Se, Ti, Te, Fi, and Fe independently and maps your full Jungian profile.',
    keywords: ['cognitive function test', '8 cognitive functions test', 'Jungian cognitive functions', 'Ni Ne Si Se Ti Te Fi Fe test'],
    eyebrow: 'Cognitive function test',
    h1: 'A cognitive function test for all 8 Jungian functions',
    intro: [
      'TypeJung measures Ni, Ne, Si, Se, Ti, Te, Fi, and Fe independently so you can see the shape of your cognitive profile instead of guessing from a type description.',
      'The free assessment gives you a function map and likely type pattern. Optional paid reports add deeper analysis with one-time CAD pricing: CA$19 for Insight and CA$39 for Mastery.',
    ],
    intent: {
      bestFor: 'Searchers who want a cognitive function test that shows all 8 scores and explains the pattern behind them.',
      measures: 'Ni, Ne, Si, Se, Ti, Te, Fi, Fe, likely type pattern, dominant-inferior axis, stress signals, and interpretation confidence.',
      privacy: 'The core 42-question result is free. Paid reports are optional one-time upgrades after the result is visible.',
    },
    sections: [
      {
        heading: 'The 8 functions TypeJung measures',
        body: [
          'The test separates perceiving functions, which describe how information comes into awareness, from judging functions, which describe how decisions and evaluations are made.',
          'This is useful because people rarely fit cleanly into one simple trait pair. You may have strong intuition and still rely on sensing in specific contexts, or score close between two judging functions when work and relationships ask different things from you.',
        ],
        bullets: [
          'Ni: convergent pattern insight and future orientation',
          'Ne: divergent possibility scanning and idea generation',
          'Si: memory, continuity, and experience-based comparison',
          'Se: present-moment awareness and direct engagement',
          'Ti: internal logic, precision, and model building',
          'Te: external organization, results, and execution',
          'Fi: personal values, authenticity, and inner alignment',
          'Fe: relational attunement, harmony, and shared values',
        ],
        links: [
          { href: '/functions/ni', label: 'Introverted Intuition guide' },
          { href: '/functions/ne', label: 'Extraverted Intuition guide' },
          { href: '/functions/ti', label: 'Introverted Thinking guide' },
          { href: '/functions/fe', label: 'Extraverted Feeling guide' },
        ],
      },
      {
        heading: 'What you receive after the assessment',
        body: [
          'Your result shows relative function strength and a likely type interpretation. That gives you a way to inspect the data instead of accepting a black-box label.',
          'The result is designed for self-reflection, not clinical diagnosis. It gives you language for attention, judgment, stress, and development so you can test the pattern against real life.',
        ],
        bullets: [
          'A free cognitive function profile',
          'A likely Jungian type pattern',
          'Educational links for each function',
          'Optional deeper reports for stress patterns, relationship triggers, and practice guidance',
        ],
      },
      {
        heading: 'Why all 8 scores matter',
        body: [
          'The most useful insight often comes from the relationships between scores. A high dominant score can show what feels natural. A close auxiliary score can show how that strength gets supported. A lower or reactive function can point toward stress and growth.',
          'That is why TypeJung avoids reducing the result to only one function or one type code. The function map lets you compare competing hypotheses instead of hiding uncertainty.',
        ],
        table: {
          headers: ['Pattern in the score', 'Possible meaning', 'What to inspect next'],
          rows: [
            ['Two high perceiving functions', 'You may switch between pattern insight, possibilities, memory, or direct experience by context', 'Compare Ni, Ne, Si, and Se descriptions'],
            ['High thinking and feeling', 'Decision-making may combine logic and values rather than one simple preference', 'Compare Ti, Te, Fi, and Fe examples'],
            ['One function feels reactive', 'It may be less conscious or stress-linked', 'Read the inferior function page'],
            ['Nearby type possibilities', 'Your likely type may need interpretation, not force', 'Read the matching type pages'],
          ],
        },
      },
      {
        heading: 'Best next step',
        body: [
          'Take the assessment first, then use the Learn section to understand your top two functions and your possible inferior function. The pattern between those positions is usually more useful than any single score.',
        ],
        links: [
          { href: '/assessment', label: 'Start the free cognitive function test' },
          { href: '/jungian-typology', label: 'Read the Jungian typology guide' },
          { href: '/inferior-function-test', label: 'Find your inferior-function pattern' },
        ],
      },
    ],
    faqs: [
      {
        question: 'Does the cognitive function test measure all 8 functions?',
        answer: 'Yes. TypeJung scores Ni, Ne, Si, Se, Ti, Te, Fi, and Fe rather than only asking broad type-dichotomy questions.',
      },
      {
        question: 'Is the cognitive function test free?',
        answer: 'The core 42-question assessment is free. Insight and Mastery are optional one-time CAD paid reports.',
      },
      {
        question: 'Can I use the result to find my type?',
        answer: 'Yes. The function profile supports a likely type interpretation, but the profile itself is the main source of self-reflection.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Start the test' },
      { href: '/cognitive-functions', label: 'Cognitive functions guide' },
      { href: '/functions/ni', label: 'Introverted Intuition' },
      { href: '/functions/ti', label: 'Introverted Thinking' },
    ],
  },
  {
    slug: 'infj-vs-infp-test',
    query: 'INFJ vs INFP test',
    title: 'INFJ vs INFP Test - Compare Ni-Fe and Fi-Ne | TypeJung',
    description: 'Use TypeJung as an INFJ vs INFP test by comparing Ni-Fe and Fi-Ne evidence instead of relying on stereotypes.',
    keywords: ['INFJ vs INFP test', 'INFJ or INFP', 'Ni Fe vs Fi Ne', 'INFJ INFP cognitive functions'],
    eyebrow: 'INFJ vs INFP test',
    h1: 'INFJ vs INFP: test the function pattern, not the stereotype',
    intro: [
      'INFJ and INFP can both look private, sensitive, idealistic, and meaning-focused. That is why stereotype-based quizzes often confuse them.',
      'TypeJung helps you compare the function evidence behind the labels: Ni-Fe for INFJ-like patterns and Fi-Ne for INFP-like patterns.',
    ],
    sections: [
      {
        heading: 'The real comparison: Ni-Fe versus Fi-Ne',
        body: [
          'INFJ usually points toward introverted intuition supported by extraverted feeling. INFP usually points toward introverted feeling supported by extraverted intuition.',
          'Both patterns can care deeply, but they organize experience differently. Ni-Fe tends to converge on a pattern and translate it relationally. Fi-Ne tends to protect inner meaning and explore possibilities around it.',
        ],
        table: {
          headers: ['Question', 'INFJ-like Ni-Fe', 'INFP-like Fi-Ne'],
          rows: [
            ['What comes first?', 'A converging pattern or future implication', 'A felt sense of personal truth or value'],
            ['How does care show up?', 'Reading relational atmosphere and adjusting communication', 'Protecting authenticity and inner alignment'],
            ['What creates stress?', 'Concrete limits, sensory overwhelm, or loss of groundedness', 'External demands, efficiency pressure, or being forced to systematize'],
          ],
        },
      },
      {
        heading: 'Why a normal quiz may not settle it',
        body: [
          'Many quizzes ask whether you are organized, emotional, creative, or introverted. Those answers can shift with age, work, relationships, and stress.',
          'A better INFJ vs INFP test looks for the order of attention: whether insight narrows toward one symbolic pattern or value opens into many possible meanings.',
        ],
      },
      {
        heading: 'Use TypeJung as the next check',
        body: [
          'Take the free assessment, then compare your strongest intuition and feeling signals, attitude direction, and likely inferior-function pressure. The result will not force certainty too quickly, but it gives a clearer map than a label-only quiz.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can TypeJung tell me if I am INFJ or INFP?',
        answer: 'TypeJung gives a likely type pattern and function map. Use it to compare Ni-Fe and Fi-Ne evidence instead of treating any test as final identity.',
      },
      {
        question: 'Why do INFJ and INFP get confused?',
        answer: 'They can share interests, sensitivity, introversion, and idealism. The difference is usually the function process underneath the behavior.',
      },
      {
        question: 'Is this INFJ vs INFP test free?',
        answer: 'The core 42-question TypeJung assessment is free. Deeper reports are optional one-time CAD upgrades.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/blog/infj-vs-infp-cognitive-functions', label: 'INFJ vs INFP guide' },
      { href: '/functions/ni', label: 'Introverted Intuition' },
      { href: '/functions/fi', label: 'Introverted Feeling' },
      { href: '/types/infj', label: 'INFJ type guide' },
      { href: '/types/infp', label: 'INFP type guide' },
    ],
  },
  {
    slug: 'intj-vs-intp-test',
    query: 'INTJ vs INTP test',
    title: 'INTJ vs INTP Test - Compare Ni-Te and Ti-Ne | TypeJung',
    description: 'Use TypeJung as an INTJ vs INTP test by comparing Ni-Te and Ti-Ne function evidence instead of stereotypes.',
    keywords: ['INTJ vs INTP test', 'INTJ or INTP', 'Ni Te vs Ti Ne', 'INTJ INTP cognitive functions'],
    eyebrow: 'INTJ vs INTP test',
    h1: 'INTJ vs INTP: test how your thinking actually works',
    intro: [
      'INTJ and INTP are often compared through shallow stereotypes: planner versus procrastinator, strategist versus philosopher, confident versus detached.',
      'TypeJung makes the comparison more useful by looking at the function pattern: Ni-Te for INTJ-like convergence and execution, Ti-Ne for INTP-like precision and possibility testing.',
    ],
    sections: [
      {
        heading: 'The real comparison: Ni-Te versus Ti-Ne',
        body: [
          'An INTJ-like pattern often starts with a strategic read of where things are going, then organizes action around that direction. An INTP-like pattern often starts by refining the internal model, then tests alternate explanations.',
          'Both can be analytical and private. The difference is whether insight tends to converge toward a plan or logic tends to stay open while the model becomes cleaner.',
        ],
        table: {
          headers: ['Question', 'INTJ-like Ni-Te', 'INTP-like Ti-Ne'],
          rows: [
            ['What is satisfying?', 'A clear strategic direction that can be executed', 'A precise model that explains the edge cases'],
            ['What is frustrating?', 'Endless debate without movement', 'Premature execution before the logic is clean'],
            ['What often gets neglected?', 'Present sensory limits and improvisation', 'Relational calibration and social feedback'],
          ],
        },
      },
      {
        heading: 'Why type descriptions are not enough',
        body: [
          'Many INTJ and INTP descriptions overlap around intelligence, independence, skepticism, and systems thinking. That overlap can make a type description feel accurate even when the function order is wrong.',
          'A useful INTJ vs INTP test should ask what your attention does first and what kind of uncertainty bothers you most.',
        ],
      },
      {
        heading: 'Use the TypeJung result as a map',
        body: [
          'Take the free assessment, then compare your thinking and intuition scores, attitude direction, and inferior-function signal. The point is not to win a label. The point is to understand the operating pattern behind the label.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can TypeJung decide INTJ vs INTP for me?',
        answer: 'TypeJung gives a likely type pattern and function evidence. Use it as a structured comparison between Ni-Te and Ti-Ne, not as an unquestionable verdict.',
      },
      {
        question: 'Why do INTJ and INTP get mistyped?',
        answer: 'Both can be analytical, private, and independent. Many tests overfocus on behavior and underfocus on the order of cognition.',
      },
      {
        question: 'Is this INTJ vs INTP test free?',
        answer: 'The core TypeJung assessment is free. Optional paid reports add deeper interpretation after you see the result.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/blog/intj-vs-intp-ni-te-vs-ti-ne', label: 'INTJ vs INTP guide' },
      { href: '/functions/ni', label: 'Introverted Intuition' },
      { href: '/functions/ti', label: 'Introverted Thinking' },
      { href: '/types/intj', label: 'INTJ type guide' },
      { href: '/types/intp', label: 'INTP type guide' },
    ],
  },
  {
    slug: 'mbti-keeps-changing',
    query: 'why does my MBTI keep changing',
    title: 'Why Does My MBTI Keep Changing? Take a Function-Based Test | TypeJung',
    description: 'If your MBTI type keeps changing, TypeJung can help you compare the cognitive function pattern behind shifting labels.',
    keywords: ['why does my MBTI keep changing', 'MBTI keeps changing', 'changing MBTI results', 'function based MBTI test'],
    eyebrow: 'Changing MBTI results',
    h1: 'If your MBTI keeps changing, test the pattern underneath',
    intro: [
      'Getting INFJ one month, INFP the next, and ENFP after that does not always mean your personality changed. It may mean the test is measuring mood, role, or self-image.',
      'TypeJung gives you a function map so you can inspect what stays stable beneath changing four-letter results.',
    ],
    sections: [
      {
        heading: 'Why results shift',
        body: [
          'Many MBTI-style quizzes mix behavior, identity, work role, social confidence, stress state, and preference into the same score. When your context changes, the answer pattern can change.',
          'Close scores also make labels unstable. A small wording change can push someone across a letter boundary even if the underlying function profile is similar.',
        ],
        bullets: [
          'Stress can make you answer from a defensive pattern',
          'Work and relationship roles can change visible behavior',
          'Binary letter scoring hides close or mixed function signals',
          'A label can change while the deeper energy pattern remains recognizable',
        ],
      },
      {
        heading: 'What to test instead',
        body: [
          'Instead of chasing the perfect four-letter label, compare the function evidence. Which kinds of perception feel natural? Which judging mode feels trusted? Which inferior-function pressure appears under stress?',
          'A function-based map gives you more to work with than a single unstable type code.',
        ],
      },
      {
        heading: 'Use TypeJung when the label is not enough',
        body: [
          'The free assessment shows a core energy map and likely type pattern. If the map feels accurate, optional Insight and Mastery reports add deeper stress, relationship, and growth interpretation.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does changing MBTI mean my personality changed?',
        answer: 'Not necessarily. It often means the test is sensitive to context, mood, wording, or close scores.',
      },
      {
        question: 'Can cognitive functions explain changing results?',
        answer: 'Yes. A function profile can show why nearby type labels compete and where the underlying pattern is more stable.',
      },
      {
        question: 'What should I do if every test gives a different type?',
        answer: 'Stop comparing labels for a moment. Compare the function pattern, stress edge, and dominant-inferior axis instead.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/blog/why-mbti-type-keeps-changing', label: 'Read the full guide' },
      { href: '/mbti-alternative', label: 'MBTI alternative' },
      { href: '/cognitive-function-test', label: 'Cognitive function test' },
    ],
  },
  {
    slug: 'jungian-cognitive-functions-test',
    query: 'Jungian cognitive functions test',
    title: 'Jungian Cognitive Functions Test - Map Ni Ne Si Se Ti Te Fi Fe | TypeJung',
    description: 'Take a Jungian cognitive functions test that maps all 8 function-attitudes and explains your dominant-inferior pattern.',
    keywords: ['Jungian cognitive functions test', 'Jung functions test', 'Ni Ne Si Se Ti Te Fi Fe test', 'Jungian function stack test'],
    eyebrow: 'Jungian functions test',
    h1: 'A Jungian cognitive functions test for the full stack',
    intro: [
      'A serious Jungian cognitive functions test should do more than hand you a four-letter label. It should show how the function pattern is built.',
      'TypeJung maps all 8 function-attitudes, then explains the dominant-inferior axis that often carries the clearest growth tension.',
    ],
    intent: {
      bestFor: 'People searching specifically for Jungian functions, function stacks, and a full Ni Ne Si Se Ti Te Fi Fe assessment.',
      measures: 'Introverted and extraverted attitudes across thinking, feeling, sensation, and intuition, plus dominant-inferior interpretation.',
      privacy: 'Use the free core map first. Paid interpretation is optional and should only be used if the map feels accurate.',
    },
    sections: [
      {
        heading: 'What makes it Jungian',
        body: [
          'TypeJung begins with Jung\'s core distinction between attitude direction and psychological function. It then measures introverted and extraverted versions of thinking, feeling, sensation, and intuition.',
          'That gives you a practical map of attention, judgment, stress, and development instead of a flat type label.',
        ],
        bullets: [
          'Introverted and extraverted attitude direction',
          'Thinking and feeling as judging functions',
          'Sensation and intuition as perceiving functions',
          'Dominant, auxiliary, tertiary, and inferior pattern interpretation',
        ],
        links: [
          { href: '/jungian-typology', label: 'Read the Jungian typology guide' },
          { href: '/cognitive-functions', label: 'Read the 8 cognitive functions guide' },
        ],
      },
      {
        heading: 'What the free result includes',
        body: [
          'The free result gives you the main energy map and likely function pattern. It is enough to start comparing your type hypothesis against real self-observation.',
          'Paid reports are optional and add deeper interpretation only after you have seen the core map.',
        ],
        bullets: [
          'Relative scores for all 8 function-attitudes',
          'A likely type pattern with room for close alternatives',
          'A dominant-inferior axis for growth and stress reflection',
          'Clear next links into function and type guides',
        ],
      },
      {
        heading: 'Function stack versus function profile',
        body: [
          'A function stack is a theory-based interpretation of how functions tend to organize in a type. A function profile is the measured pattern from your answers. The two should inform each other, but they are not the same thing.',
          'TypeJung starts with the profile, then interprets likely stack patterns. That makes it easier to notice when a type code is plausible but not yet certain.',
        ],
        table: {
          headers: ['Concept', 'What it means', 'How TypeJung uses it'],
          rows: [
            ['Function profile', 'The score shape across all 8 functions', 'Shows the direct answer pattern'],
            ['Function stack', 'A model of dominant, auxiliary, tertiary, and inferior positions', 'Helps interpret the score shape'],
            ['Dominant-inferior axis', 'The tension between the most trusted and least conscious poles', 'Frames stress and development'],
          ],
        },
      },
      {
        heading: 'How to use the output',
        body: [
          'Read the highest function as a hypothesis about what your ego trusts. Read the lowest or inferior signal as a place to observe stress, reaction, attraction, and developmental tension. Then retake later to see whether the map becomes more flexible.',
        ],
        links: [
          { href: '/assessment', label: 'Take the free Jungian cognitive functions test' },
          { href: '/inferior-function-test', label: 'Understand your inferior function' },
          { href: '/mbti-alternative', label: 'Compare TypeJung as an MBTI alternative' },
        ],
      },
    ],
    faqs: [
      {
        question: 'Does TypeJung test all 8 Jungian cognitive functions?',
        answer: 'Yes. It measures Ni, Ne, Si, Se, Ti, Te, Fi, and Fe as a profile rather than relying only on broad dichotomies.',
      },
      {
        question: 'Is this different from an MBTI test?',
        answer: 'Yes. TypeJung can support a likely type pattern, but the function map is the main output.',
      },
      {
        question: 'Can I take it without paying?',
        answer: 'Yes. The 42-question assessment and core energy map are free. Insight and Mastery are optional one-time CAD upgrades.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/cognitive-functions', label: 'Cognitive functions guide' },
      { href: '/jungian-typology', label: 'Jungian typology guide' },
      { href: '/inferior-function-test', label: 'Inferior function test' },
    ],
  },
  {
    slug: 'jungian-typology',
    query: 'Jungian typology',
    title: 'Jungian Typology Guide - Functions, Type, and Self-Reflection | TypeJung',
    description: 'Learn Jungian typology through cognitive functions, attitude direction, dominant-inferior patterns, and practical self-reflection.',
    keywords: ['Jungian typology', 'Jung psychological types', 'Jungian personality types', 'Jungian functions'],
    eyebrow: 'Jungian typology',
    h1: 'A practical guide to Jungian typology',
    intro: [
      'Jungian typology is a way to understand the patterns behind attention, judgment, stress, and development. It is deeper than a label because it asks which mental functions carry the most energy and which parts of the psyche remain less conscious.',
      'TypeJung turns that model into a free assessment and a set of readable guides so you can compare your own pattern with the theory.',
    ],
    sections: [
      {
        heading: 'The core idea behind Jungian type',
        body: [
          'Carl Jung described type through two attitudes, introversion and extraversion, and four psychological functions: thinking, feeling, sensation, and intuition. Modern cognitive-function language combines those into eight function-attitudes.',
          'That means a useful Jungian typology result should explain more than whether someone is introverted or intuitive. It should show how attention and judgment actually organize themselves.',
        ],
        bullets: [
          'Introverted and extraverted attitudes describe the direction of energy',
          'Thinking and feeling describe judging or evaluation',
          'Sensation and intuition describe perception or information gathering',
          'The dominant-inferior axis often reveals the clearest growth tension',
        ],
      },
      {
        heading: 'Why TypeJung starts with the energy map',
        body: [
          'A four-letter type can be useful shorthand, but it can also flatten the person. TypeJung starts with an energy map because the relative pattern between functions usually explains more than a single label.',
          'After the assessment, you can compare your strongest channels, likely type pattern, and inferior-function pressure before deciding whether you want a deeper paid report.',
        ],
      },
      {
        heading: 'How to study your result',
        body: [
          'Read the top function as a hypothesis about what your ego trusts most. Read the inferior function as a place where pressure, attraction, avoidance, or overreaction may show up. Then use the result as observation, not identity.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is Jungian typology the same as MBTI?',
        answer: 'No. MBTI popularized four-letter type language, but Jungian typology begins with psychological functions and attitude direction.',
      },
      {
        question: 'What is the most important part of Jungian typology?',
        answer: 'The dominant-inferior relationship is often the most useful because it shows both a strength and a likely developmental edge.',
      },
      {
        question: 'Can TypeJung tell me my exact type?',
        answer: 'TypeJung gives a likely type pattern and a function map. Treat it as a structured self-observation tool, not a final identity label.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/cognitive-functions', label: 'Learn the cognitive functions' },
      { href: '/jungian-test', label: 'Jungian test' },
      { href: '/inferior-function-test', label: 'Inferior function test' },
    ],
  },
  {
    slug: 'cognitive-functions',
    query: 'Jungian cognitive functions',
    title: 'Jungian Cognitive Functions Guide - Ni Ne Si Se Ti Te Fi Fe | TypeJung',
    description: 'Understand the 8 Jungian cognitive functions: Ni, Ne, Si, Se, Ti, Te, Fi, and Fe, plus how they shape type and stress patterns.',
    keywords: ['Jungian cognitive functions', '8 cognitive functions', 'Ni Ne Si Se Ti Te Fi Fe', 'cognitive functions guide'],
    eyebrow: 'Cognitive functions',
    h1: 'Understand the 8 Jungian cognitive functions',
    intro: [
      'The 8 cognitive functions are the working parts behind Jungian type. They describe how attention gathers information and how judgment makes decisions.',
      'TypeJung measures these functions through a 42-question assessment, then turns the scores into an energy map, likely type pattern, and educational self-reflection.',
    ],
    sections: [
      {
        heading: 'The four perceiving functions',
        body: [
          'Perceiving functions describe how information enters awareness. Intuition looks for pattern and possibility. Sensing stays closer to concrete reality, memory, and present experience.',
        ],
        bullets: [
          'Ni: convergent pattern insight, symbolic meaning, future orientation',
          'Ne: possibilities, alternatives, associations, and divergent ideas',
          'Si: memory, continuity, precedent, and experience-based comparison',
          'Se: direct contact with the present, action, and sensory detail',
        ],
      },
      {
        heading: 'The four judging functions',
        body: [
          'Judging functions describe how decisions are organized. Thinking evaluates through logic and structure. Feeling evaluates through value, relationship, and meaning.',
        ],
        bullets: [
          'Ti: internal precision, categories, and logical models',
          'Te: external order, measurable outcomes, and execution',
          'Fi: personal value, authenticity, and inner alignment',
          'Fe: shared value, emotional tone, and relational coordination',
        ],
      },
      {
        heading: 'Functions are more useful in relationship',
        body: [
          'A single high score can be interesting, but the pattern matters more. Dominant and auxiliary functions usually feel more available. Inferior-function material often appears through stress, attraction, projection, or sudden overreaction.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What are the 8 Jungian cognitive functions?',
        answer: 'The 8 functions are Ni, Ne, Si, Se, Ti, Te, Fi, and Fe. They combine Jung\'s four functions with introverted and extraverted attitudes.',
      },
      {
        question: 'Can I have more than one strong cognitive function?',
        answer: 'Yes. TypeJung scores functions as a profile, so nearby functions can both be meaningful instead of forcing one winner too quickly.',
      },
      {
        question: 'How do cognitive functions relate to MBTI types?',
        answer: 'A four-letter type can be interpreted as a likely function stack, but TypeJung starts with the function evidence before interpreting the type pattern.',
      },
    ],
    relatedLinks: [
      { href: '/cognitive-function-test', label: 'Take the cognitive function test' },
      { href: '/functions/ni', label: 'Introverted Intuition' },
      { href: '/functions/fe', label: 'Extraverted Feeling' },
      { href: '/jungian-typology', label: 'Jungian typology guide' },
    ],
  },
  {
    slug: 'shadow-work-test',
    query: 'shadow work test',
    title: 'Shadow Work Test - Jungian Self-Observation Patterns | TypeJung',
    description: 'Use a Jungian self-observation test to explore inferior-function pressure and stress reactions without clinical diagnosis.',
    keywords: ['shadow work test', 'Jungian shadow test', 'shadow work questions', 'inferior function shadow'],
    eyebrow: 'Shadow work test',
    h1: 'A Jungian shadow work test for self-observation',
    intro: [
      'Shadow work is not about finding a villain inside yourself. In Jungian language, it starts by noticing what the ego avoids, disowns, overreacts to, or projects onto other people.',
      'TypeJung approaches shadow-language carefully through cognitive-function patterns, especially the inferior-function edge where stress and self-observation often meet.',
    ],
    sections: [
      {
        heading: 'What a shadow work test can and cannot do',
        body: [
          'A self-assessment can give language for observation. It cannot diagnose trauma, anxiety, depression, or any mental health condition. The safest use is reflective: notice the pattern, test it against real life, and slow down before making it your identity.',
        ],
        bullets: [
          'Use the result as a starting hypothesis',
          'Notice where stress creates overreaction or avoidance',
          'Look for repeated reactions and relationship triggers',
          'Work with a qualified professional for severe or persistent distress',
        ],
      },
      {
        heading: 'Why TypeJung connects shadow work to the inferior function',
        body: [
          'The inferior function often marks the least conscious side of the dominant pattern. When pressure rises, that function can feel awkward, compulsive, or surprisingly intense.',
          'Mapping the dominant-inferior axis gives you a practical way to ask: what am I overusing, and what am I neglecting?',
        ],
      },
      {
        heading: 'How to use the result',
        body: [
          'After the assessment, read the inferior-function section first. Then watch for moments when the same theme appears in stress, conflict, envy, attraction, or body tension. That is where reflection becomes useful.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is TypeJung a clinical shadow work test?',
        answer: 'No. TypeJung is an educational self-exploration tool. It is not therapy, diagnosis, or medical advice.',
      },
      {
        question: 'What is the Jungian shadow?',
        answer: 'The shadow refers to parts of the psyche that are less conscious, disowned, avoided, or projected. In TypeJung, inferior-function pressure is one practical entry point.',
      },
      {
        question: 'Can shadow work be uncomfortable?',
        answer: 'Yes. If reflection feels overwhelming or destabilizing, pause and work with a qualified professional rather than forcing the process alone.',
      },
    ],
    relatedLinks: [
      { href: '/assessment', label: 'Take the free assessment' },
      { href: '/inferior-function-test', label: 'Inferior function test' },
      { href: '/blog/understanding-the-grip', label: 'Understand the grip' },
      { href: '/pricing', label: 'See one-time pricing' },
    ],
  },
];
