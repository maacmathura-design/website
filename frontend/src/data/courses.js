// Single source of truth for course content. Course text is reproduced verbatim from the
// original pages. Where the original pages disagree, the course's own page wins and the other
// value is kept in `sourceVariants` and listed in `courseDataConflicts` for MAAC Mathura to
// confirm. Optional fields are only present when the original site had that information.
import { ROUTES } from '../routes';
import { showcaseItems } from './showcase';
import { courseFormats } from './bannerFormats';

import adobePhotoshopIcon from '../icons/adobe.png';
import adobePremiereIcon from '../icons/AdobePremiere.jpeg';
import adobeAuditionIcon from '../icons/adobeAudition.png';
import autodesk3dsMaxIcon from '../icons/Autodesk3dsMax.png';
import unityIcon from '../icons/Unity.png';
import googleSketchupIcon from '../icons/Google Sketchup.png';
import lumionIcon from '../icons/Lumion.png';
import zbrushIcon from '../icons/Zbrush.png';
import adobeSubstance3dPainterIcon from '../icons/AdobeSubstance3dPainter.png';
import autodeskMayaIcon from '../icons/AutodeskMaya.png';
import nukeIcon from '../icons/Nuke.png';
import mochaIcon from '../icons/Mocha.png';
import silhouetteIcon from '../icons/Silhouette.png';
import threeDEqualizerIcon from '../icons/3DEqualizer.png';
import blenderIcon from '../icons/Blender.png';
import vRayIcon from '../icons/V-Ray.jpeg';
import autodeskMudboxIcon from '../icons/AutodeskMudbox.jpeg';
import adobeAfterEffectsIcon from '../icons/AdobeAfterEffects.jpeg';
import fusionIcon from '../icons/Fusion.jpeg';
import cinema4dIcon from '../icons/Cinema4D.jpeg';
import realFlowIcon from '../icons/RealFlow.png';
import fumeFxIcon from '../icons/FumeFX.png';

import ad3dBanner from '../images/courses/ad3d.jpg';
import ad3dBannerSmall from '../images/courses/ad3d-960.jpg';
import advfxBanner from '../images/courses/advfx.jpg';
import advfxBannerSmall from '../images/courses/advfx-960.jpg';
import adidgpBanner from '../images/courses/adidgp.jpg';
import adidgpBannerSmall from '../images/courses/adidgp-960.jpg';
import apdmdBanner from '../images/courses/apdmd.jpg';
import apdmdBannerSmall from '../images/courses/apdmd-960.jpg';
import shortTermBanner from '../images/courses/short-term.jpg';
import shortTermBannerSmall from '../images/courses/short-term-960.jpg';
import moreCareerBanner from '../images/courses/more-career.jpg';
import moreCareerBannerSmall from '../images/courses/more-career-960.jpg';
import catalogueBanner from '../images/courses/catalogue.jpg';
import catalogueBannerSmall from '../images/courses/catalogue-960.jpg';

import modelingTexturingElective from '../images/electives/modeling-texturing.webp';
import lightingElective from '../images/electives/lighting.webp';
import animationElective from '../images/electives/animation.webp';

export const COURSE_CATEGORY = {
  advanced: 'advanced',
  shortTerm: 'short-term',
  moreCareer: 'more-career',
};

/* ------------------------------------------------------------------ software */

// Local logos keyed by the software names exactly as the original pages spell them.
const SOFTWARE_ICONS = {
  'Adobe Photoshop': adobePhotoshopIcon,
  'Adobe After Effects': adobeAfterEffectsIcon,
  'Adobe After Effect': adobeAfterEffectsIcon,
  'Adobe Premiere': adobePremiereIcon,
  'Adobe Audition': adobeAuditionIcon,
  'Adobe Substance 3d Painter': adobeSubstance3dPainterIcon,
  'Autodesk 3ds Max': autodesk3dsMaxIcon,
  'Autodesk Maya': autodeskMayaIcon,
  'Autodesk Mudbox': autodeskMudboxIcon,
  'Blackmagic Fusion': fusionIcon,
  Fusion: fusionIcon,
  Zbrush: zbrushIcon,
  'Mazon Zbrush': zbrushIcon,
  Unity: unityIcon,
  Nuke: nukeIcon,
  Mocha: mochaIcon,
  Silhouette: silhouetteIcon,
  '3D Equalizer': threeDEqualizerIcon,
  'Real Flow': realFlowIcon,
  'Fume FX': fumeFxIcon,
  'Cinema 4D': cinema4dIcon,
  Blender: blenderIcon,
  'V-Ray': vRayIcon,
  Lumion: lumionIcon,
  'Google Sketchup': googleSketchupIcon,
};

