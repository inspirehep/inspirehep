import conferenceSchema from '../conference';
import { inspireCategoryValues } from '../../../common/schemas/constants';

const dataWithRequiredFields = {
  name: 'International Cool Conf 2020',
  dates: ['2020-06-01', '2020-06-10'],
  addresses: [{ city: 'Geneva', country: 'Switzerland' }],
  field_of_interest: [inspireCategoryValues[0]],
};

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('conferenceSchema', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when required fields are missing', async () => {
    const data = {};
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when all required fields are present', async () => {
    const data = dataWithRequiredFields;
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when acroynms empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      acroynms: [''],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when acroynms are not empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      acroynms: ['CoCo'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when series_number is a number', async () => {
    const data = {
      ...dataWithRequiredFields,
      series_number: 123,
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when series_number is not a number', async () => {
    const data = {
      ...dataWithRequiredFields,
      series_number: 'not a number',
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when dates are not both valid dates', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['2020-06-01', 'not a date'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when dates are not both valid dates', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['not a date', '2020-06-01'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when only one of the dates is present', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['2020-06-01', ''],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when dates have only single date', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['2020-06-01'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when dates have more than 2 dates', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: ['2020-06-01', '2020-06-02', '2020-06-03'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when dates is only single date', async () => {
    const data = {
      ...dataWithRequiredFields,
      dates: '2020-06-01',
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when websites are empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      websites: [''],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when websites are url', async () => {
    const data = {
      ...dataWithRequiredFields,
      websites: ['https://coolconf.com'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when websites are not url', async () => {
    const data = {
      ...dataWithRequiredFields,
      websites: ['not a url'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when field_of_interest has invalid value', async () => {
    const data = {
      ...dataWithRequiredFields,
      field_of_interest: [inspireCategoryValues[0], 'not a field'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when addresses are empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      addresses: [{}],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when addresses have invalid country', async () => {
    const data = {
      ...dataWithRequiredFields,
      addresses: [
        {
          country: 'not a country',
          city: 'Geneva',
        },
      ],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when addresses do not have country', async () => {
    const data = {
      ...dataWithRequiredFields,
      addresses: [
        {
          city: 'Geneva',
        },
      ],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when addresses do not have city', async () => {
    const data = {
      ...dataWithRequiredFields,
      addresses: [
        {
          country: 'Switzerland',
        },
      ],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates full address', async () => {
    const data = {
      ...dataWithRequiredFields,
      addresses: [
        {
          country: 'Switzerland',
          city: 'Geneva',
          state: 'Geneva',
          venue: 'CERN',
        },
      ],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when contacts are empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: [{}],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when contacts miss email', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: [
        {
          name: 'Cool Dude',
        },
      ],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates when contacts miss name', async () => {
    const data = {
      ...dataWithRequiredFields,
      contacts: [
        {
          email: 'cool.dude@cern.ch',
        },
      ],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when keywords are empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      keywords: [''],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates when keywords are not empty', async () => {
    const data = {
      ...dataWithRequiredFields,
      keywords: ['cool'],
    };
    const isValid = await conferenceSchema.isValid(data);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
  });
});
