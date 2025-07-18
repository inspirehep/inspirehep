import React from 'react';

import { renderWithRouter } from '../../../fixtures/render';
import InstitutionPeople from '../InstitutionPeople';

describe('InstitutionPeople', () => {
  it('renders', () => {
    const recordId = 123;
    const { asFragment } = renderWithRouter(
      <InstitutionPeople recordId={recordId} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
