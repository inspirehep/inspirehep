import { render } from '@testing-library/react';
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
      {
        value: 'note3 here https://pos.sissa.it/390/977/pdf',
      },
    ]);
    const { getByRole, getByText } = render(
      <PublicNotesList publicNotes={publicNotes} />
    );

    expect(getByText('note1')).toBeInTheDocument();
    expect(getByText('note2')).toBeInTheDocument();
    expect(getByText('note3 here')).toBeInTheDocument();
    expect(
      getByRole('link', { name: 'https://pos.sissa.it/390/977/pdf' })
    ).toBeInTheDocument();
  });
});
