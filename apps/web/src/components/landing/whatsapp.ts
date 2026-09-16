/** Número comercial único. Cambiarlo aquí lo cambia en toda la landing. */
export const WHATSAPP_NUMBER = '+57 324 2182112'

export const whatsappHref = (number: string = WHATSAPP_NUMBER): string =>
  'https://wa.me/' + number.replace(/[^0-9]/g, '')
