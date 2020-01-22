import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ExternalSystemIdentifierList from '../ExternalSystemIdentifierList';

describe('ExternalSystemIdentifierList', () => {
  it('renders with external system identifiers', () => {
    const externalSystemIdentifiers = fromJS([
      {
        url_link: 'https://cds.cern.ch/record/12345',
        url_name: 'CERN Document Server',
      },
      {
        url_link: 'https://ui.adsabs.harvard.edu/abs/123.1234',
        url_name: 'ADS Abstract Service',
      },
    ]);
    const wrapper = shallow(
      <ExternalSystemIdentifierList
        externalSystemIdentifiers={externalSystemIdentifiers}
      />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