const softwareList = (...names) => names.map((name) => ({ name, icon: SOFTWARE_ICONS[name] ?? null }));

/* ---------------------------------------------------------------------- FAQs */

const ANIMATION_SCOPE_FAQ = {
  question: 'What is the scope of Animation?',
  answer:
    '3D Animation is employed in movies, Tv series, Ott, E-Commerce, Ad-Films, ELearning, Games, Architecture Visualization, Medical & other Training Simulation Programs, Product Designing, Augmented Reality & Virtual Reality Experiences and Much More.',
};

const CERTIFICATE_FAQ = {
  question: 'Is it degree or diploma?',
  answer:
    'All courses are certificate programs by MAAC. The primary goal of MAAC courses is making you skilled and providing 100% Job Placement Assistance.',
};

const GAMING_FAQS = [
  {
    question: 'Do you teach game development/coding in ADIDGP?',
    answer:
      'ADIDGP is a design first programme. Development/coding is touched upon wherever required to learn integration of design with real-time game play.',
  },
  {
    question: 'How can I make my own game?',
    answer:
      'Step by step guidance will be provided during the programme to help you design the game you dream of.',
  },
  {
    question: 'Is it too technical to learn Gaming courses?',
    answer:
      'Game designing is easier than it sounds, with the latest software like Unity and Unreal, game design can be learnt while MAAC trainers hold hands and take you through the course curriculum.',
  },
];

// Shown under "Student Works" on every original program page, including Gaming and APDMD.
const STUDENT_WORKS_INTRO = 'Sneak peek into creations from students studying 3D Animation with us.';

/* ---------------------------------------------------------- advanced programs */

