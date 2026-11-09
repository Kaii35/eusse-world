'use client'

import { Button } from '@eusse/ui'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { controlClass, Field, Notice, Surface } from './kit'

import { Link, useRouter } from '@/lib/i18n/navigation'
import { useLogin, useRegister } from '@/lib/marketplace/api/queries'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

type Mode = 'login' | 'register'

/**
 * Ingreso y registro en una sola pantalla. Tras ingresar, la tienda. Tras registrarse,
 * una pantalla que pide revisar el correo antes de seguir.
 */
export function AccessPanel({ initialMode }: { initialMode: Mode }) {
  const t = useTranslations('marketplace.access')
  const tStore = useTranslations('marketplace.store')
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

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:py-16">
      <aside className="bg-primary text-primary-foreground flex flex-col justify-between gap-8 rounded-lg p-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-h2 font-semibold">{t('heroTitle')}</h1>
          <p className="text-body opacity-90">{t('heroBody')}</p>
        </div>
        <ul className="text-body-sm flex flex-col gap-3">
          <li>{t('heroPoint1')}</li>
          <li>{t('heroPoint2')}</li>
          <li>{t('heroPoint3')}</li>
        </ul>
      </aside>

      <Surface labelledBy={`${ids}-title`}>
        {register.isSuccess ? (
          <div className="flex flex-col gap-4">
            <h2 id={`${ids}-title`} className="text-h3 text-foreground font-semibold">
              {t('registeredTitle')}
            </h2>
            <Notice>{t('registered')}</Notice>
            <Button
              variant="secondary"
              onClick={() => {
                switchMode('login')
              }}
            >
              {t('goLogin')}
            </Button>
          </div>
        ) : (
          <>
            <div
              role="tablist"
              aria-label={t('tabLogin')}
              className="bg-surface-sunken grid grid-cols-2 gap-1 rounded-md p-1"
            >
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
                  className={
                    mode === tab
                      ? 'bg-surface text-foreground text-body-sm shadow-raised rounded-sm py-2 font-semibold'
                      : 'text-muted-foreground text-body-sm rounded-sm py-2'
                  }
                >
                  {tab === 'login' ? t('tabLogin') : t('tabRegister')}
                </button>
              ))}
            </div>

            <div id={`${ids}-form`} role="tabpanel" aria-labelledby={`${ids}-tab-${mode}`}>
              <div className="flex flex-col gap-1 pb-4">
                <h2 id={`${ids}-title`} className="text-h3 text-foreground font-semibold">
                  {mode === 'login' ? t('loginTitle') : t('registerTitle')}
                </h2>
                <p className="text-body-sm text-muted-foreground">
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
                    <legend className="text-body font-semibold">{t('sectionPerson')}</legend>
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
                    <legend className="text-body font-semibold">{t('sectionCompany')}</legend>
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

                <Button
                  type="submit"
                  size="lg"
                  isLoading={pending}
                  disabled={pending}
                  className="w-full"
                >
                  {mode === 'login' ? t('login') : t('register')}
                </Button>
              </form>

              <button
                type="button"
                className="text-primary text-body-sm mt-4 underline-offset-4 hover:underline"
                onClick={() => {
                  switchMode(mode === 'login' ? 'register' : 'login')
                }}
              >
                {mode === 'login' ? t('switchToRegister') : t('switchToLogin')}
              </button>
            </div>
          </>
        )}
      </Surface>

      <div className="lg:col-span-2">
        <Link
          href="/tienda"
          className="text-primary text-body-sm underline-offset-4 hover:underline"
        >
          {tStore('back')}
        </Link>
      </div>
    </div>
  )
}
