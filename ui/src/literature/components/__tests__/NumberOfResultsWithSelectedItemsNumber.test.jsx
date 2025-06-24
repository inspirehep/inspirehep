import React from 'react';
import { render } from '@testing-library/react';

import { Provider } from 'react-redux';
import NumberOfResultsWithSelectedItemsNumber from '../NumberOfResultsWithSelectedItemsNumber';
import { getStore } from '../../../fixtures/store';

describe('NumberOfResultsWithSelectedItemsNumber', () => {
  it('renders correctly with default props', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <NumberOfResultsWithSelectedItemsNumber namespace="testNamespace" />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with numberOfSelected', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <NumberOfResultsWithSelectedItemsNumber
          namespace="testNamespace"
          numberOfSelected={5}
        />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with numberOfSelected as 0', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <NumberOfResultsWithSelectedItemsNumber
          namespace="testNamespace"
          numberOfSelected={0}
        />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
