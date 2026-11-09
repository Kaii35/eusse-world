'use client'

import { Button } from '@eusse/ui'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { errorClass, fieldClass, headingClass, labelClass, noticeClass, sectionClass } from './ui'

import { Link, useRouter } from '@/lib/i18n/navigation'
import { useLogin, useRegister } from '@/lib/marketplace/api/queries'
import { useApiErrorMessage } from '@/lib/marketplace/useApiErrorMessage'

type Mode = 'login' | 'register'

/** Ingreso y registro. Tras ingresar, la tienda. Tras registrarse, pide verificar el correo. */
export function AccessPanel() {
  const t = useTranslations('marketplace.access')
  const tStore = useTranslations('marketplace.store')
  const errorMessage = useApiErrorMessage()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')

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
  const failure = login.error ?? register.error

  function onSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
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
      company: { legalName, taxId, ...(phone ? { phone } : {}) },
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <section className={sectionClass} aria-labelledby="access-title">
        <h1 id="access-title" className={headingClass}>
          {mode === 'login' ? t('loginTitle') : t('registerTitle')}
        </h1>

        {register.isSuccess ? (
          <p role="status" className={noticeClass}>
            {t('registered')}
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <label className={labelClass}>
              {t('email')}
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                }}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              {t('password')}
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
                className={fieldClass}
              />
            </label>

            {mode === 'register' ? (
              <>
                <label className={labelClass}>
                  {t('firstName')}
                  <input
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value)
                    }}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  {t('lastName')}
                  <input
                    required
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value)
                    }}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  {t('legalName')}
                  <input
                    required
                    value={legalName}
                    onChange={(e) => {
                      setLegalName(e.target.value)
                    }}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  {t('taxId')}
                  <input
                    required
                    value={taxId}
                    onChange={(e) => {
                      setTaxId(e.target.value)
                    }}
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  {t('phone')}
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                    }}
                    className={fieldClass}
                  />
                </label>
              </>
            ) : null}

            {failure ? (
              <p role="alert" className={errorClass}>
                {errorMessage(failure)}
              </p>
            ) : null}

            <Button type="submit" isLoading={pending} disabled={pending}>
              {mode === 'login' ? t('login') : t('register')}
            </Button>
          </form>
        )}
      </section>

      {register.isSuccess ? null : (
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
          }}
          className="text-primary text-body-sm self-center underline-offset-4 hover:underline"
        >
          {mode === 'login' ? t('switchToRegister') : t('switchToLogin')}
        </button>
      )}

      <Link href="/tienda" className="text-muted-foreground text-body-sm self-center">
        {tStore('back')}
      </Link>
    </div>
  )
}
