import getValue from '../../common/getValue';

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
  { value: 'closed' },
];
export const statusOptions = [
  { value: 'open' },
  { value: 'pending' },
  ...unAuthorizedStatusOptions,
];
export const statusValues = statusOptions.map(getValue);
