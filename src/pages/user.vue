<template>
  <div>
    <!-- 面包屑导航separator: 分割符-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="javascript:void(0);">管理员列表</a>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div>
      <el-button type="primary" @click="handleAdd" style="margin-top: 30px;">添加</el-button>
      <!-- 
        利用返回数据生成树状结构表格
      -->
      <el-table :data="data" style="width: 100%" row-key="id" border>
        <!-- 
          prop : 关联的data 中的数据的名称
          label : 表头文字
          默认将 关联数据的文本作为内容项
        -->
        <!-- prop: 指定关联的data 数据的属性 -->
        <el-table-column prop="uid" label="用户编号" width="180"></el-table-column>
        <el-table-column prop="rolename" label="角色" width="150"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column label="状态" prop="status">
          <!-- 插槽插入  自定义内容 -->
          <template slot-scope="scope">
            <!-- scope.row ： 这一行的数据 -->
            <el-tag v-if="scope.row.status==1" effect="dark" type="success">已启用</el-tag>
            <el-tag v-if="scope.row.status==2" effect="dark" type="danger">已禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 点击编辑和删除按钮，做对应的操作，传入参数为这一行的数据 -->
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 弹出对话框：    -->
      <el-dialog
        :title="'角色'+tip"
        :visible.sync="dialogVisible"
        width="50%"
        :before-close="handleReset"
      >
        <el-form label-width="150px">
          <!-- 下拉选择框 -->
          <el-form-item label="角色">
            <el-select v-model="userFrom.roleid" @change="changeuser">
              <el-option
                v-for="item in user"
                :key="item.id"
                :label="item.rolename"
                :value="item.roleid"
              ></el-option>
            </el-select>
          </el-form-item>

          <!-- 树状结构 -->
          <el-form-item label="用户名">
            <el-input v-model="userFrom.username"></el-input>
          </el-form-item>

          <el-form-item label="密码">
            <el-input type="password" v-model="userFrom.password"></el-input>
          </el-form-item>

          <!-- 切换时触发 changeStatus函数 -->
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
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        @current-change="fn"
        :page-size="pagesize"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 数据后台回去
      data: [],

      //对话框是否显示
      dialogVisible: false,

      // 要显示的标题
      tip: "",

      userFrom: {
        password: "",
        status: "1",
        username: "",
        roleid: "",
        id: "",
      },
      user: [],
      // 总条数
      total: 0,
      // 每页显示多少条
      pagesize: 3,
      // 每次显示几页
      pages: 1,
      // 状态
      status: true,
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
      },
    };
  },
  mounted() {
    // 获取管理员数据
    this.getotal();
  },

  methods: {
    // 获取管理员数据
    getotal() {
      this.$axios.get("/api/usercount").then((res) => {
        this.total = res.list[0].total;
      });
      this.getlist();
    },
    getlist() {
      this.$axios
        .get("/api/userlist", { params: { size: this.pagesize, page: 1 } })
        .then((res) => {
          if (res.code == 200) {
            this.data = res.list;
          } else {
            this.$message({
              type: "warn",
              message: res.msg,
            });
          }
        });
    },
    getuser() {
      this.$axios
        .get("/api/userlist", { params: { size: this.pagesize, page: 1 } })
        .then((res) => {
          this.user = res.list;
        });
    },
    // 页码变化状态
    fn(page) {
      this.$axios
        .get("/api/usercount", { params: { size: this.pagesize } })
        .then((res) => {
          this.total = res.list[0].total;
          this.$axios
            .get("/api/userlist", {
              params: { size: this.pagesize, page: page },
            })
            .then((res) => {
              if (res.code == 200) {
                this.data = res.list;
              } else {
                this.$message({
                  type: "warn",
                  message: res.msg,
                });
              }
            });
        });
    },
    // 添加
    handleAdd() {
      this.getuser();
      this.tip = "添加";
      this.dialogVisible = true;
    },
    // 修改
    handleEdit(row) {
      this.getuser();
      this.tip = "修改";
      this.dialogVisible = true;
      this.$axios.get("/api/userinfo?uid=" + row.uid).then((res) => {
        let info = res.list;
        info.username;
        info.status;
        info.id = row.id;
        this.userFrom = info;
      });
    },
    // 取消
    handleReset() {
      this.dialogVisible = false;
      // 点击取消还原 表单数据
      this.userFrom = {
        password: "",
        status: "1",
        username: "",
        roleid: "",
        id: "",
      };
    },
    // 确认提交
    handleSubmit() {
      this.dialogVisible = false;
      let url = this.userFrom.id ? "/api/useredit" : "/api/useradd";
      this.$axios.post(url, this.userFrom).then((res) => {
        console.log(url, this.userFrom);
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: res.msg,
          });
          // 添加成功 获取最新的菜单列表来渲染
          this.$axios
            .get("/api/userlist", { params: { size: this.pagesize, page: 1 } })
            .then((res) => {
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
          // 重置表单
          this.userFrom = {
            password: "",
            status: "",
            username: "",
            roleid: "",
            id: "1",
          };
        }
      });
    },
    // 切换状态
    changeStatus(val) {
      this.userFrom.status = val ? "1" : "2";
      console.log(this.userFrom.status);
    },
    // 选择角色
    changeuser(val) {
      this.userFrom.type = val ? "1" : "2";
    },
    // 删除
    handleDelete(row) {
      this.$axios.post("/api/userdelete", { id: row.id }).then((res) => {
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: "删除成功",
          });
          this.data = res.list ? res.list : [];
          this.getlist();
        } else {
          this.$message({
            type: "warn",
            message: res.msg,
          });
        }
      });
    },
  },
};
</script>

<style>
</style>