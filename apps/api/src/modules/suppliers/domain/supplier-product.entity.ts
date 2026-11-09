import { PRINT_TECHNIQUE, SUPPLIER_TEXT_LIMITS, type PrintTechnique } from '@eusse/contracts'

import type { Money } from '@eusse/domain'

import { DomainError } from '../../../shared-kernel/domain/domain-error'

/**
 * Producto de un proveedor: una prenda con sus colores, tallas y estampados (RFC-0016 §4.1).
 *
 * Invariantes:
 *   · I-6: solo pasa a `PUBLISHED` con al menos un color, una talla y un precio base > 0.
 *   · Colores y tallas no se repiten.
 *   · Una técnica de estampado aparece una sola vez por producto.
 *   · Todos los importes comparten la moneda del precio base.
 *   · El precio por unidad lo calcula el servidor: precio base más costo de estampado (R-04).
 *
 * Vive en `domain/`: sin NestJS, sin Prisma, sin HTTP.
 */

export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS]

export type PrintOption = {
  readonly technique: PrintTechnique
  readonly sizes: readonly string[]
  readonly placements: readonly string[]
  /** Costo adicional por unidad cuando se estampa. Puede ser cero. */
  readonly unitFee: Money
}

/** Elección de estampado de un comprador. Debe existir en las opciones del producto. */
export type PrintSelection = {
  readonly technique: PrintTechnique
  readonly size: string
  readonly placement: string
}

export type SupplierProductProps = {
  readonly id: string
  readonly supplierId: string
  readonly name: string
  readonly category: string
  readonly basePrice: Money
  readonly colors: readonly string[]
  readonly sizes: readonly string[]
  readonly printOptions: readonly PrintOption[]
  readonly status: ProductStatus
}

export type NewSupplierProduct = Omit<SupplierProductProps, 'status'>

export class SupplierProductIncompleteError extends DomainError {
  override readonly name = 'SupplierProductIncompleteError'

  constructor(missing: readonly string[]) {
    super('SUPPLIER_PRODUCT_INCOMPLETE', `Para publicar faltan: ${missing.join(', ')}`, { missing })
  }
}

export class PrintNotAvailableError extends DomainError {
  override readonly name = 'PrintNotAvailableError'

  constructor(reason: string, selection: PrintSelection) {
    super('SUPPLIER_PRINT_NOT_AVAILABLE', `Este artículo no admite ese estampado (${reason})`, {
      reason,
      technique: selection.technique,
    })
  }
}

export class InvalidSupplierProductError extends DomainError {
  override readonly name = 'InvalidSupplierProductError'

  constructor(message: string, field: string) {
    super('COMMON_VALIDATION_FAILED', message, { field })
  }
}

export class SupplierProduct {
  private constructor(private readonly props: SupplierProductProps) {}

  /** Crea un producto en borrador. Los datos incompletos son válidos mientras es borrador. */
  static draft(input: NewSupplierProduct): SupplierProduct {
    const name = input.name.trim()
    const category = input.category.trim()
    if (name.length === 0 || name.length > SUPPLIER_TEXT_LIMITS.productName) {
      throw new InvalidSupplierProductError('Nombre de producto no válido', 'name')
    }
    if (category.length === 0 || category.length > SUPPLIER_TEXT_LIMITS.category) {
      throw new InvalidSupplierProductError('Categoría no válida', 'category')
    }
    assertUnique(input.colors, 'color', 'colors')
    assertUnique(input.sizes, 'talla', 'sizes')
    assertUniqueTechniques(input.printOptions)
    for (const option of input.printOptions) {
      if (option.unitFee.currency !== input.basePrice.currency) {
        throw new InvalidSupplierProductError(
          'Todos los importes de un producto deben estar en la misma moneda',
          'printOptions',
        )
      }
    }
    return new SupplierProduct({
      ...input,
      name,
      category,
      status: PRODUCT_STATUS.DRAFT,
    })
  }

  static restore(props: SupplierProductProps): SupplierProduct {
    return new SupplierProduct({ ...props })
  }

  get id(): string {
    return this.props.id
  }

