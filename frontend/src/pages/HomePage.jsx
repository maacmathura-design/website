import React from 'react';
import Hero from '../components/home/Hero';
import AboutSection from '../components/home/AboutSection';
import FeaturedCourses from '../components/home/FeaturedCourses';
import WhyMaac from '../components/home/WhyMaac';
import StudentShowcase from '../components/home/StudentShowcase';
import SoftwareSection from '../components/home/SoftwareSection';
import HowItWorks from '../components/home/HowItWorks';
import PlacementsSection from '../components/home/PlacementsSection';
import FaqSection from '../components/home/FaqSection';
import EnquirySection from '../components/home/EnquirySection';
import { ROUTES } from '../routes';
import { pageDescriptions, pageTitles } from '../data/seo';
import usePageMeta from '../hooks/usePageMeta';

const HomePage = () => {
  usePageMeta({
    title: pageTitles[ROUTES.home],
    description: pageDescriptions[ROUTES.home],
    path: ROUTES.home,
  });

  return (
    <>
      <Hero />
      <AboutSection />
      <FeaturedCourses />
      <WhyMaac />
      <StudentShowcase />
      <SoftwareSection />
      <HowItWorks />
      <PlacementsSection />
      <FaqSection />
      <EnquirySection />
    </>
  );
};

export default HomePage;
