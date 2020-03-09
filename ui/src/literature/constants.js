export const CITE_FORMAT_OPTIONS = [
  { value: 'x-bibtex', display: 'BibTeX' },
  { value: 'vnd+inspire.latex.eu+x-latex', display: 'LaTeX (EU)' },
  { value: 'vnd+inspire.latex.us+x-latex', display: 'LaTeX (US)' },
];
export const CITE_FORMAT_VALUES = CITE_FORMAT_OPTIONS.map(
  option => option.value
);

export const MAX_CITEABLE_RECORDS = 1000;

export const WITH_CITATION_SUMMARY = '#with-citation-summary';
