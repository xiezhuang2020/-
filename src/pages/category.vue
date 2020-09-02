<template>
  <div>
    <!-- 面包屑分类 -->
    <el-breadcrumb separator-class="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="javascript:;">分类管理</a>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div>
      <el-button type="primary" @click="handleadd">添加</el-button>

      <!-- 表单 -->
      <el-table
        :data="data"
        style="width: 100%"
        row-key="id"
        border
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <!-- prop: 关联的data中的数据 -->
        <el-table-column prop="catename" label="分类名称" width="180"></el-table-column>
        <el-table-column label="状态" prop="status" width="180px">
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

      <!-- 点击添加的弹框 -->
      <el-dialog :title="'菜单'+tip" :visible.sync="dialogVisible" width="50%">
        <el-form :model="cateForm" :rules="rules" ref="f1">
          <el-form-item label="上级分类" prop="pid" width="180px">
            <!-- 下拉选择框 -->
            <el-select v-model="cateForm.pid" placeholder="请选择上级类">
              <el-option :key="0" label="顶层菜单" :value="'0'"></el-option>
              <el-option
                v-for="item in catelist"
                :key="item.id"
                :label="item.catename"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 分类名称 -->
          <el-form-item prop="catename" label="分类名称">
            <el-input v-model="cateForm.catename"></el-input>
          </el-form-item>
          <!-- 照片墙 -->
          <el-form-item label="分类照片">
            <!--
              action  提交地址  必填  站位
              list-type 图片墙
              auto-upload  是否上传照片后自动上传

            -->
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :file-list="filelist"
              :on-change="onchange"
            >
              <!-- 上传 -->
              <i slot="default" class="el-icon-plus"></i>
              <!-- 图片的缩略插槽 -->
              <div slot="file" slot-scope="{file}">
                <!-- 预览图片 -->
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
                <!-- 预览图片图标 -->
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                  >
                    <i class="el-icon-zoom-in"></i>
                  </span>
                  <!-- 移除图片 -->
                  <span
                    v-if="!disabled"
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
              </div>
            </el-upload>
            <!--预览框-->
            <!-- <el-dialog :visible.sync="disabled">
              <img width="100%" :src="dialogImageUrl" alt />
            </el-dialog>-->
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
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      // 树形数据，后台获取
      data: [],
      // 图片遮罩
      disabled: false,
      dialogImageUrl: "",
      // 标题
      tip: "",
      //对话框是否显示
      dialogVisible: false,
      // 状态
      status: true,
      // 文件列表
      filelist: [],
      cateForm: {
        // 上级分类
        pid: "0",
        // 分类名称
        catename: "",
        // 图片
        img: "",
        // 状态
        status: "1",
        // id
      },
      // 分类列表数据
      catelist: [],
      // 验证
      rules: {
        pid: [{ required: true, message: "请输入上级菜单", trigger: "blur" }],
        catename: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
    };
  },
  mounted() {
    //   获取菜单数据 istree =1 返回树状结构数据渲染表格
    this.$axios.get("/api/catelist?istree=1").then((res) => {
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
  methods: {
    // 获取一级菜单
    getCate() {
      this.$axios.get("/api/catelist?pid=0").then((res) => {
        this.catelist = res.list;
      });
    },
    // 添加
    handleadd() {
      // 显示对话框
      this.dialogVisible = true;
      // 对话框标题修改
      this.tip = "添加";
      // 获取菜单
      this.getCate();
    },

    // 文件改变   上传文件
    onchange(file) {
      this.cateForm.img = file.raw;
    },
    // 切换状态
    changeStatus(val) {
      this.cateForm.status = val ? "1" : "2";
      console.log(this.cateForm.status);
    },
    // 修改
    handleEdit(row) {
      //  获取菜单
      this.getCate();
      // 修改标题
      this.tip = "修改";
      // 显示对话框
      this.dialogVisible = true;
      this.$axios.get("/api/cateinfo?id=" + row.id).then((res) => {
        console.log(res);
        // 点击修改弹出对话框，向 ruleform 添加 id 属性
        let info = res.list;
        info.id = row.id;
        info.pid = row.pid == 0 ? "顶级菜单" : row.pid;
        this.cateForm = info;
        // 状态赋值
        this.status = info.status == "1" ? true : false;
        // 设置图片预览图
        this.filelist = [{ name: "", url: "http://localhost:3000" + info.img }];
      });
    },
    // 删除
    handleDelete(row) {
      this.$axios.post("/api/catedelete", { id: row.id }).then((res) => {
        // console.log(res);
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
    // 提交操作
    handleSubmit() {
      this.cateForm.pid = this.cateForm.pid == "顶级菜单" ? 0 : "";
      this.dialogVisible = false;
      // 通过是否具有id 来判断 修改还是新增
      let url = this.cateForm.id ? "/api/cateedit" : "/api/cateadd";
      //1.新建表单数据对象
      let formData = new FormData();
      // 2.需要上传的数据添加到容器中
      for (var str in this.cateForm) {
        // @params1: 推入的属性名
        // @params2: 推入的属性值
        formData.append(str, this.cateForm[str]);
      }
      // console.log(formData);
      // 3.由于需要上传图片文件，需要改写header
      axios({
        method: "post",
        url,
        data: formData,
        headers: {
          Authorization: sessionStorage.getItem("token"),
          // 文件上传类型
          "Content-Type": "multipart/form-data ",
        },
      }).then((res) => {
        if (res.code == 200) {
          this.$message({
            type: "success",
            message: "上传成功",
          });

          this.$axios.get("/api/catelist?istree=1").then((res) => {
            console.log(res);
            if (res.code == 200) {
              this.data = res.list;
              console.log(this.data);
              // 重置表单
              this.cateForm = {
                pid: "0",
                img: "",
                catename: "",
                status: "1",
              };
              document.querySelector(
                ".el-upload-list--picture-card"
              ).innerHTML = "";
              this.filelist = [];
              this.state = true;
            } else {
              this.$message({
                type: "warn",
                message: res.msg,
              });
            }
          });
        }
      });
    },

    // 取消
    handleReset() {
      this.dialogVisible = false;
      this.cateForm = {
        pid: "0",
        img: "",
        catename: "",
        status: "1",
      };
      this.state = true;
    },
    // 图片路径
    // dialogImageUrl(file) {
    //   console.log(file);
    // },
    // 删除图片
    handleRemove(file) {
      document.querySelector(".el-upload-list--picture-card").innerHTML = "";
      this.filelist = [];
    },
    // 查看图片
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.disabled = true;
    },
  },
};
</script>

<style>
.el-button {
  margin-top: 20px;
}
</style>