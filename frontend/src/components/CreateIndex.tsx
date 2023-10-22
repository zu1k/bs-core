import {
  Button,
  Icon,
  IconButton,
  Input,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Stack,
  Select,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { TbFolder } from 'react-icons/tb';

import React from 'react';
import { invoke } from '@tauri-apps/api/primitives';
import { open } from '@tauri-apps/plugin-dialog';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SettingsItem } from './SettingsItem';

interface CreateIndexConfig {
  raw_files: string[] | string;
  compressor: string;
}

const CreateIndex: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [submitting, setSubmitting] = React.useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<CreateIndexConfig>();

  const toast = useToast();

  const onSubmit = handleSubmit(async (newConfig: CreateIndexConfig) => {
    setSubmitting(true);
    if (typeof newConfig.raw_files === 'string') {
      newConfig.raw_files = newConfig.raw_files.split(/,/g);
    }
    try {
      await invoke('create_index', { createIndexConfig: newConfig });
      onClose();
      toast({
        title: t('settings.indexing.success'),
        status: 'success',
        duration: 2000,
        position: 'top',
        isClosable: true
      });
    } catch (e) {}
    setSubmitting(false);
  });

  return (
    <>
      <Button colorScheme="green" mr={3} onClick={onOpen} width={'auto'}>
        {t('settings.indexing.title')}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('settings.indexing.title')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4}>
              <SettingsItem
                label={t('settings.indexing.raw_files')}
                help={t('settings.indexing.raw_files_help') ?? undefined}
                error={errors.raw_files?.message}
                element={
                  <Input
                    {...register('raw_files', {
                      required: t('settings.indexing.raw_files_required') ?? true
                    })}
                    aria-invalid={errors.raw_files ? 'true' : 'false'}
                  />
                }
                rightElement={
                  <InputRightElement>
                    <IconButton
                      aria-label={t('settings.index_dir_browse')}
                      title={t('settings.raw_files_browse') ?? ''}
                      tabIndex={-1}
                      icon={<Icon as={TbFolder} />}
                      variant="unstyled"
                      pt={1}
                      onClick={async () => {
                        const selected = await open({
                          directory: false,
                          multiple: true
                        });
                        if (selected)
                          setValue(
                            'raw_files',
                            selected.map((s) => s.path),
                            { shouldValidate: true }
                          );
                      }}
                    />
                  </InputRightElement>
                }
              />
              <SettingsItem
                label={t('settings.indexing.compressor')}
                help={t('settings.indexing.compresser_help') ?? undefined}
                error={errors.compressor?.message}
                element={
                  <Select
                    {...register('compressor')}
                    aria-invalid={errors.compressor ? 'true' : 'false'}
                  >
                    <option selected>none</option>
                    <option>lz4</option>
                    <option>zstd</option>
                  </Select>
                }
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t('settings.indexing.cancel')}
            </Button>
            <Button colorScheme="blue" isLoading={submitting} onClick={onSubmit}>
              {t('settings.indexing.create')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateIndex;
