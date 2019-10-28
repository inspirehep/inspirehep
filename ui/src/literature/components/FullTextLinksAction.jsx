import React from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import { Menu } from 'antd';

import IconText from '../../common/components/IconText';
import EventTracker from '../../common/components/EventTracker';
import ExternalLink from '../../common/components/ExternalLink';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';
import ActionsDropdownOrAction from '../../common/components/ActionsDropdownOrAction';

function fullTextLinkToHrefDisplayPair(fullTextLink) {
  const href = fullTextLink.get('value');
  const description = fullTextLink.get('description');
  const display = description || removeProtocolAndWwwFromUrl(href);
  return [href, display];
}

function renderFullTextsDropdownAction(fullTextLink) {
  const [href, display] = fullTextLinkToHrefDisplayPair(fullTextLink);
  return (
    <Menu.Item key={href}>
      <EventTracker eventId="PdfDownload">
        <ExternalLink href={href}>{display}</ExternalLink>
      </EventTracker>
    </Menu.Item>
  );
}

function renderFullTextAction(fullTextLink, title) {
  return (
    <EventTracker eventId="PdfDownload">
      <ExternalLink href={fullTextLink.get('value')}>{title}</ExternalLink>
    </EventTracker>
  );
}

const ACTION_TITLE = <IconText text="pdf" type="download" />;

function FullTextLinksAction({ fullTextLinks }) {
  return (
    <ActionsDropdownOrAction
      values={fullTextLinks}
      renderAction={renderFullTextAction}
      renderDropdownAction={renderFullTextsDropdownAction}
      title={ACTION_TITLE}
    />
  );
}

FullTextLinksAction.propTypes = {
  fullTextLinks: PropTypes.instanceOf(List).isRequired,
};

export default FullTextLinksAction;
