import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Map } from 'immutable';
import LiteratureReferenceCount from '../LiteratureReferenceCount';

describe('<LiteratureReferenceCount />', () => {
  test('renders null when referenceCount is falsy', () => {
    const { container } = render(
      <LiteratureReferenceCount referenceCount={null} totalReferences={10} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders core and matched counts correctly', () => {
    const referenceCount = Map({ core: 5, non_core: 3 });
    const totalReferences = 12;

    render(
      <LiteratureReferenceCount
        referenceCount={referenceCount}
        totalReferences={totalReferences}
      />
    );

    expect(screen.getByText(/References:/i)).toBeInTheDocument();
    expect(screen.getByText(/core,/i)).toBeInTheDocument();
    expect(screen.getByText(/matched/i)).toBeInTheDocument();

    expect(screen.getByText('5/12')).toBeInTheDocument();
    expect(screen.getByText('8/12')).toBeInTheDocument();
  });
});
