import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List } from 'antd';
import { Link } from 'react-router-dom';

import AuthorList from './AuthorList';
import Latex from '../../common/components/Latex';
import PublicationInfoList from './PublicationInfoList';

class CitationItem extends Component {
  static renderTitle(citation) {
    const recordId = citation.get('control_number');
    const title = citation.getIn(['titles', 0, 'title'], '');
    return (
      <Link to={`/literature/${recordId}`}>
        <Latex>{title}</Latex>
      </Link>
    );
  }

  render() {
    const { citation } = this.props;
    const publicationInfo = citation.get('publication_info');
    return (
      <List.Item>
        <List.Item.Meta
          title={CitationItem.renderTitle(citation)}
          description={
            <Fragment>
              <AuthorList
                recordId={citation.get('control_number')}
                authors={citation.get('authors')}
              />
              <PublicationInfoList
                publicationInfo={publicationInfo}
                labeled={false}
              />
            </Fragment>
          }
        />
      </List.Item>
    );
  }
}

CitationItem.propTypes = {
  citation: PropTypes.instanceOf(Map).isRequired,
};

export default CitationItem;
