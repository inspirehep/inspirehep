import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import PublicNotesList from '../PublicNotesList';

describe('PublicNotesList', () => {
  it('renders public notes', () => {
    const publicNotes = fromJS([
      {
        source: 'arXiv',
        value: 'note1',
      },
      {
        value: 'note2',
      },
    ]);
    const wrapper = shallow(<PublicNotesList publicNotes={publicNotes} />);
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
