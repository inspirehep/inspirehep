import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import PublicNotesList from '../PublicNotesList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('PublicNotesList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders public notes', () => {
    const publicNotes = fromJS([
      {
        source: 'arXiv',
        value: 'note1',
      },
      {
        value: 'note2',
      },
      {
        value: 'note3 here https://pos.sissa.it/390/977/pdf',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<PublicNotesList publicNotes={publicNotes} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
