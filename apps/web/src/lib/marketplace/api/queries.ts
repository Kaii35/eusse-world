'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiRequest } from './client'

import type { Cart, Me, OwnSupplier, Product, PublicSupplier, PrintChoice } from './types'

/**
 * Datos del servidor en TanStack Query (ADR-0012). Nunca se copian a un store.
 */

export const queryKeys = {
  me: ['auth', 'me'] as const,
  mySupplier: ['supplier', 'me'] as const,
  myProducts: ['supplier', 'products'] as const,
  suppliers: ['suppliers'] as const,
  supplierProducts: (supplierId: string) => ['suppliers', supplierId, 'products'] as const,
  cart: ['cart'] as const,
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => apiRequest<Me>('GET', '/auth/me'),
    retry: false,
  })
}

/** Sin proveedor, la API responde 404: la página lo trata como "no registrado", no como error. */
export function useMySupplier() {
  return useQuery({
    queryKey: queryKeys.mySupplier,
    queryFn: async (): Promise<OwnSupplier | null> => {
      try {
        return await apiRequest<OwnSupplier>('GET', '/supplier/me')
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
    retry: false,
  })
}

export function useMyProducts(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.myProducts,
    queryFn: () => apiRequest<Product[]>('GET', '/supplier/products'),
    enabled,
    retry: false,
  })
}

export function useActiveSuppliers() {
  return useQuery({
    queryKey: queryKeys.suppliers,
    queryFn: () => apiRequest<PublicSupplier[]>('GET', '/suppliers'),
    retry: false,
  })
}

export function useSupplierProducts(supplierId: string) {
  return useQuery({
    queryKey: queryKeys.supplierProducts(supplierId),
    queryFn: () => apiRequest<Product[]>('GET', `/suppliers/${supplierId}/products`),
    retry: false,
  })
}

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => apiRequest<Cart>('GET', '/cart'),
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      apiRequest<Me>('POST', '/auth/login', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiRequest<undefined>('POST', '/auth/logout'),
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: {
      email: string
      password: string
      firstName: string
      lastName: string
      company: { legalName: string; taxId: string; phone?: string }
    }) => apiRequest<{ status: string }>('POST', '/auth/register', input),
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      apiRequest<{ status: string }>('POST', '/auth/verify-email', { token }),
  })
}

export function useRegisterSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { legalName: string; taxId: string; phone?: string }) =>
      apiRequest<OwnSupplier>('POST', '/supplier/register', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.mySupplier }),
  })
}

export type ProductInput = {
  name: string
  category: string
  basePrice: { amount: number; currency: string }
  colors: string[]
  sizes: string[]
  printOptions: {
    technique: string
    sizes: string[]
    placements: string[]
    unitFee: { amount: number; currency: string }
  }[]
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => apiRequest<Product>('POST', '/supplier/products', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myProducts }),
  })
}

export function usePublishProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) =>
      apiRequest<Product>('POST', `/supplier/products/${productId}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.myProducts }),
  })
}

export function useAddCartLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      productId: string
      color: string
      qtyBySize: Record<string, number>
      print: PrintChoice | null
    }) => apiRequest<unknown>('POST', '/cart/lines', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  })
}

export function useRemoveCartLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lineId: string) => apiRequest<undefined>('DELETE', `/cart/lines/${lineId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  })
}
