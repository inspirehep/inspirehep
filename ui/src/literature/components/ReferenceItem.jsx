import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List } from 'antd';
import { Link } from 'react-router-dom';

import AuthorList from './AuthorList';
import DOIList from './DOIList';
import PublicationInfo from './PublicationInfo';
import Latex from '../../common/components/Latex';

class ReferenceItem extends Component {
  static renderTitle(reference) {
    const recid = reference.get('recid');
    const title = reference.get('title');

    if (recid && title) {
      return (
        <Link to={`/literature/${recid}`}>
          <Latex>{title}</Latex>
        </Link>
      );
    }
    return title;
  }

  render() {
    const { reference } = this.props;
    return (
      <List.Item>
        <List.Item.Meta
          title={ReferenceItem.renderTitle(reference)}
          description={
            <AuthorList
              recordId={reference.get('recid')}
              authors={reference.get('authors')}
            />
          }
        />
        <PublicationInfo info={reference.get('publication_info')} />
        <DOIList dois={reference.get('dois')} />
      </List.Item>
    );
  }
}

ReferenceItem.propTypes = {
  reference: PropTypes.instanceOf(Map).isRequired,
};

export default ReferenceItem;
