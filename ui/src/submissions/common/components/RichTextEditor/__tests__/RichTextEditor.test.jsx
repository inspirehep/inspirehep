import React from 'react';
import { shallow } from 'enzyme';

import RichTextEditor from '../RichTextEditor';

describe('RichTextEditor', () => {
  it('renders', () => {
    const wrapper = shallow(
      <RichTextEditor onChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
