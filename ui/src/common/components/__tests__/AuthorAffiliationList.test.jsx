import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorAffiliationList from '../AuthorAffiliationList';

describe('AuthorAffiliationList', () => {
  it('renders author with one affiliation', () => {
    const affiliations = fromJS([
      {
        value: 'Affiliation',
      },
    ]);
    const wrapper = shallow(
      <AuthorAffiliationList affiliations={affiliations} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders author with multiple affiliations', () => {
    const affiliations = fromJS([
      {
        value: 'Affiliation1',
      },
      {
        value: 'Affiliation2',
      },
    ]);
    const wrapper = shallow(
      <AuthorAffiliationList affiliations={affiliations} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
