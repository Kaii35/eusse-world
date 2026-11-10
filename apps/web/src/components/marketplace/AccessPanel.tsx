'use client'

import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { buttonClass, controlClass, cx, Field, Notice, Eyebrow } from './kit'
import styles from './wholesale.module.css'

import { Link, useRouter } from '@/lib/i18n/navigation'
import { useLogin, useRegister } from '@/lib/marketplace/api/queries'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

type Mode = 'login' | 'register'

/**
 * Registro e ingreso. Columna izquierda en azul de la landing con la propuesta; columna
 * derecha con el formulario. Tras ingresar, la tienda. Tras registrarse, pide revisar el correo.
 */
export function AccessPanel({ initialMode }: { initialMode: Mode }) {
  const t = useTranslations('marketplace.access')
  const errorMessage = useApiErrorMessage()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialMode)
  const ids = useId()

  const login = useLogin()
  const register = useRegister()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [phone, setPhone] = useState('')

  const pending = login.isPending || register.isPending
  const failure = mode === 'login' ? login.error : register.error

  function submit() {
    if (mode === 'login') {
      login.mutate(
        { email, password },
        {
          onSuccess: () => {
            router.push('/tienda')
          },
        },
      )
      return
    }
    register.mutate({
      email,
      password,
      firstName,
      lastName,
      company: { legalName, taxId, phone },
    })
  }

  function switchMode(next: Mode) {
    setMode(next)
    login.reset()
    register.reset()
  }

  const points = [t('heroPoint1'), t('heroPoint2'), t('heroPoint3')]

  return (
    <div className={styles.authWrap}>
      <aside className={styles.authAside}>
        <div className="flex flex-col gap-6">
          <Eyebrow onDark>{t('heroEyebrow')}</Eyebrow>
          <h1 className={cx(styles.display, styles.h1)}>{t('heroTitle')}</h1>
          <p className={styles.authLead}>{t('heroBody')}</p>
        </div>
        <ul className={styles.authPoints}>
          {points.map((point) => (
            <li key={point} className={styles.authPoint}>
              <span aria-hidden="true" className={styles.authDot} />
              {point}
            </li>
          ))}
        </ul>
      </aside>

      <section className={styles.authMain} aria-labelledby={`${ids}-title`}>
        {register.isSuccess ? (
          <div className={styles.authForm}>
            <Eyebrow>{t('tabRegister')}</Eyebrow>
            <h2 id={`${ids}-title`} className={cx(styles.display, styles.h2)}>
              {t('registeredTitle')}
            </h2>
            <Notice>{t('registered')}</Notice>
            <button
              type="button"
              className={buttonClass({ variant: 'secondary' })}
              onClick={() => {
                switchMode('login')
              }}
            >
              {t('goLogin')}
            </button>
          </div>
        ) : (
          <div className={styles.authForm}>
            <div role="tablist" aria-label={t('tabsLabel')} className={styles.tabs}>
              {(['login', 'register'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`${ids}-tab-${tab}`}
                  aria-selected={mode === tab}
                  aria-controls={`${ids}-form`}
                  onClick={() => {
                    switchMode(tab)
                  }}
                  className={cx(styles.tab, mode === tab && styles.tabOn)}
                >
                  {tab === 'login' ? t('tabLogin') : t('tabRegister')}
                </button>
              ))}
            </div>

            <div
              id={`${ids}-form`}
              role="tabpanel"
              aria-labelledby={`${ids}-tab-${mode}`}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h2 id={`${ids}-title`} className={cx(styles.display, styles.h2)}>
                  {mode === 'login' ? t('loginTitle') : t('registerTitle')}
                </h2>
                <p className={styles.muted}>
                  {mode === 'login' ? t('loginBody') : t('registerBody')}
                </p>
              </div>

              <form
                className="flex flex-col gap-5"
                noValidate
                onSubmit={(event: { preventDefault: () => void }) => {
                  event.preventDefault()
                  submit()
                }}
              >
                {mode === 'register' ? (
                  <fieldset className="flex flex-col gap-4">
                    <legend className="text-body mb-1 font-semibold">{t('sectionPerson')}</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t('firstName')} htmlFor={`${ids}-first`}>
                        <input
                          id={`${ids}-first`}
                          required
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(event) => {
                            setFirstName(event.target.value)
                          }}
                          className={controlClass}
                        />
                      </Field>
                      <Field label={t('lastName')} htmlFor={`${ids}-last`}>
                        <input
                          id={`${ids}-last`}
                          required
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(event) => {
                            setLastName(event.target.value)
                          }}
                          className={controlClass}
                        />
                      </Field>
                    </div>
                  </fieldset>
                ) : null}

                <fieldset className="flex flex-col gap-4">
                  {mode === 'register' ? (
                    <legend className="text-body mb-1 font-semibold">{t('sectionCompany')}</legend>
                  ) : (
                    <legend className="sr-only">{t('loginTitle')}</legend>
                  )}
                  {mode === 'register' ? (
                    <>
                      <Field label={t('legalName')} htmlFor={`${ids}-legal`}>
                        <input
                          id={`${ids}-legal`}
                          required
                          value={legalName}
                          onChange={(event) => {
                            setLegalName(event.target.value)
                          }}
                          className={controlClass}
                        />
                      </Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={t('taxId')} htmlFor={`${ids}-tax`}>
                          <input
                            id={`${ids}-tax`}
                            required
                            value={taxId}
                            onChange={(event) => {
                              setTaxId(event.target.value)
                            }}
                            className={controlClass}
                          />
                        </Field>
                        <Field label={t('phone')} htmlFor={`${ids}-phone`}>
                          <input
                            id={`${ids}-phone`}
                            type="tel"
                            required
                            autoComplete="tel"
                            value={phone}
                            onChange={(event) => {
                              setPhone(event.target.value)
                            }}
                            className={controlClass}
                          />
                        </Field>
                      </div>
                    </>
                  ) : null}

                  <Field label={t('email')} htmlFor={`${ids}-email`}>
                    <input
                      id={`${ids}-email`}
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                      }}
                      className={controlClass}
                    />
                  </Field>
                  <Field
                    label={t('password')}
                    htmlFor={`${ids}-password`}
                    hint={mode === 'register' ? t('passwordHint') : undefined}
                  >
                    <input
                      id={`${ids}-password`}
                      type="password"
                      required
                      minLength={mode === 'register' ? 12 : undefined}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                      }}
                      className={controlClass}
                    />
                  </Field>
                </fieldset>

                {failure ? (
                  <Notice tone="danger" role="alert">
                    {errorMessage(failure)}
                  </Notice>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  aria-busy={pending}
                  className={buttonClass({ size: 'lg', block: true })}
                >
                  {mode === 'login' ? t('login') : t('register')}
                </button>
              </form>

              <button
                type="button"
                className={cx(buttonClass({ variant: 'ghost' }), 'self-start')}
                onClick={() => {
                  switchMode(mode === 'login' ? 'register' : 'login')
                }}
              >
                {mode === 'login' ? t('switchToRegister') : t('switchToLogin')}
              </button>
            </div>
          </div>
        )}

        <div className={styles.authForm}>
          <Link href="/tienda" className={buttonClass({ variant: 'ghost' })}>
            {t('back')}
          </Link>
        </div>
      </section>
    </div>
  )
}
