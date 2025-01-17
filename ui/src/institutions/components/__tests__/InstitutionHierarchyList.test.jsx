import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import InstitutionHierarchyList from '../InstitutionHierarchyList';

describe('InstitutionHierarchyList', () => {
  it('renders', () => {
    const hierarchies = fromJS([
      {
        name: 'Name1',
        acronym: 'NA',
      },
      {
        name: 'Name2',
      },
    ]);
    const { asFragment } = render(
      <InstitutionHierarchyList hierarchies={hierarchies} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
