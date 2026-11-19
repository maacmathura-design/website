import React from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { ROUTES } from '../../routes';
import { HOME_SECTIONS } from '../../data/home';
import { showcaseCaption, showcaseItems, showcaseNote } from '../../data/showcase';
import { SecondaryButton } from '../ui';
import ArtworkGallery from '../showcase/ArtworkGallery';
import Section from './Section';

const StudentShowcase = () => (
  <Section
    id={HOME_SECTIONS.showcase}
    tone="alt"
    eyebrow="Student showcase"
    title="Work from the MAAC game design programme"
    description={`${showcaseNote} Select any piece to view it larger.`}
    action={
      <SecondaryButton to={ROUTES.showcase} icon={<LuChevronRight />}>
        Open the showcase
      </SecondaryButton>
    }
  >
    <ArtworkGallery items={showcaseItems} caption={showcaseCaption} />
  </Section>
);

export default StudentShowcase;
