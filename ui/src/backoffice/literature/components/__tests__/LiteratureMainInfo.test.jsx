import React from 'react';
import { screen } from '@testing-library/react';
import { Map, List } from 'immutable';
import LiteratureMainInfo from '../LiteratureMainInfo';
import { renderWithRouter } from '../../../../fixtures/render';

describe('LiteratureMainInfo', () => {
  const mockData = Map({
    titles: List([Map({ title: 'A Study on Widget Dynamics' })]),
    abstracts: List([
      Map({ value: 'This paper explores widget dynamics in depth.' }),
    ]),
    authors: List([
      Map({
        affiliations: List([
          Map({
            record: Map({
              $ref: 'https://inspirehep.net/api/institutions/903603',
            }),
            value: 'Peking U.',
          }),
        ]),
        curated_relation: true,
        full_name: 'Song, Hanlin',
        raw_affiliations: List([
          Map({
            source: 'Elsevier B.V.',
            value:
              'School of Physics, Peking University, Beijing, 100871, China',
          }),
        ]),
        record: Map({
          $ref: 'https://inspirehep.net/api/authors/2742792',
        }),
        uuid: '1661c971-41e0-4361-8770-5ab2baae543e',
      }),
    ]),
    report_numbers: List([
      Map({
        source: 'arXiv',
        value: 'ADP-25-11/T1273',
      }),
    ]),
    publication_info: List([
      Map({
        year: 2025,
        artid: '139959',
        material: 'publication',
        journal_title: 'Phys.Lett.B',
        journal_record: Map({
          $ref: 'https://inspirehep.net/api/journals/1613966',
        }),
        journal_volume: '870',
        pubinfo_freetext: 'Phys. Lett. B 870 (2025) 139959',
      }),
    ]),
    license: List([
      Map({
        url: 'https://license.example/cc-by-4.0',
        imposing: 'ACME Publishing',
      }),
    ]),
    arxiv_eprints: List([
      Map({
        value: '2510.21705',
        categories: List(['quant-ph', 'physics.atom-ph']),
      }),
    ]),
    dois: List([
      Map({ value: '10.1234/example.doi.1' }),
      Map({ value: '10.5678/example.doi.2' }),
    ]),
    collaborations: List([
      Map({
        value: 'BLFQ',
      }),
    ]),
    languages: List(['English']),
    title_translations: List([Map({ title: 'translated title' })]),
    accelerator_experiments: List([Map({ legacy_name: 'CERN-LHC' })]),
  });

  it('renders the main information correctly', () => {
    renderWithRouter(<LiteratureMainInfo data={mockData} />);

    expect(screen.getByText('A Study on Widget Dynamics')).toBeInTheDocument();
    expect(screen.getByText('Phys.Lett.B')).toBeInTheDocument();
    expect(screen.getByText('Song, Hanlin')).toBeInTheDocument();
    expect(screen.getByText('Peking U.')).toBeInTheDocument();
    expect(screen.getByText(/widget dynamics in depth\./i)).toBeInTheDocument();

    const licenseDiv = screen.getByText(/License:/i).closest('div');
    expect(licenseDiv).toBeInTheDocument();
    expect(licenseDiv).toHaveTextContent('https://license.example/cc-by-4.0');

    const arxivLink = screen.getByRole('link', { name: '2510.21705' });
    expect(arxivLink).toBeInTheDocument();
    expect(arxivLink).toHaveAttribute('href', '//arxiv.org/abs/2510.21705');

    const doiLink1 = screen.getByRole('link', {
      name: '10.1234/example.doi.1',
    });
    const doiLink2 = screen.getByRole('link', {
      name: '10.5678/example.doi.2',
    });

    expect(doiLink1).toBeInTheDocument();
    expect(doiLink1).toHaveAttribute('href', '//doi.org/10.1234/example.doi.1');

    expect(doiLink2).toBeInTheDocument();
    expect(doiLink2).toHaveAttribute('href', '//doi.org/10.5678/example.doi.2');

    expect(screen.getByText('ADP-25-11/T1273')).toBeInTheDocument();
    expect(screen.getByText('BLFQ')).toBeInTheDocument();
    expect(screen.getByText('Language: English')).toBeInTheDocument();
    expect(
      screen.getByText('Title translation: translated title')
    ).toBeInTheDocument();
    expect(screen.getByText('Experiment: CERN-LHC')).toBeInTheDocument();
  });

  it('renders the update tag when isLiteratureUpdate is true', () => {
    renderWithRouter(<LiteratureMainInfo data={mockData} isLiteratureUpdate />);

    expect(screen.getByText('Update')).toBeInTheDocument();
  });
});
