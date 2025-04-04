import React from 'react';
import { render } from '@testing-library/react';

import StatusField from '../StatusField';

describe('StatusField', () => {
  it('renders if can modify but not cataloger logged in', () => {
    const { asFragment } = render(
      <StatusField
        canModify
        isCatalogerLoggedIn={false}
        form={{ errors: {} }}
        field={{ name: {} }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders if can modify and cataloger logged in', () => {
    const { asFragment } = render(
      <StatusField
        canModify
        isCatalogerLoggedIn
        form={{ errors: {} }}
        field={{ name: {} }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders if can not modify and not cataloger logged in', () => {
    const { asFragment } = render(
      <StatusField
        canModify={false}
        isCatalogerLoggedIn={false}
        form={{ errors: {} }}
        field={{ name: {} }}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
