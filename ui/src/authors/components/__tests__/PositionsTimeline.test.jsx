import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import PositionsTimeline from '../PositionsTimeline';
import ExpandListToggle from '../../../common/components/ExpandListToggle';

describe('PositionsTimeline', () => {
  it('renders with positions', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        display_date: '1990-1994',
        rank: 'UNDERGRADUATE',
      },
      {
        institution: 'Inst 2',
        display_date: '1994-2000',
        rank: 'PHD',
      },
      {
        institution: 'CERN',
        display_date: '2000-present',
        rank: 'STAFF',
        current: true,
      },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with single position', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        rank: 'UNDERGRADUATE',
        display_date: 'present',
        current: true,
      },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only first 5 by default', () => {
    const positions = fromJS([
      { institution: 'Inst 1' },
      { institution: 'Inst 2' },
      { institution: 'Inst 3' },
      { institution: 'Inst 4' },
      { institution: 'Inst 5' },
      { institution: 'Inst 6' },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders all when ExpandListToggle is toggled by default', () => {
    const positions = fromJS([
      { institution: 'Inst 1' },
      { institution: 'Inst 2' },
      { institution: 'Inst 3' },
      { institution: 'Inst 4' },
      { institution: 'Inst 5' },
      { institution: 'Inst 6' },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    const toggleWrapper = wrapper.find(ExpandListToggle);
    const onExpandToggle = toggleWrapper.prop('onToggle');
    onExpandToggle();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
