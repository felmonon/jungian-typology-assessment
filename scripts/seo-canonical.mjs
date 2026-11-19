// Pages that answer the same search as a stronger page point their canonical
// at it, so they stop competing with each other. The pages stay live and keep
// their internal links; they are just left out of the sitemap.
//
// The main page in each cluster is the one the rest of the site links to most.
// Pages that answer a different question (mbti-changes-with-mood) keep their
// own canonical even when they share some template copy.
export const CANONICAL_OVERRIDES = {
  // INFJ vs INFP: /infj-vs-infp-test is linked from 6 pages, the others from 1-2.
  '/am-i-infj-or-infp': '/infj-vs-infp-test',
  '/blog/infj-vs-infp-cognitive-functions': '/infj-vs-infp-test',
  // INTJ vs INTP: same split between the test page and the blog article.
  '/blog/intj-vs-intp-ni-te-vs-ti-ne': '/intj-vs-intp-test',
  // "Why does my MBTI keep changing?": /mbti-keeps-changing is linked from 7 pages.
  '/why-do-i-get-different-mbti-results': '/mbti-keeps-changing',
  '/blog/why-mbti-type-keeps-changing': '/mbti-keeps-changing',
  // "In the grip": the longer, older article is the main one.
  '/blog/what-does-it-mean-to-be-in-the-grip': '/blog/understanding-the-grip',
};

/** The path a page's canonical tag should point to. */
export const canonicalPathFor = (path) => CANONICAL_OVERRIDES[path] || path;
