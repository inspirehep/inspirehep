import { fromJS } from 'immutable';

import getIcsFileContent from '../ics';

describe('ics', () => {
  it('matches ics file content with only required fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      speakers: [{ first_name: 'Harun', last_name: 'Urhan' }],
      control_number: 12345,
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });

    const content = getIcsFileContent(seminar);
    expect(content).toMatchSnapshot();
  });

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
    expect(content).toMatchSnapshot();
  });
});
