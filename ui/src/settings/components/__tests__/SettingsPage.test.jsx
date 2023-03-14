import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import SettingsPage from '../SettingsPage';

describe('SettingsPage', () => {
  it('renders page', () => {
    const wrapper = shallow(
      <SettingsPage loading={false} onChangeEmailAddress={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders page with error', () => {
    const error = fromJS({
      error: {
        status: 404,
        message: 'This is an error yo'
      }
    });
    const wrapper = shallow(
      <SettingsPage loading={false} error={error} onSubmit={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders page with authors profile section when user has author profile', () => {
    const wrapper = shallow(
      <SettingsPage loading={false} profileControlNumber="1234567" onSubmit={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders page with orcid section when user has orcid profile', () => {
    const wrapper = shallow(
      <SettingsPage loading={false} profileControlNumber="1234567" userOrcid="1234567" onSubmit={jest.fn()} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
