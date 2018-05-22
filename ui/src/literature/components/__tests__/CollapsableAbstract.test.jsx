import React from 'react';
import { shallow } from 'enzyme';

import CollapsableAbstract from '../CollapsableAbstract';

describe('CollapsableAbstract', () => {
  it('renders callapsed abstract', () => {
    const abstract = 'This abstract will be collapsed, but can be extended';
    const wrapper = shallow((
      <CollapsableAbstract
        abstract={abstract}
      />
    ));
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render if abstract is not passed', () => {
    const wrapper = shallow((
      <CollapsableAbstract />
    ));
    expect(wrapper).toMatchSnapshot();
  });
});
