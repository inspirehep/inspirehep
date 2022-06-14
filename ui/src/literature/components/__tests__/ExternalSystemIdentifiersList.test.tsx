import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ExternalSystemIdentifierList from '../ExternalSystemIdentifierList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExternalSystemIdentifierList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        externalSystemIdentifiers={externalSystemIdentifiers}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
