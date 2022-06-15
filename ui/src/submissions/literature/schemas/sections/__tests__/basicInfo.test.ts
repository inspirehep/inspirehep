// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object } from 'yup';

import basicInfo from '../basicInfo';
import { inspireCategoryValues } from '../../../../common/schemas/constants';

const schema = object().shape(basicInfo);

const dataWithRequiredFields = {
  title: 'Article',
  authors: [
    {
      full_name: 'Harun Urhan',
      affilation: 'CERN',
    },
  ],
  subjects: [inspireCategoryValues[0]],
};

describe('basicInfo section', () => {
  it('invalidates when required fields are missing', async (done: any) => {
    const isValid = await schema.isValid({});
    expect(isValid).toBe(false);
    done();
  });

  it('validates when required fields are present', async (done: any) => {
    const isValid = await schema.isValid(dataWithRequiredFields);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when authors only contain empty item', async (done: any) => {
    const data = {
      ...dataWithRequiredFields,
      authors: [{}],
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('invalidates when there is no author', async (done: any) => {
    const data = {
      ...dataWithRequiredFields,
      authors: [],
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('invalidates when an author does not have full_name ', async (done: any) => {
    const data = {
      ...dataWithRequiredFields,
      authors: [
        {
          affilation: 'CERN',
        },
      ],
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when report_numbers contain empty item', async (done: any) => {
    const data = {
      ...dataWithRequiredFields,
      report_numbers: [''],
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when report_numbers contain strings', async (done: any) => {
    const data = {
      ...dataWithRequiredFields,
      report_numbers: ['REPORT-NO-1', 'REPORT-NO-2'],
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when doi is valid', async (done: any) => {
    const data = {
      ...dataWithRequiredFields,
      doi: '10.1086/307221',
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when doi is invalid', async (done: any) => {
    const data = {
      ...dataWithRequiredFields,
      doi: 'not a doi',
    };
    const isValid = await schema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });
});
