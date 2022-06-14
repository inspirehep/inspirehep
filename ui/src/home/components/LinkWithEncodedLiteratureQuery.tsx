

import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Link } from 'react-router-dom';

import { LITERATURE } from '../../common/routes';

type Props = {
    query: string;
};

export default class LinkWithEncodedLiteratureQuery extends Component<Props> {

    render() {
        const { query } = this.props;
        return (
            <Link to={`${LITERATURE}?q=${encodeURIComponent(query)}`}>{query}</Link>
        );
    }
}
