import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import ExperimentItem from '../ExperimentItem';

describe('ExperimentItem', () => {
  it('renders with all props set', () => {
    const metadata = fromJS({
      legacy_name: 'Experiment new',
      control_number: 1234,
      number_of_papers: 99,
      institutions: [
        {
          value: 'CERN',
          record: {
            $ref: 'https://inspirehep.net/api/institutions/902725',
          },
          curated_relation: true,
        },
        {
          value: 'University',
        },
      ],
      long_name: 'This is a long name describing the experiment',
      collaboration: { value: 'ATLAS' },
      urls: [{ value: 'http://url.com' }],
    });

    const wrapper = shallow(<ExperimentItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      legacy_name: 'Experiment new',
      control_number: 1234,
    });

    const wrapper = shallow(<ExperimentItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });
});
