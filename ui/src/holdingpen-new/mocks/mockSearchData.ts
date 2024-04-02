import { List, Map } from 'immutable';

export const data = List([
  Map({
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
  }),
  Map({
    title: 'Introduction to Quantum Mechanics',
    id: 1,
    abstract:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec varius massa. Sed eleifend, ipsum at dignissim sollicitudin, ante odio laoreet nulla, at convallis purus ex sit amet dolor.',
    keywords: ['quantum', 'mechanics', 'physics'],
    authors: List([
      Map({ name: 'John Smith', affiliation: 'University X' }),
      Map({ name: 'Emily Johnson', affiliation: 'University Y' }),
    ]),
    date: '2024-04-02',
    publisher: 'Science Publishers Inc.',
    status: 'completed',
  }),
  Map({
    title: 'Advancements in Artificial Intelligence',
    id: 2,
    abstract:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec varius massa. Sed eleifend, ipsum at dignissim sollicitudin, ante odio laoreet nulla, at convallis purus ex sit amet dolor.',
    keywords: [
      'artificial intelligence',
      'machine learning',
      'neural networks',
    ],
    authors: List([
      Map({ name: 'Michael Brown', affiliation: 'Tech University' }),
      Map({ name: 'Sophia Martinez', affiliation: 'AI Research Institute' }),
    ]),
    date: '2024-04-02',
    publisher: 'Tech Publishing Group',
    status: 'awaiting decision',
  }),
  Map({
    title: 'Introduction to Quantum Mechanics',
    id: 3,
    abstract:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec varius massa. Sed eleifend, ipsum at dignissim sollicitudin, ante odio laoreet nulla, at convallis purus ex sit amet dolor.',
    keywords: ['quantum', 'mechanics', 'physics'],
    authors: List([
      Map({ name: 'John Smith', affiliation: 'University X' }),
      Map({ name: 'Emily Johnson', affiliation: 'University Y' }),
    ]),
    date: '2024-04-02',
    publisher: 'Science Publishers Inc.',
    status: 'error',
  }),
  Map({
    title: 'Advancements in Artificial Intelligence',
    id: 4,
    abstract:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec varius massa. Sed eleifend, ipsum at dignissim sollicitudin, ante odio laoreet nulla, at convallis purus ex sit amet dolor.',
    keywords: [
      'artificial intelligence',
      'machine learning',
      'neural networks',
    ],
    authors: List([
      Map({ name: 'Michael Brown', affiliation: 'Tech University' }),
      Map({ name: 'Sophia Martinez', affiliation: 'AI Research Institute' }),
    ]),
    date: '2024-04-02',
    publisher: 'Tech Publishing Group',
    status: 'preparing',
  }),
  Map({
    title: 'Introduction to Quantum Mechanics',
    id: 5,
    abstract:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec varius massa. Sed eleifend, ipsum at dignissim sollicitudin, ante odio laoreet nulla, at convallis purus ex sit amet dolor.',
    keywords: ['quantum', 'mechanics', 'physics'],
    authors: List([
      Map({ name: 'John Smith', affiliation: 'University X' }),
      Map({ name: 'Emily Johnson', affiliation: 'University Y' }),
    ]),
    date: '2024-04-02',
    publisher: 'Science Publishers Inc.',
    status: 'awaiting decision',
  }),
  Map({
    title: 'Advancements in Artificial Intelligence',
    id: 6,
    abstract:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec varius massa. Sed eleifend, ipsum at dignissim sollicitudin, ante odio laoreet nulla, at convallis purus ex sit amet dolor.',
    keywords: [
      'artificial intelligence',
      'machine learning',
      'neural networks',
    ],
    authors: List([
      Map({ name: 'Michael Brown', affiliation: 'Tech University' }),
      Map({ name: 'Sophia Martinez', affiliation: 'AI Research Institute' }),
    ]),
    date: '2024-04-02',
    publisher: 'Tech Publishing Group',
    status: 'running',
  }),
]);

export const facets = [
  {
    category: 'status',
    filters: [
      { name: 'complete', doc_count: 10 },
      { name: 'awaiting decision', doc_count: 23 },
      { name: 'error', doc_count: 23 },
      { name: 'preparing', doc_count: 23 },
      { name: 'running', doc_count: 23 },
    ],
  },
  {
    category: 'source',
    filters: [
      { name: 'arXiv', doc_count: 10 },
      { name: 'CDS', doc_count: 23 },
      { name: 'APS', doc_count: 67 },
    ],
  },
  { category: 'collection', filters: [{ name: 'HEP', doc_count: 54 }] },
  {
    category: 'subject',
    filters: [
      { name: 'physics', doc_count: 10 },
      { name: 'quantum physics', doc_count: 23 },
      { name: 'astrophysics', doc_count: 23 },
      { name: 'other', doc_count: 23 },
    ],
  },
  {
    category: 'decision',
    filters: [
      { name: 'core', doc_count: 10 },
      { name: 'non core', doc_count: 23 },
      { name: 'rejected', doc_count: 67 },
    ],
  },
  {
    category: 'pending action',
    filters: [
      { name: 'merging', doc_count: 10 },
      { name: 'matching', doc_count: 23 },
      { name: 'core selection', doc_count: 67 },
    ],
  },
  {
    category: 'journal',
    filters: [
      { name: 'Phys.Rev.C4', doc_count: 10 },
      { name: 'Eur.Phys.J.C2', doc_count: 23 },
      { name: 'Phys.Rev.A', doc_count: 67 },
    ],
  },
];
