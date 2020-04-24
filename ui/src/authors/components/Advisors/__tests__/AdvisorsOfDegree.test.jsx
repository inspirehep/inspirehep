import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import AdvisorsOfDegree from '../AdvisorsOfDegree';

describe('AdvisorsOfDegree', () => {
  it('renders other advisors', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
      },
      {
        name: 'Another Dude',
        degree_type: 'other',
      },
    ]);
    const wrapper = shallow(
      <AdvisorsOfDegree advisors={advisors} degreeType="other" />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders phd advisors', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
        degree_type: 'phd',
      },
      {
        name: 'Another Dude',
        degree_type: 'phd',
      },
    ]);
    const wrapper = shallow(
      <AdvisorsOfDegree advisors={advisors} degreeType="phd" />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });

  it('renders the master advisor', () => {
    const advisors = fromJS([
      {
        name: 'Yoda',
        degree_type: 'master',
      },
    ]);
    const wrapper = shallow(
      <AdvisorsOfDegree advisors={advisors} degreeType="master" />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
