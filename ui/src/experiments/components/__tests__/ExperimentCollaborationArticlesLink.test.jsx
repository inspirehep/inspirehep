import React from 'react';
import { shallow } from 'enzyme';

import ExperimentCollaborationArticlesLink from '../ExperimentCollaborationArticlesLink';

describe('ExperimentCollaborationArticlesLink', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ExperimentCollaborationArticlesLink recordId={1234} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
