const BIBTEX = 'application/x-bibtex';
const LATEX_EU = 'application/vnd+inspire.latex.eu+x-latex';
const LATEX_US = 'application/vnd+inspire.latex.us+x-latex';
export const CV = 'text/vnd+inspire.html+html';

export const CITE_FORMAT_OPTIONS = [
  { value: BIBTEX, display: 'BibTeX' },
  { value: LATEX_EU, display: 'LaTeX (EU)' },
  { value: LATEX_US, display: 'LaTeX (US)' },
  { value: CV, display: 'CV (html)' },
];

export const CITE_FILE_FORMAT = {
  [BIBTEX]: { mimetype: 'application/x-bibtex', extension: 'bib' },
  [LATEX_EU]: { mimetype: 'application/x-latex', extension: 'tex' },
  [LATEX_US]: { mimetype: 'application/x-latex', extension: 'tex' },
  [CV]: { mimetype: 'text/html', extension: 'html' },
};

export const CITE_FORMAT_VALUES = CITE_FORMAT_OPTIONS.map(
  option => option.value
);

export const MAX_CITEABLE_RECORDS = 1000;
