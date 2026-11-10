// The psyche map: one small diagram, drawn the same way on every concept page,
// with the region that the entry is about switched on. It is a drawing aid of
// our own, built from Jung's descriptions. It is not a reproduction of a figure
// by Jung, and the pages say so.

const CX = 160;
const CY = 196;
const R = 148;

/** Plain-language description of what each highlight shows. */
export const REGION_NOTES = {
  whole: 'The whole circle: conscious and unconscious together.',
  consciousness: 'The lit cap at the top: what is currently in awareness.',
  ego: 'The ego, at the center of consciousness.',
  persona: 'The persona: the outer edge of the psyche, facing the world.',
  'personal-unconscious': 'The personal unconscious: the layer under consciousness that comes from your own life.',
  shadow: 'The shadow, in the personal unconscious, just below the ego\'s line of sight.',
  complexes: 'Complexes: charged clusters in the personal unconscious.',
  'collective-unconscious': 'The collective unconscious: the deepest layer, common to everyone.',
  'anima-animus': 'Anima and animus: the figure at the border of the personal and the collective, facing inward.',
  archetypes: 'Archetypes: the patterns that structure the collective unconscious.',
  self: 'The Self: the center of the whole circle, and the circle itself.',
  threshold: 'The threshold between conscious and unconscious, where contents cross in both directions.',
  axis: 'The line between the ego and the Self, along which development runs.',
  outer: 'The outer world, and the edge where psyche and world meet.',
  types: 'The four functions, drawn as compass points around the ego.',
};

const on = (region, ...names) => (names.includes(region) ? ' is-on' : '');

/**
 * @param {string} region one of REGIONS in registry.mjs
 * @param {string} title concept title, used in the accessible name
 */
export function psycheMap(region, title) {
  const note = REGION_NOTES[region] || REGION_NOTES.whole;
  const diamonds = [120, 140, 160, 180, 200]
    .map((x) => `<path d="M${x} 291l6 7-6 7-6-7z"/>`)
    .join('');
  const complexDots = [[236, 164, 5], [250, 170, 6.5], [240, 178, 4], [254, 182, 3.5], [230, 172, 3]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`)
    .join('');
  return `<svg class="pm" viewBox="0 0 320 356" role="img" aria-labelledby="pm-title pm-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="pm-title">Map of the psyche: ${title}</title>
  <desc id="pm-desc">A circle divided into three layers: consciousness at the top with the ego at its center, the personal unconscious in the middle, and the collective unconscious below. ${note}</desc>
  <defs><clipPath id="pm-clip"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath></defs>
  <g class="pm-outer${on(region, 'outer')}">
    <text class="pm-label" x="160" y="14" text-anchor="middle">Outer world</text>
    <circle class="pm-outer-ring" cx="${CX}" cy="${CY}" r="155" fill="none"/>
  </g>
  <g clip-path="url(#pm-clip)">
    <rect class="pm-band pm-consciousness${on(region, 'consciousness', 'whole')}" x="0" y="40" width="320" height="88"/>
    <rect class="pm-band pm-personal${on(region, 'personal-unconscious', 'whole')}" x="0" y="128" width="320" height="102"/>
    <rect class="pm-band pm-collective${on(region, 'collective-unconscious', 'whole')}" x="0" y="230" width="320" height="120"/>
    <path class="pm-rule" d="M0 230h320"/>
  </g>
  <circle class="pm-whole${on(region, 'whole', 'self')}" cx="${CX}" cy="${CY}" r="${R}" fill="none"/>
  <path class="pm-persona${on(region, 'persona')}" d="M46.6 100.9A148 148 0 0 1 273.4 100.9" fill="none"/>
  <text class="pm-label pm-persona-label${on(region, 'persona')}" x="160" y="36" text-anchor="middle">Persona</text>
  <g class="pm-threshold${on(region, 'threshold')}">
    <path class="pm-threshold-line" d="M28.5 128h263" fill="none"/>
    <path class="pm-arrow" d="M256 141v-22m-5 6 5-6 5 6M274 115v22m-5-6 5 6 5-6" fill="none"/>
  </g>
  <text class="pm-label${on(region, 'consciousness')}" x="50" y="120">Consciousness</text>
  <text class="pm-label${on(region, 'personal-unconscious')}" x="36" y="146">Personal unconscious</text>
  <text class="pm-label${on(region, 'collective-unconscious')}" x="160" y="276" text-anchor="middle">Collective unconscious</text>
  <path class="pm-axis${on(region, 'axis')}" d="M160 100v84" fill="none"/>
  <g class="pm-types${on(region, 'types')}">
    <path d="M160 68v-8M160 104v8M142 86h-8M178 86h8" fill="none"/>
  </g>
  <g class="pm-ego${on(region, 'ego', 'types')}">
    <circle cx="160" cy="86" r="13"/>
    <text x="160" y="89.5" text-anchor="middle">Ego</text>
  </g>
  <g class="pm-shadow${on(region, 'shadow')}">
    <ellipse cx="104" cy="178" rx="33" ry="17"/>
    <text x="104" y="181.5" text-anchor="middle">Shadow</text>
  </g>
  <g class="pm-complexes${on(region, 'complexes')}">
    ${complexDots}
    <text class="pm-label" x="244" y="200" text-anchor="middle">Complexes</text>
  </g>
  <g class="pm-self${on(region, 'self', 'axis')}">
    <circle class="pm-self-ring" cx="${CX}" cy="${CY}" r="10" fill="none"/>
    <circle class="pm-self-dot" cx="${CX}" cy="${CY}" r="4.5"/>
    <text class="pm-label" x="176" y="199.5">Self</text>
  </g>
  <g class="pm-anima${on(region, 'anima-animus')}">
    <circle cx="160" cy="230" r="11"/>
    <text class="pm-label" x="160" y="254" text-anchor="middle">Anima · Animus</text>
  </g>
  <g class="pm-archetypes${on(region, 'archetypes')}">
    ${diamonds}
    <text class="pm-label" x="160" y="320" text-anchor="middle">Archetypes</text>
  </g>
</svg>`;
}
