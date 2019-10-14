import React, { Component } from 'react';
import { Map, List } from 'immutable';
import PropTypes from 'prop-types';
import { Button, Menu } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
import IconText from '../../common/components/IconText';
import EventTracker from '../../common/components/EventTracker';
import ExternalLink from '../../common/components/ExternalLink';
import DropdownMenu from '../../common/components/DropdownMenu';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';

function fullTextLinkToHrefDisplayPair(fullTextLink) {
  const href = fullTextLink.get('value');
  const description = fullTextLink.get('description');
  const display = description || removeProtocolAndWwwFromUrl(href);
  return Map({ href, display });
}

class FullTextLinksAction extends Component {
  static renderIcon() {
    return <IconText text="pdf" type="download" />;
  }

  renderDropdown() {
    const { fullTextLinks } = this.props;
    const hrefDisplayPairs = fullTextLinks.map(fullTextLinkToHrefDisplayPair);
    return (
      <DropdownMenu title={<Button>{FullTextLinksAction.renderIcon()}</Button>}>
        {hrefDisplayPairs.map(pair => (
          <Menu.Item key={pair.get('href')}>
            <EventTracker eventId="PdfDownload">
              <ExternalLink href={pair.get('href')}>
                {pair.get('display')}
              </ExternalLink>
            </EventTracker>
          </Menu.Item>
        ))}
      </DropdownMenu>
    );
  }

  renderOne() {
    const { fullTextLinks } = this.props;
    return (
      <EventTracker eventId="PdfDownload">
        <ExternalLink href={fullTextLinks.getIn([0, 'value'])}>
          {FullTextLinksAction.renderIcon()}
        </ExternalLink>
      </EventTracker>
    );
  }

  render() {
    const { fullTextLinks } = this.props;
    return (
      <ListItemAction>
        {fullTextLinks.size > 1 ? this.renderDropdown() : this.renderOne()}
      </ListItemAction>
    );
  }
}

FullTextLinksAction.propTypes = {
  fullTextLinks: PropTypes.instanceOf(List).isRequired,
};

export default FullTextLinksAction;
