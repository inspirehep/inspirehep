import getValue from '../../common/getValue';
import {
  arxivCategoryOptions,
  arxivCategoryValues,
} from '../../common/schemas/constants';

export const regionOptions = [
  { value: 'Africa' },
  { value: 'Australasia' },
  { value: 'Asia' },
  { value: 'Europe' },
  { value: 'Middle East' },
  { value: 'North America' },
  { value: 'South America' },
];
export const regionValues = regionOptions.map(getValue);

export const unAuthorizedStatusOptions = [
  { value: 'open' },
  { value: 'closed' },
];
export const statusOptions = [
  { value: 'pending' },
  ...unAuthorizedStatusOptions,
];
export const statusValues = statusOptions.map(getValue);

const OTHER_OPTION_VALUE = 'other';
export const fieldOfInterestOptions = arxivCategoryOptions.concat({
  value: OTHER_OPTION_VALUE,
});
export const fieldOfInterestValues = arxivCategoryValues.concat(
  OTHER_OPTION_VALUE
);
