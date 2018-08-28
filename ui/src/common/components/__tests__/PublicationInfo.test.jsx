import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import PublicationInfo from '../PublicationInfo';

describe('PublicationInfo', () => {
  it('renders with journal_title present', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with journal_title and alll others fields', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_volume: 'TV',
      year: 2016,
      page_start: '1',
      page_end: '2',
      artid: '012345',
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with journal_title and alll others fields', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_volume: 'TV',
      year: 2016,
      page_start: '1',
      page_end: '2',
      artid: '012345',
      pubinfo_freetext: 'Test. Pub. Info. Freetext',
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with pubinfo_freetext', () => {
    const info = fromJS({
      pubinfo_freetext: 'Test. Pub. Info. Freetext',
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without pubinfo_freetext or journal_title', () => {
    const info = fromJS({});
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with material', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      material: 'erratum',
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render material if it is publication', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      material: 'publication',
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders either page start/end or artid', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      page_start: 1,
      page_end: 10,
      artid: 123,
      journal_issue: 2,
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders only page_start when page_end is not available', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      page_start: 1,
      artid: 123,
      journal_issue: 2,
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not display a comma when page info or artid is not available', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_issue: 2,
    });
    const wrapper = shallow(<PublicationInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });
});
