import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List } from 'antd';
import { Link } from 'react-router-dom';

import AuthorsAndCollaborations from './AuthorsAndCollaborations';
import Latex from './Latex';
import PublicationInfoList from './PublicationInfoList';
import { LITERATURE } from '../routes';

class CitationItem extends Component {
  static renderTitle(citation) {
    const recordId = citation.get('control_number');
    const title = citation.getIn(['titles', 0, 'title'], '');
    return (
      <Link to={`${LITERATURE}/${recordId}`}>
        <Latex>{title}</Latex>
      </Link>
    );
  }

  render() {
    const { citation } = this.props;
    const publicationInfo = citation.get('publication_info');
    const authors = citation.get('authors');
    const recordId = citation.get('control_number');
    const collaborations = citation.get('collaborations');
    const collaborationsWithSuffix = citation.get('collaborations_with_suffix');

    return (
      <List.Item>
        <List.Item.Meta
          title={CitationItem.renderTitle(citation)}
          description={
            <Fragment>
              <AuthorsAndCollaborations
                recordId={recordId}
                authors={authors}
                collaborations={collaborations}
                collaborationsWithSuffix={collaborationsWithSuffix}
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
