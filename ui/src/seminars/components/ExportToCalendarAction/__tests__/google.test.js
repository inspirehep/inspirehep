import { fromJS } from 'immutable';

import getGoogleCalendarUrl from '../google';

describe('google', () => {
  it('matches google url with only required fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      speakers: [{ first_name: 'Harun', last_name: 'Urhan' }],
      control_number: 12345,
      start_datetime: '2020-05-15T11:45:00.000000',
      end_datetime: '2020-05-17T00:45:00.000000',
    });

    const url = getGoogleCalendarUrl(seminar);
    expect(url).toMatchSnapshot();
  });

  it('matches google url with all fields', () => {
    const seminar = fromJS({
      title: { title: 'Seminar Title' },
      speakers: [
        { first_name: 'Harun', last_name: 'Urhan' },
        { first_name: 'Ahmet', last_name: 'Urhan' },
      ],
      abstract: {
        value:
          '<div>This is a <strong>test</strong> seminar with unnecessarily long detail. The usual Ising Hamiltonian measures the area of these domain walls; as there is no explicit dependence on the genus of the domain walls, it can be thought of as a string theory with string coupling equal to unity. I discuss how to add new local terms to the Ising Hamiltonian that further weight each spin configuration by a factor depending on the genus of the corresponding domain wall, resulting in a new 3d Ising model that has a tunable bare string coupling. I will use a combination of analytical and numerical methods to analyze the phase structure of this model as this string coupling is varied. I will also describe statistical properties of the topology of worldsheets and speculate on the prospects of using this new deformation at weak string coupling to find a worldsheet description of the 3d Ising transition.<div>',
      },
      control_number: 12345,
      start_datetime: '2020-05-15T11:34:00.000000',
      end_datetime: '2020-05-15T17:34:00.000000',
      address: {
        cities: ['Geneva'],
        place_name: 'CERN',
      },
    });

    const url = getGoogleCalendarUrl(seminar);
    expect(url).toMatchSnapshot();
  });
});
