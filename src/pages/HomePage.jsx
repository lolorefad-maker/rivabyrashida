import React from 'react';
import Hero from '../components/Hero';
import TickerBar from '../components/TickerBar';
import PhilosophySection from '../components/PhilosophySection';
import FanCarousel from '../components/showcase/FanCarousel';
import CollectionGrid from '../components/CollectionGrid';
import ScrollIndex from '../components/showcase/ScrollIndex';
import BestsellersSection from '../components/BestsellersSection';
import TestimonialsSection from '../components/TestimonialsSection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TickerBar />
      <PhilosophySection />
      <CollectionGrid />
      <FanCarousel />
      <ScrollIndex />
      <BestsellersSection />
      <TestimonialsSection />
    </>
  );
}
