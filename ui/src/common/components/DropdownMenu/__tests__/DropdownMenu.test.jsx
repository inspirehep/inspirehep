import React from 'react';
import { shallow } from 'enzyme';

import DropdownMenu from '../DropdownMenu';

describe('DropdownMenu', () => {
  it('renders links without titleClassName', () => {
    const items = [
      {
        display: 'Router Link',
        to: '/router-link',
      },
      {
        display: 'Non Router Link',
        href: '/non-router-link',
      },
      {
        display: 'Non Router Link Button',
        onClick: () => null,
      },
      {
        display: 'External Link',
        href: '//external.link',
        target: '_blank',
      },
    ];
    const wrapper = shallow(<DropdownMenu items={items} title="Test" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders links with titleClassName', () => {
    const items = [
      {
        display: 'Router Link',
        to: '/router-link',
      },
      {
        display: 'Non Router Link',
        href: '/non-router-link',
      },
      {
        display: 'Non Router Link Button',
        onClick: () => null,
      },
      {
        display: 'External Link',
        href: '//external.link',
        target: '_blank',
      },
    ];
    const wrapper = shallow(
      <DropdownMenu items={items} title="Test" titleClassName="test-title" />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
