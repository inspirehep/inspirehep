import React from 'react';
import { shallow } from 'enzyme';
import ExceptionsTable from '../ExceptionsTable';

const exceptions = [
  {
    collection: 'Job',
    error:
      "Failed validating u'format' in schema[u'properties'][u'urls'][u'items'][u'properties'][u'value']:",
    recid: 1512550,
  },
  {
    collection: 'Hep',
    error:
      "Failed validating u'format' in schema[u'properties'][u'authors'][u'items'][u'properties'][u'emails'][u'items']:",
    recid: 1238165,
  },
  {
    collection: 'Conferences',
    error:
      "Failed validating u'format' in schema[u'properties'][u'urls'][u'items'][u'properties'][u'value']:",
    recid: 1356791,
  },
  {
    collection: 'Hep',
    error:
      "Failed validating u'pattern' in schema[u'properties'][u'persistent_identifiers'][u'items'][u'properties'][u'value']:",
    recid: 1635467,
  },
];

describe('ExceptionsTable', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should return correct filtered results', () => {
    const searchText = 'url';
    const wrapper = shallow(<ExceptionsTable exceptions={exceptions} />);
    const expectedFilteredResult = [
      {
        collection: 'Job',
        error:
          "Failed validating u'format' in schema[u'properties'][u'urls'][u'items'][u'properties'][u'value']:",
        recid: 1512550,
      },
      {
        collection: 'Conferences',
        error:
          "Failed validating u'format' in schema[u'properties'][u'urls'][u'items'][u'properties'][u'value']:",
        recid: 1356791,
      },
    ];
    const actualFilteredResult = wrapper
      .instance()
      .onColumnSearch(searchText, 'error');
    expect(actualFilteredResult).toEqual(expectedFilteredResult);
  });
});
