
import React from 'react';
import { CGPAProvider } from '@/context/CGPAContext';
import CGPACalculator from './CGPACalculator';

const Index = () => {
  return (
    <CGPAProvider>
      <CGPACalculator />
    </CGPAProvider>
  );
};

export default Index;
