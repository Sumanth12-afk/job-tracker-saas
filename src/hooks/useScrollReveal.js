'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollReveal — animate elements on scroll using GSAP ScrollTrigger.
 * Returns a ref to attach to a container; all children with [data-reveal]
 * will animate in when scrolled into view.
 */
export default function useScrollReveal() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const elements = containerRef.current.querySelectorAll('[data-reveal]');

        elements.forEach((el) => {
            gsap.set(el, { opacity: 0, y: 50 });

            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    end: 'top 50%',
                    toggleActions: 'play none none none',
                },
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    return containerRef;
}
