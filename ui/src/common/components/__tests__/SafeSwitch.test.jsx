import { render } from '@testing-library/react';
import { Route, MemoryRouter } from 'react-router-dom';

import SafeSwitch from '../SafeSwitch';

describe('SafeSwitch', () => {
  it('renders childrens ', () => {
    const Foo = () => <div>Foo Component</div>;
    const { getByText } = render(
      <MemoryRouter initialEntries={['/foo']}>
        <SafeSwitch>
          <Route path="/foo" component={Foo} />
        </SafeSwitch>
      </MemoryRouter>
    );
    expect(getByText('Foo Component')).toBeInTheDocument();
  });

  it('redirect to errors', () => {
    const Foo = () => <div>Foo Component</div>;
    const { container } = render(
      <MemoryRouter initialEntries={['/bad_route']}>
        <SafeSwitch>
          <Route path="/foo" component={Foo} />
        </SafeSwitch>
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
