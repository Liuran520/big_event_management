$(function(){
    //为密码框定义校验规则
    var form=layui.form;
    form.verify({
        pwd:[ /^[\S]{6,12}$/,'密码必须6到12位，且不能出现空格'],
        samePwd:function(value){
            if(value===$('[name=old_pwd]').val()){
                return '新旧密码不能相同！';
            }
        },
        rePwd:function(value){
            if(value!==$('[name=new_pwd]').val()){
                return '两次密码不一致！';
            }
        }
    });
    //发起请求实现重置密码的功能
    $(".layui-form").on('submit',function(e){
        // 阻止表单的默认重置行为
        e.preventDefault();
        $.ajax({
            method:'PATCH',
            url:'/my/updatepwd',
            data: $(this).serialize(),
            success:function(res){
                if(res.code!==0){
                    layui.layer.msg('更新密码失败！')
                }
                layui.layer.msg('更新密码成功！')
                // 重置表单 
                $('.layui-form')[0].reset();
                // $(this)[0].reset();
            }
        })
    })
})