import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import ExperimentItem from '../ExperimentItem';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ExperimentItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only needed props', () => {
    const metadata = fromJS({
      legacy_name: 'Experiment new',
      control_number: 1234,
    });

    const wrapper = shallow(<ExperimentItem metadata={metadata} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
