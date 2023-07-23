import { Box, Button, Flex, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import type { ActorSubclass } from '@dfinity/agent';
import { FC, useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import type {
  _SERVICE,
  EncryptedNote,
} from '../../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';
import {
  DeleteItemDialog,
  Layout,
  NoteCard,
  NoteModal,
} from '../../components';

interface NotesProps {
  actor: ActorSubclass<_SERVICE>;
}

export const Notes: FC<NotesProps> = ({ actor }) => {
  const {
    isOpen: isOpenNoteModal,
    onOpen: onOpenNoteModal,
    onClose: onCloseNoteModal,
  } = useDisclosure();
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [notes, setNotes] = useState<EncryptedNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');

  const openAddNoteModal = () => {
    setMode('add');
    setCurrentNote('');
    onOpenNoteModal();
  };

  const openEditNoteModal = (note: string) => {
    setMode('edit');
    setCurrentNote(note);
    onOpenNoteModal();
  };

  const getNotes = async () => {
    try {
      const notes = await actor.getNotes();
      setNotes(notes);
    } catch (err) {
      console.error(err);
    }
  };

  const addNote = async () => {
    try {
      await actor.addNote(currentNote);
    } catch (err) {
      console.error(err);
    } finally {
      onCloseNoteModal();
      await getNotes();
    }
  };

  const editNote = () => {
    console.log('edit note');
    onCloseNoteModal();
  };

  const deleteNote = () => {
    console.log('delete note');
    onCloseDeleteDialog();
  };

  useEffect(() => {
    getNotes();
  }, []);

  return (
    <>
      <Layout>
        <Box p={6} overflowY={'auto'} maxHeight={'calc(100vh - 64px)'}>
          <Flex mb={6} justifyContent={'flex-end'}>
            <Button
              leftIcon={<FiPlus />}
              colorScheme={'green'}
              variant={'outline'}
              size={'lg'}
              borderWidth={'4px'}
              onClick={() => {
                openAddNoteModal();
              }}
            >
              New Note
            </Button>
          </Flex>
          <SimpleGrid
            spacing={4}
            templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
          >
            {notes.map((note, index) => (
              <NoteCard
                key={index}
                note={note.encrypted_text}
                handleOpenDeleteDialog={onOpenDeleteDialog}
                handleOpenEditModal={openEditNoteModal}
              />
            ))}
          </SimpleGrid>
        </Box>
      </Layout>

      <NoteModal
        isOpen={isOpenNoteModal}
        onClose={onCloseNoteModal}
        title={mode === 'add' ? 'Add Note' : 'Edit Note'}
        currentNote={currentNote}
        setCurrentNote={setCurrentNote}
        handleSaveNote={mode === 'add' ? addNote : editNote}
      />

      <DeleteItemDialog
        isOpen={isOpenDeleteDialog}
        onClose={onCloseDeleteDialog}
        title={`Delete Note`}
        handleDeleteItem={deleteNote}
      />
    </>
  );
};
