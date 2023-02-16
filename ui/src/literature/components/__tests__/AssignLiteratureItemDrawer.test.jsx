import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AssignLiteratureItemDrawer from '../AssignLiteratureItemDrawer';

describe('AssignLiteratureItemDrawer', () => {
  it('renders authors list', () => {
    const onDrawerClose = jest.fn();
    const onAssign = jest.fn();
    const literatureId = 122334;
    const authors = fromJS([
      {
        full_name: 'Test, A',
        record: {
          $ref: 'https://inspirebeta.net/api/authors/1016091',
        },
      },
    ]);

    const wrapper = shallow(
      <AssignLiteratureItemDrawer
        authors={authors}
        literatureId={literatureId}
        onDrawerClose={onDrawerClose}
        onAssign={onAssign}
        currentAuthorId={12345676}
        itemLiteratureId={122334}
        page="Page"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onAssign on assign button click', () => {
    const literatureId = 122334;
    const onDrawerClose = jest.fn();
    const onAssignClick = jest.fn();

    const wrapper = shallow(
      <AssignLiteratureItemDrawer
        literatureId={literatureId}
        onDrawerClose={onDrawerClose}
        onAssign={onAssignClick}
        currentAuthorId={12345676}
        authors={[]}
        itemLiteratureId={122334}
        page="Page"
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

    wrapper
      .find('[data-test-id="assign-literature-item-button"]')
      .simulate('click');
    expect(onAssignClick).toHaveBeenCalled();
  });
});
