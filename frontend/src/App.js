import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ROUTES } from './routes';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import FloatingContact from './components/layout/FloatingContact';
import ScrollManager from './components/layout/ScrollManager';
import HomePage from './pages/HomePage';
import { COURSE_CATEGORY, advancedPrograms } from './data/courses';

const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const CourseCategoryPage = lazy(() => import('./pages/CourseCategoryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage'));
const PlacementsPage = lazy(() => import('./pages/PlacementsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Development-only component preview; the condition is constant-folded so production builds omit the chunk.
const DesignSystemPage =
  process.env.NODE_ENV === 'production' ? null : lazy(() => import('./pages/DesignSystemPage'));

function App() {
  return (
    <div className="App">
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<p className="page-loading" role="status">Loading page</p>}>
          <Routes>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.courses} element={<CoursesPage />} />
            {advancedPrograms.map((program) => (
              <Route key={program.id} path={program.path} element={<CourseDetailPage key={program.id} courseId={program.id} />} />
            ))}
            <Route
              path={ROUTES.shortTerm}
              element={<CourseCategoryPage key={COURSE_CATEGORY.shortTerm} categoryId={COURSE_CATEGORY.shortTerm} />}
            />
            <Route
              path={ROUTES.moreCareer}
              element={<CourseCategoryPage key={COURSE_CATEGORY.moreCareer} categoryId={COURSE_CATEGORY.moreCareer} />}
            />
            <Route path={ROUTES.about} element={<AboutPage />} />
            <Route path={ROUTES.showcase} element={<ShowcasePage />} />
            <Route path={ROUTES.placement} element={<PlacementsPage />} />
            <Route path={ROUTES.contact} element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
            {DesignSystemPage && <Route path="/design-system" element={<DesignSystemPage />} />}
          </Routes>
        </Suspense>
      </main>
      <FloatingContact />
      <Footer />
    </div>
  );
}

export default App;
