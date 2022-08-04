import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import DetailPageContainer from '../DetailPageContainer';

describe('DetailPageContainer', () => {
  it('renders initial state', () => {
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
      {
        full_name: 'Test, Guy 4',
      },
      {
        full_name: 'Test, Guy 5',
      },
      {
        full_name: 'Test, Guy 6',
      },
    ]);
    const record = { $ref: 'http://localhost:5000/api/literature/1234' };
    const supervisors = fromJS([
      {
        uuid: '123',
        full_name: 'John Doe',
      },
      {
        uuid: '456',
        full_name: 'Jane Doe',
      },
    ]);

    const component = shallow(<DetailPageContainer authors={authors}
      record={record}
      referencesCount={2}
      supervisors={supervisors}
      seminarsCount={2}
      loggedIn={false}
      hasAuthorProfile={false} />);
    expect(component).toMatchSnapshot();
  });
})
