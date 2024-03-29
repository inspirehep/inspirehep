import moment from 'moment';
import jobSchema from '../job';
import {
  regionValues,
  statusValues,
  fieldOfInterestValues,
} from '../constants';
import { rankValues } from '../../../common/schemas/constants';
import { DATE_RANGE_FORMAT } from '../../../../common/constants';

const dataWithRequiredFields = {
  title: 'Director',
  regions: [regionValues[0]],
  ranks: [rankValues[0]],
  field_of_interest: [fieldOfInterestValues[0]],
  institutions: [
    { value: 'CERN', record: { $ref: 'http://to/institutions/1' } },
  ],
  contacts: [{ name: 'Harun Urhan', email: 'harun.urhan@cern.ch' }],
  deadline_date: moment().add({ months: 1 }).format(DATE_RANGE_FORMAT),
  description: '<b>Director</b> at CERN',
};

describe('jobSchema', () => {
  it('invalidates when all top-level required fields without default are absent', async () => {
    const isValid = await jobSchema.isValid({});
    expect(isValid).toBe(false);
  });

  it('validates when all top-level required fields without default are present', async () => {
    const isValid = await jobSchema.isValid(dataWithRequiredFields);
    expect(isValid).toBe(true);
  });

  it('invalidates when title has just spaces', async () => {
    const data = {
      ...dataWithRequiredFields,
      title: '     ',
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when contact has only name', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: { name: 'Harun Urhan' },
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when contact has only email', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: { email: 'harun.urhan@cern.ch' },
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when contact does not have a valid email', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: { name: 'Harun Urhan', email: 'not an email' },
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when contac name has just spaces', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: { name: '  ', email: 'harun.urhan@cern.ch' },
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when status is one of job status values', async () => {
    const data = {
      ...dataWithRequiredFields,
      status: statusValues[1],
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when status is not one of job status values', async () => {
    const data = {
      ...dataWithRequiredFields,
      status: 'not a status value',
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when url is a valid url', async () => {
    const data = {
      ...dataWithRequiredFields,
      url: 'https://careers.cern/dg',
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates with experiments', async () => {
    const data = {
      ...dataWithRequiredFields,
      experiments: [{ legacy_name: 'CERN-LHC-CMS' }],
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when url is an invalid url', async () => {
    const data = {
      ...dataWithRequiredFields,
      url: 'not a url',
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when field of interest are not all one of selectable values', async () => {
    const data = {
      ...dataWithRequiredFields,
      field_of_interest: ['not a field of interest', fieldOfInterestValues[1]],
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when ranks are not all one of selectable values', async () => {
    const data = {
      ...dataWithRequiredFields,
      ranks: ['not a rank', rankValues[1]],
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when regions are not all one of selectable values', async () => {
    const data = {
      ...dataWithRequiredFields,
      regions: ['not a region', regionValues[1]],
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when deadline_date is in the past', async () => {
    const data = {
      ...dataWithRequiredFields,
      deadline_date: '1900-10-10',
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when deadline_date is later than next year', async () => {
    const data = {
      ...dataWithRequiredFields,
      deadline_date: moment().add({ years: 1, months: 4 }),
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when deadline_date is an invalid date', async () => {
    const data = {
      ...dataWithRequiredFields,
      deadline_date: 'not a date',
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when deadline_date is in the past but job status is closed', async () => {
    const data = {
      ...dataWithRequiredFields,
      status: 'closed',
      deadline_date: '1900-10-10',
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when a referece_letter is not an email nor url', async () => {
    const data = {
      ...dataWithRequiredFields,
      reference_letters: ['dude'],
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when a referece_letter is an email or url', async () => {
    const data = {
      ...dataWithRequiredFields,
      reference_letters: [
        'https://cern.ch/jobs/123/reference-letter/submit',
        'supervisor-guy-for-job-123@cern.ch',
      ],
    };
    const isValid = await jobSchema.isValid(data);
    expect(isValid).toBe(true);
  });
});
