$(function () {
    var form = layui.form;
    form.verify({
        nickname: function (value) {
            if (value.length > 6) {
                return '昵称长度必须在 1 ~ 6 个字符之间！'
            }
        }
    });
    //初始化用户基本信息
    initUserInfo();
    //实现表单重置效果
    $("#btnReset").on("click", function (e) {
        // 阻止表单的默认重置行为
        e.preventDefault();
        initUserInfo();
    });
    //提交修改信息
    $(".layui-form").on("submit", function (e) {
        alert(11)
        // 阻止表单的默认重置行为
        e.preventDefault();
        //发起Ajax请求
        $.ajax({
            method: "PUT",
            url: "/my/userinfo",
            data: $(this).serialize(),
            suceess: function (res) {
                if (res.code !== 0) { 
                    return layer.msg('更新用户信息失败！');
                } 
                layer.msg('更新用户信息成功！');
                // 调用父页面中的方法，重新渲染用户的头像和用户的信息 
                window.parent.getUserInfo()
            }
        });

    })
    //初始化用户基本信息
    function initUserInfo() {
        $.ajax({
            method: "GET",
            url: "/my/userinfo",
            success: function (res) {
                if (res.code != 0) {
                    return layui.layer.msg('获取用户信息失败！')
                }
                console.log(res)
                form.val('formUserInfo', res.data)
            }
        })
    };
})