import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import PublicationInfoList from '../PublicationInfoList';

describe('PublicationInfoList', () => {
  it('renders with publicationInfo', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const { getByText } = render(
      <PublicationInfoList publicationInfo={publicationInfo} />
    );
    expect(getByText(/Test Journal/i)).toBeInTheDocument();
    expect(getByText(/Published in:/i)).toBeInTheDocument();
  });

  it('renders without label if labeled false', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const { queryByText } = render(
      <PublicationInfoList labeled={false} publicationInfo={publicationInfo} />
    );
    expect(queryByText(/Published in:/i)).toBeNull();
  });

  // TODO: wrapperClassName is not being used in the component fix test
  it('renders with wrapperClassName', () => {
    const publicationInfo = fromJS([
      {
        journal_title: 'Test Journal',
      },
    ]);
    const { asFragment } = render(
      <PublicationInfoList
        wrapperClassName="test"
        publicationInfo={publicationInfo}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
