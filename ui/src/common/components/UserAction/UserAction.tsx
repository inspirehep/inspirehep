import './UserAction.less';

const UserActionWrapper = ({
  children,
}: {
  children: React.JSX.Element | React.JSX.Element[];
}) => <span className="__UserAction__">{children}</span>;

export default UserActionWrapper;
