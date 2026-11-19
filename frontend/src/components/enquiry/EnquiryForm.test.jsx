import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ENQUIRY_ENDPOINT } from '../../config/api';
import EnquiryForm, { describeFailure, normaliseMobile, validateEnquiry } from './EnquiryForm';

const fill = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }));

const fillValid = () => {
  fill('Student name', '  Asha   Sharma ');
  fill('Mobile number', '+91 98765 43210');
  fill('Email address', 'asha@example.com');
};

const jsonResponse = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
  jest.useRealTimers();
});

test('normaliseMobile accepts Indian mobile formats and rejects others', () => {
  expect(normaliseMobile('9876543210')).toBe('9876543210');
  expect(normaliseMobile('+91 98765-43210')).toBe('9876543210');
  expect(normaliseMobile('09876543210')).toBe('9876543210');
  expect(normaliseMobile('12345')).toBeNull();
  expect(normaliseMobile('1234567890')).toBeNull();
});

test('validateEnquiry checks required and optional fields', () => {
  const valid = { name: 'Asha', mobile: '9876543210', email: 'a@b.co', course: 'vfx' };
  expect(validateEnquiry(valid)).toEqual({});
  expect(validateEnquiry({ ...valid, course: 'hacking' })).toHaveProperty('course');
  expect(validateEnquiry({ ...valid, email: 'asha@example' })).toHaveProperty('email');
  expect(validateEnquiry({ ...valid, name: '<b>Asha</b>' })).toHaveProperty('name');
  expect(validateEnquiry({ ...valid, qualification: 'phd' })).toHaveProperty('qualification');
  expect(validateEnquiry({ ...valid, callbackTime: 'midnight' })).toHaveProperty('callbackTime');
  expect(validateEnquiry({ ...valid, message: 'a'.repeat(1001) })).toHaveProperty('message');
  expect(validateEnquiry({ ...valid, name: 'आशा शर्मा', qualification: 'graduate', callbackTime: 'evening' })).toEqual({});
});

test('describeFailure gives helpful messages for each API failure', () => {
  expect(describeFailure(422, { fields: { email: 'Bad' } })).toEqual({ message: 'Please correct the highlighted fields.', fields: { email: 'Bad' } });
  expect(describeFailure(429, { retryAfterSeconds: 600 }).message).toMatch(/in about 10 minutes/);
  expect(describeFailure(400, { error: 'too_fast' }).message).toMatch(/press Send enquiry again/);
  expect(describeFailure(503, {}).message).toMatch(/call or WhatsApp us/);
  expect(describeFailure(502, {}).message).toMatch(/could not send your enquiry right now/);
  expect(describeFailure('network').message).toMatch(/internet connection/);
  expect(describeFailure('timeout').message).toMatch(/took too long/);
});

