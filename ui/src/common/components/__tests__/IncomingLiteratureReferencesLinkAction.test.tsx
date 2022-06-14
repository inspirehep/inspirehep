import React from 'react';
import { shallow } from 'enzyme';
import IncomingLiteratureReferencesLinkAction from '../IncomingLiteratureReferencesLinkAction';

describe('IncomingLiteratureReferencesLinkAction', () => {
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
    expect(wrapper).toMatchSnapshot();
  });

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
    expect(wrapper).toMatchSnapshot();
  });
});
