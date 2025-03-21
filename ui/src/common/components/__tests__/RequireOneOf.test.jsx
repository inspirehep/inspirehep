import { render } from '@testing-library/react';

import RequireOneOf from '../RequireOneOf';

describe('RequireOneOf', () => {
  it('renders null if all dependencies are missing', () => {
    const dep1 = null;
    const dep2 = null;
    const { container } = render(
      <RequireOneOf dependencies={[dep1, dep2]}>
        <div>
          I depend on {dep1} and {dep2}
        </div>
      </RequireOneOf>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders children if one dependency is there', () => {
    const dep1 = 'dep1';
    const dep2 = null;
    const { getByText } = render(
      <RequireOneOf dependencies={[dep1, dep2]}>
        <div>
          I depend on {dep1} and {dep2}
        </div>
      </RequireOneOf>
    );
    expect(getByText(/I depend on dep1 and/i)).toBeInTheDocument();
  });

  it('renders null if dependency is an empty string', () => {
    const dep1 = '';
    const dep2 = '';
    const { container } = render(
      <RequireOneOf dependencies={[dep1, dep2]}>
        <div>
          I depend on {dep1} and {dep2}
        </div>
      </RequireOneOf>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders children if dependency is false', () => {
    const dep = false;
    const { getByText } = render(
      <RequireOneOf dependencies={[dep]}>
        <div>I depend on {dep}</div>
      </RequireOneOf>
    );
    expect(getByText(/I depend on/i)).toBeInTheDocument();
  });

  it('renders children if dependency is 0', () => {
    const dep = 0;
    const { getByText } = render(
      <RequireOneOf dependencies={[dep]}>
        <div>I depend on {dep}</div>
      </RequireOneOf>
    );
    expect(getByText(/I depend on 0/i)).toBeInTheDocument();
  });
});
