import React from 'react';
import { shallow } from 'enzyme';
import ExperimentAssociatedArticlesLink from '../ExperimentAssociatedArticlesLink';

describe('ExperimentAssociatedArticlesLink', () => {
  it('renders', () => {
    const wrapper = shallow(
      <ExperimentAssociatedArticlesLink
        recordId="12345"
        legacyName="Experiment"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
