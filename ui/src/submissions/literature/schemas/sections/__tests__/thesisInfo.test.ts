import { object } from 'yup';

import thesisInfo from '../thesisInfo';

const schema = object().shape(thesisInfo);

describe('thesisInfo section', () => {
  it('validates when submission_date is a date', async done => {
    expect(await schema.isValid({ submission_date: '1993-06-07' })).toBe(true);
    expect(await schema.isValid({ submission_date: '1993-06' })).toBe(true);
    expect(await schema.isValid({ submission_date: '1993' })).toBe(true);
    expect(await schema.isValid({ submission_date: '7 June 1993' })).toBe(true);
    expect(await schema.isValid({ submission_date: 'June 1993' })).toBe(true);
    done();
  });

  it('invalidates when submission_date is not a date', async done => {
    expect(await schema.isValid({ submission_date: '1993-13-13' })).toBe(false);
    expect(await schema.isValid({ submission_date: '1993-06-32' })).toBe(false);
    expect(await schema.isValid({ submission_date: 'Whatever' })).toBe(false);
    expect(await schema.isValid({ submission_date: '12312112345612345' })).toBe(
      false
    );
    done();
  });

  it('validates when submission_date is a date', async done => {
    expect(await schema.isValid({ defense_date: '1993-06-07' })).toBe(true);
    expect(await schema.isValid({ defense_date: '1993-06' })).toBe(true);
    expect(await schema.isValid({ defense_date: '1993' })).toBe(true);
    expect(await schema.isValid({ defense_date: '7 June 1993' })).toBe(true);
    expect(await schema.isValid({ defense_date: 'June 1993' })).toBe(true);
    done();
  });

  it('invalidates when submission_date is not a date', async done => {
    expect(await schema.isValid({ defense_date: '1993-13-13' })).toBe(false);
    expect(await schema.isValid({ defense_date: '1993-06-32' })).toBe(false);
    expect(await schema.isValid({ defense_date: 'Whatever' })).toBe(false);
    expect(await schema.isValid({ defense_date: '12312112345612345' })).toBe(
      false
    );
    done();
  });

  it('validates when supervisors only contains empty item', async done => {
    expect(await schema.isValid({ supervisors: [{}] })).toBe(true);
    done();
  });
});
