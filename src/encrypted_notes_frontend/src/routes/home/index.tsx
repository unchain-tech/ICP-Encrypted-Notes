import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMessage } from '../../hooks';
import { useAuthContext } from '../../hooks/authContext';

export const Home = () => {
  const navigate = useNavigate();

  const { login } = useAuthContext();
  const { showMessage } = useMessage();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        isLoading={isLoading}
        size={{ base: 'sm', lg: 'lg' }}
        onClick={handleLogin}
      >
        Login with Internet Identity
      </Button>
    </Box>
  );
};
