import React from 'react';
import { shallow } from 'enzyme';

import Latex from '../Latex';

describe('Latex', () => {
  it('renders only text', () => {
    const wrapper = shallow((
      <Latex>
        This does not have latex in it
      </Latex>
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('renders text with LaTex in $...$', () => {
    const formula = '2.8~\\mathrm{fb}^{-1}';
    const wrapper = shallow((
      <Latex>
        Latex here: ${formula}$
      </Latex>
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('renders text with broken LaTex by falling back raw text', () => {
    const brokenFormula = '2.8~\\mathrm{{{fb}^{-1}';
    const wrapper = shallow((
      <Latex>
        Formula here: ${brokenFormula}$
      </Latex>
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('renders whitout inner html', () => {
    const wrapper = shallow((
      <Latex />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
