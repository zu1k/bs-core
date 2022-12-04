import { Box } from '@chakra-ui/react';
import React from 'react';

export interface FooterProps {
  children: React.ReactNode;
}

const Footer: React.FC<FooterProps> = ({ children }) => {
  return (
    <Box mt={2} mb={6} w="full" textAlign="center">
      {children}
    </Box>
  );
};

export default Footer;
