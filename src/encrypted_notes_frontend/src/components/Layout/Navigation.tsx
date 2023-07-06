import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { NavLink } from 'react-router-dom';

interface LinkItemProps {
  name: string;
  href: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Notes', href: '/notes' },
  { name: 'Devices', href: '/devices' },
];

const Navigation: FC = () => {
  return (
    <Box
      bg={'gray.100'}
      borderRight={'1px'}
      borderRightColor={'gray.200'}
      minH={'100vh'}
      minW={'20vh'}
    >
      <Stack as={'nav'}>
        {LinkItems.map((link) => (
          <NavLink
            key={link.href}
            to={link.href}
            style={({ isActive }) => {
              return {
                backgroundColor: isActive ? 'green' : '',
                color: isActive ? 'white' : 'black',
              };
            }}
          >
            <Flex align={'center'} p={4}>
              <Text fontSize={'2xl'}>{link.name}</Text>
            </Flex>
          </NavLink>
        ))}
      </Stack>
    </Box>
  );
};

export default Navigation;
