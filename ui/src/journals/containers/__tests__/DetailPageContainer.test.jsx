import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { fromJS, List, Map } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import DetailPageContainer, { DetailPage } from '../DetailPageContainer';

describe('DetailPageContainer', () => {
  it('pass props from state', () => {
    const store = getStoreWithState({
      journals: fromJS({
        data: {
          metadata: {
            short_title: 'test',
            journal_title: { title: 'test' },
            urls: [{ value: 'https://www.springer.com/journal/526' }],
            public_notes: [{ value: 'Started with 1997, v.9701' }],
            title_variants: [
              'JOURNAL OF HIGH ENERGY PHYSICS',
              'JOURNL OF HIGH ENERGY PHYSICS',
            ],
            publisher: ['Springer'],
            control_number: 1234
          },
        },
      }),
    });

    const wrapper = mount(
      <Router>
        <Provider store={store}>
          <DetailPageContainer />
        </Provider>
      </Router>
    );
    expect(wrapper.find(DetailPage).prop('result')).toMatchObject(Map({
        metadata: Map({
          short_title: 'test',
          journal_title: Map({ title: 'test' }),
          urls: List([Map({ value: 'https://www.springer.com/journal/526' })]),
          public_notes: List([Map({ value: 'Started with 1997, v.9701' })]),
          title_variants: List([
            'JOURNAL OF HIGH ENERGY PHYSICS',
            'JOURNL OF HIGH ENERGY PHYSICS',
          ]),
          publisher: List(['Springer']),
          control_number: 1234
        }),
      }),
    );
  });
});
