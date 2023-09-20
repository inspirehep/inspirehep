import React from 'react';
import { render, waitFor } from '@testing-library/react';

import Suggester from '../Suggester';

const extractUniqueItemValue = (resultItem: { text: string }) =>
  resultItem.text;
const extractItemCompletionValue = (resultItem: { text: string }) =>
  resultItem.text;

describe('Suggester', () => {
  const mockOnSelect = jest.fn();
  const mockOnChange = jest.fn();
  const defaultProps = {
    pidType: "examplePidType",
    suggesterName: "exampleSuggesterName",
    onSelect: mockOnSelect,
    onChange: mockOnChange,
    extractItemCompletionValue,
    extractUniqueItemValue,
    renderResultItem: (result: { text: string }) => result.text,
    searchasyoutype: false,
  };

  it('should render with default props', async () => {
    const { getByRole, asFragment } = render(<Suggester {...defaultProps} />);
    const autoComplete = getByRole('combobox');
    expect(autoComplete).toBeInTheDocument();

    await waitFor(() => expect(asFragment()).toMatchSnapshot());
  });
});

