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
  Stack,
  Textarea,
  useDisclosure
} from '@chakra-ui/react';

import React from 'react';
import RootContext from '../store';
import { SettingsItem } from './SettingsItem';
import { TbSettings } from 'react-icons/tb';
import { parseIpfsGateways } from '../scripts/ipfs';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Config {
  ipfs_gateways: string;
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
    if (isOpen) {
      const ipfsGateways: string[] = JSON.parse(localStorage.getItem('ipfs_gateways') || '[]');
      setValue('ipfs_gateways', ipfsGateways.join('\n'));
    }
  }, [isOpen]);

  const onSubmit = async (newConfig: Config) => {
    setSubmitting(true);

    const ipfsGateways: string[] = parseIpfsGateways(newConfig.ipfs_gateways);
    localStorage.setItem('ipfs_gateways', JSON.stringify(ipfsGateways));
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
