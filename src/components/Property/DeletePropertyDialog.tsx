import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import DialogContainer from "./DialogContainer";

type DeletePropertyDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
};

const DeletePropertyDialog = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}: DeletePropertyDialogProps) => (
    <DialogContainer isOpen={isOpen} onClose={onClose}>
        <Heading as="h2" size="md" mb={4}>
            Quer deletar essa propriedade?
        </Heading>
        <Text>Essa ação não poderá ser desfeita. Deseja continuar?</Text>
        <Flex justify="flex-end" gap={3} mt={6}>
            <Button onClick={onClose} colorScheme="green" variant="outline">
                Não
            </Button>
            <Button colorScheme="red" onClick={onConfirm} loading={isDeleting}>
                Sim
            </Button>
        </Flex>
    </DialogContainer>
);

export default DeletePropertyDialog;