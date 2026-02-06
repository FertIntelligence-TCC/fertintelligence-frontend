import { Button as ChakraButton } from "@chakra-ui/react"
import type { ButtonProps } from "@chakra-ui/react"
import * as React from "react"

export type { ButtonProps }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    return <ChakraButton ref={ref} {...props} />
  }
)