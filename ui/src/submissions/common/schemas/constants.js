import getValue from '../getValue';

export const degreeTypeOptions = [
  { value: 'phd', display: 'PhD' },
  { value: 'diploma', display: 'Diploma' },
  { value: 'bachelor', display: 'Bachelor' },
  { value: 'master', display: 'Master' },
  { value: 'habilitation', display: 'Habilitation' },
  { value: 'laurea', display: 'Laurea' },
  { value: 'other', display: 'Other' },
];
export const degreeTypeValues = degreeTypeOptions.map(getValue);
