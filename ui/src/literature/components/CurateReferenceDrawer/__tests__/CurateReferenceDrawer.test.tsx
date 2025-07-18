import React from 'react';
import { screen } from '@testing-library/react';
import { Map, fromJS } from 'immutable';
import CurateReferenceDrawer, {
  renderReferenceItem,
} from '../CurateReferenceDrawer';
import { renderWithProviders } from '../../../../fixtures/render';

describe('CurateReferenceDrawer', () => {
  const defaultProps = {
    recordId: 1,
    recordUuid: '1',
    revisionId: 2,
    referenceId: 3,
    onDrawerClose: jest.fn(),
    onCurate: jest.fn(),
    loading: false,
    visible: true,
  };

  it('should render correctly', () => {
    renderWithProviders(<CurateReferenceDrawer {...defaultProps} />);
    expect(screen.getByText('Find the correct reference:')).toBeInTheDocument();
  });

  it('should render reference item correctly', () => {
    const result = Map({
      metadata: fromJS({
        titles: [{ title: 'Title' }],
        authors: [{ full_name: 'Urhan, Harun', affiliation: 'CERN' }],
        collaborations: [{ value: 'Collaboration 1' }],
        collaborations_with_suffix: [{ value: 'Collaboration 1, Suffix 1' }],
        number_of_authors: 2,
        date: '2022-05-12',
      }),
    });

    renderWithProviders(renderReferenceItem(result));
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Urhan, Harun')).toBeInTheDocument();
    expect(screen.getByText('2022-05-12')).toBeInTheDocument();
    expect(screen.getByText('Collaboration 1')).toBeInTheDocument();
    expect(screen.getByText('Collaboration 1, Suffix 1')).toBeInTheDocument();
  });
});
