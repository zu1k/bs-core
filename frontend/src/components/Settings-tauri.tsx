import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react';
import { TbFolder, TbHelp, TbSettings } from 'react-icons/tb';

import React from 'react';
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Config {
  index_dir: string;
}

interface SettingsItemProps extends InputProps {
  label: string;
  help?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const SettingsItem = React.forwardRef<HTMLInputElement, SettingsItemProps>(
  ({ label, help, error, leftElement, rightElement, ...props }, ref) => {
    console.log(label, error);
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
          <Input ref={ref} {...props} />
          {rightElement}
        </InputGroup>
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
    );
  }
);

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<Config>();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    isOpen &&
      invoke('get_config').then((conf) => {
        const config = conf as Config;
        setValue('index_dir', config.index_dir, { shouldValidate: true });
      });
  }, [isOpen]);

  const onSubmit = async (newConfig: Config) => {
    setSubmitting(true);
    await invoke('set_config', { newConfig });
    onClose();
    setSubmitting(false);
  };

  return (
    <>
      <IconButton
        ref={btnRef}
        aria-label={t('settings.title')}
        title={t('settings.title') ?? ''}
        icon={<Icon as={TbSettings} boxSize={5} />}
        onClick={onOpen}
        variant="ghost"
      />
      <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('settings.title')}</DrawerHeader>

          <DrawerBody>
            <form id="settings-form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <SettingsItem
                  label={t('settings.index_dir')}
                  help={t('settings.index_dir_help') ?? undefined}
                  {...register('index_dir', { required: t('settings.index_dir_required') ?? true })}
                  aria-invalid={errors.index_dir ? 'true' : 'false'}
                  error={errors.index_dir?.message}
                  rightElement={
                    <InputRightElement>
                      <IconButton
                        aria-label={t('settings.index_dir_browse')}
                        title={t('settings.index_dir_browse') ?? ''}
                        tabIndex={-1}
                        icon={<Icon as={TbFolder} />}
                        variant="unstyled"
                        pt={1}
                        onClick={async () => {
                          const selected = (await open({
                            defaultPath: watch('index_dir'),
                            directory: true,
                            multiple: false
                          })) as string | null;
                          if (selected) setValue('index_dir', selected, { shouldValidate: true });
                        }}
                      />
                    </InputRightElement>
                  }
                />
              </Stack>
            </form>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t('settings.cancel')}
            </Button>
            <Button colorScheme="blue" type="submit" form="settings-form" isLoading={submitting}>
              {t('settings.save')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Settings;
