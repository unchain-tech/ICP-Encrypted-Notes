import { Box, Button, Flex, Icon, Stack } from '@chakra-ui/react';
import { FC } from 'react';
import { FiBookOpen } from 'react-icons/fi';

const Header: FC = () => {
  return (
    <>
      <Box
        bg={'gray.100'}
        borderBottom={'1px'}
        borderBottomColor={'gray.200'}
        px={4}
      >
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Box>
            <Icon as={FiBookOpen} boxSize={{ base: 8, lg: 12 }} />
          </Box>
          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={7}>
              <Button colorScheme={'green'} size={{ base: 'sm', lg: 'lg' }}>Internet Identity</Button>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
};

export default Header;
