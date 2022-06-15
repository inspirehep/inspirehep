import React from 'react';
import { shallow } from 'enzyme';

import ExistingConferencesDrawer from '../ExistingConferencesDrawer';

describe('ExistingConferencesDrawer', () => {
  it('renders drawer with number of conferences', () => {
    const visible = true;
    const onDrawerClose = jest.fn();
    const numberOfConferences = 5;

    const wrapper = shallow(
      <ExistingConferencesDrawer
        visible={visible}
        onDrawerClose={onDrawerClose}
        numberOfConferences={numberOfConferences}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
