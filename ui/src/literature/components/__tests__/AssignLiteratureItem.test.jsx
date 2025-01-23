import React from 'react';
import { shallow } from 'enzyme';
import { render, waitFor, fireEvent, screen } from '@testing-library/react';

import AssignLiteratureItem from '../AssignLiteratureItem';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignLiteratureItem', () => {
  it('renders', () => {
    const wrapper = shallow(
      <AssignLiteratureItem
        controlNumber={123456}
        currentUserRecordId={123456}
        onAssign={jest.fn()}
      />
    );

    expect(wrapper).toMatchSnapshot();
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