const advancedProgramRecords = [
  {
    id: 'ad3d-edge-plus',
    code: 'AD3D Edge PLUS',
    title: 'AD3D Edge PLUS - Advanced Program in 3D Animation Design',
    discipline: '3D Animation',
    path: ROUTES.animation3d,
    duration: '24 Months',
    skillLevel: 'Advanced',
    description: [
      'Learn 3D animation from the best and discover what it takes to become a professional animator. Once you’ve mastered the foundational skills, you’ll get your characters interacting with their environment. Learn to design advanced animation sequences for international films and 3D projects.',
    ],
    learning: {
      intro:
        'Start from basics of animation and learn advanced 3D Animation softwares like AUTODESK MAYA, 3DS MAX, UNREAL Engine to master 3D Animation Design and Film Making',
    },
    careerHighlight: 'Learn to design advanced animation sequences for international films and 3D projects.',
    software: softwareList(
      'Adobe Photoshop',
      'Adobe After Effects',
      'Adobe Premiere',
      'Adobe Audition',
      'Autodesk 3ds Max',
      'Autodesk Maya',
      'Autodesk Mudbox',
      'Blackmagic Fusion',
      'Autodesk MotionBuilder',
      'Unreal Engine',
      'Adobe Substance 3d Painter',
      'Zbrush'
    ),
    electives: [
      { name: 'Modeling & Texturing', image: modelingTexturingElective },
      { name: 'Lighting', image: lightingElective },
      { name: '3D Animation', image: animationElective },
    ],
    faqs: [
      {
        question: 'Is it required to have good drawing skills to learn Animation?',
        answer:
          'Animation is as much a technical skill as creative, at MAAC you are taught to convert your imagination into creations using tools from basic to advanced. Hence, there is no necessary pre-requisition of drawing skills.',
      },
      ANIMATION_SCOPE_FAQ,
      CERTIFICATE_FAQ,
    ],
    artwork: { src: ad3dBanner, srcSmall: ad3dBannerSmall, ...courseFormats('ad3d'), focus: '50% 40%' },
    enquiry: { value: 'animation', label: '3D Animation – AD3D Edge PLUS' },
    sourceVariants: [{ source: ROUTES.courses, duration: '27 Months' }],
  },
  {
    id: 'advfx-plus',
    code: 'ADVFX PLUS',
    title: 'ADVFX PLUS - Advanced Program in Visual Effects Film Making',
    discipline: 'VFX',
    path: ROUTES.vfx,
    duration: '24 Months',
    skillLevel: 'Advanced',
    tagline: 'Be the VFX artist that makes an ordinary movie or a scene extraordinary with unparalleled visual effects!',
    description: [
      'Visual effects is an exciting field where no two days are the same! This course will walk you through the entire VFX production process step-by-step, give you plenty of hands-on experience, plus the confidence and job skills to pursue a career in the entertainment industry. Master not just the fundamentals, but also the advanced techniques of VFX artistry. Learn the latest tools & technologies and gain a thorough understanding of the new-age production workflow!',
    ],
    learning: {
      intro: 'Learn Visual Effects Design using popularly used industry software like NUKE, MOCHA, FUSION, HOUDINI.',
    },
    careerHighlight:
      'This course will walk you through the entire VFX production process step-by-step, give you plenty of hands-on experience, plus the confidence and job skills to pursue a career in the entertainment industry.',
    software: softwareList(
      'Adobe Photoshop',
      'Adobe After Effects',
      'Adobe Premiere',
      'Adobe Audition',
      'Autodesk 3ds Max',
      'Autodesk Maya',
      'Autodesk Mudbox',
      'Blackmagic Fusion',
      'Adobe Substance 3d Painter',
      'Silhouette',
      'Real Flow',
      'Nuke',
      'Mocha',
      '3D Equalizer',
      'Houdini',
      'Vue'
    ),
    faqs: [
      { question: 'Can I learn Animation & VFX both??', answer: 'Yes, ADVFX covers the best of both worlds' },
      ANIMATION_SCOPE_FAQ,
      CERTIFICATE_FAQ,
    ],
    artwork: { src: advfxBanner, srcSmall: advfxBannerSmall, ...courseFormats('advfx'), focus: '60% 40%' },
    enquiry: { value: 'vfx', label: 'VFX – ADVFX PLUS' },
    sourceVariants: [{ source: ROUTES.courses, duration: '27 Months' }],
  },
  {
    id: 'adidgp',
    code: 'ADIDGP',
    title: 'ADIDGP - Advanced Program in Interactive Game Design Plu',
    discipline: 'Gaming',
    path: ROUTES.gaming,
    duration: '24 Months',
    skillLevel: 'Advanced',
    description: [
      'The course offers dedicated modules for 2D Interactivity & Design Viz, Integration using Unity game engine for Augmented and Virtual Reality, Mobile Gaming development using Unity, Games level designing and development, and Game asset integration using Unreal game engine.',
      'ADIDGP course at MAAC makes you a pro in design visualization, character animation, digital sculpting, game asset creation, and augmented and virtual reality. These skills are high in-demand at the top studios who are constantly looking for all-round professionals who can deliver high quality.',
    ],
    learning: {
      topicsHeading: 'Dedicated modules',
      topics: [
        '2D Interactivity & Design Viz',
        'Integration using Unity game engine for Augmented and Virtual Reality',
        'Mobile Gaming development using Unity',
        'Games level designing and development',
        'Game asset integration using Unreal game engine',
      ],
      skills: [
        'design visualization',
        'character animation',
        'digital sculpting',
        'game asset creation',
        'augmented and virtual reality',
      ],
    },
    careerHighlight:
      'These skills are high in-demand at the top studios who are constantly looking for all-round professionals who can deliver high quality.',
    software: softwareList(
      'Adobe Photoshop',
      'Adobe Premiere',
      'Adobe Audition',
      'Autodesk Maya',
      'Autodesk MotionBuilder',
      'Adobe Substance 3d Painter',
      'Unity',
      'Unreal Engine',
      'Adobe Illustrator',
      'Adobe Animate CC',
      'Mazon Zbrush',
      'Marvellous Designer'
    ),
    faqs: GAMING_FAQS,
    studentWork: { sourceIntro: STUDENT_WORKS_INTRO, items: showcaseItems },
    artwork: { src: adidgpBanner, srcSmall: adidgpBannerSmall, ...courseFormats('adidgp'), focus: '40% 40%' },
    enquiry: { value: 'gaming', label: 'Gaming – ADIDGP' },
  },
  {
    id: 'apdmd',
    code: 'APDMD',
    title: 'APDMD - Advanced Program in Digital Media & Design',
    discipline: 'Web & Graphic Design',
    path: ROUTES.webGraphic,
    duration: '24 Months',
    skillLevel: 'Advanced',
    description: [
      'This is a holistic course that provides students with training in print, web, 2D animation and responsive web design. The latest industry trends such as digital production, augmented reality, and more enable them to create innovative pieces of digital communication. Advanced Program in Digital Media & Design (APDMD) provides a comprehensive, 360 degree learning opportunity for extensive job-oriented training in responsive web design, 2D animation and print.',
    ],
    learning: {
      topicsHeading: 'Training in',
      topics: ['print', 'web', '2D animation', 'responsive web design'],
    },
    careerHighlight:
      'Advanced Program in Digital Media & Design (APDMD) provides a comprehensive, 360 degree learning opportunity for extensive job-oriented training in responsive web design, 2D animation and print.',
    // Verbatim, including the duplicate Adobe Illustrator entry; see courseDataConflicts.
    software: softwareList(
      'Adobe Illustrator',
      'Adobe Photoshop',
      'Adobe InDesign',
      'Adobe Dreamweaver',
      'Autodesk Maya',
      'Autodesk MotionBuilder',
      'Adobe Substance 3d Painter',
      'Unity',
      'Unreal Engine',
      'Adobe Illustrator',
      'Adobe Animate CC',
      'Mazon Zbrush',
      'Marvellous Designer'
    ),
    faqs: GAMING_FAQS,
    artwork: { src: apdmdBanner, srcSmall: apdmdBannerSmall, ...courseFormats('apdmd'), focus: '50% 40%' },
    enquiry: { value: 'web_design', label: 'Web & Graphic Design – APDMD' },
  },
];

