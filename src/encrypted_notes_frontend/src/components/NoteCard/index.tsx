import {
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FC } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';

interface NoteCardProps {
  note: string;
  handleOpenDeleteDialog: () => void;
  handleOpenEditModal: (note: string) => void;
}

export const NoteCard: FC<NoteCardProps> = ({
  note,
  handleOpenDeleteDialog,
  handleOpenEditModal,
}) => {
  return (
    <Card variant={'outline'}>
      <CardBody>
        <Stack mt={'6'} spacing={'3'}>
          <Text>{note}</Text>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter justifyContent={'flex-end'}>
        <ButtonGroup spacing={'2'}>
          <IconButton
            aria-label="Trash note"
            icon={<FiTrash2 />}
            onClick={handleOpenDeleteDialog}
          />
          <IconButton
            aria-label="Edit note"
            icon={<FiEdit />}
            onClick={() => {
              handleOpenEditModal(note);
            }}
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};
