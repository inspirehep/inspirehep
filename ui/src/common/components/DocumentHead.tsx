import React, { Component } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Helmet } from 'react-helmet';

type Props = {
    title: string;
    description?: string;
};

class DocumentHead extends Component<Props> {

  render() {
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

export default DocumentHead;
