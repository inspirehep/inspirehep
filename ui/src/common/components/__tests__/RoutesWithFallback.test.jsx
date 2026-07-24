import { Route } from 'react-router-dom';

import { renderWithRouter } from '../../../fixtures/render';
import RoutesWithFallback from '../RoutesWithFallback';

describe('RoutesWithFallback', () => {
  it('renders children ', () => {
    const Foo = () => <div>Foo Component</div>;
    const { getByText } = renderWithRouter(
      <RoutesWithFallback>
        <Route path="/foo" element={<Foo />} />
      </RoutesWithFallback>,
      { route: '/foo' }
    );
    expect(getByText('Foo Component')).toBeInTheDocument();
  });

  it('redirect to errors', () => {
    const Foo = () => <div>Foo Component</div>;
    const { container } = renderWithRouter(
      <RoutesWithFallback>
        <Route path="/foo" element={<Foo />} />
      </RoutesWithFallback>,
      { route: '/bad_route' }
    );
    expect(container).toBeEmptyDOMElement();
  });
});
