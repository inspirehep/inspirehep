import React from 'react';
import { shallow } from 'enzyme';

import DocumentHead from '../DocumentHead';


describe('DocumentHead', () => {
  
  it('renders with only title', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<DocumentHead title="Jessica Jones" />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('renders with title, description and children', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <DocumentHead title="Page Title" description="This is a test page">
        <meta name="citation_title" content="Page Title" />
      </DocumentHead>
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
