import {
  Button,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from '@chakra-ui/react';
import { FC } from 'react';

import type { EncryptedNote } from '../../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';

interface NoteModalProps {
  currentNote: EncryptedNote;
  isLoading: boolean;
  isOpen: boolean;
  title: string;
  handleSaveNote: () => void;
  onClose: () => void;
  setCurrentNote: (note: EncryptedNote) => void;
}

export const NoteModal: FC<NoteModalProps> = ({
  currentNote,
  isLoading,
  isOpen,
  title,
  handleSaveNote,
  onClose,
  setCurrentNote,
}) => {
  const safeCurrentNote = currentNote || { id: BigInt(0), data: '' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <Textarea
              placeholder="Write your note here..."
              value={safeCurrentNote.data}
              onChange={(e) =>
                setCurrentNote({
                  id: safeCurrentNote.id,
                  data: e.target.value,
                })
              }
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme={'blue'}
            mr={3}
            isLoading={isLoading}
            onClick={handleSaveNote}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
