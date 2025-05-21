import React from 'react';
import { QuizProvider } from '@/contexts/QuizContext';
import PracticePage from './PracticePage';

const PracticePageWrapper: React.FC = () => {
  return (
    <QuizProvider>
      <PracticePage />
    </QuizProvider>
  );
};

export default PracticePageWrapper;