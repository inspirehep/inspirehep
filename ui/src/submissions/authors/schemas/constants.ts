import getValue from '../../common/getValue';

export const authorStatusOptions = [
  { value: 'active', display: 'Active' },
  { value: 'deceased', display: 'Deceased' },
  { value: 'departed', display: 'Departed' },
  { value: 'retired', display: 'Retired' },
];
export const authorStatusValues = authorStatusOptions.map(getValue);
