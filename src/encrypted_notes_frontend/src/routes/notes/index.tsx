import { Box, Button, Flex, SimpleGrid, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import type { EncryptedNote } from '../../../../declarations/encrypted_notes_backend/encrypted_notes_backend.did';
import {
  DeleteItemDialog,
  Layout,
  NoteCard,
  NoteModal,
} from '../../components';
import { useDeviceCheck, useMessage } from '../../hooks';
import { useAuthContext } from '../../hooks/authContext';

export const Notes = () => {
  const {
    isOpen: isOpenDeleteDialog,
    onOpen: onOpenDeleteDialog,
    onClose: onCloseDeleteDialog,
  } = useDisclosure();
  const {
    isOpen: isOpenNoteModal,
    onOpen: onOpenNoteModal,
    onClose: onCloseNoteModal,
  } = useDisclosure();
  const navigate = useNavigate();

  const { auth, logout } = useAuthContext();
  const { isDeviceRemoved } = useDeviceCheck();
  const { showMessage } = useMessage();

  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [notes, setNotes] = useState<EncryptedNote[]>([]);
  const [currentNote, setCurrentNote] = useState<EncryptedNote | undefined>(
    undefined,
  );
  const [deleteId, setDeleteId] = useState<bigint | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

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

  const addNote = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }

    setIsLoading(true);

    try {
      // バックエンドキャニスターにノートを追加します。
      console.log('add note');
    } catch (err) {
      showMessage({
        title: 'Failed to add note',
        status: 'error',
      });
    } finally {
      onCloseNoteModal();
      setIsLoading(false);
    }
  };

  const deleteNote = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }

    setIsLoading(true);

    try {
      // ノートを削除します。
      console.log('delete note');
    } catch (err) {
      showMessage({
        title: 'Failed to delete note',
        status: 'error',
      });
    } finally {
      onCloseDeleteDialog();
      setIsLoading(false);
    }
  };

  const getNotes = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }

    try {
      // バックエンドキャニスターからノート一覧を取得します。
      setNotes([]);
    } catch (err) {
      showMessage({
        title: 'Failed to get notes',
        status: 'error',
      });
    }
  }

  const updateNote = async () => {
    if (auth.status !== 'SYNCED') {
      console.error(`CryptoService is not synced.`);
      return;
    }

    setIsLoading(true);

    try {
      // バックエンドキャニスターにノートを追加します。
      console.log('update note');
    } catch (err) {
      showMessage({
        title: 'Failed to update note',
        status: 'error',
      });
    } finally {
      onCloseNoteModal();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (auth.status === 'ANONYMOUS') {
      navigate('/');
    }
    if (auth.status === 'SYNCHRONIZING') {
      return;
    }
    (async () => {
      await getNotes();
    })();
  }, [auth.status]);

  if (auth.status === 'SYNCHRONIZING') {
    return (
      <Layout>
        <Box p={6} overflowY={'auto'} maxHeight={'calc(100vh - 64px)'}>
          Loading...
        </Box>
      </Layout>
    );
  }

  useEffect(() => {
    // 1秒ごとにポーリングします。
    const intervalId = window.setInterval(async () => {
      console.log('Check device data...');

      const isRemoved = await isDeviceRemoved();
      if (isRemoved) {
        try {
          await logout();
          showMessage({
            title: 'This device has been deleted.',
            status: 'info',
          });
          navigate('/');
        } catch (err) {
          showMessage({ title: 'Failed to logout', status: 'error' });
          console.error(err);
        }
      }
    }, 1000);

    // クリーンアップ関数を返します。
    return () => {
      clearInterval(intervalId);
    };
  }, [auth]);

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
        isLoading={isLoading}
        isOpen={isOpenNoteModal}
        onClose={onCloseNoteModal}
        title={mode === 'add' ? 'Add Note' : 'Edit Note'}
        currentNote={currentNote}
        setCurrentNote={setCurrentNote}
        handleSaveNote={mode === 'add' ? addNote : updateNote}
      />

      <DeleteItemDialog
        isLoading={isLoading}
        isOpen={isOpenDeleteDialog}
        onClose={onCloseDeleteDialog}
        title={`Delete Note`}
        handleDeleteItem={deleteNote}
      />
    </>
  );
};
