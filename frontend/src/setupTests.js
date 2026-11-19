// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// The app loads animation features asynchronously; tests load them synchronously so the
// late LazyMotion state update does not land outside act().
jest.mock('./motion/MotionProvider', () => {
  const React = jest.requireActual('react');
  const { LazyMotion, MotionConfig, domAnimation } = jest.requireActual('framer-motion');
  return {
    MotionProvider: ({ children }) =>
      React.createElement(
        LazyMotion,
        { features: domAnimation, strict: true },
        React.createElement(MotionConfig, { reducedMotion: 'user' }, children)
      ),
  };
});

// jsdom does not implement these browser APIs.
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));

Element.prototype.scrollTo = Element.prototype.scrollTo || (() => {});
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
window.scrollTo = () => {};
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};

window.IntersectionObserver =
  window.IntersectionObserver ||
  class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
