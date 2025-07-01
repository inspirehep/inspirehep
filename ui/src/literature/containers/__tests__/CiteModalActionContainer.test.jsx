import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState, getStore } from '../../../fixtures/store';
import CiteModalActionContainer from '../CiteModalActionContainer';
import { setPreference } from '../../../actions/user';
import { CITE_FORMAT_PREFERENCE } from '../../../reducers/user';

jest.mock('../../../actions/user');

jest.mock('../../components/CiteModalAction', () => (props) => (
  <div
    data-testid="cite-modal-action"
    data-props={JSON.stringify({
      initialCiteFormat: props.initialCiteFormat,
      recordId: props.recordId,
    })}
  >
    <button
      type="button"
      data-testid="cite-format-change-button"
      onClick={() => props.onCiteFormatChange('application/x-bibtex')}
    >
      Change Cite Format
    </button>
  </div>
));

describe('CiteModalActionContainer', () => {
  beforeAll(() => {
    setPreference.mockReturnValue(async () => {});
  });

  afterEach(() => {
    setPreference.mockClear();
  });

  it('passes user preferred cite format as initialCiteFormat', () => {
    const store = getStoreWithState({
      user: fromJS({
        preferences: {
          [CITE_FORMAT_PREFERENCE]: 'application/x-bibtex',
        },
      }),
    });
    const { getByTestId } = render(
      <Provider store={store}>
        <CiteModalActionContainer recordId={12345} />
      </Provider>
    );

    const component = getByTestId('cite-modal-action');
    const props = JSON.parse(component.getAttribute('data-props'));

    expect(props).toEqual({
      initialCiteFormat: 'application/x-bibtex',
      recordId: 12345,
    });
  });

  it('calls setPreferredCiteFormat on CiteModalAction cite format change', () => {
    const store = getStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <CiteModalActionContainer recordId={12345} />
      </Provider>
    );

    const changeButton = getByTestId('cite-format-change-button');
    changeButton.click();

    const format = 'application/x-bibtex';
    expect(setPreference).toHaveBeenCalledWith(CITE_FORMAT_PREFERENCE, format);
  });
});
