import React from 'react';
import { shallow } from 'enzyme';
import ExceptionsDashboard from '../ExceptionsDashboard';

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

describe('ExceptionsDashboard', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(<ExceptionsDashboard exceptions={exceptions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should calculate number of errors in each collection type', () => {
    const actualResult = ExceptionsDashboard.getExceptionCountEntriesByCollection(
      exceptions
    );
    const expectedResult = [['Job', 1], ['Hep', 2], ['Conferences', 1]];
    expect(actualResult).toEqual(expectedResult);
  });
});
