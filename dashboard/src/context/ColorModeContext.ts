import { createContext } from 'react';

/** Consumed by any component that needs the dark/light toggle. */
export const ColorModeContext = createContext({ toggleColorMode: () => {} });
