import getValue from '../../common/getValue';

export const languageOptions = [
  { value: 'en', display: 'English' },
  { value: 'zh', display: 'Chinese' },
  { value: 'fr', display: 'French' },
  { value: 'de', display: 'German' },
  { value: 'it', display: 'Italian' },
  { value: 'ja', display: 'Japanese' },
  { value: 'pt', display: 'Portuguese' },
  { value: 'ru', display: 'Russian' },
  { value: 'es', display: 'Spanish' },
  { value: 'oth', display: 'Other' },
];
export const languageValues = languageOptions.map(getValue);

export const subjectOptions = [
  { value: 'Accelerators' },
  { value: 'Astrophysics' },
  { value: 'Computing' },
  { value: 'Data Analysis and Statistics' },
  { value: 'Experiment-HEP' },
  { value: 'Experiment-Nucl' },
  { value: 'General Physics' },
  { value: 'Gravitation and Cosmology' },
  { value: 'Instrumentation' },
  { value: 'Lattice' },
  { value: 'Math and Math Physics' },
  { value: 'Other' },
  { value: 'Phenomenology-HEP' },
  { value: 'Theory-HEP' },
  { value: 'Theory-Nucl' },
];
export const subjectValues = subjectOptions.map(getValue);
