import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import CitationSummarySwitch from '../CitationSummarySwitch';

describe('CitationSummarySwitch', () => {
  it('renders checked state with correct tooltip', () => {
    render(
      <CitationSummarySwitch
        checked
        onChange={jest.fn()}
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference
      />
    );

    expect(screen.getByText('Citation Summary')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('renders unchecked state with correct tooltip', () => {
    render(
      <CitationSummarySwitch
        checked={false}
        onChange={jest.fn()}
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference={false}
      />
    );

    expect(screen.getByText('Citation Summary')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('calls onCitationSummaryUserPreferenceChange on mount', () => {
    const onCitationSummaryUserPreferenceChange = jest.fn();
    render(
      <CitationSummarySwitch
        checked={false}
        onChange={jest.fn()}
        onCitationSummaryUserPreferenceChange={
          onCitationSummaryUserPreferenceChange
        }
        citationSummaryEnablingPreference
      />
    );

    expect(onCitationSummaryUserPreferenceChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange when switch is clicked', () => {
    const onChange = jest.fn();

    render(
      <CitationSummarySwitch
        checked
        onChange={onChange}
        onCitationSummaryUserPreferenceChange={jest.fn()}
        citationSummaryEnablingPreference
      />
    );

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
