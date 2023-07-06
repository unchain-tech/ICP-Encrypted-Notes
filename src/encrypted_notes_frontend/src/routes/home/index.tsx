import { Box, Button, Heading, Text } from '@chakra-ui/react';

export const Home = () => {
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
      <Button colorScheme={'green'} size={{ base: 'sm', lg: 'lg' }}>
        Authenticate
      </Button>
    </Box>
  );
};

export default Home;
