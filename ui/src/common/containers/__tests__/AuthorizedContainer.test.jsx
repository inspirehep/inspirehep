import { fromJS, List } from 'immutable';

import { getStore } from '../../../fixtures/store';
import AuthorizedContainer from '../AuthorizedContainer';
import { renderWithProviders } from '../../../fixtures/render';

describe('AuthorizedContainer', () => {
  it('renders children if user is authorized', () => {
    const store = getStore({
      user: fromJS({
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const { getByText } = renderWithProviders(
      <AuthorizedContainer authorizedRoles={List(['superuser', 'cataloger'])}>
        <div>SECRET DIV [work in progress]</div>
      </AuthorizedContainer>,
      { store }
    );

    expect(getByText('SECRET DIV [work in progress]')).toBeInTheDocument();
  });

  it('does not render if user is not authorized', () => {
    const store = getStore({
      user: fromJS({
        data: {
          roles: ['unauthorized'],
        },
      }),
    });
    const { queryByText } = renderWithProviders(
      <AuthorizedContainer authorizedRoles={List(['superuser'])}>
        <div>SECRET DIV [work in progress]</div>
      </AuthorizedContainer>,
      { store }
    );
    expect(queryByText('SECRET DIV [work in progress]')).toBeNull();
  });
});