/* ------------------------------------------------- short-term and career courses */

const MAX_PRO_DESCRIPTION =
  'MAX Pro trains students in texturing, lighting, modeling, skinning and character set up. You will be introduced to 3ds Max software. The usage of latest software like 3d Max helps you understand the functioning of the animation industry and the kinds of tools and technologies used. The MAX Pro course at MAAC helps you learn the fundamentals of 3D World along with advanced areas like dynamics and animation. This is ideal in case you are looking for short-duration multimedia courses.';

const catalogCourseRecords = [
  {
    id: 'design-viz-pro',
    title: 'Design Viz Pro',
    duration: '7 Months',
    skillLevel: 'Intermediate',
    description: [
      'Design Viz Pro allows you to deep dive into design and visualization, from planning till execution. If you have strong visualization skills and love to play with the latest software, then this is the course for you. On successful completion of the animation course, you will be able to make a career in the animation industry, production houses, or architecture and engineering companies.',
    ],
    software: softwareList(
      'Adobe Photoshop',
      'Autodesk 3ds Max',
      'Unity',
      'Google Sketchup',
      'V-Ray',
      'Lumion',
      'Adobe Premiere',
      'Adobe Audition'
    ),
  },
  {
    id: 'maya-pro',
    title: 'Maya Pro',
    duration: '10 Months',
    skillLevel: 'Intermediate',
    description: [
      'MAYA Pro is one of the most sought after short-term courses at MAAC. It covers areas of animation including character animation, digital sculpting, and 3D design and modeling. Maya Pro takes you through the nuances of modeling, texturing, lighting, rigging, VFX and animation with the help of two advanced and industry-leading software, Maya and Mudbox. Maya Pro can be used for animation, environments, motion graphics, virtual reality, and character creation.',
    ],
    software: softwareList('Autodesk Maya', 'Adobe Substance 3d Painter', 'Zbrush'),
  },
  {
    id: 'max-pro-3ds-max',
    title: 'MAX PRO',
    variantLabel: '3ds Max',
    duration: '6 Months',
    skillLevel: 'Intermediate',
    description: [MAX_PRO_DESCRIPTION],
    software: softwareList('Autodesk 3ds Max', 'Autodesk Mudbox'),
  },
  {
    id: 'digital-filmmaking',
    title: 'DIGITAL FILMMAKING',
    duration: '6 Months',
    skillLevel: 'Intermediate',
    description: [
      'Short term digital filmmaking course is one of the most preferred introductory courses, where you can learn the basics and core areas of filmmaking, like pre-production techniques, linear editing, sound editing, and clay animation.',
    ],
    software: softwareList('Adobe Photoshop', 'Adobe After Effect', 'Adobe Audition', 'Adobe Premiere'),
  },
  {
    id: 'compositing-plus',
    title: 'COMPOSITING PLUS',
    duration: '7 Months',
    skillLevel: 'Intermediate',
    description: [
      'No film, TV or music video is complete without going through the process of compositing and editing. At this stage, different visual elements are placed together to create one scene or one sequence. The short-term Compositing Plus course at MAAC prepares you to excel in areas like digital design, match moving, rotoscopy, and camera tracking.',
    ],
    software: softwareList(
      'Adobe Photoshop',
      'Adobe After Effects',
      'Fusion',
      'Nuke',
      'Mocha',
      'Silhouette',
      '3D Equalizer'
    ),
  },
  {
    id: 'blender',
    title: 'Blender',
    duration: '6 Months',
    skillLevel: 'Intermediate',
    description: [
      'Blender is an open source 3D production software. You will learn to create 3D animation designs. Blender is widely used and gaining popularity in small and medium size studios producing for digital mediums.',
    ],
    software: softwareList('Blender'),
  },
  {
    id: 'max-pro-cinema-4d',
    title: 'MAX PRO',
    variantLabel: 'Cinema 4D',
    duration: '6 Months',
    skillLevel: 'Intermediate',
    description: [MAX_PRO_DESCRIPTION],
    software: softwareList('Cinema 4D'),
  },
  {
    id: 'd3d',
    title: 'D3D - Program in 3D Animation Filmmaking',
    duration: '18 Months',
    skillLevel: 'Advanced',
    description: [
      "It is a mix of imagination, creativity & technology. With MAAC's 3D Animation Film making course, a career course in 3D animation filmmaking, you will learn all the creative aspects of animation like pre-production, storyboarding, filmmaking and character animation. The 3D animation course prepares you to enter the professional world of 3D animation by providing you with extensive classroom and practical training, latest software and portfolio development.",
    ],
    software: softwareList(
      'Adobe Photoshop',
      'Autodesk 3ds Max',
      'Autodesk Maya',
      'Autodesk Mudbox',
      'Adobe After Effect',
      'Adobe Substance 3d Painter',
      'Adobe Premiere',
      'Adobe Audition'
    ),
  },
  {
    id: 'vfx-plus',
    title: 'VFX PLUS- Program in Visual Effects',
    duration: '18 Months',
    skillLevel: 'Advanced',
    description: [
      'VFX Plus is a professional course designed to train you in the latest visual effects software and techniques that are extensively used in filmmaking. From Bollywood movies like Baahubali, to Hollywood movies like Dawn of the Planet of the Apes and web series like Game of Thrones, all have massive use of Visual Effects. You will learn the fundamentals of digital designs, layer-based compositing, clean plate & wire removal, concepts of set extension & CG integration and match moving & camera tracking. All the aspects prepare you to work on high-end projects in an authentic studio environment.',
    ],
    software: softwareList(
      'Fusion',
      'Nuke',
      'Autodesk Mudbox',
      '3D Equalizer',
      'Real Flow',
      'Fume FX',
      'Adobe Photoshop',
      'Mocha',
      'Autodesk 3ds Max',
      'Adobe After Effect'
    ),
  },
  {
    id: 'apdmc',
    title: 'APDMC - Advanced Program in Digital Media Creation',
    duration: '18 Months',
    skillLevel: 'Advanced',
    description: [
      'Program in Digital Media Creation makes you an expert in building state-of-the-art print, web, and 3D animation content for different platforms and audiences. If you dream to work as a 3D Animator or a Communication Designer in a reputed company, then join Program in Digital Media Creation at MAAC now. The career course teaches you the fundamentals of drawing, concepts of design and illustration, concepts of web designing, and a lot more.',
    ],
    software: softwareList('Autodesk 3ds Max', 'Autodesk Mudbox', 'Adobe Photoshop', 'Adobe After Effect'),
  },
];

