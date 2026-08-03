import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Map } from 'immutable';
import LiteratureReferenceCount from '../LiteratureReferenceCount';

describe('<LiteratureReferenceCount />', () => {
  test('renders null when referenceCount is falsy', () => {
    const { container } = render(
      <LiteratureReferenceCount referenceCount={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders core and matched counts correctly', () => {
    const referenceCount = Map<'core' | 'non_core' | 'total', number>({
      core: 5,
      non_core: 3,
      total: 12,
    });

    render(<LiteratureReferenceCount referenceCount={referenceCount} />);

    expect(screen.getByText(/References:/i)).toBeInTheDocument();
    expect(screen.getByText(/core,/i)).toBeInTheDocument();
    expect(screen.getByText(/matched/i)).toBeInTheDocument();

    expect(screen.getByText('5/12')).toBeInTheDocument();
    expect(screen.getByText('8/12')).toBeInTheDocument();
  });

  test('prefers the totalReferences prop over referenceCount.total', () => {
    const referenceCount = Map<'core' | 'non_core' | 'total', number>({
      core: 5,
      non_core: 3,
      total: 12,
    });

    render(
      <LiteratureReferenceCount
        referenceCount={referenceCount}
        totalReferences={20}
      />
    );

    expect(screen.getByText('5/20')).toBeInTheDocument();
    expect(screen.getByText('8/20')).toBeInTheDocument();
  });
});
