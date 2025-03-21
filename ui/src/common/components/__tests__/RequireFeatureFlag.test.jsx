import { render } from '@testing-library/react';
import RequireFeatureFlag from '../RequireFeatureFlag';

describe('RequireFeatureFlag', () => {
  beforeEach(() => {
    global.CONFIG = {};
  });

  it('renders null if flag is false', () => {
    global.CONFIG = { A_WIP_FEATURE: false };
    const { container } = render(
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders null if flag is not set', () => {
    const { container } = render(
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders whenDisabled if flag is not set and whenDisabled is', () => {
    const { getByText } = render(
      <RequireFeatureFlag
        flag="A_WIP_FEATURE"
        whenDisabled="Almost there, this feature is WIP"
      >
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    expect(getByText('Almost there, this feature is WIP')).toMatchSnapshot();
  });

  it('renders children if flag is set', () => {
    global.CONFIG = { A_WIP_FEATURE: true };
    const { getByText } = render(
      <RequireFeatureFlag flag="A_WIP_FEATURE">
        <div>a WIP Feature</div>
      </RequireFeatureFlag>
    );
    expect(getByText('a WIP Feature')).toMatchSnapshot();
  });
});
