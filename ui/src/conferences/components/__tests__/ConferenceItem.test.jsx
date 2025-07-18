import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fromJS } from 'immutable';

import { renderWithRouter } from '../../../fixtures/render';
import ConferenceItem from '../ConferenceItem';

jest.mock('../ConferenceDates', () => ({ openingDate, closingDate }) => (
  <span data-testid="conference-dates">
    {openingDate} - {closingDate}
  </span>
));

jest.mock('../../../common/components/AddressList', () => ({ addresses }) => (
  <span data-testid="address-list">
    {addresses?.getIn([0, 'cities', 0]) || 'No address'}
  </span>
));

jest.mock('../InspireCategoryList', () => ({ categories }) => (
  <span data-testid="inspire-categories">
    {categories?.getIn([0, 'term']) || 'No categories'}
  </span>
));

jest.mock('../ProceedingsAction', () => () => (
  <span data-testid="proceedings-action">Proceedings</span>
));

jest.mock('../../../literature/components/UrlsAction', () => () => (
  <span data-testid="urls-action">URLs</span>
));

jest.mock('../ConferenceContributionLink', () => ({ contributionsCount }) => (
  <span data-testid="contribution-link">
    {contributionsCount} contributions
  </span>
));

jest.mock('../../../common/components/EditRecordAction', () => () => (
  <span data-testid="edit-action">Edit</span>
));

jest.mock(
  '../../../common/components/EventTitle',
  () =>
    ({ title, acronym }) => (
      <span data-testid="event-title">
        {title?.get('title')} {acronym && `(${acronym})`}
      </span>
    )
);

jest.mock(
  '../../../common/components/ResultItem',
  () =>
    ({ children, leftActions, rightActions }) => (
      <div data-testid="result-item">
        <div data-testid="left-actions">{leftActions}</div>
        <div data-testid="content">{children}</div>
        <div data-testid="right-actions">{rightActions}</div>
      </div>
    )
);

describe('ConferenceItem', () => {
  it('renders with all props set', () => {
    const metadata = fromJS({
      titles: [{ title: 'test' }],
      acronyms: ['acronym'],
      opening_date: '2019-11-21',
      closing_date: '2019-11-28',
      control_number: 12345,
      addresses: [
        {
          cities: ['Liverpool'],
          country_code: 'USA',
          country: 'country',
        },
      ],
      cnum: 'C05-09-16.1',
      can_edit: true,
      inspire_categories: [{ term: 'physics' }],
      urls: [{ value: 'http://url.com' }],
      proceedings: [
        {
          publication_info: [
            {
              year: 2015,
              journal_title: 'title',
            },
          ],
        },
      ],
      number_of_contributions: 3,
    });

    renderWithRouter(<ConferenceItem metadata={metadata} openDetailInNewTab />);

    expect(screen.getByTestId('result-item')).toBeInTheDocument();
    expect(screen.getByTestId('event-title')).toHaveTextContent(
      'test (acronym)'
    );
    expect(screen.getByTestId('conference-dates')).toHaveTextContent(
      '2019-11-21 - 2019-11-28'
    );
    expect(screen.getByTestId('address-list')).toHaveTextContent('Liverpool');
    expect(screen.getByTestId('inspire-categories')).toHaveTextContent(
      'physics'
    );

    expect(screen.getByTestId('urls-action')).toBeInTheDocument();
    expect(screen.getByTestId('proceedings-action')).toBeInTheDocument();
    expect(screen.getByTestId('edit-action')).toBeInTheDocument();

    expect(screen.getByTestId('contribution-link')).toHaveTextContent(
      '3 contributions'
    );

    const titleLink = screen.getByRole('link');
    expect(titleLink).toHaveAttribute('href', '/conferences/12345');
    expect(titleLink).toHaveAttribute('target', '_blank');
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      titles: [{ title: 'test' }],
      control_number: 12345,
      opening_date: '2019-11-21',
    });

    renderWithRouter(<ConferenceItem metadata={metadata} />);

    expect(screen.getByTestId('result-item')).toBeInTheDocument();
    expect(screen.getByTestId('event-title')).toHaveTextContent('test');
    expect(screen.getByTestId('conference-dates')).toBeInTheDocument();

    expect(screen.queryByTestId('urls-action')).not.toBeInTheDocument();
    expect(screen.queryByTestId('proceedings-action')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-action')).not.toBeInTheDocument();
    expect(screen.queryByTestId('contribution-link')).not.toBeInTheDocument();

    const titleLink = screen.getByRole('link');
    expect(titleLink).toHaveAttribute('href', '/conferences/12345');
    expect(titleLink).not.toHaveAttribute('target');
  });

  it('does not render contribution link when number_of_contributions is 0', () => {
    const metadata = fromJS({
      titles: [{ title: 'test' }],
      control_number: 12345,
      opening_date: '2019-11-21',
      number_of_contributions: 0,
    });

    renderWithRouter(<ConferenceItem metadata={metadata} />);

    expect(screen.queryByTestId('contribution-link')).not.toBeInTheDocument();
  });
});
