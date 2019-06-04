import getValue from '../../common/getValue';
import { RANK_VALUE_TO_DISPLAY } from '../../../common/constants';

export const arxivCategoryOptions = [
  { value: 'astro-ph' },
  { value: 'cond-mat' },
  { value: 'cs' },
  { value: 'econ' },
  { value: 'eess' },
  { value: 'gr-qc' },
  { value: 'hep-ex' },
  { value: 'hep-lat' },
  { value: 'hep-ph' },
  { value: 'hep-th' },
  { value: 'math' },
  { value: 'math-ph' },
  { value: 'nlin' },
  { value: 'nucl-ex' },
  { value: 'nucl-th' },
  { value: 'physics' },
  { value: 'physics.acc-ph' },
  { value: 'physics.ins-det' },
  { value: 'q-bio' },
  { value: 'q-fin' },
  { value: 'quant-ph' },
  { value: 'stat' },
];
export const arxivCategoryValues = arxivCategoryOptions.map(getValue);

export const authorStatusOptions = [
  { value: 'active', display: 'Active' },
  { value: 'deceased', display: 'Deceased' },
  { value: 'departed', display: 'Departed' },
  { value: 'retired', display: 'Retired' },
];
export const authorStatusValues = authorStatusOptions.map(getValue);

export const rankOptions = Object.keys(RANK_VALUE_TO_DISPLAY).map(key => ({
  value: key,
  display: RANK_VALUE_TO_DISPLAY[key],
}));
export const rankValues = rankOptions.map(getValue);
