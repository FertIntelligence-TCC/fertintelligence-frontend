import { chakra } from "@chakra-ui/react";

export const SelectElement = chakra("select");

export const commonFieldStyles = {
    bg: "white",
    borderColor: "gray.300",
    borderWidth: "1px",
    borderRadius: "md",
    _hover: { borderColor: "gray.400" },
    _focus: { borderColor: "green.500", boxShadow: "0 0 0 1px var(--chakra-colors-green-500)" },
    _dark: { bg: "gray.800", borderColor: "gray.600", color: "white" },
    _disabled: { 
        opacity: 1, 
        cursor: "not-allowed", 
        bg: "gray.100", 
        color: "gray.700",
        borderColor: "gray.300",
        _dark: { bg: "gray.700", color: "gray.300", borderColor: "gray.600" }
    },
    _readOnly: {
        opacity: 1, 
        cursor: "not-allowed", 
        bg: "gray.100",
        color: "gray.700",
        _dark: { bg: "gray.700", color: "gray.300" }
    }
};

export const selectFieldStyles = { 
    ...commonFieldStyles, 
    px: 3, 
    py: 2, 
    cursor: "pointer" 
};

export const headerCellStyles = {
    bg: "gray.100",
    _dark: { bg: "gray.700", color: "gray.200", borderColor: "gray.600" }
};

export const sectionHeaderStyles = {
    bg: "gray.200",
    fontWeight: "bold",
    pt: 3, 
    pb: 3,
    _dark: { bg: "gray.600", color: "white", borderColor: "gray.500" }
};