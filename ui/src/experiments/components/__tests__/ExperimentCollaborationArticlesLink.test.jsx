import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ExperimentCollaborationArticlesLink from '../ExperimentCollaborationArticlesLink';

describe('ExperimentCollaborationArticlesLink', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ExperimentCollaborationArticlesLink
        collaboration={fromJS({ value: 'Atlas' })}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
