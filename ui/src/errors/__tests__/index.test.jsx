import { Routes, Route } from 'react-router-dom';
import { renderWithProviders } from '../../fixtures/render';
import Errors from '../index';
import { ERRORS } from '../../common/routes';

const renderErrors = (route) =>
  renderWithProviders(
    <Routes>
      <Route path={`${ERRORS}/*`} element={<Errors />} />
    </Routes>,
    { route }
  );

describe('errors', () => {
  it('navigates to Error404 when /errors/404', () => {
    const { getByText } = renderErrors('/errors/404');

    expect(
      getByText('Sorry, we were not able to find what you were looking for...')
    ).toBeInTheDocument();
  });

  it('navigates to Error401 when /errors/401', () => {
    const { getByText } = renderErrors('/errors/401');

    expect(
      getByText('Sorry, you are not authorised to view this page.')
    ).toBeInTheDocument();
  });

  it('navigates to Error500 when /errors/500', () => {
    const { getByText } = renderErrors('/errors/500');

    expect(getByText('Something went wrong')).toBeInTheDocument();
  });

  it('navigates to ErrorNetwork when /errors/network', () => {
    const { getByText } = renderErrors('/errors/network');

    expect(getByText('Connection error!')).toBeInTheDocument();
  });

  it('navigates to Error404 when /errors/anythingElse', () => {
    const { getByText } = renderErrors('/errors/anythingElse');
    expect(
      getByText('Sorry, we were not able to find what you were looking for...')
    ).toBeInTheDocument();
  });
});
