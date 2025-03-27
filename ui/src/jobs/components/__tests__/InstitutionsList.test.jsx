import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import InstitutionsList from '../InstitutionsList';

describe('InstitutionsList', () => {
  it('renders institutions', () => {
    const institutions = fromJS([
      {
        value: 'UC, Berkeley',
      },
      {
        value: 'CERN',
      },
    ]);
    const { getByText } = render(
      <InstitutionsList institutions={institutions} />
    );
    expect(getByText('UC, Berkeley,')).toBeInTheDocument();
    expect(getByText('CERN')).toBeInTheDocument();
  });
});
