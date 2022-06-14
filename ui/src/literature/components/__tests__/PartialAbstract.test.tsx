import React from 'react';
import { shallow } from 'enzyme';

import PartialAbstract from '../PartialAbstract';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PartialAbstract', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should render partial abstract', () => {
    const abstract =
      'The phenomenon of CP violation is crucial to understand the asymmetry between matter and antimatter that exists in the Universe. Dramatic experimental progress has been made, in particular in measurements of the behaviour of particles containing the b quark, where CP violation effects are predicted by the Kobayashi-Maskawa mechanism that is embedded in the Standard Model. The status of these measurements and future prospects for an understanding of CP violation beyond the Standard Model are reviewed.';
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
    const wrapper = shallow(<PartialAbstract abstract={abstract} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render if abstract is not passed', () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{}' is not assignable to type 'never'.
    const wrapper = shallow(<PartialAbstract />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('should not append ellipsis when abstract length is less than the limit', () => {
    const abstract = 'A short abstract';
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'never'.
    const wrapper = shallow(<PartialAbstract abstract={abstract} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
