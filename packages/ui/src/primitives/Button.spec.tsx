import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

/**
 * Se consulta por ROL ACCESIBLE (`getByRole`), nunca por clase CSS ni `data-testid`:
 * así el test verifica la accesibilidad de paso y no se rompe con cambios visuales
 * (skills/testing.md).
 */
describe('Button', () => {
  it('debería exponerse como botón con su nombre accesible', () => {
    render(<Button>Añadir al carrito</Button>)
    expect(screen.getByRole('button', { name: 'Añadir al carrito' })).toBeInTheDocument()
  })

  it('debería ser de tipo button por defecto, no submit', () => {
    // Dentro de un <form>, el tipo por defecto de <button> es "submit": explicitarlo
    // evita envíos accidentales.
    render(<Button>Acción</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('debería respetar un type explícito', () => {
    render(<Button type="submit">Confirmar</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('debería responder al clic', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Pulsar</Button>)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('debería ser operable con teclado', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Pulsar</Button>)

    await userEvent.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
  })

  describe('estado de carga', () => {
    it('debería anunciarse como ocupado y quedar deshabilitado', () => {
      render(<Button isLoading>Confirmar pedido</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toBeDisabled()
    })

    it('no debería dispararse dos veces durante la carga', async () => {
      // El segundo clic es la causa número uno de órdenes duplicadas (riesgo R-04).
      const onClick = vi.fn()
      render(
        <Button isLoading onClick={onClick}>
          Confirmar pedido
        </Button>,
      )

      await userEvent.click(screen.getByRole('button'))

      expect(onClick).not.toHaveBeenCalled()
    })

    it('no debería marcar aria-busy cuando no está cargando', () => {
      render(<Button>Acción</Button>)
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
    })
  })

  describe('asChild', () => {
    it('debería renderizar un enlace conservando el rol correcto', () => {
      // Un <button> dentro de un <a> es HTML inválido y confunde al lector de pantalla.
      render(
        <Button asChild>
          <a href="/es/catalog">Ver catálogo</a>
        </Button>,
      )

      expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute(
        'href',
        '/es/catalog',
      )
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  it('debería permitir que el consumidor sobrescriba clases', () => {
    render(<Button className="w-full">Ancho completo</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('debería propagar las props nativas del elemento', () => {
    render(<Button aria-label="Cerrar" data-state="open" />)
    expect(screen.getByRole('button', { name: 'Cerrar' })).toHaveAttribute('data-state', 'open')
  })
})
