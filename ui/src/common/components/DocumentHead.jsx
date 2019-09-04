import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

class DocumentHead extends Component {
  render() {
    const { title, description } = this.props;
    return (
      <Helmet>
        <title>{title} - INSPIRE</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
    );
  }
}

DocumentHead.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default DocumentHead;
