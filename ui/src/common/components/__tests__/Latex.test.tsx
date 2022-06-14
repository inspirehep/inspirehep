import React from 'react';
import { mount } from 'enzyme';

import Latex from '../Latex';

describe('Latex', () => {
  it('renders only text', () => {
    const wrapper = mount(<Latex>This does not have latex in it</Latex>);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders text with LaTex in $...$', () => {
    const textWithLatex = 'ATLAS $B_{s} \u2192 \u00b5^{+} \u00b5^{\u2212}$';
    const wrapper = mount(<Latex>{textWithLatex}</Latex>);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders text with broken LaTex by falling back raw text', () => {
    const textWithBrokenLatex = 'ATLAS $B_{{s}$';
    const wrapper = mount(<Latex>{textWithBrokenLatex}</Latex>);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders whitout inner html', () => {
    const wrapper = mount(<Latex />);
    expect(wrapper).toMatchSnapshot();
  });
});
