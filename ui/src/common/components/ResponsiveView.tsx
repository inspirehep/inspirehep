import PropTypes from 'prop-types';
import useResponsiveCheck, {
  MinSize,
  MaxSize,
} from '../hooks/useResponsiveCheck';

function ResponsiveView({
  min,
  max,
  render,
}: {
  render: Function;
  min?: MinSize;
  max?: MaxSize;
}) {
  const shouldRender = useResponsiveCheck({ min, max });

  return shouldRender ? render() : null;
}

ResponsiveView.propTypes = {
  min: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'xxl']),
  max: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  render: PropTypes.func.isRequired,
};

export default ResponsiveView;
