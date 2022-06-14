import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Author from '..';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Author', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders unlinkedAuthor with affiliations', () => {
    const author = fromJS({
      full_name: 'Name, Full, Jr.',
      first_name: 'Full, Jr.',
      last_name: 'Name',
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Author author={author} recordId={12345} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders editor', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      first_name: 'Full',
      last_name: 'Name',
      inspire_roles: ['editor'],
      affiliations: [
        {
          value: 'Affiliation',
        },
      ],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders supervisor', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      inspire_roles: ['supervisor'],
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders linked author', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      record: {
        $ref: 'https://beta.inspirehep.net/api/authors/12345',
      },
      bai: 'Full.Name.1',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders unlinked author with bai', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      bai: 'Full.Name.1',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Author recordId={12345} author={author} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
