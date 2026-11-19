import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppProviders from '../../AppProviders';
import { THEME_STORAGE_KEY } from '../../theme/ThemeProvider';
import { COURSE_CATEGORY, advancedPrograms, shortTermCatalog } from '../../data/courses';
import { phone } from '../../data/site';
import { ROUTES } from '../../routes';
import CourseCatalogCard from '../course/CourseCatalogCard';
import EnquiryCTA from '../enquiry/EnquiryCTA';
import {
  AnimatedSection,
  Badge,
  Container,
  GlassCard,
  Modal,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
  ThemeToggle,
} from '.';

const renderInTheme = (theme, ui) => {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  return render(
    <MemoryRouter>
      <AppProviders>{ui}</AppProviders>
    </MemoryRouter>
  );
};

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe.each(['light', 'dark'])('in the %s theme', (theme) => {
  test('the provider applies the theme to the document', () => {
    renderInTheme(theme, <Container>content</Container>);
    expect(document.documentElement).toHaveAttribute('data-theme', theme);
  });

  test('buttons render as router links, anchors or buttons', () => {
    renderInTheme(
      theme,
      <>
        <PrimaryButton to={ROUTES.contact}>Apply</PrimaryButton>
        <SecondaryButton href={`tel:${phone.tel}`}>Call</SecondaryButton>
        <PrimaryButton disabled>Disabled</PrimaryButton>
      </>
    );
    expect(screen.getByRole('link', { name: 'Apply' })).toHaveAttribute('href', ROUTES.contact);
    expect(screen.getByRole('link', { name: 'Call' })).toHaveAttribute('href', `tel:${phone.tel}`);
    const disabled = screen.getByRole('button', { name: 'Disabled' });
    expect(disabled).toBeDisabled();
    expect(disabled).toHaveAttribute('type', 'button');
  });

  test('layout and content primitives render semantic markup', () => {
    renderInTheme(
      theme,
      <Container as="section" aria-label="container">
        <SectionHeading eyebrow="Eyebrow" title="Heading" description="Description" level={3} />
        <GlassCard as="article" interactive>
          <Badge variant="accent">24 Months</Badge>
        </GlassCard>
        <AnimatedSection as="div">Revealed</AnimatedSection>
      </Container>
    );
    expect(screen.getByRole('region', { name: 'container' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByRole('article')).toHaveTextContent('24 Months');
    expect(screen.getByText('Revealed')).toBeInTheDocument();
  });

  test('CourseCatalogCard renders course data without altering it', () => {
    const program = advancedPrograms[0];
    const catalogCourse = shortTermCatalog.courses[0];
    renderInTheme(
      theme,
      <>
        <CourseCatalogCard course={program} categoryId={COURSE_CATEGORY.advanced} />
        <CourseCatalogCard course={catalogCourse} categoryId={COURSE_CATEGORY.shortTerm} expanded />
      </>
    );
    expect(screen.getByRole('heading', { level: 3, name: program.title })).toBeInTheDocument();
    expect(screen.getAllByText(program.duration).length).toBeGreaterThan(0);
    expect(screen.getByText(program.description[0])).toBeInTheDocument();
    expect(screen.getByRole('link', { name: `View details: ${program.title}` })).toHaveAttribute('href', program.path);
    expect(screen.getByText(catalogCourse.description[0])).toBeInTheDocument();
    catalogCourse.software.forEach((item) => expect(screen.getAllByText(item.name).length).toBeGreaterThan(0));
    expect(screen.queryByRole('link', { name: `View details: ${catalogCourse.title}` })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Enquire Now about ${catalogCourse.title}` })).toBeInTheDocument();
  });

  test('EnquiryCTA links to the contact page and the real phone number', () => {
    renderInTheme(theme, <EnquiryCTA />);
    expect(screen.getByRole('link', { name: 'Send an enquiry' })).toHaveAttribute('href', ROUTES.contact);
    expect(screen.getByRole('link', { name: `Call ${phone.display}` })).toHaveAttribute('href', `tel:${phone.tel}`);
  });
});

test('ThemeToggle switches the theme and remembers the choice', () => {
  renderInTheme('dark', <ThemeToggle />);
  const toggle = screen.getByRole('button', { name: 'Switch to light theme' });

  fireEvent.click(toggle);
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
});

test('EnquiryCTA can open an in-page enquiry instead of navigating', () => {
  const onEnquire = jest.fn();
  renderInTheme('light', <EnquiryCTA onEnquire={onEnquire} />);
  fireEvent.click(screen.getByRole('button', { name: 'Send an enquiry' }));
  expect(onEnquire).toHaveBeenCalledTimes(1);
});

test('Modal is an accessible dialog that closes with Escape and restores focus', () => {
  const Harness = () => {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>Open</button>
        <Modal open={open} onClose={() => setOpen(false)} title="Enquire" description="Leave your details">
          <button type="button">Inside</button>
        </Modal>
      </>
    );
  };
  renderInTheme('dark', <Harness />);

  const opener = screen.getByRole('button', { name: 'Open' });
  opener.focus();
  fireEvent.click(opener);

  const dialog = screen.getByRole('dialog', { name: 'Enquire' });
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAccessibleDescription('Leave your details');
  expect(dialog).toContainElement(document.activeElement);

  fireEvent.keyDown(document, { key: 'Escape' });
  expect(opener).toHaveFocus();
});
