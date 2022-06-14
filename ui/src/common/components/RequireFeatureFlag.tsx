

import { getConfigFor } from '../config';

type Props = {
    flag: string;
    children: React.ReactNode;
    whenDisabled?: React.ReactNode;
};

function RequireFeatureFlag({ flag, children, whenDisabled = null }: Props) {
  const isEnabled = getConfigFor(flag);
  return isEnabled ? children : whenDisabled;
}

export default RequireFeatureFlag;
