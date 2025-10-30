import { Button, Flex, Heading } from "@chakra-ui/react";
import DialogContainer from "./DialogContainer";
import PropertyFormFields from "./PropertyFormFields";
import { PropertyFormState } from "./types";

type PropertyFormDialogProps = {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    canSubmit: boolean;
    form: PropertyFormState;
    onFormChange: <Field extends keyof PropertyFormState>(
        field: Field,
        value: PropertyFormState[Field],
    ) => void;
    submitLabel?: string;
    cancelLabel?: string;
};

const PropertyFormDialog = ({
    title,
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    canSubmit,
    form,
    onFormChange,
    submitLabel = "Concluir",
    cancelLabel = "Cancelar",
}: PropertyFormDialogProps) => (
    <DialogContainer isOpen={isOpen} onClose={onClose}>
        <Heading as="h2" size="md" mb={4}>
            {title}
        </Heading>
        <PropertyFormFields form={form} onFormChange={onFormChange} />
        <Flex justify="flex-end" gap={3} mt={6}>
            <Button onClick={onClose} colorScheme="red" variant="outline">
                {cancelLabel}
            </Button>
            <Button
                colorScheme="green"
                onClick={onSubmit}
                loading={isSubmitting}
                disabled={!canSubmit}
            >
                {submitLabel}
            </Button>
        </Flex>
    </DialogContainer>
);

export default PropertyFormDialog;
