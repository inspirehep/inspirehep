import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';
import { Button, Menu, Icon, Tooltip } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
import DropdownMenu from '../../common/components/DropdownMenu';
import ExternalLink from '../../common/components/ExternalLink';
import { removeProtocolAndWwwFromUrl } from '../../common/utils';

const BLOG_DISPLAY = 'Blog';
function websiteToHrefDisplayPair(website) {
  const href = website.get('value');
  const description = website.get('description', '').toLowerCase();
  const display =
    description === 'blog' ? BLOG_DISPLAY : removeProtocolAndWwwFromUrl(href);
  return Map({ href, display });
}

function sortBlogFirst(a, b) {
  if (a === b) {
    return 0;
  }

  if (a === 'Blog') {
    return -1;
  }

  if (b === 'Blog') {
    return 1;
  }

  return 0;
}

class AuthorWebsitesAction extends Component {
  static renderIcon() {
    return <Icon type="link" />;
  }

  renderDropdown() {
    const { websites } = this.props;
    const hrefDisplayPairs = websites
      .map(websiteToHrefDisplayPair)
      .sortBy(pair => pair.get('display'), sortBlogFirst);
    return (
      <DropdownMenu
        title={
          <Tooltip title="Personal websites">
            <Button>{AuthorWebsitesAction.renderIcon()}</Button>
          </Tooltip>
        }
      >
          {hrefDisplayPairs.map(pair => (
            <Menu.Item key={pair.get('href')}>
              <ExternalLink href={pair.get('href')}>
                {pair.get('display')}
              </ExternalLink>
            </Menu.Item>
          ))}
      </DropdownMenu>
    );
  }

  renderOne() {
    const { websites } = this.props;
    return (
      <Tooltip title="Personal website">
        <ExternalLink href={websites.getIn(['0', 'value'])}>
          {AuthorWebsitesAction.renderIcon()}
        </ExternalLink>
      </Tooltip>
    );
  }

  render() {
    const { websites } = this.props;
    return (
      <ListItemAction>
        {websites.size > 1 ? this.renderDropdown() : this.renderOne()}
      </ListItemAction>
    );
  }
}

AuthorWebsitesAction.propTypes = {
  websites: PropTypes.instanceOf(List).isRequired,
};

export default AuthorWebsitesAction;
