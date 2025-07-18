import React from 'react';

import NumberOfResultsWithSelectedItemsNumber from '../NumberOfResultsWithSelectedItemsNumber';
import { renderWithProviders } from '../../../fixtures/render';

describe('NumberOfResultsWithSelectedItemsNumber', () => {
  it('renders correctly with default props', () => {
    const { asFragment } = renderWithProviders(
      <NumberOfResultsWithSelectedItemsNumber namespace="testNamespace" />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with numberOfSelected', () => {
    const { asFragment } = renderWithProviders(
      <NumberOfResultsWithSelectedItemsNumber
        namespace="testNamespace"
        numberOfSelected={5}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with numberOfSelected as 0', () => {
    const { asFragment } = renderWithProviders(
      <NumberOfResultsWithSelectedItemsNumber
        namespace="testNamespace"
        numberOfSelected={0}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
