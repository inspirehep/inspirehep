import React from 'react';
import { shallow } from 'enzyme';

import FieldInfoAlert from '../FieldInfoAlert';

describe('FieldInfoAlert', () => {
  it('renders with alert description', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <FieldInfoAlert description={<span>Watch out for this field!</span>} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
