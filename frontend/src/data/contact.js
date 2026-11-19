import { phone, social, whatsappUrl } from './site';

/**
 * Centre contact details.
 * email, address, hours and mapEmbedUrl are null because they do not appear anywhere in the
 * existing site. The contact page renders a field only when it has a value, so these stay
 * unpublished rather than being filled with placeholders.
 */
export const contactDetails = {
  phone,
  whatsappUrl,
  email: null,
  address: null,
  hours: null,
  mapEmbedUrl: null,
  channels: [
    { id: 'instagram', label: 'Instagram', value: 'maacmathura', href: social.instagram },
    { id: 'facebook', label: 'Facebook', value: 'MAAC Mathura', href: social.facebook },
  ],
};
