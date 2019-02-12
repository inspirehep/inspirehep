import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import CollaborationList from '../CollaborationList';

describe('CollaborationList', () => {
  it('renders with collaboration without suffix', () => {
    const collaborations = fromJS([{ value: 'Alias Investigations' }]);
    const wrapper = shallow(
      <CollaborationList collaborations={collaborations} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with collaborations without suffix', () => {
    const collaborations = fromJS([
      { value: 'Alias Investigations' },
      { value: 'Nelson and Murdock' },
    ]);
    const wrapper = shallow(
      <CollaborationList collaborations={collaborations} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with collaborations with and without suffix', () => {
    const collaborationsWithSuffix = fromJS([
      { value: 'Avangers Groups' },
      { value: 'Avangers Task Force' },
      { value: 'Avangers Consortium' },
      { value: 'Avangers Team' },
    ]);
    const collaborations = fromJS([
      { value: 'Alias Investigations' },
      { value: 'Nelson and Murdock' },
      { value: 'Defenders Group and Avengers' },
      { value: 'Defenders Task Force and Avengers' },
    ]);
    const wrapper = shallow(
      <CollaborationList
        collaborations={collaborations}
        collaborationsWithSuffix={collaborationsWithSuffix}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with collaborations with suffix', () => {
    const collaborationsWithSuffix = fromJS([
      { value: 'Avangers Groups' },
      { value: 'Avangers Group' },
      { value: 'Avangers Task Force' },
      { value: 'Avangers Consortium' },
      { value: 'Avangers Team' },
    ]);
    const wrapper = shallow(
      <CollaborationList collaborationsWithSuffix={collaborationsWithSuffix} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
