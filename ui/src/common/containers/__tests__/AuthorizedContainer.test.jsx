import { render } from '@testing-library/react';
import { fromJS, List } from 'immutable';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import AuthorizedContainer from '../AuthorizedContainer';

describe('AuthorizedContainer', () => {
  it('renders children if user is authorized', () => {
    const store = getStore({
      user: fromJS({
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const { getByText } = render(
      <Provider store={store}>
        <AuthorizedContainer authorizedRoles={List(['superuser', 'cataloger'])}>
          <div>SECRET DIV [work in progress]</div>
        </AuthorizedContainer>
      </Provider>
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
    const { queryByText } = render(
      <Provider store={store}>
        <AuthorizedContainer authorizedRoles={List(['superuser'])}>
          <div>SECRET DIV [work in progress]</div>
        </AuthorizedContainer>
      </Provider>
    );
    expect(queryByText('SECRET DIV [work in progress]')).toBeNull();
  });
});
