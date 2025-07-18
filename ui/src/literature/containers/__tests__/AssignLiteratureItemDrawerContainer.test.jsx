import React from 'react';
import { fromJS, Set } from 'immutable';

import { getStore } from '../../../fixtures/store';
import AssignLiteratureItemDrawerContainer from '../AssignLiteratureItemDrawerContainer';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
  it('passes state to props', async () => {
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
      router: {
        location: {
          pathname: '/literature/123459',
        },
      },
    });

    const { findByTestId } = renderWithProviders(
      <AssignLiteratureItemDrawerContainer itemLiteratureId={123459} />,
      {
        store,
        route: '/literature/123459',
      }
    );

    const component = await findByTestId('assign-literature-item-drawer');
    const props = JSON.parse(component.getAttribute('data-props'));

    expect(props.authors).toEqual([{ full_name: 'Test, Author' }]);
    expect(props.literatureId).toBe(123456);
    expect(props.currentUserRecordId).toBe(123457);
  });
});
