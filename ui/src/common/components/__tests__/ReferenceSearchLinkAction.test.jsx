import React from 'react';
import { shallow } from 'enzyme';
import ReferenceSearchLinkAction from '../ReferenceSearchLinkAction';

describe('ReferenceSearchLinkAction', () => {
  it('renders with required props', () => {
    const recordId = 12345;
    const wrapper = shallow(<ReferenceSearchLinkAction recordId={recordId} />);
    expect(wrapper).toMatchSnapshot();
  });
});
