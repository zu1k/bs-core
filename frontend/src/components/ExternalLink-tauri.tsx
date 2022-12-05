import { Link, LinkProps } from '@chakra-ui/react';

import React from 'react';
import { open } from '@tauri-apps/api/shell';

const ExternalLink = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  return (
    <Link
      {...props}
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        props.href && open(props.href);
      }}
    ></Link>
  );
});

export default ExternalLink;
