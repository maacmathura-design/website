import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import AppProviders from './AppProviders';
import { ROUTES } from './routes';
import { phone, social, whatsappUrl } from './data/site';
import { advancedPrograms, courses, moreCareerCatalog, shortTermCatalog, uniqueSoftware } from './data/courses';

const renderAt = async (path) => {
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <AppProviders>
        <App />
      </AppProviders>
    </MemoryRouter>
  );
  await screen.findByRole('heading', { level: 1 });
  await act(async () => {});
  return view;
};

const internalHrefs = (container) =>
  within(container)
    .getAllByRole('link')
    .map((link) => link.getAttribute('href'))
    .filter((href) => href.startsWith('/'));

test('renders the redesigned homepage with the enquiry form', async () => {
  await renderAt(ROUTES.home);
  expect(screen.getByRole('heading', { level: 1, name: 'Turn Your Creativity Into Your Career.' })).toBeInTheDocument();
  expect(screen.getByText('Learn Animation, VFX, Gaming and Digital Design at MAAC Mathura.')).toBeInTheDocument();
  expect(screen.getByRole('form', { name: 'Admission enquiry' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeInTheDocument();
});

test('the homepage contains every requested section in order', async () => {
  await renderAt(ROUTES.home);
  const ids = ['about', 'courses', 'why-maac', 'showcase', 'software', 'how-it-works', 'placements', 'faq', 'enquire'];
  const sections = ids.map((id) => document.getElementById(id));
  sections.forEach((section) => expect(section).toBeInTheDocument());
  sections.slice(1).forEach((section, index) => {
    // eslint-disable-next-line no-bitwise
    expect(sections[index].compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

test('homepage copy does not mention Delhi', async () => {
  await renderAt(ROUTES.home);
  expect(document.body.textContent).not.toMatch(/delhi/i);
});

test('every internal homepage link points at a real route or homepage section', async () => {
  await renderAt(ROUTES.home);
  const routes = Object.values(ROUTES);
  internalHrefs(document.body).forEach((href) => {
    const [path, hash] = href.split('#');
    expect(routes).toContain(path);
    if (hash) expect(document.getElementById(hash)).toBeInTheDocument();
  });
});

test('featured course cards link to their course pages', async () => {
  await renderAt(ROUTES.home);
  const courses = document.getElementById('courses');
  const detailLinks = within(courses).getAllByRole('link', { name: /^View details:/ });
  expect(detailLinks.map((link) => link.getAttribute('href'))).toEqual([
    ...advancedPrograms.map((program) => program.path),
    ROUTES.shortTerm,
    ROUTES.moreCareer,
  ]);
});

const COURSE_PAGES = [ROUTES.courses, ...advancedPrograms.map((program) => program.path), ROUTES.shortTerm, ROUTES.moreCareer];

const expectLinksResolve = (container, currentPath) => {
  const routes = Object.values(ROUTES);
  internalHrefs(container).forEach((href) => {
    const [pathAndQuery, hash] = href.split('#');
    const path = pathAndQuery.split('?')[0];
    expect(routes).toContain(path);
    if (hash && path === currentPath) expect(document.getElementById(hash)).toBeInTheDocument();
  });
};

test.each(advancedPrograms.map((program) => [program.path, program]))(
  '%s renders the course detail template from the course data',
  async (path, program) => {
    await renderAt(path);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { level: 1, name: program.title })).toBeInTheDocument();
    expect(within(main).getAllByText(program.duration).length).toBeGreaterThan(0);
    expect(within(main).getAllByText(program.skillLevel).length).toBeGreaterThan(0);
    program.description.forEach((paragraph) => expect(within(main).getByText(paragraph)).toBeInTheDocument());
    program.faqs.forEach((faq) => expect(within(main).getByText(faq.question)).toBeInTheDocument());
    uniqueSoftware(program.software).forEach((item) => expect(within(main).getByText(item.name)).toBeInTheDocument());

    ['overview', 'software', 'careers', 'faq', 'enquire'].forEach((id) => expect(document.getElementById(id)).toBeInTheDocument());
    expect(Boolean(document.getElementById('learning'))).toBe(Boolean(program.learning));
    expect(Boolean(document.getElementById('electives'))).toBe(Boolean(program.electives));
    expect(Boolean(document.getElementById('student-work'))).toBe(Boolean(program.studentWork));
    program.electives?.forEach((elective) => expect(within(main).getByRole('heading', { name: elective.name })).toBeInTheDocument());

    expect(within(main).getByLabelText('Course interested in')).toHaveValue(program.enquiry.value);
    expectLinksResolve(main, path);
  }
);

test.each([
  [ROUTES.shortTerm, shortTermCatalog],
  [ROUTES.moreCareer, moreCareerCatalog],
])('%s lists every course in its category with full details', async (path, catalog) => {
  await renderAt(path);
  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { level: 1, name: catalog.title })).toBeInTheDocument();
  expect(within(main).getByText(catalog.description)).toBeInTheDocument();
  expect(within(main).getByText(catalog.duration)).toBeInTheDocument();

  const list = document.getElementById('course-list');
  const cards = within(list).getAllByRole('article');
  expect(cards).toHaveLength(catalog.courses.length);
  catalog.courses.forEach((course, index) => {
    const card = cards[index];
    expect(card).toHaveAttribute('id', course.id);
    expect(within(card).getByRole('heading', { level: 3, name: course.title })).toBeInTheDocument();
    expect(within(card).getByText(course.description[0])).toBeInTheDocument();
    course.software.forEach((item) => expect(within(card).getAllByText(item.name).length).toBeGreaterThan(0));
  });
  expect(within(main).getByLabelText('Course interested in')).toHaveValue(catalog.enquiry.value);
  expectLinksResolve(main, path);
});

test('the course catalogue lists every category with working detail links', async () => {
  await renderAt(ROUTES.courses);
  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { level: 1, name: 'Courses at MAAC' })).toBeInTheDocument();
  expect(within(main).getByRole('navigation', { name: 'Course categories' })).toBeInTheDocument();

  [advancedPrograms, shortTermCatalog.courses, moreCareerCatalog.courses].forEach((list, index) => {
    const section = document.getElementById(['advanced', 'short-term', 'more-career'][index]);
    expect(within(section).getAllByRole('article')).toHaveLength(list.length);
  });

  const detailLinks = within(main).getAllByRole('link', { name: /^View details:/ });
  expect(detailLinks).toHaveLength(advancedPrograms.length + shortTermCatalog.courses.length + moreCareerCatalog.courses.length);
  detailLinks.forEach((link) => {
    const [path, hash] = link.getAttribute('href').split('#');
    expect(COURSE_PAGES).toContain(path);
    if (hash) expect(courses.map((course) => course.id)).toContain(hash);
  });
  expect(screen.queryByText(/View Full Detail/i)).not.toBeInTheDocument();
  expectLinksResolve(main, ROUTES.courses);
});

test('the catalogue category filter shows only the chosen category', async () => {
  await renderAt(`${ROUTES.courses}?category=advanced`);
  expect(document.getElementById('advanced')).toBeInTheDocument();
  expect(document.getElementById('short-term')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /^Advanced Programmes/ })).toHaveAttribute('aria-current', 'page');
});

