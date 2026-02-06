import React, { useState, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

const DashboardCarousel = ({ slides, autoPlayInterval = 8000 }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isPaused, slides.length, autoPlayInterval]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    if (!slides || slides.length === 0) return null;

    return (
        <div
            className="relative w-full h-[420px] md:h-[400px] group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides Container */}
            <div className="w-full h-full relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out transform
                            ${index === currentIndex ? 'opacity-100 translate-x-0' :
                                index < currentIndex ? 'opacity-0 -translate-x-full' :
                                    'opacity-0 translate-x-full'}
                        `}
                    >
                        {slide}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 border border-white/10 text-white opacity-60 hover:opacity-100 transition-opacity hover:bg-[#00d9ff]/20 hover:border-[#00d9ff]/50"
                    >
                        <MdChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 border border-white/10 text-white opacity-60 hover:opacity-100 transition-opacity hover:bg-[#00d9ff]/20 hover:border-[#00d9ff]/50"
                    >
                        <MdChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Pagination Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 
                                ${index === currentIndex ? 'w-8 bg-[#00d9ff]' : 'bg-white/30 hover:bg-white/50'}
                            `}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardCarousel;
