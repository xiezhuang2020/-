<template>
  <div>
    <!-- 面包屑分类 -->
    <el-breadcrumb separator-class="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="javascript:;">商品规格</a>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div>
      <el-button type="primary" @click="handleadd">添加</el-button>

      <!-- 表单 -->
      <el-table :data="specsdata" style="width: 100%" row-key="id" border>
        <!-- prop: 关联的data中的数据 -->
        <el-table-column prop="specsname" label="属性名称" width="180"></el-table-column>
        <el-table-column label="属性值" width="180">
          <!-- 插槽插入  自定义内容 -->
          <template slot-scope="scope">
            <!-- scope.row ： 这一行的数据 -->
            <el-tag v-for="(item, index) in scope.row.attrs" :key="index">{{item}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="form.status" width="180px">
          <!-- 插槽插入  自定义内容 -->
          <template slot-scope="scope">
            <!-- scope.row ： 这一行的数据 -->
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

      <!-- 点击添加弹窗 -->
      <el-dialog :title="'规格'+tip" :visible.sync="infoVisible">
        <el-form :model="form" :rules="rules" ref="form" label-width="100px">
          <!-- 属性名称 -->
          <el-form-item label="属性名称" prop="specsname">
            <el-input v-model="form.specsname"></el-input>
          </el-form-item>
          <!-- 属性值 -->
          <el-form-item label="属性值" prop="attrs">
            <!-- v-model 不能绑定v-for的item的值把数据变成数组成员对象的属性 -->
            <div class="attr-box" v-for="(item, index) in form.attrs" :key="index">
              <el-input type="text" v-model="item.value"></el-input>
              <!-- !-- 根据index 来决定 显示哪个按钮 -->
              <el-button dark type="primary" v-if="index===0" @click="handleAddAttr">添加属性</el-button>
              <el-button dark type="danger" v-if="index>0" @click="handleRemoveAttr(index)">删除</el-button>
            </div>
          </el-form-item>

          <el-form-item label="状态">
            <el-switch v-model="form.status" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleReset('form')">取 消</el-button>
          <el-button type="primary" @click="handleSubmit('form')">确 定</el-button>
        </div>
      </el-dialog>
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="pagesize"></el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 后台获取数据
      specsdata: [],
      // 对话框是否显示
      infoVisible: false,
      // 菜单标题
      tip: "",

      // 验证规则
      rules: {
        specsname: [
          { required: true, message: "请输入规格标题", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 2 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
      // 总条数
      total: 0,
      // 每页显示多少条
      pagesize: 5,
      // 每次显示几页
      pages: 1,
      // 表单数据
      form: {
        attrs: [{ value: "" }],
        specsname: "",
        status: true,
      },
    };
  },
  mounted() {
    this.getpagelist();
    this.getcount();
  },
  methods: {
    // 编辑
    handleEdit(row) {
      this.tip = "修改";
      this.infoVisible = true;
      let id = row.id;
      this.$axios
        .get("/api/specsinfo", {
          params: {
            id,
          },
        })
        .then((res) => {
          console.log(res);
          let attrs = res.list[0].attrs.map((item) => {
            return {
              value: item,
            };
          });
          this.form.attrs = attrs;
          this.form.id = res.list[0].id;
          this.form.specsname = res.list[0].specsname;
          this.form.status = res.list[0].status === 1 ? true : false;
        });
    },
    // 获取当前页数的数据
    getpagelist() {
      this.$axios
        .get("/api/specslist", {
          params: { size: this.pagesize, page: 1 },
        })
        .then((res) => {
          console.log(res);
          if (res.code == 200) {
            this.specsdata = res.list;
          } else {
            this.$message({
              type: "warn",
              message: res.msg,
            });
          }
        });
    },
    // 获取规格数量
    getcount() {
      this.$axios.get("/api/specscount").then((res) => {
        console.log(res);
        this.total = res.lsit ? res.list[0].total : 0;
      });
    },
    // 添加
    handleadd() {
      this.infoVisible = true;
      this.tip = "添加";
      this.form = {
        specsname: "",
        attrs: [{ value: "" }],
        status: true,
      };
    },
    // 添加属性
    handleAddAttr() {
      this.form.attrs.unshift({ value: "" });
    },
    // 点击确认
    handleSubmit(form) {
      this.$refs[form].validate((valid) => {
        if (!valid) {
          return false;
        }
        this.form.status = this.form.status ? 1 : 2;
        let attrs = this.form.attrs.map((item) => item.value);
        this.form.attrs = attrs.join(",");
        let url = this.form.id ? "/api/specsedit" : "/api/specsadd";
        this.$axios.post(url, this.form).then((res) => {
          console.log(url, this.form);
          if ((res.code = 200)) {
            this.$message({
              showClose: true,
              message: res.msg,
              type: "success",
            });
            this.infoVisible = false;
            this.getpagelist();
          } else {
            this.$message({
              showClose: true,
              message: res.msg,
              type: "error",
            });
          }
        });
      });
      this.form = {
        specsname: "",
        attrs: [{ value: "" }],
        status: true,
      };
    },
    // 取消
    handleReset() {
      this.infoVisible = false;
      this.tip = "添加";
      this.from = {
        attrs: [{ value: "" }],
        specsname: "",
        status: true,
      };
    },
    // 删除属性
    handleRemoveAttr(i) {
      this.form.attrs.splice(i, 1);
    },
    // 删除
    handleDelete(row) {
      this.$confirm("此操作将永久删除规格, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 点击确定之后的操作
        this.$axios.post("/api/specsdelete", { id: row.id }).then((res) => {
          console.log(res);
          if (res.code == 200) {
            this.$message({
              type: "success",
              message: res.msg,
            });
            this.specsdata = res.list;
          } else {
            this.$message({
              type: "wran",
              message: res.msg,
            });
          }
        });
      });
    },
  },
};
</script>

<style>
.el-button {
  margin-top: 20px;
}
/* 修改组件样式不能设置为作用域样式，避免影响其它组件中使用该组件间受到影响，用自己设置的容器包裹它 */
.attr-box .el-input {
  width: 200px;
}
.attr-box .el-button {
  margin-top: 0px;
}
</style>