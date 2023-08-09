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

import { EncryptedNote } from '../../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';

interface NoteCardProps {
  note: EncryptedNote;
  handleOpenDeleteDialog: (id: bigint) => void;
  handleOpenEditModal: (note: EncryptedNote) => void;
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
          <Text>{note.data}</Text>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter justifyContent={'flex-end'}>
        <ButtonGroup spacing={'2'}>
          <IconButton
            aria-label="Trash note"
            icon={<FiTrash2 />}
            onClick={() => handleOpenDeleteDialog(note.id)}
          />
          <IconButton
            aria-label="Edit note"
            icon={<FiEdit />}
            onClick={() => handleOpenEditModal(note)}
          />
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};
