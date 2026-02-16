'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollFloat = ({
    children,
    scrollContainerRef,
    containerClassName = '',
    textClassName = '',
    animationDuration = 1,
    ease = 'back.inOut(2)',
    scrollStart = 'center bottom+=50%',
    scrollEnd = 'bottom bottom-=40%',
    stagger = 0.03,
}) => {
    const containerRef = useRef(null);

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';
        return text.split('').map((char, index) => (
            <span className="sf-char" key={index} style={{ display: 'inline-block' }}>
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    }, [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller =
            scrollContainerRef && scrollContainerRef.current
                ? scrollContainerRef.current
                : window;

        const charElements = el.querySelectorAll('.sf-char');

        const ctx = gsap.context(() => {
            gsap.fromTo(
                charElements,
                {
                    willChange: 'opacity, transform',
                    opacity: 0,
                    yPercent: 120,
                    scaleY: 2.3,
                    scaleX: 0.7,
                    transformOrigin: '50% 0%',
                },
                {
                    duration: animationDuration,
                    ease: ease,
                    opacity: 1,
                    yPercent: 0,
                    scaleY: 1,
                    scaleX: 1,
                    stagger: stagger,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: scrollStart,
                        end: scrollEnd,
                        scrub: true,
                    },
                }
            );
        }, el);

        return () => ctx.revert();
    }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

    return (
        <span
            ref={containerRef}
            className={containerClassName}
            style={{ overflow: 'hidden', display: 'inline-block' }}
        >
            <span
                className={textClassName}
                style={{ display: 'inline-block', lineHeight: 1.5 }}
            >
                {splitText}
            </span>
        </span>
    );
};

export default ScrollFloat;
