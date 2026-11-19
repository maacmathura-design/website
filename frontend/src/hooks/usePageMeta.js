import { useLayoutEffect } from 'react';
import { phone, social } from '../data/site';

const BRAND = 'MAAC Mathura';
const SCHEMA_ID = 'page-structured-data';

/** Keeps a title that already names MAAC Mathura from being suffixed twice. */
export const pageTitle = (title) => {
  if (!title || title === BRAND || title.endsWith(`| ${BRAND}`) || title.endsWith(BRAND)) return title || BRAND;
  return `${title} | ${BRAND}`;
};

const upsertMeta = (attribute, key, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const absolute = (origin, path) => `${origin}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Organization details are limited to what the site actually publishes:
 * the name, phone, social profiles and that teaching happens in Mathura.
 * There is no address, email or opening hours to include.
 */
const buildSchema = (origin, { breadcrumbs, course, itemList }) => {
  const graph = [
    {
      '@type': 'EducationalOrganization',
      '@id': `${origin}/#organization`,
      name: BRAND,
      url: `${origin}/`,
      telephone: phone.tel,
      areaServed: 'Mathura',
      parentOrganization: { '@type': 'Organization', name: 'Aptech Ltd.' },
      sameAs: [social.instagram, social.facebook],
    },
  ];

  if (breadcrumbs?.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        ...(crumb.path ? { item: absolute(origin, crumb.path) } : {}),
      })),
    });
  }

  if (course) {
    graph.push({
      '@type': 'Course',
      name: course.name,
      description: course.description,
      url: absolute(origin, course.path),
      provider: { '@id': `${origin}/#organization` },
    });
  }

  if (itemList?.length) {
    graph.push({
      '@type': 'ItemList',
      itemListElement: itemList.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absolute(origin, item.path),
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
};

/**
 * Sets the title, description, canonical URL, Open Graph and Twitter cards,
 * and JSON-LD for the current route. `path` is the route path, without a query or hash.
 */
const usePageMeta = ({ title, description, path = '/', image = '/og.png', breadcrumbs, course, itemList }) => {
  const breadcrumbKey = JSON.stringify(breadcrumbs ?? null);
  const courseKey = JSON.stringify(course ?? null);
  const itemListKey = JSON.stringify(itemList ?? null);

  useLayoutEffect(() => {
    const resolvedTitle = pageTitle(title);
    document.title = resolvedTitle;
    const origin = window.location.origin;
    const url = absolute(origin, path);
    const imageUrl = image.startsWith('http') ? image : `${origin}${image.startsWith('/') ? image : `/${image}`}`;

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', resolvedTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', BRAND);
    upsertMeta('property', 'og:locale', 'en_IN');
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', resolvedTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', imageUrl);
    upsertLink('canonical', url);

    let script = document.getElementById(SCHEMA_ID);
    if (!script) {
      script = document.createElement('script');
      script.id = SCHEMA_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(buildSchema(origin, {
      breadcrumbs: JSON.parse(breadcrumbKey),
      course: JSON.parse(courseKey),
      itemList: JSON.parse(itemListKey),
    }));
  }, [title, description, path, image, breadcrumbKey, courseKey, itemListKey]);
};

export default usePageMeta;
