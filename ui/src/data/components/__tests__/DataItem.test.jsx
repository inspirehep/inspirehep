import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import DataItem from '../DataItem';

describe('DataItem', () => {
  it('renders with all props set', () => {
    const metadata = fromJS({
      titles: [
        {
          source: "pariatur adipisicing amet",
          subtitle: "voluptate eiusmod fugiat",
          title: "Test title"
        },
      ],
      authors: [
        {
          affiliations: [
            {
              curated_relation: true,
              record: {
                $ref: "http://M1/api/institutions/12346"
              },
              value: "ut"
            },
          ],
          urls: [{ value: 'http://url.com' }],
          dois: [
            {
              source: "in ad et",
              value: "10.8756/tTM",
              material: "data"
            },
            {
              source: "mollit deserunt eu",
              value: "10.5/.Aww=bT@",
              material: "version"
            },
            {
              source: "adipisicing et",
              value: "10.0.9747720/#}O=W:$",
              material: "part"
            }
          ]
        }
      ],
      control_number: 1234
    });

    const wrapper = shallow(<DataItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      titles: [
      {
        source: "pariatur adipisicing amet",
        subtitle: "voluptate eiusmod fugiat",
        title: "Test title"
      },
      ],
      control_number: 1234
    });

    const wrapper = shallow(<DataItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });
});
