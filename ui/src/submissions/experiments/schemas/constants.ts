import getValue from '../../common/getValue';

export const EXPERIMENT_TYPE_OPTIONS = [
  {
    value: 'collaboration',
    display: 'Collaboration',
  },
  {
    value: 'experiment',
    display: 'Experiment',
  },
  {
    value: 'accelerator',
    display: 'Accelerator',
  },
];

export const experimentValues = EXPERIMENT_TYPE_OPTIONS.map(getValue);
