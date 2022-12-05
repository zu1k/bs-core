import {
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useControllableState
} from '@chakra-ui/react';

import React from 'react';
import { TbCircleX } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';

interface SearchInputProps {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder, icon, value, onChange }) => {
  const [controlledValue, setControlledValue] = useControllableState({
    value,
    onChange,
    defaultValue: ''
  });
  const { t } = useTranslation();

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none" children={icon} />
      <Input
        type="text"
        aria-label={placeholder}
        placeholder={placeholder}
        value={controlledValue}
        onChange={(e) => setControlledValue(e.target.value)}
      />
      <InputRightElement>
        {value === '' ? null : (
          <IconButton
            aria-label={t('input.clear')}
            tabIndex={-1}
            title={t('input.clear') ?? ''}
            icon={<Icon as={TbCircleX} color="GrayText" />}
            variant="unstyled"
            onClick={() => setControlledValue('')}
          />
        )}
      </InputRightElement>
    </InputGroup>
  );
};

export default SearchInput;
