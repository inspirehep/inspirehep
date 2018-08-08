function getValue(object) {
  return object.value;
}

export const fieldOfResearchOptions = [
  { value: 'cs' },
  { value: 'hep-ex' },
  { value: 'hep-ph' },
  { value: 'astro-ph' },
  { value: 'nucl-ex' },
];
export const fieldOfResearchValues = fieldOfResearchOptions.map(getValue);

export const degreeTypeOptions = [
  { value: 'diploma', display: 'Diploma' },
  { value: 'bachelor', display: 'Bachelor' },
  { value: 'master', display: 'Master' },
];
export const degreeTypeValues = degreeTypeOptions.map(getValue);

export const maxYear = 2050;
export const minYear = 1000;
