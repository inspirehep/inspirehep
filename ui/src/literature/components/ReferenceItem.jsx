import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List } from 'antd';
import { Link } from 'react-router-dom';

import AuthorList from './AuthorList';
import Latex from '../../common/components/Latex';

class ReferenceItem extends Component {
  static renderTitle(reference) {
    const recordId = reference.get('control_number');
    const title = reference.getIn(['titles', 0, 'title'], '');
    const label = reference.get('label');

    const labelDisplay = label ? `[${label}] ` : '';

    if (recordId && title) {
      return (
        <Link to={`/literature/${recordId}`}>
          {labelDisplay} <Latex>{title}</Latex>
        </Link>
      );
    }
    return `${labelDisplay}${title}`;
  }

  render() {
    const { reference } = this.props;

    return (
      <List.Item>
        <List.Item.Meta
          title={ReferenceItem.renderTitle(reference)}
          description={
            <AuthorList
              recordId={reference.get('control_number')}
              authors={reference.get('authors')}
            />
          }
        />
      </List.Item>
    );
  }
}

ReferenceItem.propTypes = {
  reference: PropTypes.instanceOf(Map).isRequired,
};

export default ReferenceItem;
