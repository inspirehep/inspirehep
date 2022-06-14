import React from 'react';
import { shallow } from 'enzyme';

import DOILink from '../DOILink';

describe('DOILink', () => {
  it('renders with doi', () => {
    const wrapper = shallow(
      <DOILink doi="12.1234/1234567890123_1234">DOI</DOILink>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
