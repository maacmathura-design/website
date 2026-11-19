import React, { useEffect, useId, useRef, useState } from 'react';
import { LuAlertCircle, LuCheckCircle2, LuPhone, LuSend } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import { ENQUIRY_ENDPOINT } from '../../config/api';
import { enquiryCourseGroups, enquiryCourseOptions } from '../../data/courses';
import { ENQUIRY_LIMITS, FORM_LOCATION, callbackTimeOptions, qualificationOptions } from '../../data/enquiry';
import { phone, whatsappUrl } from '../../data/site';
import { PrimaryButton, SecondaryButton } from '../ui';
import { cx } from '../../utils/cx';
import styles from './EnquiryForm.module.css';

const REQUEST_TIMEOUT_MS = 20000;
const FIELD_ORDER = ['name', 'mobile', 'email', 'course', 'qualification', 'callbackTime', 'message'];
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const SUCCESS_MESSAGE = 'The MAAC Mathura team will contact you soon.';

const isKnownCourse = (value) => enquiryCourseOptions.some((option) => option.value === value);
const isOption = (options, value) => options.some((option) => option.value === value);

/** Accepts 10-digit Indian mobile numbers, optionally prefixed with +91, 91 or 0. */
export const normaliseMobile = (value) => {
  const digits = value.replace(/[\s()-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
};

/** Mirrors the backend rules so most mistakes are caught before a request is made. */
export const validateEnquiry = ({ name, mobile, email, course, qualification = '', callbackTime = '', message = '' }) => {
  const errors = {};
  const trimmedName = name.trim().replace(/\s+/g, ' ');
  if (!trimmedName) errors.name = 'Please enter the student’s name.';
  else if (trimmedName.length < 2) errors.name = 'Name must be at least 2 characters.';
  else if (!NAME_PATTERN.test(trimmedName)) errors.name = 'Use letters, spaces, dots, hyphens and apostrophes only.';

  if (!mobile.trim()) errors.mobile = 'Please enter a mobile number.';
  else if (!normaliseMobile(mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number, for example 98765 43210.';

  const trimmedEmail = email.trim();
  if (!trimmedEmail) errors.email = 'Please enter an email address.';
  else if (!EMAIL_PATTERN.test(trimmedEmail)) errors.email = 'Enter a valid email address, for example name@gmail.com.';

  if (!isKnownCourse(course)) errors.course = 'Please choose a course.';
  if (qualification && !isOption(qualificationOptions, qualification)) errors.qualification = 'Please choose a qualification from the list.';
  if (callbackTime && !isOption(callbackTimeOptions, callbackTime)) errors.callbackTime = 'Please choose a time from the list.';
  if (message.trim().length > ENQUIRY_LIMITS.message) errors.message = `Please keep your message under ${ENQUIRY_LIMITS.message} characters.`;
  return errors;
};

/** Turns an API failure into a message for the student (and field errors, when the API sent them). */
export const describeFailure = (status, body) => {
  if (status === 422 && body?.fields) {
    return { message: 'Please correct the highlighted fields.', fields: body.fields };
  }
  if (status === 429) {
    const minutes = body?.retryAfterSeconds ? Math.max(1, Math.ceil(body.retryAfterSeconds / 60)) : null;
    return {
      message: `We have received several enquiries from this connection. Please try again${minutes ? ` in about ${minutes} minute${minutes === 1 ? '' : 's'}` : ' later'}, or call or WhatsApp us.`,
    };
  }
  if (body?.error === 'too_fast') return { message: 'Please check your details and press Send enquiry again.' };
  if (status === 502 || status === 503) {
    return { message: 'Sorry, we could not send your enquiry right now. Please try again in a few minutes, or call or WhatsApp us.' };
  }
  if (status === 'timeout') return { message: 'The request took too long. Please check your connection and try again.' };
  if (status === 'network') return { message: 'We could not reach our server. Please check your internet connection and try again.' };
  return { message: 'Sorry, your enquiry could not be sent. Please try again, or call or WhatsApp us.' };
};

const initialValues = (course) => ({
  name: '',
  mobile: '',
  email: '',
  course: isKnownCourse(course) ? course : enquiryCourseOptions[0].value,
  qualification: '',
  callbackTime: '',
  message: '',
});

const currentPage = () =>
  typeof window === 'undefined' ? undefined : `${window.location.pathname}${window.location.search}${window.location.hash}`.slice(0, 300);

const EnquiryForm = ({ defaultCourse, formLocation = FORM_LOCATION.page, submitLabel = 'Send enquiry', className, onSubmitted }) => {
  const id = useId();
  const formRef = useRef(null);
  const resultRef = useRef(null);
  const inFlight = useRef(false);
  const startedAt = useRef(Date.now());
  const [values, setValues] = useState(() => initialValues(defaultCourse));
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [failure, setFailure] = useState(null);
  const [result, setResult] = useState(null);

  // Fields are disabled while sending, so focus moves only after the next render re-enables them.
  const pendingFocus = useRef(null);
  useEffect(() => {
    if (status === 'success') resultRef.current?.focus();
  }, [status]);
  useEffect(() => {
    if (pendingFocus.current && status !== 'submitting') {
      formRef.current?.elements.namedItem(pendingFocus.current)?.focus();
      pendingFocus.current = null;
    }
  });

  const fieldId = (name) => `${id}-${name}`;
  const errorId = (name) => `${id}-${name}-error`;

  const focusField = (name) => {
    pendingFocus.current = name;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;

    const validationErrors = validateEnquiry(values);
    const firstInvalid = FIELD_ORDER.find((name) => validationErrors[name]);
    if (firstInvalid) {
      setErrors(validationErrors);
      setFailure(null);
      setStatus('idle');
      focusField(firstInvalid);
      return;
    }
    setErrors({});
    setFailure(null);

    // Bots fill every field; people never see this one.
    if (honeypot) {
      setResult({ message: SUCCESS_MESSAGE });
      setStatus('success');
      return;
    }

    inFlight.current = true;
    setStatus('submitting');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      let response;
      try {
        response = await fetch(ENQUIRY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name.trim().replace(/\s+/g, ' '),
            mobile: normaliseMobile(values.mobile),
            email: values.email.trim(),
            course: values.course,
            qualification: values.qualification || undefined,
            callbackTime: values.callbackTime || undefined,
            message: values.message.trim() || undefined,
            sourcePage: currentPage(),
            formLocation,
            website: honeypot,
            elapsedMs: Date.now() - startedAt.current,
          }),
          signal: controller.signal,
        });
      } catch (error) {
        const reason = error?.name === 'AbortError' ? 'timeout' : 'network';
        setFailure(describeFailure(reason));
        setStatus('error');
        return;
      }

      const body = await response.json().catch(() => null);
      if (!response.ok || body?.ok === false) {
        const described = describeFailure(response.status, body);
        setFailure(described);
        setStatus('error');
        if (described.fields) {
          setErrors(described.fields);
          const first = FIELD_ORDER.find((name) => described.fields[name]);
          if (first) focusField(first);
        }
        return;
      }

      setValues(initialValues(values.course));
      setResult({ duplicate: Boolean(body?.duplicate) });
      setStatus('success');
      onSubmitted?.();
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
    }
  };

  const startAgain = () => {
    startedAt.current = Date.now();
    setResult(null);
    setStatus('idle');
  };

  if (status === 'success') {
    return (
      <div className={cx(styles.result, className)} role="status" tabIndex={-1} ref={resultRef}>
        <LuCheckCircle2 className={styles.resultIcon} aria-hidden="true" />
        <p className={styles.resultTitle}>
          {result?.duplicate ? 'We already have your enquiry.' : 'Thank you! Your enquiry has been sent.'}
        </p>
        <p className={styles.resultText}>{SUCCESS_MESSAGE}</p>
        <SecondaryButton size="sm" onClick={startAgain}>Send another enquiry</SecondaryButton>
      </div>
    );
  }

  const describedBy = (name, ...extra) => [errors[name] ? errorId(name) : null, ...extra].filter(Boolean).join(' ') || undefined;

  const label = (name, text, optional) => (
    <label className={styles.label} htmlFor={fieldId(name)}>
      {text}
      {optional && <span className={styles.optional}> (optional)</span>}
    </label>
  );

  const errorText = (name) => errors[name] && <p id={errorId(name)} className={styles.error}>{errors[name]}</p>;

  const input = (name, text, inputProps) => (
    <div className={styles.field}>
      {label(name, text)}
      <input
        id={fieldId(name)}
        name={name}
        className={styles.input}
        value={values[name]}
        onChange={handleChange}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(name)}
        required
        {...inputProps}
      />
      {errorText(name)}
    </div>
  );

  const select = (name, text, { optional, placeholder, groups, options }) => (
    <div className={styles.field}>
      {label(name, text, optional)}
      <select
        id={fieldId(name)}
        name={name}
        className={cx(styles.input, styles.select)}
        value={values[name]}
        onChange={handleChange}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(name)}
        required={!optional}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {groups
          ? groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </optgroup>
            ))
          : options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
      </select>
      {errorText(name)}
    </div>
  );

  const submitting = status === 'submitting';
  const messageLength = values.message.trim().length;

  return (
    <form
      ref={formRef}
      className={cx(styles.form, className)}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Admission enquiry"
      aria-busy={submitting || undefined}
    >
      <fieldset className={styles.fieldset} disabled={submitting}>
        <div className={styles.grid}>
          {input('name', 'Student name', { type: 'text', autoComplete: 'name', maxLength: ENQUIRY_LIMITS.name })}
          {input('mobile', 'Mobile number', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', maxLength: 16, placeholder: '10-digit number' })}
          {input('email', 'Email address', { type: 'email', autoComplete: 'email', maxLength: ENQUIRY_LIMITS.email })}
          {select('course', 'Course interested in', { groups: enquiryCourseGroups })}
          {select('qualification', 'Educational qualification', { optional: true, placeholder: 'Select qualification', options: qualificationOptions })}
          {select('callbackTime', 'Preferred callback time', { optional: true, placeholder: 'Select a time', options: callbackTimeOptions })}
          <div className={cx(styles.field, styles.wide)}>
            {label('message', 'Message', true)}
            <textarea
              id={fieldId('message')}
              name="message"
              className={cx(styles.input, styles.textarea)}
              rows={3}
              value={values.message}
              onChange={handleChange}
              maxLength={ENQUIRY_LIMITS.message}
              placeholder="Anything you would like to ask about fees, batches or the course"
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={describedBy('message', `${id}-message-count`)}
            />
            <p id={`${id}-message-count`} className={styles.hint}>
              {messageLength}/{ENQUIRY_LIMITS.message} characters
            </p>
            {errorText('message')}
          </div>
        </div>

        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor={fieldId('website')}>Leave this field empty</label>
          <input
            id={fieldId('website')}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>
      </fieldset>

      <div className={styles.footer}>
        <PrimaryButton type="submit" size="lg" fullWidth icon={<LuSend />} disabled={submitting}>
          {submitting ? 'Sending…' : submitLabel}
        </PrimaryButton>
        <p className={styles.note}>By submitting, you agree to be contacted by MAAC Mathura about your enquiry.</p>
      </div>

      {status === 'error' && failure && (
        <div className={styles.formError} role="alert">
          <p className={styles.formErrorText}>
            <LuAlertCircle aria-hidden="true" />
            {failure.message}
          </p>
          {!failure.fields && (
            <p className={styles.formErrorActions}>
              <a href={`tel:${phone.tel}`}><LuPhone aria-hidden="true" /> Call {phone.display}</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><FaWhatsapp aria-hidden="true" /> WhatsApp us</a>
            </p>
          )}
        </div>
      )}
    </form>
  );
};

export default EnquiryForm;
