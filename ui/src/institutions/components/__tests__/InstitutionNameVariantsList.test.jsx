import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import InstitutionsNameVariantsList from '../InstitutionNameVariantsList';

describe('InstitutionNameVariantsList', () => {
  it('renders', () => {
    const nameVariants = fromJS([
      {
        value: 'Name1',
      },
      {
        value: 'Name2',
      },
    ]);
    const { asFragment } = render(
      <InstitutionsNameVariantsList nameVariants={nameVariants} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
