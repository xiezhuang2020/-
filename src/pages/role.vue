<template>
  <div>
    <!-- 面包屑导航 separator: 分割符-->
    <el-breadcrumb separator-class="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="javascript:;">角色管理</a>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="router-container">
      <el-button type="primary" @click="handleadd">添加</el-button>
      <!-- 利用返回的数据生成树桩结构表单 -->
      <el-table :data="data" style="width: 100%" row-key="id" border>
        <!-- prop: 关联的data中的数据 -->
        <el-table-column prop="rolename" label="名称" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="180">
          <!-- 插槽插入  自定义内容 -->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status==1" effect="dark" type="success">已启用</el-tag>
            <el-tag v-if="scope.row.status==2" effect="dark" type="danger">已禁用</el-tag>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 弹出对话框  -->
      <el-dialog
        :title="'角色'+tip"
        :before-close="handleReset"
        :visible.sync="dialogVisible"
        width="50%"
      >
        <el-form :model="ruleForm" :rules="rules" ref="f1">
          <el-form-item prop="rolename" label="角色名称">
            <el-input v-model="ruleForm.rolename"></el-input>
          </el-form-item>
          <!-- 树桩结构 -->
          <el-form-item label="角色权限">
            <!-- 
                data绑定的树桩结构数据
                show-checkbox 可选择
                node-key  节点表示
                props children 子节点数据
                label 文本是title 属性
                ref 添加标记  获取后面的checked-key做准备
            -->
            <el-tree
              ref="m"
              :data="menu"
              :props="{children:'children',label:'title'}"
              show-checkbox
              node-key="id"
              :default-checked-keys="menus"
            ></el-tree>
          </el-form-item>
          <!-- 切换时触发 changeStatus函数-->
          <el-form-item label="状态">
            <el-switch
              v-model="status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="changeStatus"
            ></el-switch>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="handleReset">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 树型结构 ,后台获取
      data: [],
      // 对话框是否显示
      dialogVisible: false,
      //对话框标题文本
      tip: "",
      ruleForm: {
        rolename: "",
        status: "1",
      },
      menu: [],
      status: true,
      menus: [],
      rules: {
        rolename: [
          { required: true, message: "请输入上级菜单", trigger: "blur" },
        ],
      },
    };
  },
  mounted() {
    this.$axios.get("/api/rolelist").then((res) => {
      if (res.code == 200) {
        this.data = res.list;
      } else {
        this.$message({
          type: "warn",
          $message: res.msg,
        });
      }
    });
  },
  methods: {
    getmenu() {
      // 获取菜单的树桩结构
      this.$axios.get("/api/menulist?istree=1").then((res) => {
        this.menu = res.list;
      });
    },
    // 点编辑时的函数
    handleEdit(row) {
      this.getmenu();
      this.tip = "修改";
      // 显示对话框
      this.dialogVisible = true;
      this.$axios
        .get("/api/roleinfo", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          let info = res.list;
          this.menus = res.list.menus.split(",");
          // 点击修改弹出对话框向ruleform添id属性
          info.id = row.id.toString();
          this.ruleForm = info;
        });
    },

    // 点击添加时
    handleadd() {
      // 获取菜单
      this.getmenu();
      this.tip = "添加";
      this.dialogVisible = true;
    },
    // 点击删除函数
    handleDelete(row) {
      //根据id 删除数据
      this.$axios.post("/api/roledelete", { id: row.id }).then((res) => {
        // console.log($message);
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: "删除成功",
          });
          this.data = res.list ? res.list : [];
        } else {
          this.$message({
            type: "warn",
            message: res.msg,
          });
        }
      });
    },
    // 点击取消函数 ,还原表单数据
    handleReset() {
      this.dialogVisible = false;
      this.ruleForm = {
        rolename: "",
        status: "1",
      };
    },
    // 点击提交函数
    handleSubmit() {
      this.dialogVisible = false;
      // 通过是否具有id 来判断 修改还是新增
      let url = this.ruleForm.id ? "/api/roleedit" : "/api/roleadd";
      let menus = this.$refs.m.getCheckedKeys().join(",");
      console.log(url, menus);
      this.ruleForm.menus = menus;
      this.$axios.post(url, this.ruleForm).then((res) => {
        // 向后台提交数据
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: res.msg,
          });
          // 添加成功 获取最新的菜单列表来渲染
          this.$axios.get("/api/rolelist").then((res) => {
            console.log(res);
            if (res.code == 200) {
              this.data = res.list || [];
            } else {
              this.$message({
                type: "warn",
                message: res.msg,
              });
            }
          });
        } else {
          this.$message({
            type: "warn",
            message: res.msg,
          });
        }
        // 重置表单
        this.ruleForm = {
          rolename: "",
          status: "1",
        };
      });
    },
    // 点击切换状态函数
    changeStatus(val) {
      this.ruleForm.status = val ? "1" : "2";
    },
  },
};
</script>

<style>
.el-button {
  margin-top: 20px;
}
</style>