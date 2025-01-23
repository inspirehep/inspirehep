import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import LiteratureClaimButton from '../LiteratureClaimButton';

describe('LiteratureClaimButton', () => {
  it('renders disabled when user is not logged in', () => {
    const wrapper = shallow(
      <LiteratureClaimButton
        loggedIn={false}
        hasAuthorProfile={false}
        authors={fromJS([])}
        controlNumber={123456}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders disabled when user is logged in but doesnt have profile', () => {
    const wrapper = shallow(
      <LiteratureClaimButton
        loggedIn
        hasAuthorProfile={false}
        authors={fromJS([])}
        controlNumber={123456}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders disabled when user is logged in and has profile but there is no authors', () => {
    const wrapper = shallow(
      <LiteratureClaimButton
        loggedIn
        hasAuthorProfile
        authors={fromJS([])}
        controlNumber={123456}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders enabled', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
    ]);
    const wrapper = shallow(
      <LiteratureClaimButton
        loggedIn
        hasAuthorProfile
        authors={authors}
        controlNumber={123456}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
