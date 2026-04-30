
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseForm from '@/components/CourseForm';
import CourseList from '@/components/CourseList';
import CGPASummary from '@/components/CGPASummary';
import CGPAStats from '@/components/CGPAStats';
import ErrorBoundary from '@/components/ErrorBoundary';

const CGPACalculator = () => {
  // Scroll progress bar
  useEffect(() => {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : '0%';
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div id="scroll-progress" />
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow pt-24">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl font-bold text-center mb-3 animate-fade-in [animation-delay:100ms]">
            CGPA Calculator
          </h1>
          <p className="text-center text-muted-foreground mb-8 animate-fade-in [animation-delay:200ms]">
            Track your academic performance and calculate your Cumulative Grade Point Average
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 md:items-start">
            <div className="animate-fade-in [animation-delay:300ms] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl">
              <ErrorBoundary>
                <CourseForm />
              </ErrorBoundary>
            </div>
            <div className="animate-fade-in [animation-delay:450ms] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl">
              <ErrorBoundary>
                <CGPASummary />
              </ErrorBoundary>
            </div>
          </div>

          <div className="animate-fade-in [animation-delay:600ms] mb-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-xl">
            <ErrorBoundary>
              <CourseList />
            </ErrorBoundary>
          </div>

          <div className="animate-fade-in [animation-delay:700ms]">
            <h2 className="text-2xl font-bold mb-4">Statistics</h2>
            <ErrorBoundary>
              <CGPAStats />
            </ErrorBoundary>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CGPACalculator;
