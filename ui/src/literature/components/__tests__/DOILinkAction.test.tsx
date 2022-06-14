import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import DOILinkAction from '../DOILinkAction';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DOILinkAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with a doi id', () => {
    const dois = fromJS([{ value: '10.1007/s11182-019-01606-1' }]);
    const wrapper = shallow(<DOILinkAction dois={dois} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with multiple doi ids', () => {
    const dois = fromJS([
      { value: '10.1007/s11182-019-01606-1' },
      { value: '10.1007/s11182-019-01606-2' },
    ]);
    const wrapper = shallow(<DOILinkAction dois={dois} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with multiple doi ids and material', () => {
    const dois = fromJS([
      { value: '10.1007/s11182-019-01606-1' },
      { value: '10.1007/s11182-019-01606-2', material: 'publication' },
    ]);
    const wrapper = shallow(<DOILinkAction dois={dois} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
