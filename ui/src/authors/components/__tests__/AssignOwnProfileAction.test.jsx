import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

import AssignOwnProfileAction from '../AssignOwnProfileAction';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useParams: jest.fn().mockReturnValue({ id: 123 }) };
});

describe('AssignOwnProfileAction', () => {
  it('renders', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction onAssign={jest.fn()} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders singular form if numberOfSelected is 1', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction onAssign={jest.fn()} numberOfSelected={1} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders plural form if numberOfSelected is more than 1', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction onAssign={jest.fn()} numberOfSelected={123} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders disabled', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        disabled
        disabledAssignAction
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with disabled assign action', () => {
    const { asFragment } = render(
      <AssignOwnProfileAction
        onAssignToAnotherAuthor={jest.fn()}
        onAssign={jest.fn()}
        disabledAssignAction
      />
    );
    expect(asFragment()).toMatchSnapshot();
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
