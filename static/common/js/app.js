var CompanyObjList = []//待计算公司对象
    , canCalc = false;

$(function () {
    //下拉刷新
    $(document.body).pullToRefresh();
    $(document.body).on("pull-to-refresh", function () {
        setTimeout(function () { location.reload(); }, 1000);
    });
    //长按编辑
    bingLongPressEvent();
});

//添加事件
$('.j-add').on('click', function () {
    var companyObj = {
        Id: CompanyObjList.length
        , Company: $('.j-companyName').val()
        , Price: $('.j-price').val()
    };
    if (!companyObj.Company || companyObj.Company.lenght == 0 || !companyObj.Price || companyObj.Price.lenght == 0) {
        $.toast('不能存在空项', 'forbidden');
        return;
    }
    var index = $('.j-add').attr('data-id') * 1;
    if (index == -1) {
        //新增
        CompanyObjList.push(companyObj);
        $('.j-item-container').append(template('t-con-item', { list: [companyObj] }));
        $('.j-count').text(CompanyObjList.length);
    } else {
        //编辑
        CompanyObjList[index].Company = companyObj.Company;
        CompanyObjList[index].Price = companyObj.Price;
        $currentDom = $('.j-item').eq(index);
        $currentDom.find('p').text((index + 1) + '.' + CompanyObjList[index].Company);
        $currentDom.find('.weui-cell__ft').text(CompanyObjList[index].Price);
    }
    if (!canCalc && CompanyObjList.length > 2) {
        $('.j-calc').removeClass('weui-btn_disabled');
        canCalc = true;
    }
    $.closePopup();
    $('.j-companyName').val('');
    $('.j-price').val('');
    $.toptip('操作成功', 200, 'success');
});

//添加公司弹窗事件
$('.j-open').on('click', function () {
    openPopup();
});

//添加信息弹窗
function openPopup(id) {
    var title = '添加竞标信息', index = -1;
    if (CompanyObjList[id]) {
        index = id;
        title = '修改竞标信息';
        $('.j-companyName').val(CompanyObjList[id].Company);
        $('.j-price').val(CompanyObjList[id].Price);
    }
    $('.j-add').attr('data-id', index);
    $('.j-popupTitle').text(title);
    $("#edit").popup();
}

//绑定公司长按编辑事件
function bingLongPressEvent() {
    var timeout = 0;
    if ($.device.ios) {
        //ios
        $('.j-item-container').on({
            touchstart: function (e) {
                var id = $(this).attr('data-Id');
                timeout = setTimeout(function () {
                    timeout = 0;
                    //弹窗编辑
                    openPopup(id);
                }, 500);
                e.preventDefault();
            },
            touchmove: function () {
                clearTimeout(timeout);
                timeout = 0;
                return false;
            },
            touchend: function () {
                clearTimeout(timeout);
                if (timeout != 0) {
                    //单击
                }
                return false;
            }
        }, '.j-item');
    }
    else {
        $('.j-item-container').on({
            mousedown: function () {
                var id = $(this).attr('data-Id');
                timeout = setTimeout(function () {
                    //弹窗编辑
                    openPopup(id);
                }, 800);
            }
            , mouseup: function () {
                clearTimeout(timeout);
            }
        }, '.j-item');
    }
}

//计算
$('.j-calc').on('click', function () {
    if (!canCalc) return;
    canCalc = false;
    $.showLoading('正在计算中...');

    //http://iwenli.org/api/open.asd
    var timeout = setTimeout(function () {
        $.hideLoading(); canCalc = true;
        $.alert('服务器请求超时，请刷新重试...');
    },
        5000 //超时时间，考虑到网络问题，5秒还是比较合理的  
    );
    setTimeout(function () {
        $.post("/api/open.axd", { data: JSON.stringify(CompanyObjList) }, function (data) {
            if (timeout) { //清除定时器  
                clearTimeout(timeout);
                timeout = null;
            }
            $.hideLoading(); canCalc = true;
            var obj = JSON.parse(data);
            if (obj.errcode == 0) {
                $('.j-result-item').empty().append(template('t-result-item', { list: obj.data }));
                $('#resultPage header span').text(parseInt(Math.random()*100));
                $("#resultPage").popup();
            } else {
                $.toast(obj.errmsg, 'forbidden');
            }
        });
    }, 1000);
});
