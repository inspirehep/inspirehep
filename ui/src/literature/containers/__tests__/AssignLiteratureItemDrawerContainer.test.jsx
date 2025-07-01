import React from 'react';
import { render } from '@testing-library/react';
import { fromJS, Set } from 'immutable';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import AssignLiteratureItemDrawerContainer from '../AssignLiteratureItemDrawerContainer';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockImplementation(() => ({
    id: 123,
  })),
}));

jest.mock('../../components/AssignLiteratureItemDrawer', () => (props) => (
  <div
    data-testid="assign-literature-item-drawer"
    data-props={JSON.stringify({
      authors: props.authors ? props.authors.toJS() : props.authors,
      literatureId: props.literatureId,
      currentUserRecordId: props.currentUserRecordId,
    })}
  >
    AssignLiteratureItemDrawer Mock
  </div>
));

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

    const { getByTestId } = render(
      <Provider store={store}>
        <AssignLiteratureItemDrawerContainer itemLiteratureId={123459} />
      </Provider>
    );

    const component = getByTestId('assign-literature-item-drawer');
    const props = JSON.parse(component.getAttribute('data-props'));

    expect(props.authors).toEqual([{ full_name: 'Test, Author' }]);
    expect(props.literatureId).toBe(123456);
    expect(props.currentUserRecordId).toBe(123457);
  });
});
