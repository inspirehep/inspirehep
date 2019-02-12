import React from 'react';
import { shallow } from 'enzyme';

import LoadingOrChildren from '../LoadingOrChildren';

describe('LoadingOrChildren', () => {
  it('render with loading', () => {
    const wrapper = shallow(<LoadingOrChildren loading />);
    expect(wrapper).toMatchSnapshot();
  });

  it('render without loading', () => {
    const wrapper = shallow(
      <LoadingOrChildren loading={false}>
        <div>
          <h2>Test</h2>
        </div>
      </LoadingOrChildren>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
