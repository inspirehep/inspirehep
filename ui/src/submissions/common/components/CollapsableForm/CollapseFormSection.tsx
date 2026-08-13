import { ReactNode } from 'react';

interface CollapsableFormSectionProps {
  header?: ReactNode;
  children?: ReactNode;
  [prop: string]: unknown;
}

function CollapsableFormSection({ children }: CollapsableFormSectionProps) {
  return <>{children}</>;
}

export default CollapsableFormSection;