/* ---------------------------------------------------------------- categories */

const categoryRecords = [
  {
    id: COURSE_CATEGORY.advanced,
    title: 'Advanced Programmes',
    shortTitle: 'Advanced',
    description: 'Flagship programmes in 3D Animation, VFX, Gaming and Web & Graphic Design.',
    path: `${ROUTES.courses}?category=${COURSE_CATEGORY.advanced}`,
    courseIds: advancedProgramRecords.map((course) => course.id),
  },
  {
    id: COURSE_CATEGORY.shortTerm,
    title: 'Short-term Courses',
    shortTitle: 'Short-term',
    duration: 'Less than 12 months',
    skillLevel: 'Intermediate',
    description:
      'Maac offers a boutique of short-term courses, enabling students to kickstart their career with limited time or budget at their disposal. These short-term courses also train the student to be job ready at the end of their training period.',
    path: ROUTES.shortTerm,
    artwork: { src: shortTermBanner, srcSmall: shortTermBannerSmall, ...courseFormats('short-term'), focus: '70% 30%' },
    enquiry: { value: 'short_term', label: 'Short-term Courses' },
    courseIds: [
      'design-viz-pro',
      'maya-pro',
      'max-pro-3ds-max',
      'digital-filmmaking',
      'compositing-plus',
      'blender',
      'max-pro-cinema-4d',
    ],
  },
  {
    id: COURSE_CATEGORY.moreCareer,
    // Shown in capitals ("MORE CAREER COURSES") on the original page.
    title: 'More Career Courses',
    shortTitle: 'More career',
    duration: '12 to 20 Months',
    skillLevel: 'Advanced',
    description:
      'Learn core skills like Graphic Designing, Web Designing and get training in 3D Animation Design, study VFX, or Game Design.',
    path: ROUTES.moreCareer,
    artwork: { src: moreCareerBanner, srcSmall: moreCareerBannerSmall, ...courseFormats('more-career'), focus: '50% 40%' },
    enquiry: { value: 'more_career', label: 'More Career Courses' },
    courseIds: ['d3d', 'vfx-plus', 'apdmc', 'digital-filmmaking', 'compositing-plus', 'blender', 'max-pro-cinema-4d'],
  },
];

