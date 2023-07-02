import React, { useState } from 'react';
import { Button, useToast } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { Book } from '../scripts/searcher';
import autoDownload from '../scripts/download';
import { t } from 'i18next';

export interface IpfsDownloadButtonProps {
  book: Book;
  onlyIcon: boolean;
}

const IpfsDownloadButton: React.FC<IpfsDownloadButtonProps> = ({ book, onlyIcon }) => {
  const toast = useToast();
  const [downloadProgress, setDownloadProgress] = useState(-1);

  return (
    <Button
      key="auto_download"
      w="100%"
      zIndex={111}
      variant="outline"
      colorScheme="blue"
      leftIcon={onlyIcon ? undefined : <DownloadIcon />}
      isLoading={downloadProgress > -1}
      loadingText={`${downloadProgress}%`}
      onClick={(e) => {
        e.stopPropagation();
        autoDownload(book, toast, setDownloadProgress);
      }}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {onlyIcon ? <DownloadIcon /> : t('auto_download')}
    </Button>
  );
};

export default IpfsDownloadButton;
