import React, { Component } from 'react';
// @ts-ignore
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

class DocumentHead extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'title' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { title, description, children } = this.props;
    return (
      <Helmet>
        <title>{title} - INSPIRE</title>
        {description && <meta name="description" content={description} />}
        {children}
      </Helmet>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
DocumentHead.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
};

export default DocumentHead;
