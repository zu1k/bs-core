import { Icon, IconButton, useColorMode } from '@chakra-ui/react';
import { TbMoon, TbSun } from 'react-icons/tb';

import React from 'react';
import { useTranslation } from 'react-i18next';

const ColorModeSwitch: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { t } = useTranslation();

  return (
    <IconButton
      aria-label={colorMode === 'light' ? t('nav.toggle_dark') : t('nav.toggle_light')}
      title={(colorMode === 'light' ? t('nav.toggle_dark') : t('nav.toggle_light')) ?? ''}
      icon={
        colorMode === 'light' ? <Icon as={TbSun} boxSize={5} /> : <Icon as={TbMoon} boxSize={5} />
      }
      onClick={toggleColorMode}
      variant="ghost"
    />
  );
};

export default ColorModeSwitch;
