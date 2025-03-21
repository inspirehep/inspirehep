import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import KeywordList from '../KeywordList';

describe('KeywordList', () => {
  it('renders with keywords', () => {
    const keywords = fromJS([
      {
        value: 'CMS',
      },
      {
        value: 'LHC-B',
      },
    ]);
    const { getByText } = render(<KeywordList keywords={keywords} />);
    expect(getByText('CMS')).toBeInTheDocument();
    expect(getByText('LHC-B')).toBeInTheDocument();
  });
});
