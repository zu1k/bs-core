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
import { ChakraStylesConfig, CreatableSelect, chakraComponents } from 'chakra-react-select';

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

interface SearchSelectProps {
  icon: React.ReactNode;
  placeholder: string;
  value?: string;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
}

const SearchSelect: React.FC<SearchSelectProps> = ({
  placeholder,
  icon,
  value,
  options,
  onChange
}) => {
  const [controlledValue, setControlledValue] = useControllableState({
    value,
    onChange
  });

  const { t } = useTranslation();

  const chakraStyles: ChakraStylesConfig = {
    container: (provided) => ({
      ...provided,
      w: '100%'
    }),
    valueContainer: (provided) => ({
      ...provided,
      paddingInlineStart: '38px'
    })
  };

  const components = {
    ClearIndicator: (props: any) => (
      <chakraComponents.ClearIndicator {...props}>
        <Icon as={TbCircleX} color="GrayText" w={4} h={4} />
      </chakraComponents.ClearIndicator>
    ),
    IndicatorSeparator: () => null,
    DropdownIndicator: () => null
  };

  return (
    <InputGroup isolation="auto">
      <InputLeftElement pointerEvents="none" children={icon} zIndex={0} />
      <CreatableSelect
        isMulti
        name={placeholder}
        placeholder={placeholder}
        aria-label={placeholder}
        closeMenuOnSelect={false}
        chakraStyles={chakraStyles}
        components={components}
        options={options}
        onChange={(newValue) => {
          const value = newValue.map((v) => (v as { value: string }).value).join(' ');
          setControlledValue(value);
        }}
      />
    </InputGroup>
  );
};

export { SearchInput, SearchSelect };
