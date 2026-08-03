import { Route, Routes } from 'react-router-dom';

import { renderWithRouter } from '../../../fixtures/render';
import ConditionalElement from '../ConditionalElement';

const Test = () => <div>Test Component</div>;

describe('ConditionalElement', () => {
  it('renders component if condition is true', () => {
    const { getByText } = renderWithRouter(
      <Routes>
        <Route
          path="/test"
          element={
            <ConditionalElement condition redirectTo="/nowhere">
              <Test />
            </ConditionalElement>
          }
        />
      </Routes>,
      { route: '/test' }
    );
    expect(getByText('Test Component')).toBeInTheDocument();
  });

  it('redirects if condition is false', () => {
    const Another = () => <div>Another Component</div>;
    const { queryByText, getByText } = renderWithRouter(
      <Routes>
        <Route path="/another" element={<Another />} />
        <Route
          path="/test"
          element={
            <ConditionalElement condition={false} redirectTo="/another">
              <Test />
            </ConditionalElement>
          }
        />
      </Routes>,
      { route: '/test' }
    );

    expect(getByText('Another Component')).toBeInTheDocument();
    expect(queryByText('Test Component')).toBeNull();
  });
});
