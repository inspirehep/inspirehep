import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import CiteModalAction from '../CiteModalAction';
import citeArticle from '../../citeArticle';

jest.mock('../../citeArticle');

describe('CiteModalAction', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders with all props', async () => {
    render(
      <CiteModalAction
        recordId="1598135"
        initialCiteFormat="bibtex"
        page="test"
        onCiteFormatChange={jest.fn()}
      />
    );
    await waitFor(() => fireEvent.click(screen.getByText('cite')));

    render(
      <CiteModalAction
        recordId="123"
        initialCiteFormat="bibtex"
        page="test"
        onCiteFormatChange={jest.fn()}
      />
    );

    await waitFor(() =>
      expect(screen.getByText('Download')).toBeInTheDocument()
    );
  });

  it('opens the modal on cite button click', () => {
    render(
      <CiteModalAction
        recordId="123"
        initialCiteFormat="bibtex"
        page="test"
        onCiteFormatChange={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('cite'));
    expect(screen.getByText('Cite Article')).toBeVisible();
  });

  it('shows the cite text in the modal', async () => {
    const mockCiteArticle = jest.fn().mockResolvedValue('bibtex citation');
    (citeArticle as jest.Mock).mockImplementation(mockCiteArticle);

    render(
      <CiteModalAction
        recordId="123"
        initialCiteFormat="bibtex"
        page="test"
        onCiteFormatChange={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('cite'));
    await waitFor(() =>
      expect(mockCiteArticle).toHaveBeenCalledWith('bibtex', '123')
    );
    expect(screen.getByText('bibtex citation')).toBeVisible();
  });

  it('shows the error message if citeArticle throws an error', async () => {
    const mockCiteArticle = jest
      .fn()
      .mockRejectedValue(new Error('failed to cite'));
    (citeArticle as jest.Mock).mockImplementation(mockCiteArticle);

    render(
      <CiteModalAction
        recordId="123"
        initialCiteFormat="bibtex"
        page="test"
        onCiteFormatChange={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('cite'));
    await waitFor(() =>
      expect(screen.getByText(/Could not create cite text/)).toBeVisible()
    );
    expect(mockCiteArticle).toHaveBeenCalledWith('bibtex', '123');
  });

  it('shows the error message if citeArticle throws an error', async () => {
    const mockCiteArticle = jest
      .fn()
      .mockRejectedValue(new Error('failed to cite'));
    (citeArticle as jest.Mock).mockImplementation(mockCiteArticle);

    render(
      <CiteModalAction
        recordId="123"
        initialCiteFormat="bibtex"
        page="test"
        onCiteFormatChange={jest.fn()}
      />
    );
    fireEvent.click(screen.getByText('cite'));
    await waitFor(() =>
      expect(screen.getByText(/Could not create cite text/)).toBeVisible()
    );
    expect(mockCiteArticle).toHaveBeenCalledWith('bibtex', '123');
  });

  it('changes the cite format on format selection', async () => {
    const onCiteFormatChangeMock = jest.fn();
    (citeArticle as jest.Mock).mockImplementation(onCiteFormatChangeMock);

    render(
      <CiteModalAction
        recordId="1234"
        initialCiteFormat="bibtex"
        onCiteFormatChange={onCiteFormatChangeMock}
        page="page"
      />
    );
    await waitFor(() => fireEvent.click(screen.getByText('cite')));

    const selectBox = screen.getByTestId('cite-format');
    const selectBoxInput = within(selectBox).getByRole('combobox');
    await waitFor(() =>
      fireEvent.change(selectBoxInput, { target: { value: 'bib' } })
    );

    await waitFor(() =>
      expect(onCiteFormatChangeMock).toHaveBeenCalledWith('bibtex', '1234')
    );
  });
});
