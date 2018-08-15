import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Switch } from 'react-router-dom';
import { shallow, mount } from 'enzyme';

import { getStore } from '../../fixtures/store';
import Submissions from '../';
import AuthorSubmissionPage from '../containers/AuthorSubmissionPage';
import SubmissionSuccessPage from '../containers/SubmissionSuccessPage';

describe('Submissions', () => {
  it('renders initial state', () => {
    const component = shallow(<Submissions />);
    expect(component).toMatchSnapshot();
  });

  // TODO: enable after https://github.com/airbnb/enzyme/issues/1553 is solved (Context API support)
  xit('navigates to AuthorSubmissionPage when /submissions/author', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/author']} initialIndex={0}>
          <Switch id="main">
            <Submissions />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(AuthorSubmissionPage)).toExist();
  });

  xit('navigates to SubmissionSuccessPage when /submissions/success', () => {
    const wrapper = mount(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/submissions/author']} initialIndex={0}>
          <Switch id="main">
            <Submissions />
          </Switch>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(SubmissionSuccessPage)).toExist();
  });
});
