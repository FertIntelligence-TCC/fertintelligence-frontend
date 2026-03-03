import { Box, BoxProps } from "@chakra-ui/react";

export const Divider = (props: BoxProps) => {
  return (
    <Box
      as="hr"
      borderWidth="0"
      borderBottomWidth="1px"
      borderColor="gray.200"
      _dark={{ borderColor: "whiteAlpha.200" }}
      w="100%"
      my={4}
      {...props}
    />
  );
};