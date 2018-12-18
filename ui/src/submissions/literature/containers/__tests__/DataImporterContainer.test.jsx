import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import { getStore, getStoreWithState } from '../../../../fixtures/store';
import DataImporterContainer from '../DataImporterContainer';
import { INITIAL_FORM_DATA_REQUEST } from '../../../../actions/actionTypes';
import LinkLikeButton from '../../../../common/components/LinkLikeButton';

describe('DataImporterContainer', () => {
  it('renders without error', () => {
    const store = getStore();
    const wrapper = shallow(
      <DataImporterContainer store={store} onSkipClick={jest.fn()} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders with error with a message', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        loadingInitialData: false,
        initialDataError: { message: 'Import Error' },
      }),
    });
    const wrapper = shallow(
      <DataImporterContainer store={store} onSkipClick={jest.fn()} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders with error without a message', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        loadingInitialData: false,
        initialDataError: { foo: 'bar' },
      }),
    });
    const wrapper = shallow(
      <DataImporterContainer store={store} onSkipClick={jest.fn()} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders while importing', () => {
    const store = getStoreWithState({
      submissions: fromJS({
        loadingInitialData: true,
      }),
    });
    const wrapper = shallow(
      <DataImporterContainer store={store} onSkipClick={jest.fn()} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('dispatches initial data request when import is clicked', () => {
    const store = getStore();
    const importValue = 'arXiv:1001.1234';
    const wrapper = shallow(
      <DataImporterContainer store={store} onSkipClick={jest.fn()} />
    ).dive();
    wrapper
      .find('[data-test-id="import-input"]')
      .simulate('change', { target: { value: importValue } });
    wrapper.find('[data-test-id="import-button"]').simulate('click');
    const actions = store.getActions();
    const expectedAction = actions.find(
      action =>
        action.type === INITIAL_FORM_DATA_REQUEST &&
        action.payload.id === importValue
    );
    expect(expectedAction).toBeDefined();
  });

  it('dispatches initial data request with import value when import button is clicked', () => {
    const store = getStore();
    const importValue = 'arXiv:1001.1234';
    const wrapper = shallow(
      <DataImporterContainer store={store} onSkipClick={jest.fn()} />
    ).dive();
    wrapper
      .find('[data-test-id="import-input"]')
      .simulate('change', { target: { value: importValue } });
    wrapper.find('[data-test-id="import-button"]').simulate('click');
    const actions = store.getActions();
    const expectedAction = actions.find(
      action =>
        action.type === INITIAL_FORM_DATA_REQUEST &&
        action.payload.id === importValue
    );
    expect(expectedAction).toBeDefined();
  });

  it('calls onSkipClick prop when skip button is clicked', () => {
    const store = getStore();
    const onSkipClick = jest.fn();
    const wrapper = shallow(
      <DataImporterContainer store={store} onSkipClick={onSkipClick} />
    ).dive();
    wrapper.find(LinkLikeButton).simulate('click');
    expect(onSkipClick).toHaveBeenCalledTimes(1);
  });
});
