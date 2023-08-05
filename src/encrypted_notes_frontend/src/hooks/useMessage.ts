import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

type showMessageProps = {
  title: string;
  status: 'info' | 'warning' | 'success' | 'error';
};

export const useMessage = () => {
  const toast = useToast();

  const showMessage = useCallback(
    (props: showMessageProps) => {
      const { title, status } = props;

      toast({
        title,
        status,
        position: 'top',
        duration: 2000,
        isClosable: true,
      });
    },
    [toast],
  );

  return { showMessage };
};
