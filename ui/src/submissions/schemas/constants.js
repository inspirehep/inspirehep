function getValue(object) {
  return object.value;
}

export const arxivCategoryOptions = [
  { value: 'astro-ph' },
  { value: 'cond-math' },
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

export const degreeTypeOptions = [
  { value: 'phd', display: 'PhD' },
  { value: 'diploma', display: 'Diploma' },
  { value: 'bachelor', display: 'Bachelor' },
  { value: 'master', display: 'Master' },
  { value: 'habiliation', display: 'Habiliation' },
  { value: 'laurea', display: 'Laurea' },
  { value: 'other', display: 'Other' },
];
export const degreeTypeValues = degreeTypeOptions.map(getValue);

export const rankOptions = [
  { value: 'SENIOR', display: 'Senior (permanent)' },
  { value: 'JUNIOR', display: 'Junior (leads to Senior)' },
  { value: 'STAFF', display: 'Staff (non-research)' },
  { value: 'VISITOR', display: 'Visitor' },
  { value: 'POSTDOC', display: 'PostDoc' },
  { value: 'PHD', display: 'PhD' },
  { value: 'MASTER', display: 'Master' },
  { value: 'UNDERGRADUATE', display: 'Undergrad' },
  { value: 'OTHER', display: 'other' },
];
export const rankValues = rankOptions.map(getValue);
