import { fromJS } from 'immutable';

import getIcsFileContent from '../ics';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ics', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('matches ics file content with only required fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      speakers: [{ first_name: 'Harun', last_name: 'Urhan' }],
      control_number: 12345,
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });

    const content = getIcsFileContent(seminar);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(content).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('matches ics file content with all fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      speakers: [
        { first_name: 'Harun', last_name: 'Urhan' },
        { first_name: 'Ahmet', last_name: 'Urhan' },
      ],
      abstract: {
        value: '<div>This is a <strong>test</strong> seminar<div>',
      },
      control_number: 12345,
      start_datetime: '2020-05-15T11:34:00.000000',
      end_datetime: '2020-05-15T17:34:00.000000',
      address: {
        cities: ['Geneva'],
        place_name: 'CERN',
      },
      inspire_categories: [
        { term: 'Accelerators' },
        { term: 'Experiment-HEP' },
      ],
    });

    const content = getIcsFileContent(seminar);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(content).toMatchSnapshot();
  });
});
