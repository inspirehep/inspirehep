import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import CollaborationList from '../CollaborationList';

describe('CollaborationList', () => {
  it('renders with collaboration', () => {
    const collaborations = fromJS([{ value: 'Alias Investigations' }]);
    const wrapper = shallow(
      <CollaborationList collaborations={collaborations} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders with collaborations', () => {
    const collaborations = fromJS([
      { value: 'Alias Investigations' },
      { value: 'Nelson and Murdock' },
    ]);
    const wrapper = shallow(
      <CollaborationList collaborations={collaborations} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
