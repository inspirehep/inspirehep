import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AssignLiteratureItemDrawer from '../AssignLiteratureItemDrawer.tsx';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignLiteratureItemDrawer', () => {
  it('renders authors list', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
      {
        full_name: 'Test, Guy 4',
      },
      {
        full_name: 'Test, Guy 5',
      },
      {
        full_name: 'Test, Guy 6',
      },
    ]);
    const wrapper = shallow(
      <AssignLiteratureItemDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        currentAuthorId={12345676}
        authors={authors}
        paperId={122334}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const onAssignClick = jest.fn();

    const wrapper = shallow(
      <AssignLiteratureItemDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        onAssign={onAssignClick}
        currentAuthorId={12345676}
        authors={[]}
        paperId={122334}
      />
    );
    expect(
      wrapper.find('[data-test-id="assign-literature-item-button"]')
    ).toHaveProp({
      disabled: true,
    });

    const value = 11121;
    wrapper
      .find('[data-test-id="literature-drawer-radio-group"]')
      .simulate('change', { target: { value } });
    wrapper.update();
    expect(
      wrapper.find('[data-test-id="assign-literature-item-button"]')
    ).toHaveProp({
      disabled: false,
    });

    wrapper.find('[data-test-id="assign-literature-item-button"]').simulate('click');
    expect(onAssignClick).toHaveBeenCalled();
  });
});
