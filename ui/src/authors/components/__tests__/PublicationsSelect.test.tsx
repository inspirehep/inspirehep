import React from 'react';
import { shallow } from 'enzyme';
import { Checkbox } from 'antd';

import PublicationsSelect from '../PublicationsSelect';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PublicationsSelect', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('sets publication selection on checkbox change', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectPapersUserCanNotClaim = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectClaimedPapers = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectUnclaimedPapers = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectPapers = jest.fn();
    const wrapper = shallow(
      <PublicationsSelect
        claimed
        canClaim={false}
        onSelectPapersUserCanNotClaim={onSelectPapersUserCanNotClaim}
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
    const onCheckboxChange = wrapper.find(Checkbox).prop('onChange');
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    onCheckboxChange({ target: { checked: true } });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onSelectPapersUserCanNotClaim).toHaveBeenCalled();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onSelectClaimedPapers).toHaveBeenCalled();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onSelectPapers).toHaveBeenCalled();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders checked when selected', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectPapersUserCanNotClaim = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectClaimedPapers = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectUnclaimedPapers = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectPapers = jest.fn();
    const wrapper = shallow(
      <PublicationsSelect
        claimed
        checked
        canClaim={false}
        onSelectPapersUserCanNotClaim={onSelectPapersUserCanNotClaim}
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders unchecked when not selected', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectPapersUserCanNotClaim = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectClaimedPapers = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectUnclaimedPapers = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onSelectPapers = jest.fn();
    const wrapper = shallow(
      <PublicationsSelect
        claimed
        checked={false}
        canClaim={false}
        onSelectPapersUserCanNotClaim={onSelectPapersUserCanNotClaim}
        onSelectClaimedPapers={onSelectClaimedPapers}
        onSelectUnclaimedPapers={onSelectUnclaimedPapers}
        onSelectPapers={onSelectPapers}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
