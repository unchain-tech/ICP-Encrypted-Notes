import { Card, CardBody, CardFooter, IconButton, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface DeviceCardProps {
  device: { alias: string; isCurrentDevice: boolean };
  handleOpenDeleteDialog: () => void;
}

export const DeviceCard: FC<DeviceCardProps> = ({
  device,
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
        <Text fontSize={{ base: 'sm', lg: 'xl' }}>{device.alias}</Text>
      </CardBody>
      <CardFooter>
        {device.isCurrentDevice ? (
          <Text as={'b'} color={'gray'} fontSize={{ base: 'sm', lg: 'xl' }}>
            This Device
          </Text>
        ) : (
          <IconButton
            aria-label={'Delete device'}
            icon={<FiTrash2 />}
            onClick={handleOpenDeleteDialog}
          />
        )}
      </CardFooter>
    </Card>
  );
};
