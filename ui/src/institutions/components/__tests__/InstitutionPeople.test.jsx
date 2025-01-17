import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InstitutionPeople from '../InstitutionPeople';

describe('InstitutionPeople', () => {
  it('renders', () => {
    const recordId = 123;
    const { asFragment } = render(
      <MemoryRouter>
        <InstitutionPeople recordId={recordId} />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
