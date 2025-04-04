import React from 'react';
import { fromJS } from 'immutable';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DataImporter from '../DataImporter';

describe('DataImporter', () => {
  it('renders without error while importing', () => {
    const { asFragment } = render(
      <DataImporter
        error={null}
        isImporting
        onImportClick={jest.fn()}
        onSkipClick={jest.fn()}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with error with a message', () => {
    const { asFragment } = render(
      <DataImporter
        error={fromJS({ message: 'error' })}
        isImporting={false}
        onImportClick={jest.fn()}
        onSkipClick={jest.fn()}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with error with message and recid', () => {
    const { asFragment } = render(
      <DataImporter
        error={fromJS({ message: 'error', recid: '12345' })}
        isImporting={false}
        onImportClick={jest.fn()}
        onSkipClick={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with error without a message', () => {
    const { asFragment } = render(
      <DataImporter
        error={fromJS({ data: 'error' })}
        isImporting={false}
        onImportClick={jest.fn()}
        onSkipClick={jest.fn()}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onImportClick with import value when import button is clicked', async () => {
    const importValue = 'arXiv:1001.1234';
    const onImportClick = jest.fn();

    render(
      <DataImporter
        error={null}
        isImporting={false}
        onImportClick={onImportClick}
        onSkipClick={jest.fn()}
      />
    );

    const importInput = screen.getByTestId('import-input');
    const importButton = screen.getByTestId('import-button');

    await userEvent.type(importInput, importValue);
    await userEvent.click(importButton);

    expect(onImportClick).toHaveBeenCalledWith(importValue);
  });

  it('calls onSkipClick prop when skip button is clicked', async () => {
    const onSkipClick = jest.fn();

    render(
      <DataImporter
        error={null}
        isImporting={false}
        onImportClick={jest.fn()}
        onSkipClick={onSkipClick}
      />
    );

    const skipButton = screen.getByTestId('skip-import-button');
    await userEvent.click(skipButton);

    expect(onSkipClick).toHaveBeenCalledTimes(1);
  });
});
