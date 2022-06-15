import React from 'react';
import { shallow } from 'enzyme';
import ExperimentAssociatedArticlesLink from '../ExperimentAssociatedArticlesLink';


describe('ExperimentAssociatedArticlesLink', () => {
  
  it('renders', () => {
    const wrapper = shallow(
      <ExperimentAssociatedArticlesLink
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'number'.
        recordId="12345"
        legacyName="Experiment"
      />
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
