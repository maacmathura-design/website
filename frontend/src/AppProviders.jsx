import React from 'react';
import { ThemeProvider } from './theme/ThemeProvider';
import { MotionProvider } from './motion/MotionProvider';
import { EnquiryProvider } from './components/enquiry/EnquiryProvider';

const AppProviders = ({ children }) => (
  <ThemeProvider>
    <MotionProvider>
      <EnquiryProvider>{children}</EnquiryProvider>
    </MotionProvider>
  </ThemeProvider>
);

export default AppProviders;
