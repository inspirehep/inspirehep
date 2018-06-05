import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List } from 'antd';
import { Link } from 'react-router-dom';

import AuthorList from './AuthorList';
import DOIList from './DOIList';
import PublicationInfo from './PublicationInfo';
import Latex from '../../common/components/Latex';
import ArxivEprintList from './ArxivEprintList';

class ReferenceItem extends Component {
  static renderTitle(reference) {
    const recordId = reference.get('control_number');
    const title = reference.getIn(['titles', 0, 'title']);

    if (recordId && title) {
      return (
        <Link to={`/literature/${recordId}`}>
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
              recordId={reference.get('control_number')}
              authors={reference.get('authors')}
            />
          }
        />
        <div>
          <PublicationInfo
            info={reference.getIn(['publication_info', 0], Map())}
          />
          <ArxivEprintList eprints={reference.get('arxiv_eprints')} />
          <DOIList dois={reference.get('dois')} />
        </div>
      </List.Item>
    );
  }
}

ReferenceItem.propTypes = {
  reference: PropTypes.instanceOf(Map).isRequired,
};

export default ReferenceItem;
