import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';

function CollaborationLogo({
  href,
  name,
  src,
}: {
  href: string;
  name: string;
  src: string;
}) {
  return (
    <LinkWithTargetBlank href={href}>
      <img height={40} src={src} alt={name} />
    </LinkWithTargetBlank>
  );
}

export default CollaborationLogo;
