import React from 'react';
import { shallow } from 'enzyme';
import ToolAction from '../ToolAction';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('ToolAction', () => {
  it('renders', () => {
    const wrapper = shallow(<ToolAction onAssign={jest.fn()} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const wrapper = shallow(
      <ToolAction onAssign={jest.fn()} disabledAssignConference />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssignToConference on assign-conference click ', () => {
    const onAssignToConference = jest.fn();
    const wrapper = shallow(
      <ToolAction onAssignToConference={onAssignToConference} />
    );
    wrapper.find('[data-test-id="assign-conference"]').simulate('click');
    expect(onAssignToConference).toHaveBeenCalled();
  });
});