export const catalogueHero = {
  title: 'Courses at MAAC',
  description:
    'Choose from specialized courses giving in-depth knowledge to learn skills that prepare you for a successful career in the professional Media and Entertainment industry',
  artwork: { src: catalogueBanner, srcSmall: catalogueBannerSmall, ...courseFormats('catalogue'), focus: '50% 50%' },
};

/* ------------------------------------------------------------- assembled model */

const categoriesFor = (id) => categoryRecords.filter((category) => category.courseIds.includes(id)).map((c) => c.id);

const enquiryLabel = (course) => (course.variantLabel ? `${course.title} (${course.variantLabel})` : course.title);

export const courses = [
  ...advancedProgramRecords.map((course) => ({ ...course, categories: categoriesFor(course.id) })),
  ...catalogCourseRecords.map((course) => {
    const categories = categoriesFor(course.id);
    const home = categoryRecords.find((category) => category.id === categories[0]);
    return {
      ...course,
      categories,
      path: `${home.path}#${course.id}`,
      enquiry: { value: course.id, label: enquiryLabel(course) },
    };
  }),
];

const courseById = new Map(courses.map((course) => [course.id, course]));

export const getCourse = (id) => {
  const course = courseById.get(id);
  if (!course) throw new Error(`Unknown course: ${id}`);
  return course;
};

export const courseCategories = categoryRecords.map(({ courseIds, ...category }) => ({
  ...category,
  courses: courseIds.map(getCourse),
}));

export const getCategory = (id) => {
  const category = courseCategories.find((item) => item.id === id);
  if (!category) throw new Error(`Unknown course category: ${id}`);
  return category;
};

/** Where "View details" should go for a course listed under a given category. */
export const courseHref = (course, categoryId = course.categories[0]) =>
  categoryId === COURSE_CATEGORY.advanced ? course.path : `${getCategory(categoryId).path}#${course.id}`;

export const advancedPrograms = getCategory(COURSE_CATEGORY.advanced).courses;
export const shortTermCatalog = getCategory(COURSE_CATEGORY.shortTerm);
export const moreCareerCatalog = getCategory(COURSE_CATEGORY.moreCareer);

