import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorsAndCollaborations from '../AuthorsAndCollaborations';

describe('AuthorsAndCollaborations', () => {
  it('renders only author list if collaborations are missing (default author props)', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorsAndCollaborations authors={authors} recordId={12345} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only author list if collaborations are missing (extra author props)', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorsAndCollaborations
        authors={authors}
        authorCount={1}
        enableAuthorsShowAll
        recordId={12345}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only one collaboration and author for the collaboration', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorsAndCollaborations
        enableAuthorsShowAll
        authors={authors}
        authorCount={1}
        collaborations={collaborations}
        recordId={12345}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders multiple collaborations and author for the collaborations', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
    ]);
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
      {
        value: 'Test Collab 2',
      },
    ]);
    const wrapper = shallow(
      <AuthorsAndCollaborations
        enableAuthorsShowAll
        authors={authors}
        authorCount={1}
        collaborations={collaborations}
        recordId={12345}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders collaboration list with single item and author list with limit 1 if there are multiple authors', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const collaborationsWithSuffix = fromJS([
      {
        value: 'Test 1 Group',
      },
    ]);
    const wrapper = shallow(
      <AuthorsAndCollaborations
        enableAuthorsShowAll
        authors={authors}
        authorCount={12}
        collaborationsWithSuffix={collaborationsWithSuffix}
        recordId={12345}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders collaboration list and author list if collaborations and authors have multiple items', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
    ]);
    const collaborationsWithSuffix = fromJS([
      {
        value: 'Test 1 Group',
      },
      {
        value: 'Test 2 Group',
      },
    ]);
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorsAndCollaborations
        enableAuthorsShowAll
        authors={authors}
        authorCount={12}
        collaborations={collaborations}
        collaborationsWithSuffix={collaborationsWithSuffix}
        recordId={12345}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render bullet if authors missing', () => {
    const collaborationsWithSuffix = fromJS([
      {
        value: 'Test 1 Group',
      },
      {
        value: 'Test 2 Group',
      },
    ]);
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorsAndCollaborations
        collaborations={collaborations}
        collaborationsWithSuffix={collaborationsWithSuffix}
        recordId={12345}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render bullet if authors missing with single collaboration', () => {
    const collaborations = fromJS([
      {
        value: 'Test Collab 1',
      },
    ]);
    const wrapper = shallow(
      <AuthorsAndCollaborations
        collaborations={collaborations}
        recordId={12345}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
