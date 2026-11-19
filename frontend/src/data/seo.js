import { ROUTES } from '../routes';
import { phone } from './site';
import { showcaseNote } from './showcase';

/**
 * Document titles and descriptions. Visible page headings stay as published;
 * these strings are only for the document head. Each description names Mathura once.
 */
export const pageTitles = {
  [ROUTES.home]: 'MAAC Mathura',
  [ROUTES.about]: 'About',
  [ROUTES.courses]: 'Courses',
  [ROUTES.animation3d]: '3D animation courses',
  [ROUTES.vfx]: 'VFX courses',
  [ROUTES.gaming]: 'Game design courses',
  [ROUTES.webGraphic]: 'Web and graphic design courses',
  [ROUTES.shortTerm]: 'Short-term courses',
  [ROUTES.moreCareer]: 'Career courses',
  [ROUTES.showcase]: 'Student showcase',
  [ROUTES.placement]: 'Placements',
  [ROUTES.contact]: 'Contact',
};

export const pageDescriptions = {
  [ROUTES.home]:
    'MAAC Mathura teaches animation, VFX, game design and digital design. Explore the programmes and send an admission enquiry.',
  [ROUTES.about]:
    'About MAAC Mathura, the centre teaching MAAC programmes in animation, VFX, gaming and design.',
  [ROUTES.courses]:
    'Animation, VFX, game design and digital design courses at MAAC Mathura.',
  [ROUTES.animation3d]:
    '3D animation courses at MAAC Mathura. AD3D Edge PLUS is the advanced 3D animation programme.',
  [ROUTES.vfx]:
    'VFX courses at MAAC Mathura. ADVFX PLUS is the advanced visual effects programme.',
  [ROUTES.gaming]:
    'Game design courses at MAAC Mathura. ADIDGP is the advanced interactive game design programme.',
  [ROUTES.webGraphic]:
    'Web and graphic design courses at MAAC Mathura. APDMD covers print, web and 2D animation.',
  [ROUTES.shortTerm]:
    'Short-term courses at MAAC Mathura in animation, visual effects and digital design.',
  [ROUTES.moreCareer]:
    'Career courses at MAAC Mathura in animation, visual effects and digital media.',
  [ROUTES.showcase]: showcaseNote,
  [ROUTES.placement]:
    'Placement assistance at MAAC Mathura. Individual placement is not guaranteed.',
  [ROUTES.contact]:
    `Call or WhatsApp MAAC Mathura on ${phone.display}, or send an admission enquiry.`,
};
