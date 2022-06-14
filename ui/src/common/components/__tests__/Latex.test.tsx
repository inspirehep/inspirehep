import React from 'react';
import { mount } from 'enzyme';

import Latex from '../Latex';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Latex', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders only text', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = mount(<Latex>This does not have latex in it</Latex>);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders text with LaTex in $...$', () => {
    const textWithLatex = 'ATLAS $B_{s} \u2192 \u00b5^{+} \u00b5^{\u2212}$';
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = mount(<Latex>{textWithLatex}</Latex>);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders text with broken LaTex by falling back raw text', () => {
    const textWithBrokenLatex = 'ATLAS $B_{{s}$';
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = mount(<Latex>{textWithBrokenLatex}</Latex>);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders whitout inner html', () => {
    const wrapper = mount(<Latex />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
