import { Box, Flex, Icon } from '@chakra-ui/react';
import { FC } from 'react';
import { FiBookOpen } from 'react-icons/fi';

export const Header: FC = () => {
  return (
    <>
      <Box
        bg={'gray.100'}
        borderBottom={'1px'}
        borderBottomColor={'gray.200'}
        px={4}
        h={'64px'}
      >
        <Flex h={'64px'} alignItems={'center'} justifyContent={'space-between'}>
          <Box>
            <Icon as={FiBookOpen} boxSize={{ base: 8, lg: 12 }} />
          </Box>
          <Flex alignItems={'center'}></Flex>
        </Flex>
      </Box>
    </>
  );
};
