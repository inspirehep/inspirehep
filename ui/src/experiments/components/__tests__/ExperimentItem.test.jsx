import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import ExperimentItem from '../ExperimentItem';
import { getStore } from '../../../fixtures/store';

describe('ExperimentItem', () => {
  it('renders with all props set', () => {
    const metadata = fromJS({
      legacy_name: 'Experiment new',
      control_number: 1234,
      number_of_papers: 99,
      institutions: [
        {
          value: 'CERN',
          record: {
            $ref: 'https://inspirehep.net/api/institutions/902725',
          },
          curated_relation: true,
        },
        {
          value: 'University',
        },
      ],
      long_name: 'This is a long name describing the experiment',
      collaboration: { value: 'ATLAS' },
      urls: [{ value: 'http://url.com' }],
    });

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ExperimentItem metadata={metadata} />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      legacy_name: 'Experiment new',
      control_number: 1234,
    });

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ExperimentItem metadata={metadata} />{' '}
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
