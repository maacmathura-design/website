import backendOptions from '../../../backend/src/enquiryOptions.json';
import { enquiryCourseForPage, enquiryCourseOptions } from './courses';
import { FORM_LOCATION, callbackTimeOptions, qualificationOptions } from './enquiry';

const asMap = (options) => Object.fromEntries(options.map((option) => [option.value, option.label]));

test('frontend enquiry options match the backend allowlist exactly', () => {
  expect(asMap(enquiryCourseOptions)).toEqual(backendOptions.courses);
  expect(asMap(qualificationOptions)).toEqual(backendOptions.qualifications);
  expect(asMap(callbackTimeOptions)).toEqual(backendOptions.callbackTimes);
  expect(Object.values(FORM_LOCATION).sort()).toEqual(Object.keys(backendOptions.formLocations).sort());
});

test('enquiryCourseForPage preselects the course for the current page', () => {
  expect(enquiryCourseForPage('/VFX')).toBe('vfx');
  expect(enquiryCourseForPage('/3DAnimation')).toBe('animation');
  expect(enquiryCourseForPage('/ShortTermSpecializedPage')).toBe('short_term');
  expect(enquiryCourseForPage('/ShortTermSpecializedPage', '#maya-pro')).toBe('maya-pro');
  expect(enquiryCourseForPage('/MoreCareerCoursesPage', '#blender')).toBe('blender');
  expect(enquiryCourseForPage('/MoreCareerCoursesPage', '#unknown')).toBe('more_career');
  expect(enquiryCourseForPage('/')).toBeUndefined();
  expect(enquiryCourseForPage('/Contact')).toBeUndefined();
  expect(enquiryCourseForPage('/About')).toBeUndefined();
  expect(enquiryCourseForPage('/StudentShowcase')).toBeUndefined();
  expect(enquiryCourseForPage('/Placement')).toBeUndefined();
});
