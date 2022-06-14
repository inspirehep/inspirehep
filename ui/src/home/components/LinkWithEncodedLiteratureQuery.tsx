

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { LITERATURE } from '../../common/routes';

export default class LinkWithEncodedLiteratureQuery extends Component {
    render() {
        const { query } = this.props;
        return (
            <Link to={`${LITERATURE}?q=${encodeURIComponent(query)}`}>{query}</Link>
        );
    }
}

LinkWithEncodedLiteratureQuery.propTypes = {
  query: PropTypes.string.isRequired,
};
