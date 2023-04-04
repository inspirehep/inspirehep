import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { LITERATURE } from '../routes';

const CollaborationLink = ({children}: {children: string}) => {
  const collaboration = children;
  const link = `${LITERATURE}?q=collaboration:${collaboration}`;
  return <Link to={link}>{collaboration}</Link>;
}


export default CollaborationLink;
