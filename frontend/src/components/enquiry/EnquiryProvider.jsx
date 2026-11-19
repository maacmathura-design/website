import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal } from '../ui';
import EnquiryForm from './EnquiryForm';
import { FORM_LOCATION } from '../../data/enquiry';

const EnquiryContext = createContext(null);

export function EnquiryProvider({ children }) {
  const [request, setRequest] = useState({ open: false, course: undefined, key: 0 });

  const openEnquiry = useCallback((course) => {
    setRequest((current) => ({ open: true, course: typeof course === 'string' ? course : undefined, key: current.key + 1 }));
  }, []);
  const closeEnquiry = useCallback(() => setRequest((current) => ({ ...current, open: false })), []);

  const value = useMemo(() => ({ openEnquiry, closeEnquiry }), [openEnquiry, closeEnquiry]);

  return (
    <EnquiryContext.Provider value={value}>
      {children}
      <Modal
        open={request.open}
        onClose={closeEnquiry}
        title="Enquire now"
        description="Tell us what you would like to study and the MAAC Mathura team will get in touch."
        size="lg"
      >
        <EnquiryForm key={request.key} defaultCourse={request.course} formLocation={FORM_LOCATION.popup} />
      </Modal>
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  const context = useContext(EnquiryContext);
  if (!context) throw new Error('useEnquiry must be used inside <EnquiryProvider>');
  return context;
}
