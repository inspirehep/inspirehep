import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Button, Menu } from 'antd';

import ListItemAction from '../../common/components/ListItemAction';
import DropdownMenu from '../../common/components/DropdownMenu';
import IconText from '../../common/components/IconText';
import DOILink from './DOILink';
import DOIMaterial from './DOIMaterial';

class DOILinkAction extends Component {
  static renderIconTextForDOI() {
    return <IconText text="DOI" type="link" />;
  }

  renderDOIDropdownItems() {
    const { dois } = this.props;
    return dois.map(doi => (
      <Menu.Item key={doi.get('value')}>
        <DOILink doi={doi.get('value')}>
          {doi.get('value')}
          <DOIMaterial material={doi.get('material')} />
        </DOILink>
      </Menu.Item>
    ));
  }

  renderDOIDropdown() {
    return (
      <DropdownMenu
        title={<Button>{DOILinkAction.renderIconTextForDOI()}</Button>}
      >
        {this.renderDOIDropdownItems()}
      </DropdownMenu>
    );
  }

  renderDoiLink() {
    const { dois } = this.props;
    return (
      <DOILink doi={dois.getIn([0, 'value'])}>
        {DOILinkAction.renderIconTextForDOI()}
      </DOILink>
    );
  }

  render() {
    const { dois } = this.props;
    return (
      <ListItemAction>
        {dois.size > 1 ? this.renderDOIDropdown() : this.renderDoiLink()}
      </ListItemAction>
    );
  }
}

DOILinkAction.propTypes = {
  dois: PropTypes.instanceOf(List).isRequired,
};

export default DOILinkAction;
