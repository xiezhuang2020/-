<template>
  <div class="login">
    <div class="login-box">
      <h2>登录</h2>
      <el-form :model="ruleForm" :rules="rules" ref="f1" class="demo-ruleForm">
        <el-form-item prop="username">
          <el-input v-model="ruleForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="ruleForm.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('f1')">立即登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
export default {
  data() {
    return {
      // 数据
      ruleForm: {
        username: "",
        password: "",
      },
      //   验证规则 和 el-form-item prop 挂钩
      rules: {
        username: [
          { required: true, message: "请输入用户姓名", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 4, max: 8, message: "长度在 4 到 8 个字符", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    ...mapMutations(["setInfo"]),
    submitForm(formname) {
      // 提交表单时，根据传入的表单名,进行数据验证
      // valid -> boolean ：是否验证通过
      this.$refs[formname].validate((valid) => {
        // 验证通过
        if (valid) {
          this.$axios.post("/api/userlogin", this.ruleForm).then((res) => {
            //  登录成功
            if (res.code === 200) {
              sessionStorage.setItem("token", JSON.stringify(res.list.token));
              sessionStorage.setItem("user", JSON.stringify(res.list));
              // this.setInfo();
              this.$router.replace("/");
            } else {
              // 登陆失败
              this.$message.error(res.msg);
            }
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
};
</script>

<style lang='stylus'>
.login {
  height: 100%;
  background: -webkit-linear-gradient(left, #563443, #413a53, #2f3d60);

  .login-box {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -150px;
    margin-top: -150px;
    width: 300px;
    height: 300px;

    h2 {
      text-align: center;
      color: #fff;
      margin: 20px 0;
    }

    .el-button {
      width: 100%;
    }
  }
}
</style>