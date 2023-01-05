import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  IconButton,
  Input,
  InputRightElement,
  Stack,
  Textarea,
  useDisclosure
} from '@chakra-ui/react';
import { TbFolder, TbSettings } from 'react-icons/tb';

import React from 'react';
import RootContext from '../store';
import { SettingsItem } from './SettingsItem';
import { invoke } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { parseIpfsGateways } from '../scripts/ipfs';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Config {
  index_dir: string;
  ipfs_gateways: string;
}

interface TauriConfig {
  index_dir: string;
  ipfs_gateways: string[];
}

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
  const rootContext = React.useContext(RootContext);

  React.useEffect(() => {
    isOpen &&
      invoke('get_config').then((conf) => {
        const config = conf as TauriConfig;
        setValue('index_dir', config.index_dir, { shouldValidate: true });
        setValue('ipfs_gateways', config.ipfs_gateways.join('\n'), { shouldValidate: true });
        rootContext.setIpfsGateways(config.ipfs_gateways);
      });
  }, [isOpen]);

  const onSubmit = async (newConfig: Config) => {
    setSubmitting(true);

    const ipfsGateways: string[] = parseIpfsGateways(newConfig.ipfs_gateways);
    const tauriConfig = {
      ...newConfig,
      ipfs_gateways: ipfsGateways
    };
    await invoke('set_config', { newConfig: tauriConfig });
    rootContext.setIpfsGateways(ipfsGateways);
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
                  error={errors.index_dir?.message}
                  element={
                    <Input
                      {...register('index_dir', {
                        required: t('settings.index_dir_required') ?? true
                      })}
                      aria-invalid={errors.index_dir ? 'true' : 'false'}
                    />
                  }
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
                <SettingsItem
                  label={t('settings.ipfs_gateways')}
                  help={t('settings.ipfs_gateways_help') ?? undefined}
                  error={errors.ipfs_gateways?.message}
                  element={
                    <Textarea
                      {...register('ipfs_gateways')}
                      aria-invalid={errors.ipfs_gateways ? 'true' : 'false'}
                    />
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
