
import React, { useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseForm from '@/components/CourseForm';
import CourseList from '@/components/CourseList';
import CGPASummary from '@/components/CGPASummary';
import CGPAStats from '@/components/CGPAStats';
import ErrorBoundary from '@/components/ErrorBoundary';

const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

const useScrollProgress = () => {
  useEffect(() => {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
};

const CGPACalculator = () => {
  useScrollReveal();
  useScrollProgress();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scroll progress bar */}
      <div id="scroll-progress" />

      <Header />

      <main className="flex-grow pt-24 pb-12 overflow-hidden">

        {/* ── Hero section ── */}
        <section className="hero-bg relative dots-bg py-14 mb-10">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
            <div className="inline-block mb-4 animate-bounce-in">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 badge-pop">
                🎓 Academic Performance Tracker
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in [animation-delay:100ms] gradient-text leading-tight">
              CGPA Calculator
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto animate-fade-in [animation-delay:250ms] leading-relaxed">
              Track your academic performance across every semester and year.
              Calculate your Cumulative Grade Point Average instantly.
            </p>
            {/* Animated underline */}
            <div className="mt-6 flex justify-center animate-fade-in [animation-delay:400ms]">
              <div className="h-1 w-24 rounded-full bg-primary progress-bar" />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 max-w-4xl">

          {/* ── Form + Summary ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="reveal-left delay-100 card-glow rounded-xl">
              <ErrorBoundary>
                <CourseForm />
              </ErrorBoundary>
            </div>
            <div className="reveal-right delay-200 card-glow rounded-xl">
              <ErrorBoundary>
                <CGPASummary />
              </ErrorBoundary>
            </div>
          </div>

          {/* ── Section divider ── */}
          <div className="reveal flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
              Course List
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
          </div>

          {/* ── Course list ── */}
          <div className="reveal delay-100 card-glow rounded-xl mb-10">
            <ErrorBoundary>
              <CourseList />
            </ErrorBoundary>
          </div>

          {/* ── Statistics heading ── */}
          <div className="reveal flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
              Statistics
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
          </div>

          <div className="reveal delay-100">
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
