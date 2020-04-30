import seminarSchema from '../seminar';
import { inspireCategoryValues } from '../../../common/schemas/constants';

const dataWithRequiredFields = {
  name: ' Cool Seminar',
  dates: ['2020-05-06 08:30 AM', '2020-05-06 02:30 PM'],
  field_of_interest: [inspireCategoryValues[0]],
  speakers: [{ name: 'Harun Urhan' }]
};

describe('seminarSchema', () => {
  it('invalidates when required fields are missing', async () => {
    const data = {};
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when all required fields are present', async () => {
    const data = dataWithRequiredFields;
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates when series_number is a number', async () => {
    const data = {
      ...dataWithRequiredFields,
      series_number: 123,
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when series_number is not a number', async () => {
    const data = {
      ...dataWithRequiredFields,
      series_number: 'not a number',
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when dates are not both valid dates', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['2020-05-06 08:30 AM', 'not a date'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when dates are not both valid dates', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['not a date', '2020-05-06 08:30 AM'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when only one of the dates is present', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['', '2020-05-06 08:30 AM'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when dates have only single date', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['2020-06-01'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when dates have more than 2 dates', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['2020-05-06 08:30 AM', '2020-05-06 09:30 AM', '2020-05-06 10:30 AM'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when dates is only single date', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: '2020-05-06 08:30 AM',
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when websites are empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      websites: [''],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates when websites are url', async () => {
    const data = {
      ...dataWithRequiredFields,
      websites: ['https://coolsem.com'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when websites are not url', async () => {
    const data = {
      ...dataWithRequiredFields,
      websites: ['not a url'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when join_urls has only empty object', async () => {
    const data = {
      ...dataWithRequiredFields,
      join_urls: [{}],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates when join_urls is empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      join_urls: [],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates when join_urls has a url with a description', async () => {
    const data = {
      ...dataWithRequiredFields,
      join_urls: [{
        value: 'https://coolsem.com/join',
        description: 'Not zoom link'
      }],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates when join_urls has a url without a description', async () => {
    const data = {
      ...dataWithRequiredFields,
      join_urls: [{
        value: 'https://coolsem.com/join',
      }],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when join_urls has an invalid url', async () => {
    const data = {
      ...dataWithRequiredFields,
      join_urls: [{
        value: 'not a url',
      }],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when field_of_interest has invalid value', async () => {
    const data = {
      ...dataWithRequiredFields,
      field_of_interest: [inspireCategoryValues[0], 'not a field'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when addres is empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      address: {},
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when addresses have invalid country', async () => {
    const data = {
      ...dataWithRequiredFields,
      address: {
        country: 'not a country',
        city: 'Geneva',
      },
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when addresses do not have country', async () => {
    const data = {
      ...dataWithRequiredFields,
      address: {
        city: 'Geneva',
      },
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when addresses do not have city', async () => {
    const data = {
      ...dataWithRequiredFields,
      address: {
        country: 'Switzerland',
      },
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates full address', async () => {
    const data = {
      ...dataWithRequiredFields,
      addresses: {
        country: 'Switzerland',
        city: 'Geneva',
        state: 'Geneva',
        venue: 'CERN',
      },
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates when speakers have only name', async () => {
    const data = {
      ...dataWithRequiredFields,
      speakers: [
        {
          name: 'Cool Dude',
        },
      ],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates when speakers have both name and affiliation', async () => {
    const data = {
      ...dataWithRequiredFields,
      speakers: [
        {
          name: 'Cool Dude',
          affiliation: 'CERN'
        },
      ],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when speakers have only affiliation', async () => {
    const data = {
      ...dataWithRequiredFields,
      speakers: [
        {
          affiliation: 'CERN'
        },
      ],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when contacts are empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: [{}],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });


  it('validates when contacts have both name and email', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: [
        {
          email: 'cool.dude@cern.ch',
          name: 'Cool Dude',
        },
      ],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('invalidates when contacts have invalid email', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: [
        {
          email: 'not an email',
          name: 'Cool Dude',
        },
      ],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when contacts miss email', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: [
        {
          name: 'Cool Dude',
        },
      ],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('invalidates when contacts miss name', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: [
        {
          email: 'cool.dude@cern.ch',
        },
      ],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(false);
  });

  it('validates when keywords are empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      keywords: [''],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });

  it('validates when keywords are not empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      keywords: ['cool'],
    };
    const isValid = await seminarSchema.isValid(data);
    expect(isValid).toBe(true);
  });
});
