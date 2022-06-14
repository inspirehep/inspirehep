import { useMemo } from 'react';

function isPresent(value: $TSFixMe) {
  return value != null && value !== '';
}

type Props = {
    dependencies: $TSFixMe[];
    children: React.ReactNode;
};

function RequireOneOf({ dependencies, children }: Props) {
  const isAtLeastOnePresent = useMemo(() => dependencies.some(isPresent), [
    dependencies,
  ]);
  return isAtLeastOnePresent ? children : null;
}

export default RequireOneOf;
