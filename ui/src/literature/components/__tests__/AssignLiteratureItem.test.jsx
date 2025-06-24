import React from 'react';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

import AssignLiteratureItem from '../AssignLiteratureItem';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignLiteratureItem', () => {
  beforeAll(() => {
    const rootElement = document.createElement('div');
    rootElement.setAttribute('id', 'root');
    document.body.appendChild(rootElement);
  });

  it('renders', () => {
    const { asFragment } = render(
      <AssignLiteratureItem
        controlNumber={123456}
        currentUserRecordId={123456}
        onAssign={jest.fn()}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onAssign on assign-self click', async () => {
    const onAssign = jest.fn();

    const { container } = render(
      <AssignLiteratureItem
        onAssign={onAssign}
        currentUserRecordId={33}
        controlNumber={123456}
      />
    );

    const dropdown = container.getElementsByClassName(
      'ant-dropdown-trigger'
    )[0];

    await waitFor(() => fireEvent.mouseOver(dropdown));
    await waitFor(() => screen.getByTestId('assign-literature-item').click());

    await waitFor(() => expect(onAssign).toHaveBeenCalled());
  });
});
