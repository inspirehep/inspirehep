import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorResultItem from '../AuthorResultItem';

describe('AuthorResultItem', () => {
  it('renders with only name', () => {
    const metadata = fromJS({
      name: { value: 'Urhan, Harun' },
      control_number: 12345,
    });
    const wrapper = shallow(<AuthorResultItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders full author result', () => {
    const metadata = fromJS({
      name: { value: 'Urhan, Harun' },
      control_number: 12345,
      project_membership: [{ name: 'CERN-LHC-CMS' }],
      positions: [
        { institution: 'CERN', current: 'true' },
        { institution: 'CERN2' },
        { institution: 'CERN3', current: 'true' },
      ],
      arxiv_categories: ['hep-th'],
    });
    const wrapper = shallow(<AuthorResultItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });
});
