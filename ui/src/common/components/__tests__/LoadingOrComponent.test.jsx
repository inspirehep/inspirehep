import React from 'react';
import { shallow } from 'enzyme';

import LoadingOrComponent from '../LoadingOrComponent';

describe('LoadingOrComponent', () => {
  it('render with loading', () => {
    const wrapper = shallow(<LoadingOrComponent loading={true} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render without loading', () => {
    const wrapper = shallow(
      <LoadingOrComponent loading={false}>
        <div>
          <h2>Test</h2>
        </div>
      </LoadingOrComponent>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
