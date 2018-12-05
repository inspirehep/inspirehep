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
        start_date: '1990',
        end_date: '1994',
        rank: 'UNDERGRADUATE',
      },
      {
        institution: 'Inst 2',
        start_date: '1994',
        end_date: '2000',
        rank: 'PHD',
      },
      {
        institution: 'CERN',
        start_date: '2000',
        rank: 'STAFF',
        current: true,
      },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with single position if has rank even if current', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        rank: 'UNDERGRADUATE',
        current: true,
      },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with single position if has start_date even if current', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        start_date: '2000',
        current: true,
      },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with single position if has end_date even if current', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        end_date: '2005',
        current: true,
      },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render with single position without any of extra display keys if current', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        current: true,
      },
    ]);
    const wrapper = shallow(<PositionsTimeline positions={positions} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without any of extra display keys if not current', () => {
    const positions = fromJS([
      {
        institution: 'Inst 1',
        current: false,
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
