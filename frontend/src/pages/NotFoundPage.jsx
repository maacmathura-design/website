import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, PrimaryButton, SecondaryButton } from '../components/ui';
import usePageMeta from '../hooks/usePageMeta';
import { ROUTES } from '../routes';
import styles from './NotFoundPage.module.css';

/** Unknown addresses keep the site header and footer, and are not offered to search engines. */
const NotFoundPage = () => {
  const { pathname } = useLocation();

  usePageMeta({
    title: 'Page not found',
    description: 'This address is not a page on the MAAC Mathura website.',
    path: pathname,
  });

  useEffect(() => {
    let meta = document.head.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex');
    return () => {
      if (previous) meta.setAttribute('content', previous);
      else meta.remove();
    };
  }, []);

  return (
    <Container as="section" className={styles.page} aria-labelledby="not-found-title">
      <p className={styles.eyebrow}>404</p>
      <h1 id="not-found-title">Page not found</h1>
      <p className={styles.text}>This address is not a page on the MAAC Mathura website.</p>
      <div className={styles.actions}>
        <PrimaryButton to={ROUTES.home}>Back to home</PrimaryButton>
        <SecondaryButton to={ROUTES.courses}>View courses</SecondaryButton>
        <SecondaryButton to={ROUTES.contact}>Contact</SecondaryButton>
      </div>
    </Container>
  );
};

export default NotFoundPage;
