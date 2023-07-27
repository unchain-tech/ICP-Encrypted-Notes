import { Box, Button, Flex, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import type { ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { FC, useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { NavigateFunction, useNavigate } from 'react-router-dom';

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
import { useDeviceCheck } from '../../hooks';
import { CryptoService } from '../../lib/cryptoService';

interface NotesProps {
  actor: ActorSubclass<_SERVICE>;
  client: AuthClient;
  cryptoService: CryptoService;
  checkAuthenticated: (navigate: NavigateFunction) => Promise<void>;
}

export const Notes: FC<NotesProps> = ({
  actor,
  client,
  cryptoService,
  checkAuthenticated,
}) => {
  const navigate = useNavigate();
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
  const [currentNote, setCurrentNote] = useState<EncryptedNote | undefined>(
    undefined,
  );
  const [deleteId, setDeleteId] = useState<bigint | undefined>(undefined);

  useDeviceCheck(actor, client, cryptoService);

  const openAddNoteModal = () => {
    setMode('add');
    setCurrentNote(undefined);
    onOpenNoteModal();
  };

  const openEditNoteModal = (note: EncryptedNote) => {
    setMode('edit');
    setCurrentNote(note);
    onOpenNoteModal();
  };

  const openDeleteDialog = (id: bigint) => {
    setDeleteId(id);
    onOpenDeleteDialog();
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
      await actor.addNote(currentNote.encrypted_text);
    } catch (err) {
      console.error(err);
    } finally {
      onCloseNoteModal();
      await getNotes();
    }
  };

  const updateNote = async () => {
    try {
      await actor.updateNote(currentNote);
    } catch (err) {
      console.error(err);
    } finally {
      onCloseNoteModal();
      await getNotes();
    }
  };

  const deleteNote = async () => {
    try {
      await actor.deleteNote(deleteId);
    } catch (err) {
      console.error(err);
    } finally {
      onCloseDeleteDialog();
      await getNotes();
    }
  };

  useEffect(() => {
    checkAuthenticated(navigate);
  }, []);

  useEffect(() => {
    (async () => {
      if (actor) {
        await getNotes();
      }
    })();
  }, [actor]);

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
                note={note}
                handleOpenDeleteDialog={openDeleteDialog}
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
        handleSaveNote={mode === 'add' ? addNote : updateNote}
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
