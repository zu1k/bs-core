import { Box, Flex, Heading, Spacer, useColorMode } from '@chakra-ui/react';
import React, { useEffect } from 'react';

import { useInView } from 'react-intersection-observer';

export interface HeaderProps {
  title: string;
  children: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
  const { ref, inView } = useInView({ threshold: 0 });
  const [bgColor, setBgColor] = React.useState('transparent');
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!inView) {
      setBgColor(colorMode === 'light' ? 'white' : 'blue.900');
    } else {
      setBgColor('transparent');
    }
  }, [inView, colorMode]);

  return (
    <>
      <Flex
        px={{base: 4, md: 8}}
        py={3}
        mb={2}
        w="full"
        position="sticky"
        top={0}
        zIndex="sticky"
        transition="background-color 0.2s ease-in-out"
        bgColor={bgColor}
        boxShadow={!inView ? 'sm' : 'none'}
      >
        <Heading as="h1" fontSize="xl" my={2}>
          {title}
        </Heading>
        <Spacer />
        <Box>{children}</Box>
      </Flex>
      <Box ref={ref} />
    </>
  );
};

export default Header;
