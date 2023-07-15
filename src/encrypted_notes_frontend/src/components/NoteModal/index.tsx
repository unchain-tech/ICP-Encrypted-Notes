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

interface NoteModalProps {
  currentNote: string;
  isOpen: boolean;
  title: string;
  handleSaveNote: () => void;
  onClose: () => void;
  setCurrentNote: (note: string) => void;
}

export const NoteModal: FC<NoteModalProps> = ({
  currentNote,
  isOpen,
  title,
  handleSaveNote,
  onClose,
  setCurrentNote,
}) => {
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
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme={'blue'} mr={3} onClick={handleSaveNote}>
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
