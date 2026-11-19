import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import AppProviders from '../AppProviders';
import { ROUTES } from '../routes';
import { phone } from '../data/site';
import { featuredCourses } from '../data/home';
import { programFaqs } from '../data/courses';
import { showcaseItems } from '../data/showcase';

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={[ROUTES.home]}>
      <AppProviders>
        <App />
      </AppProviders>
    </MemoryRouter>
  );

const header = () => screen.getByRole('banner');

describe('header', () => {
  test('shows the requested navigation, call and enquiry actions', () => {
    renderHome();
    const nav = within(header()).getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', ROUTES.home);
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', ROUTES.about);
    expect(within(nav).getByRole('button', { name: 'Courses' })).toHaveAttribute('aria-expanded', 'false');
    expect(within(nav).getByRole('link', { name: 'Student Showcase' })).toHaveAttribute('href', ROUTES.showcase);
    expect(within(nav).getByRole('link', { name: 'Placements' })).toHaveAttribute('href', ROUTES.placement);
    expect(within(nav).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', ROUTES.contact);
    expect(within(header()).getByRole('link', { name: /Call Now/ })).toHaveAttribute('href', `tel:${phone.tel}`);
    expect(within(header()).getByRole('button', { name: /Switch to (light|dark) theme/ })).toBeInTheDocument();
    expect(within(header()).getByRole('button', { name: 'Enquire Now' })).toBeInTheDocument();
  });

  test('the courses mega menu opens, links to every course and closes on Escape', () => {
    renderHome();
    const trigger = within(header()).getByRole('button', { name: 'Courses' });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    const hrefs = within(panel).getAllByRole('link').map((link) => link.getAttribute('href'));
    featuredCourses.forEach((course) => expect(hrefs).toContain(course.path));
    expect(hrefs).toContain(ROUTES.courses);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  test('Enquire Now opens the enquiry dialog with the form', () => {
    renderHome();
    fireEvent.click(within(header()).getByRole('button', { name: 'Enquire Now' }));
    const dialog = screen.getByRole('dialog', { name: 'Enquire now' });
    expect(within(dialog).getByRole('form', { name: 'Admission enquiry' })).toBeInTheDocument();
    expect(dialog).toContainElement(document.activeElement);
  });

  test('the mobile drawer exposes navigation, courses, call and enquiry', async () => {
    renderHome();
    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    const drawer = screen.getByRole('dialog', { name: 'Site menu' });
    const coursesToggle = within(drawer).getByRole('button', { name: 'Courses' });
    fireEvent.click(coursesToggle);
    expect(coursesToggle).toHaveAttribute('aria-expanded', 'true');
    featuredCourses.forEach((course) =>
      expect(within(drawer).getByRole('link', { name: new RegExp(course.title) })).toHaveAttribute('href', course.path)
    );
    expect(within(drawer).getByRole('link', { name: 'Call Now' })).toHaveAttribute('href', `tel:${phone.tel}`);

    fireEvent.click(within(drawer).getByRole('button', { name: 'Enquire Now' }));
    expect(screen.getByRole('dialog', { name: 'Enquire now' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Site menu' })).not.toBeInTheDocument());
  });
});

describe('homepage sections', () => {
  test('a course card enquiry preselects that course', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: 'Enquire Now about VFX' }));
    const dialog = screen.getByRole('dialog', { name: 'Enquire now' });
    expect(within(dialog).getByLabelText('Course interested in')).toHaveValue('vfx');
  });

  test('the hero slideshow can be paused and switched', () => {
    renderHome();
    const pause = screen.getByRole('button', { name: 'Pause background slideshow' });
    fireEvent.click(pause);
    expect(screen.getByRole('button', { name: 'Play background slideshow' })).toBeInTheDocument();

    const vfxTab = screen.getByRole('button', { name: 'VFX' });
    fireEvent.click(vfxTab);
    expect(vfxTab).toHaveAttribute('aria-pressed', 'true');
  });

  test('the FAQ accordion shows existing FAQs and toggles answers', () => {
    renderHome();
    const faq = document.getElementById('faq');
    const triggers = within(faq).getAllByRole('button');
    expect(triggers).toHaveLength(programFaqs.length);
    expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
    expect(within(faq).getByText(programFaqs[0].answer)).toBeInTheDocument();

    fireEvent.click(triggers[1]);
    expect(triggers[1]).toHaveAttribute('aria-expanded', 'true');
    expect(triggers[0]).toHaveAttribute('aria-expanded', 'false');
    expect(within(faq).getByRole('region', { name: programFaqs[1].question })).toBeInTheDocument();
  });

  test('student work opens in a lightbox with keyboard and button navigation', () => {
    renderHome();
    const showcase = document.getElementById('showcase');
    const thumbs = within(showcase).getAllByRole('button', { name: /larger$/ });
    expect(thumbs).toHaveLength(showcaseItems.length);

    fireEvent.click(thumbs[0]);
    const dialog = screen.getByRole('dialog', { name: 'Student artwork' });
    expect(dialog).toHaveAccessibleDescription(`Image 1 of ${showcaseItems.length}`);

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(dialog).toHaveAccessibleDescription(`Image 2 of ${showcaseItems.length}`);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Previous' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Previous' }));
    expect(dialog).toHaveAccessibleDescription(`Image ${showcaseItems.length} of ${showcaseItems.length}`);
  });

  test('recruiter logos have names and a pause control', () => {
    renderHome();
    const placements = document.getElementById('placements');
    expect(within(placements).getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
    expect(within(placements).getByRole('button', { name: 'Pause logo carousel' })).toBeInTheDocument();
    expect(placements.textContent).toMatch(/not guaranteed/);
  });
});
