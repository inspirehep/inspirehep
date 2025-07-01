import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import {
  getStore,
  getStoreWithState,
  mockActionCreator,
} from '../../../fixtures/store';
import CitationSummarySwitchContainer, {
  UI_CITATION_SUMMARY_PARAM,
} from '../CitationSummarySwitchContainer';
import { appendQueryToLocationSearch } from '../../../actions/router';
import { CITATION_SUMMARY_ENABLING_PREFERENCE } from '../../../reducers/user';
import {
  LITERATURE_NS,
  AUTHOR_PUBLICATIONS_NS,
} from '../../../search/constants';
import { setPreference } from '../../../actions/user';
import { fetchCitationSummary } from '../../../actions/citations';

jest.mock('../../../actions/router');
mockActionCreator(appendQueryToLocationSearch);

jest.mock('../../../actions/citations');
mockActionCreator(fetchCitationSummary);

jest.mock('../../components/CitationSummarySwitch', () => (props) => (
  <div
    data-testid="citation-summary-switch"
    data-props={JSON.stringify({
      checked: props.checked,
      citationSummaryEnablingPreference:
        props.citationSummaryEnablingPreference,
    })}
  >
    <button
      type="button"
      data-testid="on-change-true-button"
      onClick={() => props.onChange(true)}
    >
      Change True
    </button>
    <button
      type="button"
      data-testid="on-change-false-button"
      onClick={() => props.onChange(false)}
    >
      Change False
    </button>
    <button
      type="button"
      data-testid="on-preference-change-button"
      onClick={() => props.onCitationSummaryUserPreferenceChange(true)}
    >
      Preference Change
    </button>
  </div>
));

describe('CitationSummarySwitchContainer', () => {
  it('dispatches setPreference and fetchCitationSummary when switch is toggled to true', () => {
    const namespace = LITERATURE_NS;
    const store = getStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );

    const changeTrueButton = getByTestId('on-change-true-button');
    changeTrueButton.click();

    const expectedActions = [
      setPreference(CITATION_SUMMARY_ENABLING_PREFERENCE, true),
      fetchCitationSummary(namespace),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('removes citation summary param when switch is toggled to false', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );

    const changeFalseButton = getByTestId('on-change-false-button');
    changeFalseButton.click();

    const expectedActions = [
      setPreference(CITATION_SUMMARY_ENABLING_PREFERENCE, false),
      appendQueryToLocationSearch({ [UI_CITATION_SUMMARY_PARAM]: undefined }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('sets checked if citation summary param is set', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      router: {
        location: {
          search: `?${UI_CITATION_SUMMARY_PARAM}=true`,
          query: { [UI_CITATION_SUMMARY_PARAM]: true },
        },
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );

    const component = getByTestId('citation-summary-switch');
    const props = JSON.parse(component.getAttribute('data-props'));

    expect(props.checked).toBe(true);
  });

  it('sets unchecked if hash is not set', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      location: {
        search: '?another-thing=5',
        query: { 'another-thing': 5 },
      },
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );

    const component = getByTestId('citation-summary-switch');
    const props = JSON.parse(component.getAttribute('data-props'));

    expect(props.checked).toBe(false);
  });

  it('sets citationSummaryEnablingPreference from state', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      user: fromJS({
        preferences: { [CITATION_SUMMARY_ENABLING_PREFERENCE]: true },
      }),
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );

    const component = getByTestId('citation-summary-switch');
    const props = JSON.parse(component.getAttribute('data-props'));

    expect(props.citationSummaryEnablingPreference).toBe(true);
  });

  it('dispatches appendQueryToLocationSearch onCitationSummaryUserPreferenceChange if the citation summary is enabled', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <CitationSummarySwitchContainer namespace={namespace} />
      </Provider>
    );

    const preferenceChangeButton = getByTestId('on-preference-change-button');
    preferenceChangeButton.click();

    const expectedActions = [
      appendQueryToLocationSearch({ [UI_CITATION_SUMMARY_PARAM]: true }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
