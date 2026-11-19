import { ROUTES } from '../routes';
import {
  COURSE_CATEGORY,
  advancedPrograms,
  courseCategories,
  courseDataConflicts,
  courseHref,
  courses,
  enquiryCourseGroups,
  enquiryCourseOptions,
  getCourse,
  moreCareerCatalog,
  programFaqs,
  shortTermCatalog,
  softwareWithLogos,
  uniqueSoftware,
} from './courses';

const sourceText = (course) => [...course.description, course.learning?.intro ?? ''].join(' ').toLowerCase();

test('every course has a unique id and one record, even when listed in two categories', () => {
  const ids = courses.map((course) => course.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(courses).toHaveLength(14);
});

test('categories keep the original course order and count', () => {
  expect(courseCategories.map((category) => category.id)).toEqual([
    COURSE_CATEGORY.advanced,
    COURSE_CATEGORY.shortTerm,
    COURSE_CATEGORY.moreCareer,
  ]);
  expect(advancedPrograms.map((course) => course.path)).toEqual([
    ROUTES.animation3d,
    ROUTES.vfx,
    ROUTES.gaming,
    ROUTES.webGraphic,
  ]);
  expect(shortTermCatalog.courses.map((course) => course.title)).toEqual([
    'Design Viz Pro',
    'Maya Pro',
    'MAX PRO',
    'DIGITAL FILMMAKING',
    'COMPOSITING PLUS',
    'Blender',
    'MAX PRO',
  ]);
  expect(moreCareerCatalog.courses.map((course) => course.title)).toEqual([
    'D3D - Program in 3D Animation Filmmaking',
    'VFX PLUS- Program in Visual Effects',
    'APDMC - Advanced Program in Digital Media Creation',
    'DIGITAL FILMMAKING',
    'COMPOSITING PLUS',
    'Blender',
    'MAX PRO',
  ]);
});

test.each(courses.map((course) => [course.id, course]))('%s has the core fields', (_id, course) => {
  expect(course.title).toBeTruthy();
  expect(course.categories.length).toBeGreaterThan(0);
  expect(course.duration).toBeTruthy();
  expect(course.skillLevel).toBeTruthy();
  expect(course.description.length).toBeGreaterThan(0);
  expect(course.software.length).toBeGreaterThan(0);
  expect(course.path).toBeTruthy();
  expect(course.enquiry.value).toBeTruthy();
  expect(course.enquiry.label).toBeTruthy();
});

test.each(advancedPrograms.map((program) => [program.id, program]))(
  '%s has the fields its detail page renders',
  (_id, program) => {
    expect(program.code).toBeTruthy();
    expect(program.discipline).toBeTruthy();
    expect(program.faqs.length).toBeGreaterThan(0);
    expect(program.artwork.src).toBeTruthy();
    expect(program.artwork.srcSmall).toBeTruthy();
  }
);

test('learning and career text is quoted from the course’s own copy, not written for it', () => {
  advancedPrograms.forEach((program) => {
    const text = sourceText(program);
    [...(program.learning?.topics ?? []), ...(program.learning?.skills ?? []), program.careerHighlight]
      .filter(Boolean)
      .forEach((excerpt) => expect(text).toContain(excerpt.toLowerCase()));
  });
});

test('optional sections only exist where the original site had the content', () => {
  expect(advancedPrograms.filter((program) => program.electives).map((program) => program.id)).toEqual(['ad3d-edge-plus']);
  expect(advancedPrograms.filter((program) => program.studentWork).map((program) => program.id)).toEqual(['adidgp']);
  expect(advancedPrograms.filter((program) => program.tagline).map((program) => program.id)).toEqual(['advfx-plus']);
  courses
    .filter((course) => !course.categories.includes(COURSE_CATEGORY.advanced))
    .forEach((course) => {
      expect(course.faqs).toBeUndefined();
      expect(course.electives).toBeUndefined();
      expect(course.studentWork).toBeUndefined();
    });
});

test('published wording is preserved, including known issues awaiting review', () => {
  expect(getCourse('adidgp').title).toBe('ADIDGP - Advanced Program in Interactive Game Design Plu');
  expect(getCourse('advfx-plus').faqs[0]).toEqual({
    question: 'Can I learn Animation & VFX both??',
    answer: 'Yes, ADVFX covers the best of both worlds',
  });
  expect(getCourse('ad3d-edge-plus').faqs[1].answer).toMatch(/^3D Animation is employed in movies, Tv series, Ott,/);
  expect(getCourse('apdmd').software.filter((item) => item.name === 'Adobe Illustrator')).toHaveLength(2);
  expect(getCourse('apdmd').faqs).toBe(getCourse('adidgp').faqs);
  expect(getCourse('adidgp').software.map((item) => item.name)).toContain('Mazon Zbrush');
});

test('advanced programmes show the duration from their own page and keep the conflicting value', () => {
  ['ad3d-edge-plus', 'advfx-plus'].forEach((id) => {
    const course = getCourse(id);
    expect(course.duration).toBe('24 Months');
    expect(course.sourceVariants).toEqual([{ source: ROUTES.courses, duration: '27 Months' }]);
  });
});

test('uniqueSoftware drops repeated names but keeps the original order', () => {
  const names = uniqueSoftware(getCourse('apdmd').software).map((item) => item.name);
  expect(names[0]).toBe('Adobe Illustrator');
  expect(new Set(names).size).toBe(names.length);
  expect(names).toHaveLength(12);
});

test('every course links to an existing route', () => {
  advancedPrograms.forEach((program) => expect(courseHref(program)).toBe(program.path));
  expect(courseHref(getCourse('maya-pro'))).toBe(`${ROUTES.shortTerm}#maya-pro`);
  expect(courseHref(getCourse('d3d'))).toBe(`${ROUTES.moreCareer}#d3d`);
  expect(courseHref(getCourse('blender'), COURSE_CATEGORY.shortTerm)).toBe(`${ROUTES.shortTerm}#blender`);
  expect(courseHref(getCourse('blender'), COURSE_CATEGORY.moreCareer)).toBe(`${ROUTES.moreCareer}#blender`);
  courses.forEach((course) => expect(Object.values(ROUTES)).toContain(course.path.split(/[?#]/)[0]));
});

test('enquiry options cover every course and keep the values the backend already receives', () => {
  const values = enquiryCourseOptions.map((option) => option.value);
  expect(new Set(values).size).toBe(values.length);
  expect(values.slice(0, 4)).toEqual(['animation', 'vfx', 'gaming', 'web_design']);
  expect(values).toEqual(expect.arrayContaining(['short_term', 'more_career']));
  courses.forEach((course) => expect(values).toContain(course.enquiry.value));
  expect(enquiryCourseGroups.flatMap((group) => group.options)).toEqual(enquiryCourseOptions);
  expect(getCourse('max-pro-3ds-max').enquiry.label).toBe('MAX PRO (3ds Max)');
  expect(getCourse('max-pro-cinema-4d').enquiry.label).toBe('MAX PRO (Cinema 4D)');
});

test('conflicts awaiting review reference real courses', () => {
  courseDataConflicts.forEach((conflict) => {
    conflict.courses.forEach((id) => expect(() => getCourse(id)).not.toThrow());
    expect(conflict.issue).toBeTruthy();
    expect(conflict.resolution).toBeTruthy();
  });
});

test('homepage FAQs are the unique program FAQs', () => {
  const questions = programFaqs.map((faq) => faq.question);
  expect(new Set(questions).size).toBe(questions.length);
  advancedPrograms
    .flatMap((program) => program.faqs)
    .forEach((faq) => expect(questions).toContain(faq.question));
});

test('software logos are unique and come from local icons', () => {
  const icons = softwareWithLogos.map((item) => item.icon);
  expect(new Set(icons).size).toBe(icons.length);
  softwareWithLogos.forEach((item) => expect(item.name).toBeTruthy());
});
