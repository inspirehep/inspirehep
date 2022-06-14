import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import ReferenceLettersContacts from '../ReferenceLettersContacts';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ReferenceLettersContacts', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with referenceLetters', () => {
    const referenceLetters = fromJS({
      urls: [
        { value: 'https://qa.inspirehep.net' },
        { value: 'www.google.com', description: 'Google' },
      ],
      emails: ['awi_moni@yahoo.com', 'mariahmoni@gmail.com'],
    });
    const wrapper = shallow(
      <ReferenceLettersContacts referenceLetters={referenceLetters} />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
