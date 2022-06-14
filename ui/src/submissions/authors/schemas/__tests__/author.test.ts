import authorSchema from '../author';
import { authorStatusValues } from '../constants';
import {
  degreeTypeValues,
  arxivCategoryValues,
  rankValues,
} from '../../../common/schemas/constants';

const dataWithRequiredFields = {
  given_name: 'Harun',
  family_name: 'Urhan',
  display_name: 'Harun, Urhan',
};

describe('authorSchema', () => {
  it('invalidates when all top-level required fields without default are absent', async done => {
    const isValid = await authorSchema.isValid({});
    expect(isValid).toBe(false);
    done();
  });

  it('invalidates when given_name has just spaces', async done => {
    const data = {
      ...dataWithRequiredFields,
      display_name: '  ',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('invalidates when family_name has just spaces', async done => {
    const data = {
      ...dataWithRequiredFields,
      family_name: '  ',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('invalidates when display_name has just spaces', async done => {
    const data = {
      ...dataWithRequiredFields,
      display_name: '  ',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when alternate_name is empty', async done => {
    const data = {
      ...dataWithRequiredFields,
      alternate_name: '',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when all top-level required fields without default are present', async done => {
    const isValid = await authorSchema.isValid(dataWithRequiredFields);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when emails are valid emails', async done => {
    const data = {
      ...dataWithRequiredFields,
      emails: [{ value: 'a@b.guy', hidden: true }, { value: 'c@d.dude' }],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when pulic_emails are not all valid emails', async done => {
    const data = {
      ...dataWithRequiredFields,
      emails: [{ value: 'not an email', hidden: true }, { value: 'c@d.dude' }],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when status is one of author status values', async done => {
    const data = {
      ...dataWithRequiredFields,
      status: authorStatusValues[1],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when status is not one of author status values', async done => {
    const data = {
      ...dataWithRequiredFields,
      status: 'not a status value',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when orcid is valid', async done => {
    const data = {
      ...dataWithRequiredFields,
      orcid: '0000-0001-5109-3700',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when orcid is invalid', async done => {
    const data = {
      ...dataWithRequiredFields,
      orcid: '1234-1234-1234-1234',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when websites are urls', async done => {
    const data = {
      ...dataWithRequiredFields,
      websites: ['https://dude.com', 'http://guy.com'],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when websites are empty string', async done => {
    const data = {
      ...dataWithRequiredFields,
      websites: [''],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when websites are not all urls', async done => {
    const data = {
      ...dataWithRequiredFields,
      websites: ['https://dude.com', 'not a website'],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when blog is a url', async done => {
    const data = {
      ...dataWithRequiredFields,
      blog: 'https://blog.dude.com',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when blog is not a url', async done => {
    const data = {
      ...dataWithRequiredFields,
      blog: 'not a url',
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when arxiv_categories are one of selectable values', async done => {
    const data = {
      ...dataWithRequiredFields,
      arxiv_categories: [arxivCategoryValues[0], arxivCategoryValues[1]],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when arxiv_categories are not all one of selectable values', async done => {
    const data = {
      ...dataWithRequiredFields,
      arxiv_categories: ['not a field of research', arxivCategoryValues[1]],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when all positions have institution', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [
        {
          institution: 'Test 1',
        },
        {
          institution: 'Test 2',
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when all positions fields are valid', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [
        {
          institution: 'Test 1',
          start_date: '2000',
          end_date: '',
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when positions year field is not valid', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [
        {
          institution: 'Test 1',
          start_date: '123456',
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when positions rank is one of the selectable values', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [
        {
          institution: 'Test 1',
          rank: rankValues[0],
          hidden: true,
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when positions rank is not one of the selectable values', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [
        {
          institution: 'Test 1',
          rank: 'not a rank',
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when positions item is empty', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [{}],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when positions item has only empty institution', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [{ institution: '' }],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when a positions item has institution with only spaces', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [
        {
          institution: '',
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when all positions do not have institution', async done => {
    const data = {
      ...dataWithRequiredFields,
      positions: [
        {
          institution: 'Test 1',
        },
        {
          current: true,
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when all project_membership have name', async done => {
    const data = {
      ...dataWithRequiredFields,
      project_membership: [
        {
          name: 'Test 1',
        },
        {
          name: 'Test 2',
          hidden: true,
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when a project_membership have name with only spaces', async done => {
    const data = {
      ...dataWithRequiredFields,
      project_membership: [
        {
          name: ' ',
          current: true,
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when all project_membership fields are valid', async done => {
    const data = {
      ...dataWithRequiredFields,
      project_membership: [
        {
          name: 'Test 1',
          start_date: '1995',
          end_date: '1999',
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when project_membership item is empty', async done => {
    const data = {
      ...dataWithRequiredFields,
      project_membership: [{}],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when project_membership item has only empty name', async done => {
    const data = {
      ...dataWithRequiredFields,
      project_membership: [{ name: '' }],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when all project_membership do not have experiment', async done => {
    const data = {
      ...dataWithRequiredFields,
      project_membership: [
        {
          name: 'Test 1',
        },
        {
          current: true,
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when all advisors have name', async done => {
    const data = {
      ...dataWithRequiredFields,
      advisors: [
        {
          name: 'Test 1',
        },
        {
          name: 'Test 2',
          hidden: true,
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('validates when an advisor has name with only spaces', async done => {
    const data = {
      ...dataWithRequiredFields,
      advisors: [
        {
          name: '  ',
          degree_type: degreeTypeValues[0],
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when advisors degree_type is one of the selectable values', async done => {
    const data = {
      ...dataWithRequiredFields,
      advisors: [
        {
          name: 'Test 1',
          degree_type: degreeTypeValues[0],
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when advisors degree_type is not one of the selectable values', async done => {
    const data = {
      ...dataWithRequiredFields,
      advisors: [
        {
          name: 'Test 1',
          degree_type: 'not a degree type',
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });

  it('validates when advisors item is empty', async done => {
    const data = {
      ...dataWithRequiredFields,
      advisors: [{}],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(true);
    done();
  });

  it('invalidates when all advisors do not have name', async done => {
    const data = {
      ...dataWithRequiredFields,
      arxiv_categories: [
        {
          name: 'Test 1',
        },
        {
          degree_type: degreeTypeValues[0],
        },
      ],
    };
    const isValid = await authorSchema.isValid(data);
    expect(isValid).toBe(false);
    done();
  });
});
