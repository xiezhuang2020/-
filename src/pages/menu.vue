//<template>
  <div>
    <!-- 面包屑分类 -->
    <el-breadcrumb separator-class="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>
        <a href="javascript:;">菜单管理</a>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div>
      <el-button type="primary" @click="handleadd()">添加</el-button>
      <!-- 表单 -->
      <el-table
        :data="data"
        style="width: 100%"
        row-key="id"
        border
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      >
        <!-- prop: 关联的data中的数据 -->
        <el-table-column prop="title" label="分类名称" width="180"></el-table-column>
        <el-table-column prop="icon" label="图标" width="180">
          <!-- 插槽插入  自定义内容 -->
          <template slot-scope="scope">
            <i :class="scope.row.icon"></i>
          </template>
        </el-table-column>
        <!-- 类型 -->
        <el-table-column prop="type" label="类型">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type==1">目录</el-tag>
            <el-tag v-else type="success">菜单</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="菜单URL"></el-table-column>
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
        <el-form :model="ruleForm" :rules="rules" ref="f1">
          <el-form-item label="菜单类型" prop="pid" width="180px">
            <!-- 下拉选择框 -->
            <el-select v-model="ruleForm.pid" placeholder="请选择菜单类型" @change="changemenu">
              <el-option :key="0" label="顶层菜单" :value="'0'"></el-option>
              <el-option
                v-for="item in menu"
                :key="item.id"
                :label="item.title"
                :value="item.id.toString()"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="title" label="菜单名称">
            <el-input v-model="ruleForm.title"></el-input>
          </el-form-item>

          <!-- 根据 type 决定 是否显示 -->
          <el-form-item prop="icon" label="菜单图标" v-show="ruleForm.type==='1'">
            <el-input v-model="ruleForm.icon"></el-input>
          </el-form-item>
          <!-- 根据 type 决定 是否显示 -->
          <el-form-item label="菜单路径" v-show="ruleForm.type==='2'">
            <el-input v-model="ruleForm.url"></el-input>
          </el-form-item>

          <!-- 类型 -->
          <el-form-item label="类型">
            <el-radio v-model="ruleForm.type" label="1" :disabled="ruleForm.type=='2'">目录</el-radio>
            <el-radio v-model="ruleForm.type" label="2" :disabled="ruleForm.type=='1'">菜单</el-radio>
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
export default {
  data() {
    //  value 要验证的值
    // callback，回调函数 ,传入错误对象，显示错误信息
    var menucheck = (rule, value, callback) => {
      // 输入值为空
      if (!value) {
        return callback(new Error("菜单不能为空"));
      }
      var reg = /^[\u4e00-\u9fa5]{3,5}$/g;
      if (!reg.test(value)) {
        return callback(new Error("请输入3-5汉字"));
      }
    };
    return {
      // 树形数据，后台获取
      data: [],
      //对话框是否显示
      dialogVisible: false,
      ruleForm: {
        icon: "",
        pid: "0",
        status: "1",
        title: "",
        type: "1",
        url: "",
      },
      tip: "",
      menu: [],
      rules: {
        pid: [{ required: true, message: "请输入上级菜单", trigger: "blur" }],
        title: [{ validator: menucheck, trigger: "blur" }],
      },
      //   切换状态
      status: true,
    };
  },
  mounted() {
    // 获取菜单数据
    this.$axios.get("/api/menulist?istree=1").then((res) => {
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
    getmenu() {
      this.$axios.get("/api/menulist?pid=0").then((res) => {
        this.menu = res.list;
      });
    },
    handleadd() {
      // 获取菜单
      this.getmenu();
      // 对话框标题修改
      this.tip = "添加";
      // 显示对话框
      this.dialogVisible = true;
    },

    // 点击切换 目录或者菜单
    changemenu(val) {
      // 根据 切换的 option 的value 决定类型
      this.ruleForm.type = val == 0 ? "1" : "2";
    },
    changeStatus(val) {
      // 根据 切换的 boolean 决定状态
      this.ruleForm.status = val ? "1" : "2";
    },
    // 点击编辑时
    handleEdit(row) {
      // 获取菜单
      this.getmenu();
      this.tip = "修改";
      //显示对话框
      this.dialogVisible = true;
      let obj = row.id;
      // get 请求以对象的形式传入参数，必须是在params 属性中
      this.$axios
        .get("/api/menuinfo", {
          params: {
            id: row.id,
          },
        })
        .then((res) => {
          let obj = row.id;
          let info = res.list;
          // 点击修改弹出对话框，向 ruleform 添加 id 属性
          info.id = obj.toString();
          info.pid = info.pid.toString();
          info.type = info.type.toString();
          this.ruleForm = info;
        });
    },
    // 点击添加的确认时
    handleSubmit() {
      this.dialogVisible = false;
      // 通过是否具有id 来判断 修改还是新增
      let url = this.ruleForm.id ? "/api/menuedit" : "/api/menuadd";
      this.$axios.post(url, this.ruleForm).then((res) => {
        // 向后台提交数据

        if (res.code == 200) {
          this.$message({
            type: "success",
            message: res.msg,
          });
          // 添加成功 获取最新的菜单列表来渲染
          this.$axios.get("/api/menulist?istree=1").then((res) => {
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
          icon: "",
          pid: 0,
          status: 1,
          title: "",
          type: 1,
          url: "",
        };
      });
    },
    // 删除
    handleDelete(row) {
      this.$axios.post("/api/menudelete", { id: row.id }).then((res) => {
        console.log(res);
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
    // 点击取消还原 表单数据
    handleReset() {
      this.dialogVisible = false;
      this.ruleForm = {
        pid: "0",
        title: "",
        icon: "",
        type: "1",
        url: "",
        status: "1",
      };
    },
  },
};
</script>

<style >
.el-button {
  margin-top: 20px;
}
</style>