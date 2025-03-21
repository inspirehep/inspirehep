import { render } from '@testing-library/react';

import RecordUpdateInfo from '../RecordUpdateInfo';

describe('RecordUpdateInfo', () => {
  it('renders RecordUpdateInfo with correct update time', () => {
    const testDate = '2020-10-05T13:39:19.083762+00:00';
    const { getByText } = render(<RecordUpdateInfo updateDate={testDate} />);

    expect(getByText(/Updated on Oct 5, 2020/i)).toBeInTheDocument();
  });
});
