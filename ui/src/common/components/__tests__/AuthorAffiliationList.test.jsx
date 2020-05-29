import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AffiliationList from '../AffiliationList';

describe('AffiliationList', () => {
  it('renders author with one affiliation', () => {
    const affiliations = fromJS([
      {
        value: 'CERN2',
        record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
      },
    ]);
    const wrapper = shallow(<AffiliationList affiliations={affiliations} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders author with multiple affiliations', () => {
    const affiliations = fromJS([
      {
        value: 'CERN2',
        record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
      },
      {
        value: 'CERN1',
      },
    ]);
    const wrapper = shallow(<AffiliationList affiliations={affiliations} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
