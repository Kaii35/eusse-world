'use client'

import { useEffect, useRef } from 'react'

/**
 * Cierra un `<details>` al hacer clic fuera, al pulsar Escape (devolviendo el foco al
 * `<summary>`) y al activar un enlace de dentro. Sin JS el `<details>` sigue
 * funcionando: esto sólo pule el comportamiento.
 */
export function useDismissDetails<T extends HTMLDetailsElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const details = ref.current
    if (!details) return undefined

    const close = (): void => {
      details.open = false
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (details.open && !details.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || !details.open) return
      close()
      details.querySelector('summary')?.focus()
    }
    const onClick = (event: MouseEvent): void => {
      if ((event.target as Element).closest('a')) close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    details.addEventListener('keydown', onKeyDown)
    details.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      details.removeEventListener('keydown', onKeyDown)
      details.removeEventListener('click', onClick)
    }
  }, [])

  return ref
}
