import React from 'react';
import { shallow } from 'enzyme';
import DropdownMenu from '../../../common/components/DropdownMenu';

describe('DropdownMenu', () => {
  it('renders correctly with default props', () => {
    const wrapper = shallow(<DropdownMenu title="title" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with items and onClick handlers', () => {
    const mockOnClick1 = jest.fn();
    const mockOnClick2 = jest.fn();
    const mockOnClick3 = jest.fn();

    const items = [
      {
        key: '1',
        label: 'Item 1',
        onClick: mockOnClick1,
      },
      {
        key: '2',
        label: 'Item 2',
        onClick: mockOnClick2,
      },
      {
        key: '3',
        label: 'Item 3',
        onClick: mockOnClick3,
      },
    ];
    const wrapper = shallow(<DropdownMenu title="title" items={items} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with disabled prop', () => {
    const mockOnClick = jest.fn();

    const items = [
      {
        key: '1',
        label: 'Item 1',
        onClick: mockOnClick,
      },
    ];
    const wrapper = shallow(
      <DropdownMenu title="title" items={items} disabled />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with overlayClassName', () => {
    const mockOnClick = jest.fn();

    const items = [
      {
        key: '1',
        label: 'Item 1',
        onClick: mockOnClick,
      },
    ];
    const wrapper = shallow(
      <DropdownMenu
        title="title"
        items={items}
        overlayClassName="custom-class"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
