import React from 'react';
import { shallow } from 'enzyme';
import IncomingLiteratureReferencesLinkAction from '../IncomingLiteratureReferencesLinkAction';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('IncomingLiteratureReferencesLinkAction', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with required props', () => {
    const itemCount = 29;
    const referenceType = 'citation';
    const recordId = 888;
    const linkQuery = `refersto:recid:${recordId}`;
    const trackerEventId = 'Citations:Search';
    const wrapper = shallow(
      <IncomingLiteratureReferencesLinkAction
        itemCount={itemCount}
        linkQuery={linkQuery}
        referenceType={referenceType}
        trackerEventId={trackerEventId}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with required props when reference count is singular', () => {
    const itemCount = 1;
    const referenceType = 'paper';
    const recordId = 888;
    const linkQuery = `refersto:recid:${recordId}`;
    const trackerEventId = 'Papers:Search';
    const wrapper = shallow(
      <IncomingLiteratureReferencesLinkAction
        itemCount={itemCount}
        linkQuery={linkQuery}
        referenceType={referenceType}
        trackerEventId={trackerEventId}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
