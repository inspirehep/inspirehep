import React from 'react';
import { Helmet } from 'react-helmet';

const DocumentHead = ({
  title,
  description,
  children,
}: {
  title: string | undefined;
  description?: string | undefined;
  children?: any;
}) => (
  <Helmet>
    <title>{title} - INSPIRE</title>
    {description && <meta name="description" content={description} />}
    {children}
  </Helmet>
);

export default DocumentHead;
