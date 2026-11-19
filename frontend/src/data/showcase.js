import gaming1 from '../images/showcase/gaming-1.webp';
import gaming2 from '../images/showcase/gaming-2.webp';
import gaming3 from '../images/showcase/gaming-3.webp';
import gaming4 from '../images/showcase/gaming-4.webp';
import gaming5 from '../images/showcase/gaming-5.webp';
import gaming6 from '../images/showcase/gaming-6.webp';
import gaming7 from '../images/showcase/gaming-7.webp';
import gaming8 from '../images/showcase/gaming-8.webp';
import gaming9 from '../images/showcase/gaming-9.webp';
import gaming10 from '../images/showcase/gaming-10.webp';
import gaming11 from '../images/showcase/gaming-11.webp';
import gaming12 from '../images/showcase/gaming-12.webp';
import gaming13 from '../images/showcase/gaming-13.webp';
import gaming14 from '../images/showcase/gaming-14.webp';

// Local copies of the only student-work images still published by the MAAC
// network site (ADIDGP game design gallery). They are not Mathura-specific.
const sources = [
  [gaming1, 535],
  [gaming2, 285],
  [gaming3, 375],
  [gaming4, 534],
  [gaming5, 300],
  [gaming6, 303],
  [gaming7, 286],
  [gaming8, 535],
  [gaming9, 300],
  [gaming10, 282],
  [gaming11, 480],
  [gaming12, 534],
  [gaming13, 534],
  [gaming14, 534],
];

const HEIGHT = 300;

export const showcaseCaption =
  'MAAC network game design programme (ADIDGP). Not artwork by students of MAAC Mathura.';

export const showcaseNote =
  'These pieces are from the MAAC game design programme (ADIDGP), as published by the MAAC network. They are not artwork by students of MAAC Mathura.';

export const showcaseItems = sources.map(([src, width], index) => ({
  id: `gaming-${index + 1}`,
  src,
  width,
  height: HEIGHT,
  alt: `Game design artwork ${index + 1} of ${sources.length} from the MAAC network ADIDGP programme`,
}));
