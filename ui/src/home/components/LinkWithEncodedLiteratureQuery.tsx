

import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { LITERATURE } from '../../common/routes';

export default class LinkWithEncodedLiteratureQuery extends Component {
    render() {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'query' does not exist on type 'Readonly<... Remove this comment to see the full error message
        const { query } = this.props;
        return (
            <Link to={`${LITERATURE}?q=${encodeURIComponent(query)}`}>{query}</Link>
        );
    }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
LinkWithEncodedLiteratureQuery.propTypes = {
  query: PropTypes.string.isRequired,
};
