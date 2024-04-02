import { List, Map } from 'immutable';

export default Map({
  id: 123456,
  display_name: 'Doe, John Marc',
  name: Map({ title: 'John Marc Doe' }),
  preferred_name: 'Johnny Marc Doe',
  status: 'active',
  orcid: '0000-0000-0000-0000',
  author_profile: Map({
    url: 'https://inspirehep.net/authors/1072974',
    value: 'J.D.Siemieniuk.1',
  }),
  institutions: List([
    Map({
      name: 'University of Toronto',
      rank: 1,
      start_date: '2019',
      end_date: '-',
      current: 'true',
    }),
    Map({
      name: 'Sunnybrook Health Sciences Centre',
      rank: 2,
      start_date: '2007',
      end_date: '2019',
      current: 'false',
    }),
    Map({
      name: 'University of Warsaw',
      rank: 3,
      start_date: '1998',
      end_date: '2007',
      current: 'false',
    }),
  ]),
  projects: List([
    Map({
      name: 'Project A',
      start_date: '2019',
      end_date: '-',
      current: 'true',
    }),
    Map({
      name: 'Project B',
      start_date: '2007',
      end_date: '2019',
      current: 'false',
    }),
    Map({
      name: 'Project C',
      start_date: '1998',
      end_date: '2007',
      current: 'false',
    }),
  ]),
  subject_areas: List([
    Map({
      term: 'hep-ex',
    }),
    Map({
      term: 'hep-ph',
    }),
  ]),
  advisors: List([
    Map({
      name: 'Giri, Anjan',
      position: 'PhD',
    }),
    Map({
      name: 'Gugri, Injan',
      position: 'PhD',
    }),
  ]),
});
