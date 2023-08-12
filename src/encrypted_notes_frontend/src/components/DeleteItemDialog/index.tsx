import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { FC, useRef } from 'react';

interface DeleteItemDialogProps {
  isLoading: boolean;
  isOpen: boolean;
  title: string;
  handleDeleteItem: () => void;
  onClose: () => void;
}

export const DeleteItemDialog: FC<DeleteItemDialogProps> = ({
  isLoading,
  isOpen,
  title,
  handleDeleteItem,
  onClose,
}) => {
  const cancelRef = useRef();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button ref={cancelRef} isDisabled={isLoading} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              isLoading={isLoading}
              onClick={handleDeleteItem}
              ml={3}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
