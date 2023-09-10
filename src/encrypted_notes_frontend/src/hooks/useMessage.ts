import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

type showMessageProps = {
  title: string;
  duration?: number | null;
  status: 'info' | 'warning' | 'success' | 'error';
};

export const useMessage = () => {
  const toast = useToast();

  const showMessage = useCallback(
    (props: showMessageProps) => {
      const { title, duration = null, status } = props;

      toast({
        title,
        status,
        position: 'top',
        duration: duration,
        isClosable: true,
      });
    },
    [toast],
  );

  return { showMessage };
};
