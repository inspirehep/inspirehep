import { fromJS } from 'immutable';

import getIcsFileContent from '../ics';

// mock `ics` because it adds timestamp to `.ics` file content and hard to mock the internal moment.
jest.mock('ics', () => ({
  // mirror to assert
  createEvent: value => ({ value }),
}));

describe('ics', () => {
  it('matches ics file content with only required fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      control_number: 12345,
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });

    const content = getIcsFileContent(seminar);
    expect(content).toEqual({
      productId: 'inspirehep/seminars',
      uid: 'inspirehep-seminar-12345',
      start: [2020, 5, 15, 11, 45],
      end: [2020, 5, 17, 0, 45],
      title: 'Seminar Title',
      description: '',
      location: undefined,
      url: 'http://localhost/seminars/12345',
      categories: undefined,
    });
  });

  it('matches ics file content with all fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
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
    expect(content).toEqual({
      categories: ['Accelerators', 'Experiment-HEP'],
      description: 'This is a test seminar',
      end: [2020, 5, 15, 17, 34],
      location: 'CERN',
      productId: 'inspirehep/seminars',
      start: [2020, 5, 15, 11, 34],
      title: 'Seminar Title',
      uid: 'inspirehep-seminar-12345',
      url: 'http://localhost/seminars/12345',
    });
  });
});
