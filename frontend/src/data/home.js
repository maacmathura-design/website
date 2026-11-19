import { LuGraduationCap, LuLayers, LuMonitor, LuSparkles } from 'react-icons/lu';
import { ROUTES } from '../routes';
import { advancedPrograms, moreCareerCatalog, shortTermCatalog } from './courses';
import { heroFormats } from './bannerFormats';
import animationHero from '../images/hero/animation.jpg';
import animationHeroSmall from '../images/hero/animation-480.jpg';
import vfxHero from '../images/hero/vfx.jpg';
import vfxHeroSmall from '../images/hero/vfx-480.jpg';
import gameHero from '../images/hero/game-design.jpg';
import gameHeroSmall from '../images/hero/game-design-480.jpg';
import multimediaHero from '../images/hero/multimedia.jpg';
import multimediaHeroSmall from '../images/hero/multimedia-480.jpg';
import animationVideo from '../videos/video1.mp4';
import vfxVideo from '../videos/video2.mp4';
import gamingVideo from '../videos/video3.mp4';
import webGraphicVideo from '../videos/video4.mp4';
import moreCareerVideo from '../videos/video5.mp4';
import shortTermVideo from '../videos/video6.mp4';
import enquireStep from '../images/img1.png';
import enrollStep from '../images/img2.png';
import attendStep from '../images/img3.png';
import participateStep from '../images/img4.png';
import submitStep from '../images/img5.png';
import prepareStep from '../images/img6.png';

export const HOME_SECTIONS = {
  about: 'about',
  courses: 'courses',
  showcase: 'showcase',
  placements: 'placements',
  faq: 'faq',
  enquire: 'enquire',
};

export const homeHash = (section) => `${ROUTES.home}#${section}`;

export const hero = {
  eyebrow: 'MAAC Mathura · Animation · VFX · Gaming · Design',
  title: 'Turn Your Creativity Into Your Career.',
  description: 'Learn Animation, VFX, Gaming and Digital Design at MAAC Mathura.',
  // Supplied stills are 829px wide. `focus` keeps the subject in frame when a tall
  // viewport crops the sides.
  slides: [
    { id: 'animation', label: '3D Animation', src: animationHero, srcSmall: animationHeroSmall, width: 829, height: 463, widthSmall: 480, heightSmall: 268, ...heroFormats('animation'), focus: '32% 28%' },
    { id: 'vfx', label: 'VFX', src: vfxHero, srcSmall: vfxHeroSmall, width: 829, height: 463, widthSmall: 480, heightSmall: 268, ...heroFormats('vfx'), focus: '22% 42%' },
    { id: 'game-design', label: 'Game Design', src: gameHero, srcSmall: gameHeroSmall, width: 829, height: 464, widthSmall: 480, heightSmall: 269, ...heroFormats('game-design'), focus: '28% 36%' },
    { id: 'multimedia', label: 'Multimedia', src: multimediaHero, srcSmall: multimediaHeroSmall, width: 829, height: 464, widthSmall: 480, heightSmall: 269, ...heroFormats('multimedia'), focus: '62% 42%' },
  ],
};

export const about = {
  eyebrow: 'About MAAC',
  title: 'The high-end 3D Animation & VFX education vertical of Aptech Ltd.',
  description:
    'Through its wide network of centres, MAAC has prepared thousands of students for careers in Animation, VFX, Filmmaking, Gaming, Web and Graphic Design, through internationally recognised career courses and a dedicated Research & Development team of industry professionals.',
  highlights: [
    {
      title: 'MAAC in Mathura',
      text: 'MAAC Mathura brings these career courses to students in Mathura, with programmes in 3D Animation, VFX, Gaming, Web and Graphic Design.',
    },
    {
      title: 'Learning environment',
      text: 'The infrastructure is similar to that used by global colleges that train in Animation & VFX, creating an “on-the-job” environment in every design class.',
    },
    {
      title: 'Faculty & facilities',
      text: 'MAAC Mathura runs faculty training programmes, and teachers are trained and vetted by animation industry professionals. Classrooms use high-end computers, Wacom tablets and other professional equipment.',
    },
  ],
};

const [animation, vfx, gaming, webGraphic] = advancedPrograms;

const fromProgram = (program, video) => ({
  id: program.id,
  code: program.code,
  title: program.discipline,
  duration: program.duration,
  skillLevel: program.skillLevel,
  path: program.path,
  enquiryValue: program.enquiry.value,
  video,
});

const fromCategory = (category, code, video) => ({
  id: category.id,
  code,
  title: category.title,
  duration: category.duration,
  skillLevel: category.skillLevel,
  path: category.path,
  enquiryValue: category.enquiry.value,
  video,
});

export const featuredCourses = [
  fromProgram(animation, animationVideo),
  fromProgram(vfx, vfxVideo),
  fromProgram(gaming, gamingVideo),
  fromProgram(webGraphic, webGraphicVideo),
  fromCategory(shortTermCatalog, 'Specialised', shortTermVideo),
  fromCategory(moreCareerCatalog, 'Career programmes', moreCareerVideo),
];

export const whyMaac = {
  eyebrow: 'Why MAAC',
  title: 'Built around how studios actually work',
  description:
    'MAAC provides job-oriented graphics, animation, VFX, gaming and digital design courses, along with career development training for roles across the media and entertainment industry.',
  pillars: [
    {
      icon: LuGraduationCap,
      title: 'Industry-vetted training',
      text: 'Faculty training programmes keep teaching standards high. MAAC teachers are trained and vetted by animation industry professionals who sharpen their creative and technical skills.',
    },
    {
      icon: LuMonitor,
      title: 'Professional facilities',
      text: 'High-end computers, Wacom tablets and other equipment, with infrastructure similar to that used by global Animation & VFX colleges.',
    },
    {
      icon: LuLayers,
      title: 'Industry software',
      text: 'Programmes cover tools such as Autodesk Maya, 3ds Max, Nuke, Houdini, Unity and Unreal Engine, depending on the course you choose.',
    },
    {
      icon: LuSparkles,
      title: 'Hands-on learning',
      text: 'An “on-the-job” classroom environment, plus seminars, workshops, events and competitions, and guidance to build your show reel.',
    },
  ],
};

export const howItWorks = [
  { id: 'enquire', title: 'Enquire', text: 'About courses, fees, duration and career opportunities.', image: enquireStep },
  { id: 'enroll', title: 'Enroll', text: 'Hurray! You are now a student at MAAC.', image: enrollStep },
  { id: 'attend', title: 'Attend', text: 'Regular classes and practice sessions with MAAC trainers.', image: attendStep },
  { id: 'participate', title: 'Participate', text: 'In seminars, workshops, events and competitions.', image: participateStep },
  { id: 'submit', title: 'Submit', text: 'Your student work and show reel.', image: submitStep },
  { id: 'prepare', title: 'Prepare', text: 'Get ready for placements with career development training.', image: prepareStep },
];

export const placements = {
  eyebrow: 'Placements',
  title: 'Career training that connects you with the industry',
  description:
    'Animation and gaming studios, production houses, TV channels, publishing houses and advertising agencies need animators, VFX artists, game designers, filmmakers and designers. MAAC offers placement assistance and career development training to help students prepare for these roles.',
  logosHeading: 'Companies where students from the MAAC network have started their careers',
  disclaimer:
    'Placement assistance is offered; individual placement is not guaranteed. Logos are trademarks of their respective owners.',
};
