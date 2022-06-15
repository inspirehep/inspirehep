import React from 'react';
import { shallow } from 'enzyme';
import { Set } from 'immutable';

import AssignConferencesDrawer from '../AssignConferencesDrawer';

<<<<<<< Updated upstream

jest.mock('react-router-dom', () => ({
  
=======
jest.mock('react-router-dom', () => ({
>>>>>>> Stashed changes
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

<<<<<<< Updated upstream

describe('AssignConferencesDrawer', () => {
  
  it('renders assign conferences search', () => {
    const visible = true;
    
    const onDrawerClose = jest.fn();
    
=======
describe('AssignConferencesDrawer', () => {
  it('renders assign conferences search', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
>>>>>>> Stashed changes
    const onAssign = jest.fn();
    const selectedPapers = Set([1, 2, 3]);

    const wrapper = shallow(
      <AssignConferencesDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
<<<<<<< Updated upstream
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('calls onAssign on assign button click', () => {
    const visible = true;
    
    const onDrawerClose = jest.fn();
    
=======
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
>>>>>>> Stashed changes
    const onAssign = jest.fn();

    const selectedPapers = Set([1, 2, 3]);

    const wrapper = shallow(
      <AssignConferencesDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        selectedPapers={selectedPapers}
      />
    );
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(
      wrapper.find('[data-test-id="assign-conference-button"]')
    ).toHaveProp({
      disabled: true,
    });

    const value = { controlNumber: 123, title: 'Jessica Jones' };
    wrapper
      .find('[data-test-id="conference-radio-group"]')
      .simulate('change', { target: { value } });
    wrapper.update();
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(
      wrapper.find('[data-test-id="assign-conference-button"]')
    ).toHaveProp({
      disabled: false,
    });

    wrapper.find('[data-test-id="assign-conference-button"]').simulate('click');
<<<<<<< Updated upstream
    
=======
>>>>>>> Stashed changes
    expect(onAssign).toHaveBeenCalledWith(value.controlNumber, value.title);
  });
});
