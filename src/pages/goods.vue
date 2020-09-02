<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="javascript:;">商品列表</a>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="router-container">
      <el-button type="primary" @click="handleAdd" class="btn">添加</el-button>
      <!-- 商品列表 -->
      <el-table :data="goodsdata" border style="width: 100%">
        <el-table-column label="一级分类" width="100" prop="firstcatename"></el-table-column>
        <el-table-column label="二级分类" width="100">
          <template slot-scope="scope">{{ scope.row.secondcatename }}</template>
        </el-table-column>
        <el-table-column label="商品名称" width="180">
          <template slot-scope="scope">{{scope.row.goodsname}}</template>
        </el-table-column>
        <el-table-column label="销售价" width="100">
          <template slot-scope="scope">{{scope.row.price}}</template>
        </el-table-column>
        <el-table-column label="市场价" width="100">
          <template slot-scope="scope">{{scope.row.market_price}}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag effect="dark" type="success" v-if="scope.row.status===1">启用</el-tag>
            <el-tag effect="dark" type="danger" v-else>禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="pagesize"
        :total="pagecount"
        @current-change="fn"
      ></el-pagination>
    </div>
    <!-- 点击添加弹窗 -->
    <el-dialog
      :title="'商品'+tip"
      :visible.sync="infoVisible"
      @close="handleReset"
      @opened="handleOpen"
    >
      <el-from :mdodel="form" :rules="rules" ref="form" label-width="100px" class="'demo-form">
        <el-form-item label="一级分类" prop="first-cateid">
          <el-select v-model="form.first_cateid" placeholder="请选择分类" @change="handleCateChange">
            <el-option
              v-for="item in firstarr"
              :key="item.id"
              :label="item.catename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="二级分类" prop="first-cateid">
          <el-select v-model="form.first_cateid" placeholder="请选择分类" @change="handleCateChange">
            <el-option
              v-for="item in firstarr"
              :key="item.id"
              :label="item.catename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>-->

        <!-- <el-form-item label="商品图片">
          <el-upload action="#" list-type="picture-card" :auto-upload="false">
            <i slot="default" class="el-icon-plus"></i>
            <div slot="file" slot-scope="{file}">
              <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
                  <i class="el-icon-zoom-in"></i>
                </span>
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
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt />
          </el-dialog>
        </el-form-item>-->

        <!-- <el-form-item label="商品规格名" prop="first-cateid">
          <el-select v-model="form.first_cateid" placeholder="请选择商品规格名" @change="handleCateChange">
            <el-option
              v-for="item in firstarr"
              :key="item.id"
              :label="item.catename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>-->

        <!-- <el-form-item label="商品规格值" prop="first-cateid">
          <el-select v-model="form.first_cateid" placeholder="请选择商品规格值" @change="handleCateChange">
            <el-option
              v-for="item in firstarr"
              :key="item.id"
              :label="item.catename"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>-->

        <!-- <el-form-item label="销售价">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="市场价">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="是否新品">
          <el-radio>是</el-radio>
          <el-radio>否</el-radio>
        </el-form-item>
        <el-form-item label="是否热卖">
          <el-radio>是</el-radio>
          <el-radio>否</el-radio>
        </el-form-item>
        <el-form-item label="商品描述">
         富文本编译器的容器
          <div id="editor" ref="editorElem" style="text-align:left"></div>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio>上架</el-radio>
          <el-radio>下架</el-radio>
        </el-form-item>-->
      </el-from>
    </el-dialog>
  </div>
</template>

<script>
import $ from "jquery";
import axios from "axios";
import E from "wangeditor";
export default {
  data() {
    return {
      // 对话框是否显示
      infoVisible: false,
      tip: "",
      goodsdata: {},
      // 状态
      status: 1,
      // 当前显示条数
      pagecount: 0,
      // 一页显示多少条
      pagesize: 2,
      // 显示几页
      page: 1,
      rules: {
        cateid: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
        title: [
          { required: true, message: "请输入商品标题", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "长度在 2 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
      form: {
        // 一级分类编号
        first_cateid: "",
        // 二级分类编号
        second_cateid: "",
        // 商品名称
        goodsname: "",
        // 商品图片（文件）
        img: "",
        // 商品价格
        price: "",
        // 市场价格
        market_price: "",
        // 商品描述
        description: "",
        // 商品规格编号
        specsid: "",
        // 商品规格属性
        specsattr: "",
        isnew: false,
        ishot: false,
        status: true,
      },
      //一级分类列表
      firstarr: [],
      // 二级分类列表
      secondarr: [],
    };
  },
  mounted() {
    this.getcount();
    this.getpage();
  },
  methods: {
    // 获取当前页数商品
    getpage() {
      this.$axios
        .get("/api/goodslist", {
          params: { size: this.pagesize, page: this.page },
        })
        .then((res) => {
          this.goodsdata = res.list || [];
          console.log(res);
        });
    },
    // 获取商品数量
    getcount() {
      this.$axios.get("/api/goodscount").then((res) => {
        this.pagecount = res.list[0].total;
      });
    },
    // 获取分类
    getcategory(pid = 0) {
      this.$axios.get("/api/catelist", { params: pid }).then((res) => {
        console.log(res);
        if ((pid = 0)) {
          // pid 为0，获取一级分类
          this.firstarr = res.list;
        } else {
          // 获取二级分类
          this.secondarr = res.list;
        }
      });
    },
    // 删除
    handleDelete() {},
    // 编辑
    handleEdit() {},
    fn() {},
    // 添加
    handleAdd() {
      this.infoVisible = true;
      this.tip = "添加";
      getcategory();
    },
  },
};
</script>

<style>
.btn {
  margin-top: 20px;
}
</style>