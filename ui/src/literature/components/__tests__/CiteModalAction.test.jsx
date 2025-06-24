import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import CiteModalAction from '../CiteModalAction';
import citeArticle from '../../citeArticle';
import { CITE_FORMAT_VALUES } from '../../constants';

jest.mock('../../citeArticle');

describe('CiteModalAction', () => {
  beforeAll(() => {
    citeArticle.mockImplementation((format, recordId) =>
      Promise.resolve(`Cite ${recordId} in ${format}`)
    );
  });

  it('renders with all props', () => {
    const { asFragment } = render(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onCiteFormatChange on format change', async () => {
    const onCiteFormatChangeProp = jest.fn();
    render(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat={CITE_FORMAT_VALUES[0]}
        onCiteFormatChange={onCiteFormatChangeProp}
      />
    );

    const citeButton = screen.getByRole('button', { name: /cite/i });
    fireEvent.click(citeButton);

    await waitFor(() => {
      expect(screen.getByText('Cite Article')).toBeInTheDocument();
    });

    const formatSelector = screen.getByRole('combobox');
    fireEvent.mouseDown(formatSelector);

    const optionToSelect = await screen.findByText('LaTeX (EU)');
    fireEvent.click(optionToSelect);

    await waitFor(() => {
      expect(onCiteFormatChangeProp).toHaveBeenCalled();
    });
  });

  it('opens modal on cite click and shows content', async () => {
    const initialCiteFormat = 'application/x-bibtex';
    render(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat={initialCiteFormat}
        onCiteFormatChange={jest.fn()}
      />
    );

    const citeButton = screen.getByRole('button', { name: /cite/i });
    fireEvent.click(citeButton);

    await waitFor(() => {
      expect(screen.getByText('Cite Article')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText('Cite 12345 in application/x-bibtex')
      ).toBeInTheDocument();
    });
  });

  it('shows an alert with the error message when there is an error in setCiteContentFor', async () => {
    citeArticle.mockRejectedValueOnce(new Error('Network error'));

    render(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );

    const citeButton = screen.getByRole('button', { name: /cite/i });
    fireEvent.click(citeButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Could not create cite text/i)
      ).toBeInTheDocument();
    });
  });

  it('sets citeContent for selected format setCiteContentFor', async () => {
    render(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );

    const citeButton = screen.getByRole('button', { name: /cite/i });
    fireEvent.click(citeButton);

    await waitFor(() => {
      expect(
        screen.getByText('Cite 12345 in application/x-bibtex')
      ).toBeInTheDocument();
    });

    const formatSelector = screen.getByRole('combobox');
    fireEvent.mouseDown(formatSelector);

    citeArticle.mockResolvedValueOnce(
      'Cite 12345 in application/vnd+inspire.latex.us+x-latex'
    );

    const latexOption = await screen.findByText('LaTeX (EU)');
    fireEvent.click(latexOption);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Cite 12345 in application/vnd+inspire.latex.us+x-latex'
        )
      ).toBeInTheDocument();
    });
  });

  it('closes modal on close button click', async () => {
    render(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );

    const citeButton = screen.getByRole('button', { name: /cite/i });
    fireEvent.click(citeButton);

    await waitFor(() => {
      expect(screen.getByText('Cite Article')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // querySelector necessary here as other methods don't catch this
    await waitFor(() => {
      expect(document.querySelector('.ant-modal-wrap')).toHaveAttribute(
        'style',
        'display: none;'
      );
    });
  });

  it('renders with loading state', async () => {
    citeArticle.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve('Cite 12345 in application/x-bibtex'), 100)
        )
    );

    render(
      <CiteModalAction
        recordId={12345}
        initialCiteFormat="application/x-bibtex"
        onCiteFormatChange={jest.fn()}
      />
    );

    const citeButton = screen.getByRole('button', { name: /cite/i });
    fireEvent.click(citeButton);

    await waitFor(
      () => {
        expect(
          screen.getByTestId('loading-spinner') || screen.getByText(/loading/i)
        ).toBeInTheDocument();
      },
      { timeout: 50 }
    );
  });
});
