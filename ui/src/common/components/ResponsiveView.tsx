import useResponsiveCheck from '../hooks/useResponsiveCheck';

interface ResponsiveViewProps {
  min?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  max?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  render: () => React.JSX.Element;
}

function ResponsiveView({ min, max, render }: ResponsiveViewProps) {
  const shouldRender = useResponsiveCheck({ min, max });

  return shouldRender ? render() : null;
}

export default ResponsiveView;
