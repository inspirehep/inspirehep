import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import AuthorEmailsAction from '../AuthorEmailsAction';

describe('AuthorEmailsAction', () => {
  it('renders multiple current emails in a dropdown', () => {
    const emails = fromJS([
      { value: 'dude@email.cern' },
      { value: 'other-dude@email.cern' },
    ]);
    const { asFragment } = render(<AuthorEmailsAction emails={emails} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders single email', () => {
    const emails = fromJS([{ value: 'dude@email.cern' }]);
    const { asFragment } = render(<AuthorEmailsAction emails={emails} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
