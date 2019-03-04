import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { List } from 'antd';
import { Link } from 'react-router-dom';

import AuthorsAndCollaborations from './AuthorsAndCollaborations';
import PublicationInfoList from './PublicationInfoList';
import { LITERATURE } from '../routes';
import LiteratureTitle from './LiteratureTitle';

class CitationItem extends Component {
  static renderTitle(citation) {
    const recordId = citation.get('control_number');
    const title = citation.getIn(['titles', 0]);
    return (
      <Link to={`${LITERATURE}/${recordId}`}>
        <LiteratureTitle title={title} />
      </Link>
    );
  }

  render() {
    const { citation } = this.props;
    const publicationInfo = citation.get('publication_info');
    const authors = citation.get('authors');
    const collaborations = citation.get('collaborations');
    const collaborationsWithSuffix = citation.get('collaborations_with_suffix');

    return (
      <List.Item>
        <List.Item.Meta
          title={CitationItem.renderTitle(citation)}
          description={
            <Fragment>
              <AuthorsAndCollaborations
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
