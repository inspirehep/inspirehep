import React from 'react';
import { shallow } from 'enzyme';
import AssignAction from '../AssignAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignAction', () => {
  it('renders', () => {
    const wrapper = shallow(
      <AssignAction onAssignToAnotherAuthor={jest.fn()} onAssign={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const wrapper = shallow(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        disabled
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click ', () => {
    const onAssign = jest.fn();
    const wrapper = shallow(
      <AssignAction onAssignToAnotherAuthor={jest.fn()} onAssign={onAssign} />
    );
    wrapper.find('[data-test-id="assign-self"]').simulate('click');
    expect(onAssign).toHaveBeenCalledWith({ from: 123, to: 123 });
  });

  it('calls onAssign on unassign click ', () => {
    const onAssign = jest.fn();
    const wrapper = shallow(
      <AssignAction onAssignToAnotherAuthor={jest.fn()} onAssign={onAssign} />
    );
    wrapper.find('[data-test-id="unassign"]').simulate('click');
    expect(onAssign).toHaveBeenCalledWith({ from: 123 });
  });

  it('calls onAssignToAnotherAuthor on assign-another click ', () => {
    const onAssign = jest.fn();
    const onAssignToAnotherAuthor = jest.fn();
    const wrapper = shallow(
      <AssignAction
        onAssignToAnotherAuthor={onAssignToAnotherAuthor}
        onAssign={onAssign}
      />
    );
    wrapper.find('[data-test-id="assign-another"]').simulate('click');
    expect(onAssign).toHaveBeenCalledTimes(0);
    expect(onAssignToAnotherAuthor).toHaveBeenCalled();
  });
});
