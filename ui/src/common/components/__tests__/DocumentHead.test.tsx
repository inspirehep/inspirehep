import React from 'react';
import { shallow } from 'enzyme';

import DocumentHead from '../DocumentHead';

describe('DocumentHead', () => {
  it('renders with only title', () => {
    const wrapper = shallow(<DocumentHead title="Jessica Jones" />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with title, description and children', () => {
    const wrapper = shallow(
      <DocumentHead title="Page Title" description="This is a test page">
        <meta name="citation_title" content="Page Title" />
      </DocumentHead>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
