import React from 'react';
import { shallow } from 'enzyme';

import OrcidProfileLink from '../OrcidProfileLink';

describe('OrcidProfileLink', () => {
  it('renders with all props set', () => {
    const wrapper = shallow(
      <OrcidProfileLink className="test" orcid="0000-0001-8058-0014">
        Orcid: <strong>0000-0001-8058-0014</strong>
      </OrcidProfileLink>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only orcid', () => {
    const wrapper = shallow(<OrcidProfileLink orcid="0000-0001-8058-0014" />);
    expect(wrapper).toMatchSnapshot();
  });
});
