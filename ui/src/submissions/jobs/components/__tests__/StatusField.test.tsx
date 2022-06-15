import React from 'react';
import { shallow } from 'enzyme';

import StatusField from '../StatusField';

describe('StatusField', () => {
  it('renders if can modify but not cataloger logged in', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <StatusField canModify isCatalogerLoggedIn={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders if can modify and cataloger logged in', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<StatusField canModify isCatalogerLoggedIn />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders if can not modify and not cataloger logged in', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <StatusField canModify={false} isCatalogerLoggedIn={false} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
