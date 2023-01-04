import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  InputGroup,
  InputProps,
  Text,
  Tooltip
} from '@chakra-ui/react';

import React from 'react';
import { TbHelp } from 'react-icons/tb';

export interface SettingsItemProps extends InputProps {
  label: string;
  help?: string;
  error?: string;
  element: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  help,
  error,
  element,
  leftElement,
  rightElement
}) => {
  return (
    <FormControl isInvalid={error ? true : false}>
      <FormLabel>
        {label}{' '}
        {help && (
          <Tooltip hasArrow label={help}>
            <Text as="span">
              <Icon as={TbHelp}></Icon>
            </Text>
          </Tooltip>
        )}
      </FormLabel>
      <InputGroup>
        {leftElement}
        {element}
        {rightElement}
      </InputGroup>
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
