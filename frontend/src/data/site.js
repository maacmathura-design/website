export const phone = {
  display: '+91 8859833392',
  tel: '+918859833392',
  whatsapp: '918859833392',
};

export const whatsappMessage = 'Hello, I would like to know more about your services.';

export const whatsappUrl = `https://wa.me/${phone.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

export const social = {
  instagram: 'https://www.instagram.com/maacmathura?igsh=MmlhbzA1MHUzdGlu',
  facebook: 'https://www.facebook.com/profile.php?id=61555951572659',
  whatsapp: whatsappUrl,
};
