
import useResponsiveCheck from '../hooks/useResponsiveCheck';

type Props = {
    min?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    max?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    render: $TSFixMeFunction;
};

function ResponsiveView({ min, max, render }: Props) {
  const shouldRender = useResponsiveCheck({ min, max });

  return shouldRender ? render() : null;
}

export default ResponsiveView;
