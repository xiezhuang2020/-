<template>
  <div class="layout">
    <el-container>
      <el-aside width="201px">
        <!-- 左边分类导航视图↓ -->
        <sibdebar></sibdebar>
      </el-aside>

      <el-container>
        <el-header>
          {{username}}
          <!-- 下拉选项 -->
          <el-dropdown @command="logout">
            <span class="el-dropdown-link">
              <i class="el-icon-setting"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-header>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import sibdebar from "@/components/SideBar.vue";
// import { mapMutations } from "../utils/vuex";
export default {
  components: {
    sibdebar,
  },
  computed: {
    username() {
   
      return this.$store.state.user.username;
      // return JSON.parse(sessionStorage.getItem("user")).username;
    },
  },
  //
  methods: {
    // 退出
    logout(command) {
      // console.log(command);
      sessionStorage.clear();
      this.$store.commit("clearinfo");
      this.$router.replace("/login");
    },
  },
};
</script>

<style lang='stylus'>
.layout {
  height: 100%;

  .el-header {
    line-height: 55px;
    padding-right: 50px;
    text-align: right;
    background-color: #B3C0D1;
  }
}
</style>