import React from 'react';
import { mount } from 'enzyme';
import { fromJS, Set } from 'immutable';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import AssignLiteratureItemDrawerContainer from '../AssignLiteratureItemDrawerContainer';
import AssignLiteratureItemDrawer from '../../components/AssignLiteratureItemDrawer';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

describe('AssignLiteratureItemDrawerContainer', () => {
  it('passes state to props', () => {
    const store = getStore({
      literature: fromJS({
        allAuthors: Set([{ full_name: 'Test, Author' }]),
        assignLiteratureItemDrawerVisible: 123456,
      }),
      user: fromJS({
        data: {
          recid: 123457,
        },
      }),
    });

    const wrapper = mount(
      <Provider store={store}>
        <AssignLiteratureItemDrawerContainer itemLiteratureId={123459} />
      </Provider>
    );

    expect(wrapper.find(AssignLiteratureItemDrawer)).toHaveProp({
      authors: Set([{ full_name: 'Test, Author' }]),
      literatureId: 123456,
      currentUserRecordId: 123457,
    });
  });
});
