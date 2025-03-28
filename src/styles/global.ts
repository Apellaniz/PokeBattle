import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      code: {
        fontFamily: 'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
      },
    },
  },
});

export default theme; 