test.each([
  [ROUTES.vfx, 'Enquire Now about ADVFX PLUS', 'vfx'],
  [ROUTES.courses, 'Enquire Now about D3D - Program in 3D Animation Filmmaking', 'd3d'],
  [ROUTES.shortTerm, 'Enquire Now about MAX PRO (Cinema 4D)', 'max-pro-cinema-4d'],
  [ROUTES.moreCareer, 'Enquire Now about Blender', 'blender'],
])('on %s, "%s" preselects the course in the enquiry dialog', async (path, buttonName, value) => {
  await renderAt(path);
  fireEvent.click(screen.getAllByRole('button', { name: buttonName })[0]);
  const dialog = screen.getByRole('dialog', { name: 'Enquire now' });
  expect(within(dialog).getByLabelText('Course interested in')).toHaveValue(value);
});

test.each([
  [ROUTES.gaming, 'gaming'],
  [`${ROUTES.shortTerm}#maya-pro`, 'maya-pro'],
  [ROUTES.moreCareer, 'more_career'],
  [ROUTES.contact, 'animation'],
])('the floating Enquire Now button on %s opens the pop-up form preselected', async (path, value) => {
  await renderAt(path);
  const dock = screen.getByRole('complementary', { name: 'Quick contact' });
  fireEvent.click(within(dock).getByRole('button', { name: 'Enquire Now' }));
  const dialog = screen.getByRole('dialog', { name: 'Enquire now' });
  expect(within(dialog).getByLabelText('Course interested in')).toHaveValue(value);
  expect(within(dialog).getByLabelText('Educational qualification (optional)')).toBeInTheDocument();
});

