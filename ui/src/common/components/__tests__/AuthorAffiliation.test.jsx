import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Affiliation from '../Affiliation';

describe('Affiliation', () => {
  it('renders linked affiliation with institution', () => {
    const affiliation = fromJS({
      institution: 'CERN2',
      record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
    });
    const wrapper = shallow(<Affiliation affiliation={affiliation} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders unlinked affiliation with institution', () => {
    const affiliation = fromJS({
      institution: 'CERN2',
    });
    const wrapper = shallow(<Affiliation affiliation={affiliation} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders linked affiliation with value', () => {
    const affiliation = fromJS({
      value: 'CERN2',
      record: { $ref: 'http://inspirehep.net/api/institutions/12345' },
    });
    const wrapper = shallow(<Affiliation affiliation={affiliation} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders unlinked affiliation with value', () => {
    const affiliation = fromJS({
      value: 'CERN2',
    });
    const wrapper = shallow(<Affiliation affiliation={affiliation} />);
    expect(wrapper).toMatchSnapshot();
  });
});
