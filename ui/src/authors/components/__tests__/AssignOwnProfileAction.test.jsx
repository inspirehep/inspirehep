import React from 'react';
import { shallow } from 'enzyme';
import AssignOwnProfileAction from '../AssignOwnProfileAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignOwnProfileAction', () => {
  it('renders', () => {
    const wrapper = shallow(<AssignOwnProfileAction onAssign={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders singular form if numberOfSelected is 1', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction
        onAssign={jest.fn()}
        numberOfSelected={1}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders plural form if numberOfSelected is more than 1', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction
        onAssign={jest.fn()}
        numberOfSelected={123}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        disabled
        disabledAssignAction
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with disabled assign action', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        disabledAssignAction
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click ', () => {
    const onAssign = jest.fn();
    const wrapper = shallow(
      <AssignOwnProfileAction onAssign={onAssign} isUnassignAction={false} />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    expect(onAssign).toHaveBeenCalledWith({
      from: 123,
      to: 123,
      isUnassignAction: false,
    });
  });

  it('calls onAssign on unassign click ', () => {
    const onAssign = jest.fn();
    const wrapper = shallow(
      <AssignOwnProfileAction onAssign={onAssign} isUnassignAction />
    );
    wrapper.find('[data-test-id="unassign"]').simulate('click');
    expect(onAssign).toHaveBeenCalledWith({
      from: 123,
      isUnassignAction: true,
    });
  });
});
