import React from 'react';
import { shallow } from 'enzyme';

import LoadingOrChildren from '../LoadingOrChildren';


describe('LoadingOrChildren', () => {
  
  it('render with loading', () => {
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<LoadingOrChildren loading />);
    
    expect(wrapper).toMatchSnapshot();
  });

  
  it('render without loading', () => {
    const wrapper = shallow(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LoadingOrChildren loading={false}>
        <div>
          <h2>Test</h2>
        </div>
      </LoadingOrChildren>
    );
    
    expect(wrapper).toMatchSnapshot();
  });
});
