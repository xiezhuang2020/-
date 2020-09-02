import Vue from 'vue'
import Router from 'vue-router'
// 一级路由
import login from '@/pages/login'
// 系统设置下的二级路由
import index from '@/pages/index'
import menu from '@/pages/menu'
import Layout from '@/pages/Layout'
import role from '@/pages/role'
import user from '@/pages/user'
// 商品管理下的二级路由
import goods from '@/pages/goods'
import member from '@/pages/member'
import seckill from '@/pages/seckill'
import banner from '@/pages/banner'
import specs from '@/pages/specs'
import category from '@/pages/category'
Vue.use(Router)

let router = new Router({
  routes: [{
      // 一级路由
      path: '/login',
      component: login
    },
    {
      path: '/',
      component: Layout,
      // 二级路由
      children: [{
        path: 'index',
        component: index
      }, {
        path: 'menu',
        component: menu
      }, {
        path: 'role',
        component: role
      }, {
        path: 'user',
        component: user
      }, {
        path: 'goods',
        component: goods
      }, {
        path: 'member',
        component: member
      }, {
        path: 'seckill',
        component: seckill
      }, {
        path: 'banner',
        component: banner
      }, {
        path: 'specs',
        component: specs
      }, {
        path: 'category',
        component: category
      }, {
        path: '*',
        redirect: '/index'
      }]
    }

  ]
})
router.beforeEach((to, from, next) => {
  let user = JSON.parse(sessionStorage.getItem('user'))
  if (user) {
    if (to.path == '/login') {
      next(false)
    } else {
      next()
    }
  } else {
    if (to.path == '/login') {
      next()
    } else {
      next('/login')
    }
  }
})



export default router
