import { object } from 'yup';

import basicInfo from '../basicInfo';
import { subjectValues } from '../../constants';

const schema = object().shape(basicInfo);

const dataWithRequiredFields = {
  title: 'Article',
  authors: [
    {
      full_name: 'Harun Urhan',
      affilation: 'CERN',
    },
  ],
  subjects: [subjectValues[0]],
};

describe('basicInfo section', () => {
  it('invalidates when required fields are missing', async done => {
    const isValid = await schema.isValid({});
    expect(isValid).toBe(false);
    done();
  });

  it('validates when required fields are present', async done => {
    const isValid = await schema.isValid(dataWithRequiredFields);
    expect(isValid).toBe(true);
    done();
  });

  // FIXME: fix this case, and enable the test
  xit('invalidates when authors only contain empty item', async done => {
    const data = {
      ...dataWithRequiredFields,
      authors: [{}],
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when report_numbers contain null item', async done => {
    const data = {
      ...dataWithRequiredFields,
      report_numbers: [null],
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when report_numbers contain strings', async done => {
    const data = {
      ...dataWithRequiredFields,
      report_numbers: ['REPORT-NO-1', 'REPORT-NO-2'],
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });
});
