import { Card, CardBody, CardFooter, IconButton, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface DeviceCardProps {
  deviceAlias: string;
  isCurrentDevice: boolean;
  handleOpenDeleteDialog: (alias: string) => void;
}

export const DeviceCard: FC<DeviceCardProps> = ({
  deviceAlias,
  isCurrentDevice,
  handleOpenDeleteDialog,
}) => {
  return (
    <Card
      direction={{ base: 'column', lg: 'row' }}
      overflow="hidden"
      variant="outline"
      display={'inline-flex'}
    >
      <CardBody>
        <Text fontSize={{ base: 'sm', lg: 'xl' }}>{deviceAlias}</Text>
      </CardBody>
      <CardFooter>
        {isCurrentDevice ? (
          <Text as={'b'} color={'gray'} fontSize={{ base: 'sm', lg: 'xl' }}>
            This Device
          </Text>
        ) : (
          <IconButton
            aria-label={'Delete device'}
            icon={<FiTrash2 />}
            onClick={() => handleOpenDeleteDialog(deviceAlias)}
          />
        )}
      </CardFooter>
    </Card>
  );
};
