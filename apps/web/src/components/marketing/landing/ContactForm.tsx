import { getTranslations } from 'next-intl/server'

import { cx } from './cx'
import { DESTINATIONS, ORIGINS, SERVICES } from './data'
import { ArrowRightIcon } from './icons'
import styles from './landing.module.css'
import { QuoteForm } from './QuoteForm'

/** Formulario de solicitud de cotización. Campos en el servidor; envío en `QuoteForm`. */
export async function ContactForm() {
  const t = await getTranslations('landing.contact')
  const tc = await getTranslations('landing.countries')

  return (
    <QuoteForm
      label={t('form.label')}
      sentTitle={t('form.sentTitle')}
      sentDescription={t('form.sentDescription')}
      sendAnother={t('form.sendAnother')}
      classNames={{
        form: styles.form ?? '',
        sent: styles.sent ?? '',
        sentTitle: styles.sentTitle ?? '',
        sentText: styles.sentText ?? '',
        sentAgain: styles.sentAgain ?? '',
      }}
    >
      <label className={styles.field}>
        {t('form.name')}
        <input
          className={styles.input}
          name="name"
          required
          autoComplete="name"
          placeholder={t('form.namePlaceholder')}
        />
      </label>
      <label className={styles.field}>
        {t('form.company')}
        <input
          className={styles.input}
          name="company"
          autoComplete="organization"
          placeholder={t('form.companyPlaceholder')}
        />
      </label>
      <label className={styles.field}>
        {t('form.email')}
        <input
          className={styles.input}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={t('form.emailPlaceholder')}
        />
      </label>
      <label className={styles.field}>
        {t('form.service')}
        <select className={styles.input} name="service">
          {SERVICES.map((service) => (
            <option key={service} value={service}>
              {t(`services.${service}`)}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        {t('form.origin')}
        <select className={styles.input} name="origin">
          {ORIGINS.map((code) => (
            <option key={code} value={code}>
              {tc(code)}
            </option>
          ))}
          <option value="other">{tc('other')}</option>
        </select>
      </label>
      <label className={styles.field}>
        {t('form.destination')}
        <select className={styles.input} name="destination">
          {DESTINATIONS.map((code) => (
            <option key={code} value={code}>
              {tc(code)}
            </option>
          ))}
          <option value="other">{tc('other')}</option>
        </select>
      </label>
      <label className={cx(styles.field, styles.fieldWide)}>
        {t('form.details')}
        <textarea
          className={cx(styles.input, styles.textarea)}
          name="details"
          rows={4}
          placeholder={t('form.detailsPlaceholder')}
        />
      </label>

      <div className={styles.formFooter}>
        <span className={styles.formNote}>{t('form.responseNote')}</span>
        <button type="submit" className={cx(styles.button, styles.buttonPrimary)}>
          {t('form.submit')}
          <ArrowRightIcon className={styles.buttonArrow} />
        </button>
      </div>
    </QuoteForm>
  )
}