test('shows inline errors and does not submit missing required fields', () => {
  render(<EnquiryForm />);
  submit();

  expect(screen.getByText('Please enter the student’s name.')).toBeInTheDocument();
  expect(screen.getByText('Please enter a mobile number.')).toBeInTheDocument();
  expect(screen.getByText('Please enter an email address.')).toBeInTheDocument();
  expect(screen.getByLabelText('Student name')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Student name')).toHaveFocus();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('rejects an invalid mobile number and email before sending', () => {
  render(<EnquiryForm />);
  fill('Student name', 'Asha');
  fill('Mobile number', '12345');
  fill('Email address', 'asha@');
  submit();

  expect(screen.getByText(/valid 10-digit Indian mobile number/)).toBeInTheDocument();
  expect(screen.getByText(/valid email address/)).toBeInTheDocument();
  expect(screen.getByLabelText('Mobile number')).toHaveFocus();
  expect(global.fetch).not.toHaveBeenCalled();
});

test('marks optional fields and preselects the course it was opened for', () => {
  render(<EnquiryForm defaultCourse="maya-pro" />);
  expect(screen.getByLabelText('Course interested in')).toHaveValue('maya-pro');
  expect(screen.getByLabelText('Educational qualification (optional)')).toHaveValue('');
  expect(screen.getByLabelText('Preferred callback time (optional)')).toHaveValue('');
  expect(screen.getByLabelText('Message (optional)')).toHaveValue('');
});

test('posts every field with the source page, then resets and confirms success', async () => {
  window.history.pushState({}, '', '/VFX?ref=test');
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  global.fetch.mockResolvedValue(jsonResponse(200, { ok: true }));
  render(<EnquiryForm defaultCourse="gaming" formLocation="popup" />);
  fillValid();
  fill('Educational qualification (optional)', '12th');
  fill('Preferred callback time (optional)', 'evening');
  fill('Message (optional)', '  What are the fees?  ');
  submit();

  expect(await screen.findByText('Thank you! Your enquiry has been sent.')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveFocus();
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe(ENQUIRY_ENDPOINT);
  expect(url).toBe('/api/enquiries');
  expect(options.method).toBe('POST');
  const payload = JSON.parse(options.body);
  expect(payload).toEqual({
    name: 'Asha Sharma',
    mobile: '9876543210',
    email: 'asha@example.com',
    course: 'gaming',
    qualification: '12th',
    callbackTime: 'evening',
    message: 'What are the fees?',
    sourcePage: '/VFX?ref=test',
    formLocation: 'popup',
    website: '',
    elapsedMs: expect.any(Number),
  });
  expect(alertSpy).not.toHaveBeenCalled();
  alertSpy.mockRestore();

  fireEvent.click(screen.getByRole('button', { name: 'Send another enquiry' }));
  expect(screen.getByLabelText('Student name')).toHaveValue('');
  expect(screen.getByLabelText('Message (optional)')).toHaveValue('');
  expect(screen.getByLabelText('Course interested in')).toHaveValue('gaming');
  window.history.pushState({}, '', '/');
});

test('shows a loading state and ignores repeated clicks while sending', async () => {
  let resolve;
  global.fetch.mockReturnValue(new Promise((done) => { resolve = done; }));
  render(<EnquiryForm />);
  fillValid();
  const button = screen.getByRole('button', { name: 'Send enquiry' });
  fireEvent.click(button);
  fireEvent.click(button);
  fireEvent.submit(screen.getByRole('form', { name: 'Admission enquiry' }));

  expect(button).toHaveTextContent('Sending…');
  expect(button).toBeDisabled();
  expect(screen.getByLabelText('Student name')).toBeDisabled();
  expect(screen.getByRole('form', { name: 'Admission enquiry' })).toHaveAttribute('aria-busy', 'true');
  expect(global.fetch).toHaveBeenCalledTimes(1);

  await act(async () => resolve(jsonResponse(200, { ok: true })));
  expect(await screen.findByText('Thank you! Your enquiry has been sent.')).toBeInTheDocument();
});

test('acknowledges a duplicate enquiry without an error', async () => {
  global.fetch.mockResolvedValue(jsonResponse(200, { ok: true, duplicate: true }));
  render(<EnquiryForm />);
  fillValid();
  submit();
  expect(await screen.findByText('We already have your enquiry.')).toBeInTheDocument();
});

test('keeps the entered data and offers call and WhatsApp when sending fails', async () => {
  global.fetch.mockResolvedValue(jsonResponse(503, { ok: false, error: 'email_unavailable' }));
  render(<EnquiryForm />);
  fillValid();
  submit();

  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('could not send your enquiry right now');
  expect(alert.querySelector('a[href^="tel:"]')).not.toBeNull();
  expect(alert.querySelector('a[href^="https://wa.me/"]')).not.toBeNull();
  expect(screen.getByLabelText('Email address')).toHaveValue('asha@example.com');
  expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeEnabled();
});

test('shows server-side field errors next to the fields', async () => {
  global.fetch.mockResolvedValue(jsonResponse(422, { ok: false, error: 'validation_failed', fields: { email: 'Enter a valid email address.' } }));
  render(<EnquiryForm />);
  fillValid();
  submit();

  expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
  expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Email address')).toHaveFocus();
});

test('explains rate limiting, network failures and timeouts', async () => {
  global.fetch.mockResolvedValueOnce(jsonResponse(429, { ok: false, error: 'rate_limited', retryAfterSeconds: 120 }));
  render(<EnquiryForm />);
  fillValid();
  submit();
  expect(await screen.findByRole('alert')).toHaveTextContent('try again in about 2 minutes');

  global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
  submit();
  expect(await screen.findByText(/check your internet connection/)).toBeInTheDocument();

  global.fetch.mockRejectedValueOnce(Object.assign(new Error('aborted'), { name: 'AbortError' }));
  submit();
  expect(await screen.findByText(/took too long/)).toBeInTheDocument();
});

test('silently drops submissions that fill the honeypot field', async () => {
  const { container } = render(<EnquiryForm />);
  fillValid();
  fireEvent.change(container.querySelector('input[name="website"]'), { target: { value: 'spam' } });
  submit();

  expect(await screen.findByText('Thank you! Your enquiry has been sent.')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});
