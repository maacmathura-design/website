import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import AppProviders from '../AppProviders';
import { ROUTES } from '../routes';
import { phone } from '../data/site';
import { about } from '../data/home';
import { placementRoles, placementWorkplaces, recognitionLogos, recruiterLogos } from '../data/placements';
import { showcaseItems, showcaseNote } from '../data/showcase';
import { pageTitle } from '../hooks/usePageMeta';

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

test('the about page uses the existing MAAC copy and links to the programmes', async () => {
  await renderAt(ROUTES.about);
  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { level: 1, name: 'About MAAC Mathura' })).toBeInTheDocument();
  expect(within(main).getByRole('heading', { level: 2, name: 'About MAAC' })).toBeInTheDocument();
  expect(within(main).getAllByText(about.title).length).toBeGreaterThan(0);
  expect(within(main).getByText(about.description)).toBeInTheDocument();
  about.highlights.forEach((item) => {
    expect(within(main).getByRole('heading', { name: item.title })).toBeInTheDocument();
    expect(within(main).getByText(item.text)).toBeInTheDocument();
  });
  expect(within(main).getByText('Why choose MAAC')).toBeInTheDocument();
  expect(within(main).getByRole('link', { name: /3D Animation/ })).toHaveAttribute('href', ROUTES.animation3d);
  expect(within(main).getByRole('form', { name: 'Admission enquiry' })).toBeInTheDocument();
  expect(document.title).toBe(pageTitle('About'));
  expect(main.textContent).not.toMatch(/delhi/i);
});

test('the showcase page attributes artwork to the MAAC network, not Mathura students', async () => {
  await renderAt(ROUTES.showcase);
  const main = screen.getByRole('main');
  expect(within(main).getAllByText(showcaseNote).length).toBeGreaterThan(0);
  expect(main.textContent).not.toMatch(/MAAC Mathura students/i);

  const gallery = document.getElementById('gallery');
  const thumbs = within(gallery).getAllByRole('button', { name: /larger$/ });
  expect(thumbs).toHaveLength(showcaseItems.length);
  expect(thumbs[0]).toHaveAccessibleName(`View ${showcaseItems[0].alt.toLowerCase()} larger`);

  fireEvent.click(thumbs[0]);
  const dialog = screen.getByRole('dialog', { name: 'Student artwork' });
  expect(within(dialog).getByRole('img', { name: showcaseItems[0].alt })).toBeInTheDocument();
  expect(within(dialog).getByText(/Not artwork by students of MAAC Mathura/)).toBeInTheDocument();
  expect(document.title).toBe(pageTitle('Student showcase'));
});

test('the placements page names only identified logos and states no placement counts', async () => {
  await renderAt(ROUTES.placement);
  const main = screen.getByRole('main');
  const employers = document.getElementById('employers');
  recruiterLogos.forEach((company) => expect(within(employers).getByText(company.name)).toBeInTheDocument());
  recognitionLogos.forEach((body) => expect(within(employers).queryByText(body.name)).not.toBeInTheDocument());

  const recognition = document.getElementById('recognition');
  recognitionLogos.forEach((body) => expect(within(recognition).getByText(body.name)).toBeInTheDocument());
  expect(within(recognition).getByText(/does not present them as employers/i)).toBeInTheDocument();

  const careers = document.getElementById('careers');
  placementWorkplaces.forEach((name) => expect(within(careers).getByText(name)).toBeInTheDocument());
  placementRoles.forEach((name) => expect(within(careers).getByText(name)).toBeInTheDocument());
  expect(within(main).getByText(/individual placement is not guaranteed/i)).toBeInTheDocument();
  expect(main.textContent).not.toMatch(/\d+\s*%|students placed|placed at/i);
  expect(within(main).getByRole('form', { name: 'Admission enquiry' })).toBeInTheDocument();
  expect(document.title).toBe(pageTitle('Placements'));
});

test('the contact page publishes only known contact details', async () => {
  await renderAt(ROUTES.contact);
  const main = screen.getByRole('main');
  expect(within(main).getByRole('heading', { level: 1, name: 'Contact MAAC Mathura' })).toBeInTheDocument();
  const phonePattern = new RegExp(phone.display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  expect(within(main).getAllByRole('link', { name: phonePattern }).length).toBeGreaterThan(0);
  within(main)
    .getAllByRole('link', { name: phonePattern })
    .forEach((link) => expect(link).toHaveAttribute('href', `tel:${phone.tel}`));
  const details = document.getElementById('contact-details');
  expect(within(details).getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', expect.stringContaining('wa.me'));
  expect(within(details).getByRole('link', { name: /Instagram/ })).toHaveAttribute('href', expect.stringContaining('instagram.com'));
  expect(within(main).queryByRole('link', { name: /email/i })).not.toBeInTheDocument();
  expect(main.querySelector('iframe')).toBeNull();
  expect(main.textContent).not.toMatch(/opening hours|centre address|placeholder|lorem|coming soon/i);
  expect(within(main).getByRole('form', { name: 'Admission enquiry' })).toBeInTheDocument();
  expect(document.title).toBe(pageTitle('Contact'));
});

test('secondary page links point at real routes', async () => {
  const routes = Object.values(ROUTES);
  for (const path of [ROUTES.about, ROUTES.showcase, ROUTES.placement, ROUTES.contact]) {
    const { unmount } = await renderAt(path);
    internalHrefs(screen.getByRole('main')).forEach((href) => {
      const [pathAndQuery, hash] = href.split('#');
      expect(routes).toContain(pathAndQuery.split('?')[0]);
      if (hash && pathAndQuery.split('?')[0] === path) expect(document.getElementById(hash)).toBeInTheDocument();
    });
    unmount();
  }
});

test('pages publish a canonical URL, social metadata and organization data without an address', async () => {
  const home = await renderAt(ROUTES.home);
  expect(document.title).toBe('MAAC Mathura');
  expect(document.querySelector('meta[name="description"]').getAttribute('content')).toMatch(/animation, VFX, game design/);
  expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${window.location.origin}/`);
  expect(document.querySelector('meta[property="og:title"]').getAttribute('content')).toBe('MAAC Mathura');
  expect(document.querySelector('meta[name="twitter:card"]').getAttribute('content')).toBe('summary_large_image');

  const homeData = JSON.parse(document.getElementById('page-structured-data').textContent);
  const organization = homeData['@graph'].find((node) => node['@type'] === 'EducationalOrganization');
  expect(organization.name).toBe('MAAC Mathura');
  expect(organization.telephone).toBe(phone.tel);
  expect(organization.areaServed).toBe('Mathura');
  expect(JSON.stringify(homeData)).not.toMatch(/streetAddress|postalCode|openingHours/);
  home.unmount();

  const catalogue = await renderAt(`${ROUTES.courses}?category=advanced`);
  expect(document.title).toBe(pageTitle('Courses'));
  expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${window.location.origin}${ROUTES.courses}`);
  catalogue.unmount();

  await renderAt(ROUTES.vfx);
  const courseData = JSON.parse(document.getElementById('page-structured-data').textContent);
  expect(courseData['@graph'].some((node) => node['@type'] === 'Course')).toBe(true);
  expect(document.title).toBe(pageTitle('VFX courses'));
});
