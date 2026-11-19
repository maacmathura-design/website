import React from 'react';
import { LuArrowRight } from 'react-icons/lu';
import { hero } from '../data/home';
import { showcaseCaption, showcaseItems, showcaseNote } from '../data/showcase';
import { ROUTES } from '../routes';
import { pageDescriptions, pageTitles } from '../data/seo';
import usePageMeta from '../hooks/usePageMeta';
import { useEnquiry } from '../components/enquiry/EnquiryProvider';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import PageHero from '../components/course/PageHero';
import PageNav from '../components/layout/PageNav';
import Section from '../components/home/Section';
import ArtworkGallery from '../components/showcase/ArtworkGallery';
import EnquirySection from '../components/home/EnquirySection';

const NAV = [
  { href: '#gallery', label: 'Gallery' },
  { href: '#enquire', label: 'Enquire' },
];

const ShowcasePage = () => {
  const { openEnquiry } = useEnquiry();
  usePageMeta({
    title: pageTitles[ROUTES.showcase],
    description: pageDescriptions[ROUTES.showcase],
    path: ROUTES.showcase,
    breadcrumbs: [
      { name: 'Home', path: ROUTES.home },
      { name: 'Student showcase', path: ROUTES.showcase },
    ],
  });

  return (
    <>
      <PageHero
        artwork={hero.slides.find((slide) => slide.id === 'game-design')}
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Student showcase' }]}
        eyebrow="Student showcase"
        title="Student showcase"
        description={showcaseNote}
      >
        <PrimaryButton onClick={() => openEnquiry()}>Enquire Now</PrimaryButton>
        <SecondaryButton href="#gallery">View the gallery</SecondaryButton>
      </PageHero>

      <PageNav links={NAV} />

      <Section
        id="gallery"
        eyebrow="Game design"
        title="Artwork from the MAAC network"
        description={`${showcaseNote} Select any piece to view it larger.`}
        action={
          <SecondaryButton to={ROUTES.gaming} icon={<LuArrowRight />}>
            Explore the Gaming programme
          </SecondaryButton>
        }
      >
        <ArtworkGallery items={showcaseItems} caption={showcaseCaption} />
      </Section>

      <EnquirySection title="Ask about the Gaming programme" defaultCourse="gaming" />
    </>
  );
};

export default ShowcasePage;
