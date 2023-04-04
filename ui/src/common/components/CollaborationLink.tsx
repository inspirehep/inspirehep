import React from 'react';
import { Link } from 'react-router-dom';

import { LITERATURE } from '../routes';

const CollaborationLink = ({ children }: { children: string }) => {
  const link = `${LITERATURE}?q=collaboration:${children}`;
  return <Link to={link}>{children}</Link>;
};

export default CollaborationLink;
