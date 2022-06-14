import React from 'react';
import { shallow } from 'enzyme';
import { Alert } from 'antd';
import { fromJS } from 'immutable';

import BibliographyGenerator from '../BibliographyGenerator';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('BibliographyGenerator', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const wrapper = shallow(<BibliographyGenerator onSubmit={jest.fn()} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders citationErrors', () => {
    const citationErrors = fromJS([
      {
        message: 'Error 1',
      },
      {
        message: 'Error 2',
      },
    ]);
    const wrapper = shallow(
      <BibliographyGenerator
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onSubmit={jest.fn()}
        citationErrors={citationErrors}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(Alert)).toHaveLength(2);
  });
});
