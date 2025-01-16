import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import DetailPageContainer from '../DetailPageContainer';
import { getStore } from '../../../../fixtures/store';

describe('DetailPageContainer', () => {
  it('renders initial state', () => {
    const store = getStore({
      data: fromJS({data: { metadata: {
        titles: [
          {
            source: 'pariatur adipisicing amet',
            subtitle: 'voluptate eiusmod fugiat',
            title: 'Test title',
          },
        ],
        authors: [
          {
            affiliations: [
              {
                curated_relation: true,
                record: {
                  $ref: 'http://M1/api/institutions/12346',
                },
                value: 'ut',
              },
            ],
          },
        ],
        urls: [{ value: 'http://url.com' }],
        dois: [
          {
            source: 'in ad et',
            value: '10.8756/tTM',
            material: 'data',
          },
          {
            source: 'mollit deserunt eu',
            value: '10.5/.Aww=bT@',
            material: 'version',
          },
          {
            source: 'adipisicing et',
            value: '10.0.9747720/#}O=W:$',
            material: 'part',
          },
        ],
        control_number: 1234,
        citation_count: 666,
    }}}),
      user: fromJS({
        loggedIn: true,
      }),
    });

    const { asFragment } = render(
      <Router>
        <Provider store={store}>
          <DetailPageContainer />
        </Provider>
      </Router>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
