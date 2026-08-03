import { fromJS } from 'immutable';

import { Routes, Route } from 'react-router-dom';
import { getStore } from '../../fixtures/store';
import { renderWithProviders } from '../../fixtures/render';
import Authors from '..';
import { AUTHORS } from '../../common/routes';

describe('Authors', () => {
  it('renders initial state', () => {
    const { asFragment } = renderWithProviders(<Authors />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('navigates to SearchPageContainer when /authors', () => {
    const { getByTestId } = renderWithProviders(
      <Routes>
        <Route path={`${AUTHORS}/*`} element={<Authors />} />
      </Routes>,
      {
        route: '/authors',
      }
    );
    expect(getByTestId('authors-search-page-container')).toBeInTheDocument();
  });

  it('navigates to DetailPageContainer when /authors/:id', () => {
    const store = getStore({
      authors: fromJS({
        data: {
          metadata: {
            control_number: 1234,
            titles: [
              {
                title: 'Detail view',
              },
            ],
            ids: [],
            name: {
              preferred_name: 'Author Name',
            },
          },
        },
        publicationSelection: [],
      }),
    });

    const { getByTestId } = renderWithProviders(
      <Routes>
        <Route path={`${AUTHORS}/*`} element={<Authors />} />
      </Routes>,
      {
        store,
        route: '/authors/1',
      }
    );

    expect(getByTestId('authors-detail-page-container')).toBeInTheDocument();
  });
});
