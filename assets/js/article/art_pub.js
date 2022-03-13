$(function () {
    // 初始化富文本编辑器
    initEditor();
    var layer = layui.layer;
    var form = layui.form;
    // 定义加载文章分类的方法
    initCate();
    function initCate() {
        $.ajax({
            method: "GET",
            url: "/my/cate/list",
            success: function (res) {
                if (res.code !== 0) {
                    return layer.msg("初始化文章类别失败")
                }
                //调用template模板
                var htmlStr = template("tpl-cate", res);
                $('[name=cate_id]').html(htmlStr);
                // 一定要记得调用 form.render() 方法
                form.render();
            }
        })
    };
    // 1. 初始化图片裁剪器
    var $image = $('#image');
    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }
    // 3. 初始化裁剪区域
    $image.cropper(options);
    // 为选择封面的按钮，绑定点击事件处理函数
    $("#btnChooseImage").on("click", function () {
        $("#coverFile").click();
    });
    // 监听 coverFile 的 change 事件，获取用户选择的文件列表
    $("#coverFile").on('change', function (e) {
        //1.拿到用户选择的文件
        var file = e.target.files[0];
        // 2.判断用户是否选择了文件
        if (e.target.files.length === 0) {
            return
        }
        //3.根据选择的文件，创建一个对应的 URL 地址：
        var newImgURL = URL.createObjectURL(file);
        //4.先销毁旧的裁剪区域，再重新设置图片路径，之后再创建新的裁剪区域
        $image
            .cropper('destroy')      // 销毁旧的裁剪区域
            .attr('src', newImgURL)  // 重新设置图片路径
            .cropper(options)        // 重新初始化裁剪区域
        //5. 定义文章的发布状态
        var art_state = '已发布'
        //6.为存为草稿按钮，绑定点击事件处理函数
        $('#btnSave2').on('click', function () {
            art_state = '草稿'
        });
        //7.为表单绑定 submit 提交事件
        $("#form-pub").on("submit", function (e) {
            // 7.1阻止表单的默认提交行为
            e.preventDefault();
            //7.2基于 form 表单，快速创建一个 FormData 对象
            var fd = new FormData($(this)[0]);
            // 7.3将文章的发布状态，存到 fd 中
            fd.append('state', art_state);
            // 7.44. 将封面裁剪过后的图片，输出为一个文件对象
            //7.5.将裁剪后的图片，输出为文件
            $image
                .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                    width: 400,
                    height: 280
                })
                .toBlob(function (blob) {       // 将 Canvas 画布上的内容，转化为文件对象
                    // 得到文件对象后，进行后续的操作
                    // 7.6. 将文件对象，存储到 fd 中
                    fd.append('cover_img', blob);
                    // 7.7. 发起 ajax 数据请求
                    publishArticle(fd)
                });
        });
    });
    // 定义一个发布文章的方法
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            // 注意：如果向服务器提交的是 FormData 格式的数据，
            // 必须添加以下两个配置项
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.code !== 0) {
                    return layer.msg('发布文章失败！')
                }
                layer.msg('发布文章成功！')
                // 发布文章成功后，跳转到文章列表页面
                location.href = '../../article/art_list.html'
            }
        })
    }

})