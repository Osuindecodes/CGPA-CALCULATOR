import { useEffect, useRef } from 'react';

interface Options {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>(
  options: Options = {}
) => {
  const ref = useRef<T>(null);
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('reveal-visible');
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return ref;
};
