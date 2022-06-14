import React from 'react';
import { shallow } from 'enzyme';
import { Set } from 'immutable';

import AssignDrawer from '../AssignDrawer';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('react-router-dom', () => ({
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AssignDrawer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders assign authors search', () => {
    const visible = true;
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onDrawerClose = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const wrapper = shallow(
      <AssignDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssign on assign button click', () => {
    const visible = true;
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onDrawerClose = jest.fn();
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const wrapper = shallow(
      <AssignDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find('[data-test-id="assign-button"]')).toHaveProp({
      disabled: true,
    });

    wrapper
      .find('[data-test-id="author-radio-group"]')
      .simulate('change', { target: { value: 321 } });
    wrapper.update();
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find('[data-test-id="assign-button"]')).toHaveProp({
      disabled: false,
    });

    wrapper.find('[data-test-id="assign-button"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssign).toHaveBeenCalledWith({ from: 123, to: 321 });
  });
});
