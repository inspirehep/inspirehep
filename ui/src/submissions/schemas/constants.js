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

export const rankOptions = [
  { value: 'SENIOR', display: 'Senior (permanent)' },
  { value: 'JUNIOR', display: 'Junior (leads to Senior)' },
  { value: 'STAFF', display: 'Staff (non-research)' },
  { value: 'VISITOR', display: 'Visitor' },
  { value: 'PD', display: 'PostDoc' },
  { value: 'PHD', display: 'PhD' },
  { value: 'MASTER', display: 'Master' },
  { value: 'UNDERGRADUATE', display: 'Undergrad' },
  { value: 'OTHER', display: 'other' },
];
export const rankValues = rankOptions.map(getValue);

export const maxYear = 2050;
export const minYear = 1000;