/** Software names in their original order, without repeating an entry listed twice. */
export const uniqueSoftware = (software) => [...new Map(software.map((item) => [item.name, item])).values()];

/* ------------------------------------------------------------------ enquiries */

// The backend receives `value` unchanged. The first four values predate the redesign.
export const enquiryCourseGroups = [
  {
    label: 'Advanced programmes',
    options: advancedPrograms.map((course) => course.enquiry),
  },
  {
    label: 'Short-term and career courses',
    options: courses
      .filter((course) => !course.categories.includes(COURSE_CATEGORY.advanced))
      .map((course) => course.enquiry),
  },
  {
    label: 'Not sure yet',
    options: [shortTermCatalog.enquiry, moreCareerCatalog.enquiry],
  },
];

export const enquiryCourseOptions = enquiryCourseGroups.flatMap((group) => group.options);

/**
 * The enquiry value for the page a visitor is on: the programme on a detail page, the linked
 * course (`#course-id`) or the category on a category page, otherwise undefined.
 */
export const enquiryCourseForPage = (pathname, hash = '') => {
  const program = advancedPrograms.find((course) => course.path === pathname);
  if (program) return program.enquiry.value;
  const category = [shortTermCatalog, moreCareerCatalog].find((item) => item.path === pathname);
  if (!category) return undefined;
  const linked = category.courses.find((course) => `#${course.id}` === decodeURIComponent(hash));
  return (linked || category).enquiry.value;
};

/* ---------------------------------------------------------- derived for home */

const uniqueBy = (items, key) => [...new Map(items.map((item) => [key(item), item])).values()];

export const programFaqs = uniqueBy(
  advancedPrograms.flatMap((program) => program.faqs),
  (faq) => faq.question
);

export const softwareWithLogos = uniqueBy(
  [...shortTermCatalog.courses, ...moreCareerCatalog.courses].flatMap((course) => course.software),
  (item) => item.icon
);

/* ------------------------------------------------------------ for MAAC review */

// Conflicts and gaps in the original content. Nothing here is rendered; it exists so the
// discrepancies stay next to the data until MAAC Mathura confirms the correct values.
export const courseDataConflicts = [
  {
    courses: ['ad3d-edge-plus', 'advfx-plus'],
    issue: 'Duration is "24 Months" on the program pages but "27 Months" in the /CoursePage overview.',
    resolution: 'Program page value shown.',
  },
  {
    courses: ['adidgp'],
    issue: 'Title ends in "Game Design Plu" (likely "Plus").',
    resolution: 'Shown as published.',
  },
  {
    courses: ['apdmd'],
    issue:
      'Uses the ADIDGP gaming FAQs, its software list mirrors the gaming list, and Adobe Illustrator is listed twice.',
    resolution: 'FAQs and software shown as published; the repeated Illustrator entry is displayed once.',
  },
  {
    courses: ['adidgp', 'apdmd'],
    issue: 'Software list spells ZBrush as "Mazon Zbrush".',
    resolution: 'Shown as published.',
  },
  {
    courses: ['advfx-plus'],
    issue: 'FAQ "What is the scope of Animation?" describes 3D animation rather than VFX.',
    resolution: 'Shown as published.',
  },
  {
    courses: ['max-pro-cinema-4d'],
    issue: 'Second "MAX PRO" card lists only Cinema 4D but repeats the 3ds Max description.',
    resolution: 'Shown as published; the enquiry form labels the two cards "MAX PRO (3ds Max)" and "MAX PRO (Cinema 4D)".',
  },
  {
    courses: ['digital-filmmaking', 'compositing-plus', 'blender', 'max-pro-cinema-4d'],
    issue:
      'Listed under both Short-term (less than 12 months, Intermediate) and More Career (12 to 20 months, Advanced); each card says 6–7 months, Intermediate.',
    resolution: 'Listed in both categories with the per-course duration and skill level.',
  },
  {
    courses: ['ad3d-edge-plus', 'advfx-plus', 'adidgp', 'apdmd'],
    issue:
      'Every program page introduces student work as "students studying 3D Animation". Only the ADIDGP gallery still exists online; the AD3D, ADVFX and APDMD galleries return 404.',
    resolution: 'Student work shown on the Gaming page only, with a neutral caption.',
  },
];
