import React from 'react';
import { shallow } from 'enzyme';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

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
      <AssignOwnProfileAction onAssign={jest.fn()} numberOfSelected={1} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders plural form if numberOfSelected is more than 1', () => {
    const wrapper = shallow(
      <AssignOwnProfileAction onAssign={jest.fn()} numberOfSelected={123} />
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

  it('calls onAssign on assign-self click ', async () => {
    const onAssign = jest.fn();
    const { container } = render(
      <AssignOwnProfileAction onAssign={onAssign} isUnassignAction={false} />
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => screen.getByTestId('assign-self').click());

    await waitFor(() =>
      expect(onAssign).toHaveBeenCalledWith({ from: 123, to: 123 })
    );
  });

  it('calls onUnssign on unassign click ', async () => {
    const onUnassign = jest.fn();
    const onAssign = jest.fn();

    const { container } = render(
      <AssignOwnProfileAction
        onAssign={onAssign}
        onUnassign={onUnassign}
        isUnassignAction
      />
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => screen.getByTestId('unassign').click());

    await waitFor(() => expect(onUnassign).toHaveBeenCalledWith({ from: 123 }));
  });
});
