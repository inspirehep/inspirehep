import { List, Map } from 'immutable';

export default List([
  Map({
    authors: List([
      Map({
        last_name: 'P.Armitage',
        full_name: 'P.Armitage, N.',
        first_name: 'N.',
      }),
      Map({
        last_name: 'J.Mele',
        full_name: 'J.Mele, E.',
        first_name: 'E.',
      }),
      Map({
        full_name: 'A.Vishwanath',
        first_name: 'A.Vishwanath',
      }),
    ]),
    publication_info: List([
      Map({
        journal_volume: '90',
        artid: '015001',
        year: 2018,
        journal_title: 'Rev.Mod.Phys.',
      }),
    ]),
    label: '1',
    dois: List([
      Map({
        value: '10.1103/RevModPhys.90.015001',
      }),
    ]),
  }),
  Map({
    authors: List([
      Map({
        full_name: 'Z.Fang',
        first_name: 'Z.Fang',
      }),
    ]),
    publication_info: List([
      Map({
        journal_volume: '302',
        artid: '92',
        page_start: '92',
        year: 2003,
        journal_title: 'Science',
      }),
    ]),
    label: '2',
    dois: List([
      Map({
        value: '10.1126/science.1089408',
      }),
    ]),
  }),
  Map({
    authors: List([
      Map({
        full_name: 'R.Shimano',
        first_name: 'R.Shimano',
      }),
    ]),
    publication_info: List([
      Map({
        journal_volume: '95',
        artid: '17002',
        year: 2011,
        journal_title: 'EPL',
      }),
    ]),
    label: '3',
    dois: List([
      Map({
        value: '10.1209/0295-5075/95/17002',
      }),
    ]),
  }),
  Map({
    misc: 'Nat. Commun. 7, 11788',
    authors: List([
      Map({
        full_name: 'S.Itoh',
        first_name: 'S.Itoh',
      }),
    ]),
    publication_info: List([
      Map({
        year: 2016,
      }),
    ]),
    label: '4',
    dois: List([
      Map({
        value: '10.1038/ncomms11788',
      }),
    ]),
  }),
  // {
  //     authors: [
  //         {
  //             full_name: "K.Jenni",
  //             first_name: "K.Jenni"
  //         }
  //     ],
  //     arxiv_eprint: [
  //         {
  //             "value": "1902.04036"
  //         }
  //     ],
  //     label: "5"
  // },
  // {
  //     authors: [
  //         {
  //             full_name: "X.Wan",
  //             first_name: "X.Wan"
  //         }
  //     ],
  //     publication_info: [
  //         {
  //             journal_volume: "83",
  //             artid: "205101",
  //             year: 2011,
  //             journal_title: "Phys.Rev.B"
  //         }
  //     ],
  //     label: "6",
  //     dois: [
  //         {
  //             "value": "10.1103/PhysRevB.83.205101"
  //         }
  //     ]
  // },
  // {
  //     misc: "Nat. Commun. 6, 10042",
  //     authors: [
  //         {
  //             full_name: "T.Kondo",
  //             first_name: "T.Kondo"
  //         }
  //     ],
  //     publication_info: [
  //         {
  //             year: 2015
  //         }
  //     ],
  //     label: "7",
  //     dois: [
  //         {
  //             "value": "10.1038/ncomms10042"
  //         }
  //     ]
  // },
  // {
  //     misc: "Nat. Commun. 8, 15515",
  //     authors: [
  //         {
  //             full_name: "K.Ueda",
  //             first_name: "K.Ueda"
  //         }
  //     ],
  //     publication_info: [
  //         {
  //             year: 2017
  //         }
  //     ],
  //     label: "8",
  //     dois: [
  //         {
  //             "value": "10.1038/ncomms15515"
  //         }
  //     ]
  // },
  // {
  //     misc: "Nat. Commun. 9, 3032",
  //     authors: [
  //         {
  //             full_name: "K.Ueda",
  //             first_name: "K.Ueda"
  //         }
  //     ],
  //     publication_info: [
  //         {
  //             year: 2018
  //         }
  //     ],
  //     label: "9",
  //     dois: [
  //         {
  //             "value": "10.1038/s41467-018-05530-9"
  //         }
  //     ]
  // },
  // {
  //     misc: "Sci. Adv. 4, eaar7880",
  //     authors: [
  //         {
  //             last_name: "S.Takahashi",
  //             full_name: "S.Takahashi, K.",
  //             first_name: "K."
  //         }
  //     ],
  //     publication_info: [
  //         {
  //             year: 2018
  //         }
  //     ],
  //     label: "10",
  //     dois: [
  //         {
  //             "value": "10.1126/sciadv.aar7880"
  //         }
  //     ]
  // },
  // {
  //     authors: [
  //         {
  //             full_name: "H.Isobe",
  //             first_name: "H.Isobe"
  //         },
  //         {
  //             full_name: "B.-J.Yang",
  //             first_name: "B.-J.Yang"
  //         },
  //         {
  //             full_name: "A.Chubukov",
  //             first_name: "A.Chubukov"
  //         },
  //         {
  //             full_name: "J.Schmalian",
  //             first_name: "J.Schmalian"
  //         },
  //         {
  //             full_name: "N.Nagaosa",
  //             first_name: "N.Nagaosa"
  //         }
  //     ],
  //     publication_info: [
  //         {
  //             journal_volume: "116",
  //             artid: "076803",
  //             year: 2016,
  //             journal_title: "Phys.Rev.Lett."
  //         }
  //     ],
  //     label: "11",
  //     dois: [
  //         {
  //             "value": "10.1103/PhysRevLett.116.076803"
  //         }
  //     ]
  // },
  // {
  //     authors: [
  //         {
  //             full_name: "H.Isobe",
  //             first_name: "H.Isobe"
  //         },
  //         {
  //             full_name: "N.Nagaosa",
  //             first_name: "N.Nagaosa"
  //         }
  //     ],
  //     publication_info: [
  //         {
  //             journal_volume: "116",
  //             artid: "116803",
  //             year: 2016,
  //             journal_title: "Phys.Rev.Lett."
  //         }
  //     ],
  //     label: "12",
  //     dois: [
  //         {
  //             "value": "10.1103/PhysRevLett.116.116803"
  //         }
  //     ]
  // },
  // {
  //     authors: [
  //         {
  //             full_name: "T.Morimoto",
  //             first_name: "T.Morimoto"
  //         },
  //         {
  //             full_name: "N.Nagaosa",
  //             first_name: "N.Nagaosa"
  //         }
  //     ],
  //     publication_info: [
  //         {
  //             journal_volume: "6",
  //             artid: "19853",
  //             year: 2016,
  //             journal_title: "Sci.Rep."
  //         }
  //     ],
  //     label: "13",
  //     dois: [
  //         {
  //             "value": "10.1038/srep19853"
  //         }
  //     ]
  // }
]);
