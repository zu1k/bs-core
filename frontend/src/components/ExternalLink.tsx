import { Link, LinkProps } from '@chakra-ui/react';
import React, { Suspense } from 'react';

const ExternalLinkInner =
  import.meta.env.VITE_TAURI === '1'
    ? React.lazy(() => import('./ExternalLink-tauri'))
    : React.Fragment;

const ExternalLink = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  if (import.meta.env.VITE_TAURI === '1')
    return (
      <Suspense fallback={<Link {...props} ref={ref} isExternal></Link>}>
        <ExternalLinkInner {...props} ref={ref} />
      </Suspense>
    );
  return <Link {...props} ref={ref} isExternal></Link>;
});

export default ExternalLink;
