$(function () {
    var layer = layui.layer;
    var form = layui.form;
    var laypage = layui.laypage;
    // 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, // 页码值，默认请求第一页的数据
        pagesize: 2, // 每页显示几条数据，默认每页显示2条
        cate_id: '', // 文章分类的 Id
        state: '' // 文章的发布状态
    }
    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date);
        var y = dt.getFullYear();
        var m = padZero(dt.getMonth() + 1);
        var d = padZero(dt.getDate());
        var hh = padZero(dt.getHours());
        var mm = padZero(dt.getMinutes());
        var ss = padZero(dt.getSeconds());
        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }
    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }
    // 定义一个查询的参数对象，将来请求数据的时候
    initTable();
    initCate();
    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list' + '?' + 'pagenum=' + q["pagenum"] + '&pagesize=' + q["pagesize"] + '&cate_id=' + q["cate_id"] + '&state=' + q["state"],
            success: function (res) {
                if (res.code !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                // 使用模板引擎渲染页面的数据
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr);
                // 调用渲染分页的方法
                renderPage(res.total);
            }
        })
    };
    //初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/cate/list',
            success: function (res) {
                if (res.code !== 0) {
                    return layer.msg('获取分类数据失败！')
                }
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                // 通过 layui 重新渲染表单区域的UI结构
                form.render()
            }
        })
    };
    // 为筛选表单绑定 submit 事件
    $("#form-search").on('submit', function (e) {
        //阻止表单的默认提交事件
        e.preventDefault();
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        q["cate_id"] = cate_id;
        q["state"] = state;
        initTable()
    })
    // 定义渲染分页的方法
    function renderPage(total) {
        //执行一个laypage实例
        laypage.render({
            elem: 'pageBox', //注意，这里的 test1 是 ID，不用加 # 号
            count: total, //数据总数，从服务端得到
            limit: q["pagesize"], // 每页显示几条数据
            curr: q['pagenum'], // 设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],
            // 分页发生切换的时候，触发 jump 回调
            // 触发 jump 回调的方式有两种：
            // 1. 点击页码的时候，会触发 jump 回调
            // 2. 只要调用了 laypage.render() 方法，就会触发 jump 回调
            jump: function (obj, first) {
                // 可以通过 first 的值，来判断是通过哪种方式，触发的 jump 回调
                // 如果 first 的值为 true，证明是方式2触发的
                // 否则就是方式1触发的
                // console.log(first)
                console.log(obj.curr)
                // 把最新的页码值，赋值到 q 这个查询参数对象中
                q.pagenum = obj.curr
                // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit
                // 根据最新的 q 获取对应的数据列表，并渲染表格
                if (!first) {
                    initTable()
                }
            }
        });
    }
    //实现删除文章的功能：通过代理的形式，为删除按钮绑定点击事件处理函数
    $("tbody").on('click', '.btn-delete', function () {
        //获取页面的按钮个数
        var btnlength = $(".btn-delete").length;
        //获取文章的id
        var id = $(this).attr("data-id");
        //发送ajax请求实现实现删除功能更
        $.ajax({
            method: "DELETE",
            url: "/my/article/info?" + "id=" + id,
            success: function (res) {
                if (res.code !== 0) {
                    return layer.msg("删除失败")
                }
                layer.msg("删除成功");
                // 当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据
                // 如果没有剩余的数据了,则让页码值 -1 之后,
                // 再重新调用 initTable 方法
                if (btnlength === 1) {
                    // 如果 len 的值等于1，证明删除完毕之后，页面上就没有任何数据了
                    // 页码值最小必须是 1
                    q["pagenum"] = q["pagenum"] === 1 ? 1 : q["pagenum"] - 1
                }
                initTable();
            }
        })
    })
})