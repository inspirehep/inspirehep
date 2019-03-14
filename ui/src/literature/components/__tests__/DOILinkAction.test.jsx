import React from 'react';
import { shallow } from 'enzyme';

import DOILinkAction from '../DOILinkAction';

describe('DOILinkAction', () => {
  it('renders with a doi id', () => {
    const wrapper = shallow(
      <DOILinkAction arxivId="10.1007/s11182-019-01606-1" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
