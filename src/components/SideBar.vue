<template>
  <div>
    <el-menu
      class="el-menu-vertical-demo"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      unique-opened
      :default-active="$route.path"
    >
      <el-menu-item class="cen">网吧后台管理系统</el-menu-item>

      <el-menu-item index="/index">
        <i class="el-icon-menu"></i>
        <!-- 首页 -->
        <span slot="title">
          <router-link to="/index">首页</router-link>
        </span>
      </el-menu-item>

      <!-- 一级菜单 -->
      <el-submenu v-for="(item, index) in menus" :key="index" :index="(index+1).toString()">
        <!-- 标题插槽 -->
        <span slot="title">
          <i :class="item.icon"></i>
          {{item.title}}
        </span>
        <!-- 一级菜单下的二级菜单 -->
        <el-menu-item-group>
          <el-menu-item v-for="(sub,index) in item.children" :index="sub.url" :key="index">
            <router-link :to="sub.url">{{sub.title}}</router-link>
          </el-menu-item>
        </el-menu-item-group>
      </el-submenu>
      <!-- 一级菜单下的二级菜单 -->
    </el-menu>
  </div>
</template>

<script>
export default {
  // mounted() {
  //   console.log(this.$store.state.user.menus[0].children);
  // },
  computed: {
    menus() {
      return this.$store.state.user.menus;
    },
  },
};
</script>

<style >
/* 左侧宽带 */
.el-menu {
  width: 200px;
}

/*  */
.el-submenu .el-menu-item {
  min-width: 149px;
  height: 100%;
}
.cen {
  text-align: center;
}
/* 导航栏的颜色 */
a {
  text-decoration: none;
  color: #fff;
}

/* 活跃样式 */
.el-menu .is-active a.router-link-active,
.is-opened .is-active a.router-link-active {
  color: #ffd04b;
}
</style>