  get supplierId(): string {
    return this.props.supplierId
  }

  get name(): string {
    return this.props.name
  }

  get category(): string {
    return this.props.category
  }

  get basePrice(): Money {
    return this.props.basePrice
  }

  get colors(): readonly string[] {
    return this.props.colors
  }

  get sizes(): readonly string[] {
    return this.props.sizes
  }

  get printOptions(): readonly PrintOption[] {
    return this.props.printOptions
  }

  get status(): ProductStatus {
    return this.props.status
  }

  /** I-6: publicar exige datos completos. Lista todo lo que falta, no solo el primero. */
  publish(): SupplierProduct {
    if (this.props.status !== PRODUCT_STATUS.DRAFT) {
      throw new InvalidSupplierProductError(
        `Solo un borrador se puede publicar (estado actual: ${this.props.status})`,
        'status',
      )
    }
    const missing: string[] = []
    if (this.props.colors.length === 0) missing.push('al menos un color')
    if (this.props.sizes.length === 0) missing.push('al menos una talla')
    if (this.props.basePrice.amount <= 0) missing.push('un precio base mayor que cero')
    if (missing.length > 0) throw new SupplierProductIncompleteError(missing)
    return new SupplierProduct({ ...this.props, status: PRODUCT_STATUS.PUBLISHED })
  }

  archive(): SupplierProduct {
    return new SupplierProduct({ ...this.props, status: PRODUCT_STATUS.ARCHIVED })
  }

  /**
   * Comprueba que el comprador pide sólo colores y tallas que el proveedor declara. Un
   * pedido con una talla inventada no llega al proveedor.
   */
  assertOrderable(color: string, sizes: readonly string[]): void {
    if (this.props.status !== PRODUCT_STATUS.PUBLISHED) {
      throw new InvalidSupplierProductError('Solo se puede pedir un producto publicado', 'status')
    }
    if (!this.props.colors.includes(color)) {
      throw new InvalidSupplierProductError(`El color "${color}" no está disponible`, 'color')
    }
    for (const size of sizes) {
      if (!this.props.sizes.includes(size)) {
        throw new InvalidSupplierProductError(`La talla "${size}" no está disponible`, 'sizes')
      }
    }
  }

  /**
   * Precio de una unidad. Sin estampado, el precio base. Con estampado, precio base más
   * costo de la técnica. Una combinación que el proveedor no ofrece lanza error: nunca se
   * cobra un precio inventado.
   */
  unitPriceFor(selection: PrintSelection | null): Money {
    if (selection === null) return this.props.basePrice

    const option = this.props.printOptions.find((o) => o.technique === selection.technique)
    if (!option) throw new PrintNotAvailableError('técnica no ofrecida', selection)
    if (!option.sizes.includes(selection.size)) {
      throw new PrintNotAvailableError('tamaño no ofrecido', selection)
    }
    if (!option.placements.includes(selection.placement)) {
      throw new PrintNotAvailableError('ubicación no ofrecida', selection)
    }
    return this.props.basePrice.add(option.unitFee)
  }
}

function assertUnique(values: readonly string[], label: string, field: string): void {
  const seen = new Set<string>()
  for (const raw of values) {
    const key = raw.trim().toLowerCase()
    if (key.length === 0) {
      throw new InvalidSupplierProductError(`Un ${label} no puede estar vacío`, field)
    }
    if (seen.has(key)) {
      throw new InvalidSupplierProductError(`El ${label} "${raw}" está repetido`, field)
    }
    seen.add(key)
  }
}

function assertUniqueTechniques(options: readonly PrintOption[]): void {
  const seen = new Set<PrintTechnique>()
  for (const option of options) {
    if (!Object.values(PRINT_TECHNIQUE).includes(option.technique)) {
      throw new InvalidSupplierProductError('Técnica de estampado no válida', 'printOptions')
    }
    if (seen.has(option.technique)) {
      throw new InvalidSupplierProductError(
        `La técnica ${option.technique} aparece dos veces`,
        'printOptions',
      )
    }
    seen.add(option.technique)
  }
}
