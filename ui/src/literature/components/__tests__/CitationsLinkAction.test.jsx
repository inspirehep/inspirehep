import React from 'react';
import { shallow } from 'enzyme';

import CitationsLinkAction from '../CitationsLinkAction';

describe('CitationsLinkAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <CitationsLinkAction
        citationCount={123}
        recordId={12}
        trackerEventId="myID"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
