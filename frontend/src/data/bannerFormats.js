import animationWebp from '../images/hero/animation.webp';
import animationWebpSmall from '../images/hero/animation-480.webp';
import animationAvif from '../images/hero/animation.avif';
import animationAvifSmall from '../images/hero/animation-480.avif';
import vfxWebp from '../images/hero/vfx.webp';
import vfxWebpSmall from '../images/hero/vfx-480.webp';
import vfxAvif from '../images/hero/vfx.avif';
import vfxAvifSmall from '../images/hero/vfx-480.avif';
import gameDesignWebp from '../images/hero/game-design.webp';
import gameDesignWebpSmall from '../images/hero/game-design-480.webp';
import gameDesignAvif from '../images/hero/game-design.avif';
import gameDesignAvifSmall from '../images/hero/game-design-480.avif';
import multimediaWebp from '../images/hero/multimedia.webp';
import multimediaWebpSmall from '../images/hero/multimedia-480.webp';
import multimediaAvif from '../images/hero/multimedia.avif';
import multimediaAvifSmall from '../images/hero/multimedia-480.avif';
import ad3dWebp from '../images/courses/ad3d.webp';
import ad3dWebpSmall from '../images/courses/ad3d-960.webp';
import ad3dAvif from '../images/courses/ad3d.avif';
import ad3dAvifSmall from '../images/courses/ad3d-960.avif';
import advfxWebp from '../images/courses/advfx.webp';
import advfxWebpSmall from '../images/courses/advfx-960.webp';
import advfxAvif from '../images/courses/advfx.avif';
import advfxAvifSmall from '../images/courses/advfx-960.avif';
import adidgpWebp from '../images/courses/adidgp.webp';
import adidgpWebpSmall from '../images/courses/adidgp-960.webp';
import adidgpAvif from '../images/courses/adidgp.avif';
import adidgpAvifSmall from '../images/courses/adidgp-960.avif';
import apdmdWebp from '../images/courses/apdmd.webp';
import apdmdWebpSmall from '../images/courses/apdmd-960.webp';
import apdmdAvif from '../images/courses/apdmd.avif';
import apdmdAvifSmall from '../images/courses/apdmd-960.avif';
import shortTermWebp from '../images/courses/short-term.webp';
import shortTermWebpSmall from '../images/courses/short-term-960.webp';
import shortTermAvif from '../images/courses/short-term.avif';
import shortTermAvifSmall from '../images/courses/short-term-960.avif';
import moreCareerWebp from '../images/courses/more-career.webp';
import moreCareerWebpSmall from '../images/courses/more-career-960.webp';
import moreCareerAvif from '../images/courses/more-career.avif';
import moreCareerAvifSmall from '../images/courses/more-career-960.avif';
import catalogueWebp from '../images/courses/catalogue.webp';
import catalogueWebpSmall from '../images/courses/catalogue-960.webp';
import catalogueAvif from '../images/courses/catalogue.avif';
import catalogueAvifSmall from '../images/courses/catalogue-960.avif';

const HERO = {
  animation: { webp: animationWebp, webpSmall: animationWebpSmall, avif: animationAvif, avifSmall: animationAvifSmall },
  vfx: { webp: vfxWebp, webpSmall: vfxWebpSmall, avif: vfxAvif, avifSmall: vfxAvifSmall },
  'game-design': { webp: gameDesignWebp, webpSmall: gameDesignWebpSmall, avif: gameDesignAvif, avifSmall: gameDesignAvifSmall },
  multimedia: {
    webp: multimediaWebp,
    webpSmall: multimediaWebpSmall,
    avif: multimediaAvif,
    avifSmall: multimediaAvifSmall,
  },
};

const COURSES = {
  ad3d: { webp: ad3dWebp, webpSmall: ad3dWebpSmall, avif: ad3dAvif, avifSmall: ad3dAvifSmall },
  advfx: { webp: advfxWebp, webpSmall: advfxWebpSmall, avif: advfxAvif, avifSmall: advfxAvifSmall },
  adidgp: { webp: adidgpWebp, webpSmall: adidgpWebpSmall, avif: adidgpAvif, avifSmall: adidgpAvifSmall },
  apdmd: { webp: apdmdWebp, webpSmall: apdmdWebpSmall, avif: apdmdAvif, avifSmall: apdmdAvifSmall },
  'short-term': { webp: shortTermWebp, webpSmall: shortTermWebpSmall, avif: shortTermAvif, avifSmall: shortTermAvifSmall },
  'more-career': { webp: moreCareerWebp, webpSmall: moreCareerWebpSmall, avif: moreCareerAvif, avifSmall: moreCareerAvifSmall },
  catalogue: { webp: catalogueWebp, webpSmall: catalogueWebpSmall, avif: catalogueAvif, avifSmall: catalogueAvifSmall },
};

export const heroFormats = (base) => HERO[base];
export const courseFormats = (base) => COURSES[base];
