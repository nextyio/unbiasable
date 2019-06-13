import RNGPage from '@/module/page/rng/Container'
import ManualPage from '@/module/page/manual/Container'

import LoginPage from '@/module/page/login/Container'

import NotFound from '@/module/page/error/NotFound'

export default [
  {
    path: '/',
    page: LoginPage
  },
  {
    path: '/home',
    page: RNGPage
  },
  {
    path: '/manual',
    page: ManualPage
  },
  {
    path: '/login',
    page: LoginPage
  },
  {
    page: NotFound
  }
]
