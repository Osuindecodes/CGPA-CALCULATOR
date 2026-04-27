
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseForm from '@/components/CourseForm';
import CourseList from '@/components/CourseList';
import CGPASummary from '@/components/CGPASummary';
import ErrorBoundary from '@/components/ErrorBoundary';

const CGPACalculator = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-3 animate-fade-in [animation-delay:100ms]">
            CGPA Calculator
          </h1>
          <p className="text-center text-muted-foreground mb-8 animate-fade-in [animation-delay:200ms]">
            Track your academic performance and calculate your Cumulative Grade Point Average
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="animate-fade-in [animation-delay:300ms]">
              <ErrorBoundary>
                <CourseForm />
              </ErrorBoundary>
            </div>
            <div className="animate-fade-in [animation-delay:450ms]">
              <ErrorBoundary>
                <CGPASummary />
              </ErrorBoundary>
            </div>
          </div>

          <div className="animate-fade-in [animation-delay:600ms]">
            <ErrorBoundary>
              <CourseList />
            </ErrorBoundary>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CGPACalculator;