test('the floating contact panel links WhatsApp, phone, Facebook and Instagram', async () => {
  await renderAt(ROUTES.home);
  const dock = screen.getByRole('complementary', { name: 'Quick contact' });
  const whatsapp = within(dock).getByRole('link', { name: /WhatsApp/ });
  const call = within(dock).getByRole('link', { name: /Call MAAC Mathura/ });
  const facebook = within(dock).getByRole('link', { name: /Facebook/ });
  const instagram = within(dock).getByRole('link', { name: /Instagram/ });

  expect(whatsapp).toHaveAttribute('href', whatsappUrl);
  expect(call).toHaveAttribute('href', `tel:${phone.tel}`);
  expect(facebook).toHaveAttribute('href', social.facebook);
  expect(instagram).toHaveAttribute('href', social.instagram);
  [whatsapp, facebook, instagram].forEach((link) => {
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
  expect(within(dock).getByRole('button', { name: 'Enquire Now' })).toBeInTheDocument();
});

test.each([ROUTES.home, ROUTES.about, ROUTES.showcase, ROUTES.vfx, ROUTES.shortTerm, ROUTES.contact, ROUTES.placement])(
  '%s has a persistent enquiry form and the floating enquiry button',
  async (path) => {
    await renderAt(path);
    expect(within(screen.getByRole('complementary', { name: 'Quick contact' })).getByRole('button', { name: 'Enquire Now' })).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByRole('form', { name: 'Admission enquiry' })).toBeInTheDocument();
  },
);

test.each(COURSE_PAGES)('%s only loads local images', async (path) => {
  await renderAt(path);
  document.querySelectorAll('main img').forEach((img) => {
    expect(img.getAttribute('src')).not.toMatch(/^https?:/);
  });
});

test('the contact page uses the shared enquiry form', async () => {
  await renderAt(ROUTES.contact);
  expect(screen.getByRole('heading', { level: 1, name: 'Contact MAAC Mathura' })).toBeInTheDocument();
  expect(screen.getByRole('form', { name: 'Admission enquiry' })).toBeInTheDocument();
});

test('footer links point at real routes', async () => {
  await renderAt(ROUTES.home);
  const routes = Object.values(ROUTES);
  internalHrefs(screen.getByRole('contentinfo')).forEach((href) => expect(routes).toContain(href.split('#')[0]));
});

test('an unknown address shows the not-found page and keeps the site navigation', async () => {
  await renderAt('/this-page-does-not-exist');
  const main = screen.getByRole('main');
  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  expect(within(main).getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', ROUTES.home);
  expect(within(main).getByRole('link', { name: 'View courses' })).toHaveAttribute('href', ROUTES.courses);
  expect(within(main).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', ROUTES.contact);
  expect(document.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex');
  expect(document.title).toBe('Page not found | MAAC Mathura');
});

test('external links open safely in a new tab', async () => {
  await renderAt(ROUTES.home);
  screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('target') === '_blank')
    .forEach((link) => expect(link).toHaveAttribute('rel', expect.stringContaining('noopener')));
});
