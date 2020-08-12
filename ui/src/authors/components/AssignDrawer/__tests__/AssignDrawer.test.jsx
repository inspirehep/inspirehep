import React from 'react';
import { shallow } from 'enzyme';
import { Set } from 'immutable';

import AssignDrawer from '../AssignDrawer';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignDrawer', () => {
  it('renders assign authors search', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const wrapper = shallow(
      <AssignDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const wrapper = shallow(
      <AssignDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
    expect(wrapper.find('[data-test-id="assign-button"]')).toHaveProp({
      disabled: true,
    });

    wrapper
      .find('[data-test-id="author-radio-group"]')
      .simulate('change', { target: { value: 321 } });
    wrapper.update();
    expect(wrapper.find('[data-test-id="assign-button"]')).toHaveProp({
      disabled: false,
    });

    wrapper.find('[data-test-id="assign-button"]').simulate('click');
    expect(onAssign).toHaveBeenCalledWith({ from: 123, to: 321 });
  });
});
