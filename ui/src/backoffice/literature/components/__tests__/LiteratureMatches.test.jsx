import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { List, Map } from 'immutable';
import { renderWithRouter } from '../../../../fixtures/render';
import LiteratureMatches from '../LiteratureMatches';
import { WorkflowDecisions } from '../../../../common/constants';

const MATCHES = List([
  Map({
    abstract:
      'This paper proposes a class of causal formulations for dissipative relativistic fluid dynamics as a hyperbolic five-field system of second-order partial differential equations.',
    authors: List([
      Map({
        full_name: 'Freistöhler, Heinrich',
      }),
      Map({
        full_name: 'Ioannis, Heinrich',
      }),
    ]),
    authors_count: 1,
    control_number: 1790396,
    earliest_date: '2020-03-17',
    publication_info: List([
      Map({
        artid: '033101',
        journal_issue: '3',
        journal_record: Map({
          $ref: 'https://inspirebeta.net/api/journals/1214658',
        }),
        journal_title: 'J.Math.Phys.',
        journal_volume: '61',
        year: 2020,
      }),
    ]),
    title:
      'A class of Hadamard well-posed five-field theories of dissipative relativistic fluid dynamics',
  }),

  Map({
    abstract:
      'A search for narrow resonances decaying to the dijet final state at the CMS experiment.',
    authors: List([
      Map({
        full_name: 'Sheffield, David Gruft',
      }),
    ]),
    authors_count: 1,
    control_number: 1752989,
    earliest_date: '2017',
    number_of_pages: 151,
    public_notes: List([
      Map({
        value: 'Fermilab Library Only',
      }),
      Map({
        value: 'Submitted to SIAM J.Matrix Anal.Appl.',
      }),
    ]),
    title:
      'Search for low-mass and high-mass narrow dijet resonances with the CMS detector at $\\sqrt{s}$ = 13 TeV',
  }),

  Map({
    abstract:
      'The discovery of the Higgs boson in 2012 marked a great success of the Standard Model (SM) of particle physics.',
    authors: List([
      Map({
        full_name: 'Zhou, Hao',
      }),
    ]),
    authors_count: 1,
    control_number: 1989726,
    earliest_date: '2021',
    number_of_pages: 163,
    publication_info: List([
      Map({
        year: 2021,
      }),
    ]),
    title:
      'Search for Long-Lived Particles Produced in Proton-Proton Collisions at $\\sqrt{s}$ =13 TeV That Decay to Displaced Hadronic Jets Detected With the Muon Spectrometer in ATLAS',
  }),
]);

describe('LiteratureMatches', () => {
  const setup = () => {
    const handleResolveAction = jest.fn();

    const props = {
      fuzzyMatches: MATCHES,
      handleResolveAction,
    };

    renderWithRouter(<LiteratureMatches {...props} />);

    return { handleResolveAction };
  };

  it('renders all matches and selects the first one by default', () => {
    setup();

    expect(
      screen.getByText(/A class of Hadamard well-posed five-field theories/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Search for low-mass and high-mass narrow dijet/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Search for Long-Lived Particles Produced in Proton-Proton Collisions/i
      )
    ).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
    expect(radios[2]).not.toBeChecked();
  });

  it('changes selection when another radio is clicked and passes that value to onBestMatchSelected', () => {
    const { handleResolveAction } = setup();

    const radios = screen.getAllByRole('radio');
    const secondControlNumber = MATCHES.getIn([1, 'control_number']);

    fireEvent.click(radios[1]);
    expect(radios[1]).toBeChecked();

    const bestMatchButton = screen.getByRole('button', { name: /Best Match/i });
    fireEvent.click(bestMatchButton);

    expect(handleResolveAction).toHaveBeenCalledTimes(1);
    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.FUZZY_MATCH,
      secondControlNumber
    );
    expect(screen.getByText('Decision submitted.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Best Match/i })
    ).not.toBeInTheDocument();
  });

  it('calls onNoMatchSelected when "None of these" is clicked', () => {
    const { handleResolveAction } = setup();

    const noneButton = screen.getByRole('button', { name: /None of these/i });
    fireEvent.click(noneButton);

    expect(handleResolveAction).toHaveBeenCalledTimes(1);
    expect(handleResolveAction).toHaveBeenCalledWith(
      WorkflowDecisions.FUZZY_MATCH
    );
    expect(screen.getByText('Decision submitted.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /None of these/i })
    ).not.toBeInTheDocument();
  });

  it('renders authors correctly and shows "(N authors)" when more than one', () => {
    setup();

    expect(
      screen.getByText(/Freistöhler, Heinrich; Ioannis, Heinrich \(2 authors\)/)
    ).toBeInTheDocument();

    expect(screen.getByText(/Sheffield, David Gruft/)).toBeInTheDocument();
    expect(
      screen.queryByText(/Sheffield, David Gruft.*authors\)/i)
    ).not.toBeInTheDocument();
  });

  it('renders "Published In" only when publication info has journal_title/pubinfo_freetext', () => {
    setup();

    const publishedInLabels = screen.getAllByText(/Published In/i);
    expect(publishedInLabels).toHaveLength(1);
    expect(screen.getByText(/J.Math.Phys./i)).toBeInTheDocument();
  });

  it('renders public notes when present', () => {
    setup();

    expect(screen.getByText(/Public notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Fermilab Library Only/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Submitted to SIAM J.Matrix Anal.Appl/i)
    ).toBeInTheDocument();
  });

  it('toggles abstract visibility with the Show/Hide abstract button', () => {
    setup();

    const showButtons = screen.getAllByRole('button', {
      name: /Show abstract/i,
    });

    const firstShowBtn = showButtons[0];

    // hidden
    expect(
      screen.queryByText(/This paper proposes a class of causal formulations/i)
    ).not.toBeInTheDocument();

    // Show
    fireEvent.click(firstShowBtn);
    expect(
      screen.getByText(/This paper proposes a class of causal formulations/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Hide abstract/i })
    ).toBeInTheDocument();

    // Hide
    const hideBtn = screen.getByRole('button', { name: /Hide abstract/i });
    fireEvent.click(hideBtn);
    expect(
      screen.queryByText(/This paper proposes a class of causal formulations/i)
    ).not.toBeInTheDocument();
  });

  it('links each title to the correct literature detail route with control_number', () => {
    setup();

    const firstTitle = screen.getByText(
      /A class of Hadamard well-posed five-field theories/i
    );
    const firstControlNumber = MATCHES.getIn([0, 'control_number']);

    const link = firstTitle.closest('a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/literature/${firstControlNumber}`)
    );
  });
});
