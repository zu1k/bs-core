import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react';

import { IoLanguage } from 'react-icons/io5';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitch: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label={t('nav.toggle_language') ?? ''}
        title={t('nav.toggle_language') ?? ''}
        icon={<Icon as={IoLanguage} boxSize={5} />}
        variant="ghost"
      />
      <MenuList>
        <MenuOptionGroup
          defaultValue={i18n.language}
          type="radio"
          onChange={(value) => i18n.changeLanguage(value as string)}
        >
          <MenuItemOption value="en">English</MenuItemOption>
          <MenuItemOption value="zh-CN">简体中文</MenuItemOption>
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};

export default LanguageSwitch;
