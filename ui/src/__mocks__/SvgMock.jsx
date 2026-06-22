// Stub for all SVG imports in the test environment.
// Covers both patterns:
//   import { ReactComponent as Foo } from './icon.svg?react'
//   import Foo from './icon.svg?react'
const SvgMock = (props) => <svg {...props} />;
SvgMock.displayName = 'SvgMock';

export const ReactComponent = SvgMock;
export default SvgMock;
