import React from 'react';
import { shallow } from 'enzyme';

import DOILink from '../DOILink';

<<<<<<< Updated upstream

describe('DOILink', () => {
  
=======
describe('DOILink', () => {
>>>>>>> Stashed changes
  it('renders with doi', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <DOILink doi="12.1234/1234567890123_1234">DOI</DOILink>
    );
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(wrapper).toMatchSnapshot();
  });
});
