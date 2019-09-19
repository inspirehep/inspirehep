import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AuthorEmailsAction from '../AuthorEmailsAction';

describe('AuthorEmailsAction', () => {
  it('renders multiple current emails in a dropdown', () => {
    const emails = fromJS([
      { value: 'dude@email.cern' },
      { value: 'other-dude@email.cern' },
    ]);
    const wrapper = shallow(<AuthorEmailsAction emails={emails} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders single email', () => {
    const emails = fromJS([{ value: 'dude@email.cern' }]);
    const wrapper = shallow(<AuthorEmailsAction emails={emails} />);
    expect(wrapper).toMatchSnapshot();
  });
});
