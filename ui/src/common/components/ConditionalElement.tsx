import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ConditionalElementProps {
  children: ReactNode;
  condition: boolean;
  redirectTo: string;
}

function ConditionalElement({
  children,
  condition,
  redirectTo,
}: ConditionalElementProps) {
  return condition ? children : <Navigate to={redirectTo || '/'} replace />;
}

export default ConditionalElement;
