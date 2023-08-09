import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMessage } from '../../hooks';
import { useAuthContext } from '../../hooks/authContext';

export const Home: FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { showMessage } = useMessage();

  const handleLogin = async () => {
    try {
      await login();
      showMessage({
        title: 'Authentication succeeded',
        duration: 2000,
        status: 'success',
      });
      navigate('/notes');
    } catch (err) {
      showMessage({ title: 'Failed to authenticate', status: 'error' });
      console.error(err);
    }
  };

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      minHeight={'calc(100vh - 64px)'}
      px={{ base: '4', lg: '8' }}
    >
      <Heading
        as={'h1'}
        size={{ base: '2xl', lg: '4xl' }}
        fontWeight={'bold'}
        mb={'2rem'}
      >
        Encrypted Notes
      </Heading>
      <Text fontSize={'xl'} mb={'2rem'}>
        Please authenticate with Internet Identity.
      </Text>
      <Button
        colorScheme={'green'}
        size={{ base: 'sm', lg: 'lg' }}
        onClick={handleLogin}
      >
        Authenticate
      </Button>
    </Box>
  );
};
