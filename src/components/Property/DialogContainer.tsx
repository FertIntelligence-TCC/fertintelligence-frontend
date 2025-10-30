import { ReactNode } from "react";
import { Box, Flex } from "@chakra-ui/react";

type DialogContainerProps = {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
};

const DialogContainer = ({ isOpen, onClose, children }: DialogContainerProps) => {
    if (!isOpen) {
        return null;
    }

    return (
        <Flex
            position="fixed"
            inset={0}
            bg="blackAlpha.600"
            zIndex={1000}
            justify="center"
            align="center"
            p={4}
            onClick={onClose}
        >
            <Box
                w="full"
                maxW="lg"
                bg={{ base: "white", _dark: "gray.800" }}
                borderRadius="lg"
                boxShadow="2xl"
                p={6}
                onClick={(event) => event.stopPropagation()}
            >
                {children}
            </Box>
        </Flex>
    );
};

export default DialogContainer;
