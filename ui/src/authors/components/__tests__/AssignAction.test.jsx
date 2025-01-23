import React from 'react';
import { shallow } from 'enzyme';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

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
        onUnassign={jest.fn()}
        disabled
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders singular form if numberOfSelected is 1', () => {
    const wrapper = shallow(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        onUnassign={jest.fn()}
        numberOfSelected={1}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders plural form if numberOfSelected is more than 1', () => {
    const wrapper = shallow(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        onUnassign={jest.fn()}
        numberOfSelected={123}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click ', async () => {
    const onAssign = jest.fn();
    const { container } = render(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={onAssign}
        onUnassign={jest.fn()}
      />
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

  it('calls onAssign on unassign click ', async () => {
    const onUnassign = jest.fn();

    const { container } = render(
      <AssignAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        onUnassign={onUnassign}
      />
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => screen.getByTestId('unassign').click());

    await waitFor(() => expect(onUnassign).toHaveBeenCalledWith({ from: 123 }));
  });

  it('calls onAssignToAnotherAuthor on assign-another click ', async () => {
    const onAssign = jest.fn();
    const onAssignToAnotherAuthor = jest.fn();

    const { container } = render(
      <AssignAction
        onAssignToAnotherAuthor={onAssignToAnotherAuthor}
        onAssign={onAssign}
      />
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => screen.getByTestId('assign-another').click());

    await waitFor(() => expect(onAssign).toHaveBeenCalledTimes(0));
    await waitFor(() => expect(onAssignToAnotherAuthor).toHaveBeenCalled());
  });
});
