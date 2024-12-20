/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RequestPasswordResetImport } from './routes/request-password-reset'
import { Route as RegisterImport } from './routes/register'
import { Route as LoginImport } from './routes/login'
import { Route as DetailsImport } from './routes/details'
import { Route as CheckoutImport } from './routes/checkout'
import { Route as AccountImport } from './routes/account'
import { Route as IndexImport } from './routes/index'
import { Route as VerifyCodeIndexImport } from './routes/verify/$code/index'
import { Route as ProductsSlugIndexImport } from './routes/products/$slug/index'
import { Route as PasswordresetCodeIndexImport } from './routes/passwordreset/$code/index'
import { Route as PageUrlIndexImport } from './routes/page/$url/index'
import { Route as CategoryNameIndexImport } from './routes/category/$name/index'

// Create/Update Routes

const RequestPasswordResetRoute = RequestPasswordResetImport.update({
  path: '/request-password-reset',
  getParentRoute: () => rootRoute,
} as any)

const RegisterRoute = RegisterImport.update({
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const DetailsRoute = DetailsImport.update({
  path: '/details',
  getParentRoute: () => rootRoute,
} as any)

const CheckoutRoute = CheckoutImport.update({
  path: '/checkout',
  getParentRoute: () => rootRoute,
} as any)

const AccountRoute = AccountImport.update({
  path: '/account',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const VerifyCodeIndexRoute = VerifyCodeIndexImport.update({
  path: '/verify/$code/',
  getParentRoute: () => rootRoute,
} as any)

const ProductsSlugIndexRoute = ProductsSlugIndexImport.update({
  path: '/products/$slug/',
  getParentRoute: () => rootRoute,
} as any)

const PasswordresetCodeIndexRoute = PasswordresetCodeIndexImport.update({
  path: '/passwordreset/$code/',
  getParentRoute: () => rootRoute,
} as any)

const PageUrlIndexRoute = PageUrlIndexImport.update({
  path: '/page/$url/',
  getParentRoute: () => rootRoute,
} as any)

const CategoryNameIndexRoute = CategoryNameIndexImport.update({
  path: '/category/$name/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/account': {
      preLoaderRoute: typeof AccountImport
      parentRoute: typeof rootRoute
    }
    '/checkout': {
      preLoaderRoute: typeof CheckoutImport
      parentRoute: typeof rootRoute
    }
    '/details': {
      preLoaderRoute: typeof DetailsImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/request-password-reset': {
      preLoaderRoute: typeof RequestPasswordResetImport
      parentRoute: typeof rootRoute
    }
    '/category/$name/': {
      preLoaderRoute: typeof CategoryNameIndexImport
      parentRoute: typeof rootRoute
    }
    '/page/$url/': {
      preLoaderRoute: typeof PageUrlIndexImport
      parentRoute: typeof rootRoute
    }
    '/passwordreset/$code/': {
      preLoaderRoute: typeof PasswordresetCodeIndexImport
      parentRoute: typeof rootRoute
    }
    '/products/$slug/': {
      preLoaderRoute: typeof ProductsSlugIndexImport
      parentRoute: typeof rootRoute
    }
    '/verify/$code/': {
      preLoaderRoute: typeof VerifyCodeIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  AccountRoute,
  CheckoutRoute,
  DetailsRoute,
  LoginRoute,
  RegisterRoute,
  RequestPasswordResetRoute,
  CategoryNameIndexRoute,
  PageUrlIndexRoute,
  PasswordresetCodeIndexRoute,
  ProductsSlugIndexRoute,
  VerifyCodeIndexRoute,
])

/* prettier-ignore-end */
