import UnbiasablePage from '@/module/page/unbiasable/Container'

import LoginPage from '@/module/page/login/Container'

import NotFound from '@/module/page/error/NotFound'

export default [
  {
    path: '/',
    page: LoginPage
  },
  {
    path: '/home',
    page: UnbiasablePage
  },
  {
    path: '/login',
    page: LoginPage
  },
  {
    page: NotFound
  }
]
