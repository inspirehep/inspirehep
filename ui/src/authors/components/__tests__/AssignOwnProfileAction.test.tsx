import React from 'react';
import { shallow } from 'enzyme';
import AssignOwnProfileAction from '../AssignOwnProfileAction';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('react-router-dom', () => ({
  // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AssignOwnProfileAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const wrapper = shallow(<AssignOwnProfileAction onAssign={jest.fn()} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders singular form if numberOfSelected is 1', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssign={jest.fn()}
        numberOfSelected={1}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders plural form if numberOfSelected is more than 1', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssign={jest.fn()}
        numberOfSelected={123}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders disabled', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignToAnotherAuthor: any; onAssign: an... Remove this comment to see the full error message
        onAssignToAnotherAuthor={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssign={jest.fn()}
        disabled
        disabledAssignAction
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with disabled assign action', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssignToAnotherAuthor: any; onAssign: an... Remove this comment to see the full error message
        onAssignToAnotherAuthor={jest.fn()}
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onAssign={jest.fn()}
        disabledAssignAction
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssign on assign-self click ', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssign = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssign: any; isUnassignAction: boolean; ... Remove this comment to see the full error message
      <AssignOwnProfileAction onAssign={onAssign} isUnassignAction={false} />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssign).toHaveBeenCalledWith({
      from: 123,
      to: 123,
      isUnassignAction: false,
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onAssign on unassign click ', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onAssign = jest.fn();
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ onAssign: any; isUnassignAction: true; }' ... Remove this comment to see the full error message
      <AssignOwnProfileAction onAssign={onAssign} isUnassignAction />
    );
    wrapper.find('[data-test-id="unassign"]').simulate('click');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onAssign).toHaveBeenCalledWith({
      from: 123,
      isUnassignAction: true,
    });
  });
});
