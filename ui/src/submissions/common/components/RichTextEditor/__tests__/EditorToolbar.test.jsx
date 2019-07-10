import React from 'react';
import { shallow } from 'enzyme';

import EditorToolbar from '../EditorToolbar';

describe('RichTextEditor', () => {
  it('renders', () => {
    const wrapper = shallow(<EditorToolbar />);
    expect(wrapper).toMatchSnapshot();
  });
});
