window.onload = function () {
  var oInit = new Init();
  oInit.tableTitleScroll();
  oInit.buildNav();
  oInit.buildPage();
}

function Init() {
  this.changeValue = {};
  this.searchValue = {'searchOnJob':'1'};
  this.newMsg = [];
  
  //chosen 筛选 工号使用
  this.allEmployeeOptions = this.buildOption(ajaxUtil.getAllEmployee());
  this.allemployeeObj = this.parseObj(ajaxUtil.getAllEmployee());
  
  //筛选条件 不用进行保存 因为 select 不会被click 第二次。
  // this.operation;
}
//表单标题  固定
Init.prototype.tableTitleScroll = function () {
  $('article')[0].onscroll = (e) => {
    var event = e || window.event;
    var y = $(event.target).scrollTop();
    $('.formTitle').css({
      'top': y
    })
  }
}

Init.prototype.buildNav = function () {
  //站点的筛选
  var that = this;
  $('.searchScope').change(function () {
    // var operations = ajaxUtil.getOperation($(this).val());
    var depts = ajaxUtil.getDept($(this).val());
  
    that.fillSelect(depts, '.searchDept');
  
    
    $('.searchDept').chosen('destroy').chosen({
      allow_single_deselect: true
    });

    $('.searchDept').change(function () {
      var operationPositions = ajaxUtil.getOperation($(this).val())
      that.fillSelect(operationPositions, '.searchOperation');
      $('.searchOperation').chosen('destroy').chosen({
        allow_single_deselect: true
      });
    })
  })

  var jobTitles = ajaxUtil.getJobTitle($('.searchJobType').val());
  that.fillSelect(jobTitles, '.searchJobTitle');
  $('.searchJobTitle').chosen('destroy').chosen({
    allow_single_deselect: true
  });

  var sources = ajaxUtil.getAllSource();
  that.fillSelect(sources,'.searchSources');

  $('.searchSources').chosen('destroy').chosen({
    allow_single_deselect: true
  });
  
  // console.log(sources)
  // this.fillSelect(ajaxUtil.getAllSource(),'.searchSources');
}

//查询数据
Init.prototype.buildPage = function (exportFlag) {
  //初始化查询allsize list 显示到页面
  var that = this;
  this.btnDisable();
  $.ajax("/FHR/personFileManage.do?m=getPFMList", {
    type: 'post',
    data: {
      page: $('.nowPage').text(),
      limit: $('#pageSize').val(),
      search: JSON.stringify(that.searchValue),
      export: exportFlag
    },
    success: (res) => {
      if (res.code == 0) {
        that.searchTime = new Date().getTime() - that.starBuild;
        that.buildJson(res.pfmList)
        if (res.exportFlag) {
          that.exportExcel();
          that.btnActive();
        } else {
          that.insertRow(res.allSize);
        }
      }
    },
  })

}
Init.prototype.exportExcel = function () {
  var title = [
    '工号', '姓名', '性别', '职称', '工种类型', 
    '渠道来源', '学历', '入职日期', '转正日期', 
    '所分站点', '岗位', '对应训练员', '老带新师父',
     '培训开始日期', '培训结束日期', '实际培训周期', '标准培训周期', 
     '是否一次通过', '培训机种', '未通过原因','下线日期',
     '是否在职', '在职天数', '在职年资','离职日期',
     '是否废止', '离职类型', '离职原因','联系电话',
    ];
  var filter = ['am_oldTeacher','al_trainer'];
  JSONToExcelConvertor(this.newMsg, '人员档案导出', title, filter);
}

//排序计算json        可修改成遍历 some$ 进行排序
Init.prototype.buildJson = function (list) {
  console.log(list)
  this.newMsg = [];
  for (var i in list) {
    var ajson = list[i];
    var newJson = {};
    newJson.aa_employee_ID = ajson.employee_ID;
    newJson.ab_employeeName = ajson.employeeName;
    newJson.ac_jobTitleName = ajson.jobTitleName;
    newJson.ad_jobType = (function(){
      var jobType;
      if (ajson.jobTitle_ID === '10008' || ajson.jobTitle_ID === '10011') {
        jobType = '小时工'
      } else if (ajson.jobTitle_ID === '10003') {
        jobType = '劳务工'
      } else {
        jobType = '正式工'
      }
      return jobType;
    }());
    newJson.ae_operationName = ajson.operationName ? ajson.operationName:"";
    newJson.af_groups = ajson.groups ? ajson.groups:"";
    newJson.ag_operationPositionName = ajson.operationPositionName ? ajson.operationPositionName:'';
    newJson.ah_onTheJob = ajson.dateOfResign ? '<span style="color:red">否</span>' : '<span style="color:green">是</span>';
    if(ajson.lDateOfRegister){
      ajson.dateOfRegister = ajson.lDateOfRegister;
      ajson.dateOfPositive = "";
    }
    newJson.ai_dateOfRegister = ajson.dateOfRegister;
    newJson.aj_yearOfOnJob = dateParse.getOnJobYear(ajson.dateOfRegister,ajson.dateOfResign);
    newJson.ak_dateOfPositive = ajson.dateOfRegular ? ajson.dateOfRegular : "" ;
    newJson.al_dateOfResign = ajson.dateOfResign == null ? "" : ajson.dateOfResign;
    newJson.am_source = ajson.source == null ? "" : ajson.source;
    newJson.an_abolish = dateParse.getAbolish(ajson.dateOfRegister,ajson.dateOfResign);
    newJson.ao_dimissionType = ajson.dimissionType == null ? '' : ajson.dimissionType;
    newJson.ap_dimissionReason = ajson.dimissionReason == null ? '' : ajson.dimissionReason;
    newJson.aq_trainer = ajson.trainer == null ? "" : ajson.trainer;
    newJson.ar_trainerName = ajson.trainer == null ? "" : this.allemployeeObj[ajson.trainer];
    newJson.as_oldTeacher = ajson.oldTeacher == null ? "" : ajson.oldTeacher;
    newJson.at_oldTeacherName = ajson.oldTeacher == null ? "" : this.allemployeeObj[ajson.oldTeacher];
    newJson.au_dateOfBeginTraining = ajson.dateOfBeginTraining == null ? "" : ajson.dateOfBeginTraining;
    newJson.av_dateOfFinishTraining = ajson.dateOfFinishTraining == null ? "" : ajson.dateOfFinishTraining;
    newJson.aw_actualTrainingCycle = dateParse.getTrainingCycle(ajson.dateOfBeginTraining,ajson.dateOfFinishTraining)
    newJson.ax_standardTrainingCycle = ajson.standardTrainingCycle == null ? "" : ajson.standardTrainingCycle;
    newJson.ay_oneTimesPass = dateParse.getOneTimesPass(ajson.dateOfBeginTraining,ajson.dateOfFinishTraining,ajson.standardTrainingCycle);
    newJson.az_trainingMachine = ajson.trainingMachine == null ? "" : ajson.trainingMachine;
    newJson.ba_reasonsForFailure = ajson.reasonsForFailure == null ? "" : ajson.reasonsForFailure;
    newJson.bb_educationBackground = ajson.educationBackground == null ? "" : ajson.educationBackground;
    newJson.bc_gender = ajson.gender == 1 ? '男' : '女';
    newJson.bd_telephone = ajson.telephone == null ? "" : ajson.telephone;

    
    // newJson.au_dateOfWork = dateParse.getDateOfWork(ajson.dateOfFinishTraining);
    // newJson.aw_dayOfOnJob = dateParse.getOnJobDay(ajson.dateOfRegister,ajson.dateOfResign)
    // productionGroup   直接间接
    this.newMsg.push(newJson);
  }
  console.log(this.newMsg)
}


//插入行
Init.prototype.insertRow = function (allSize) {
  var managers = ajaxUtil.getManager();
  var editAble = null;
  var rows = '';
  var that = this;
  var msg = this.newMsg;
  //不是管理员  readonly'
  if (managers.indexOf($('.uId').text()) != -1) {
    editAble == '';
  } else {
    editAble = 'readonly'
    $('.save').css({
      'display': 'none'
    });
  }
  for (var i = 0; i < msg.length; i++) {
    (function (j) {
      
      var row = `
        <div class="formRow ${j == 0 ? 'firstRow':''}">
        <div class="lineNum item">${j + 1}</div>
        <div class="emoloyee_FK item">${msg[j].aa_employee_ID}</div>
        <div class="employee_name item">${msg[j].ab_employeeName}</div>
        <div class="jobTitle item">${msg[j].ac_jobTitleName}</div>
        <div class="jobType item">${msg[j].ad_jobType}</div>
        <div class="operation item">${msg[j].ae_operationName}</div>
        <div class="groups item">${msg[j].af_groups}</div>
        <div class="operationPosition item">${msg[j].ag_operationPositionName}</div>
        <div class="onTheJob item">${msg[j].ah_onTheJob}</div>
        <div class="dateOfRegister item">${msg[j].ai_dateOfRegister}</div>

        <div class="yearOfOnJob item">${msg[j].aj_yearOfOnJob}</div>
        <div class="dateOfPositive item">${msg[j].ak_dateOfPositive}</div>
        <div class="dateOfResign item">${msg[j].al_dateOfResign}</div>
        <div class="source  item">
          <input type="text" id="source" name="Source" readonly " value="${msg[j].am_source}">
        </div>
        <div class="abolish item">${msg[j].an_abolish}</div>
        <div class="dimissionType item">
          <input type="text" id="dimissionType" ${editAble} class="edit changeValue" name="DimissionType" value="${msg[j].ao_dimissionType}">
        </div>
        <div class="dimissionReason item">
          <input type="text" id="dimissionReason" ${editAble} class="edit changeValue" name="DimissionReason" value="${msg[j].ap_dimissionReason}">
        </div>
        <div class="trainer item">
          <select id="trainer" name="Trainer" class="edit chosen-select trainer_${j} selectValue ${editAble} ">
            <option value="${msg[j].aq_trainer}">${msg[j].ar_trainerName}</option>
          </select>
        </div>
        <div class="oldTeacher item">
          <select id="oldTeacher" name="oldTeacher" class="edit chosen-select oldTeacher_${j} selectValue ${editAble}">
            <option value="${msg[j].as_oldTeacher}">${msg[j].at_oldTeacherName}</option>
          </select>
        </div>
        <div class="dateOfBeginTraining changeDate item">
          <div class="input-group oDate date form_date" data-date-format="yyyy-mm-dd">
            <input class="form-control " id="trainingStartDate" ${editAble} name="DateOfBeginTraining" value="${msg[j].au_dateOfBeginTraining}" type="text" readonly>
            <span class="input-group-addon"><span class="glyphicon glyphicon-remove"></span></span>
          </div>
        </div>
        <div class="dateOfFinishTraining changeDate item">
          <div class="input-group oDate date form_date" data-date-format="yyyy-mm-dd">
            <input class="form-control " id="trainingEndDate" ${editAble} name="DateOfFinishTraining" value="${msg[j].av_dateOfFinishTraining}" type="text" readonly>
            <span class="input-group-addon"><span class="glyphicon glyphicon-remove"></span></span>
          </div>
        </div>
        <div class="actualTrainingCycle item">${msg[j].aw_actualTrainingCycle}</div>
        <div class="standardTrainingCycle item">
          <input type="text" id="standardTrainingCycle" ${editAble} class="edit changeValue" name="StandardTrainingCycle" value="${msg[j].ax_standardTrainingCycle}">
        </div>
        <div class="oneTimesPass item">${msg[j].ay_oneTimesPass}</div>
        <div class="trainingMachine item">
          <input type="text" id="trainingMachine" ${editAble} class="edit changeValue" name="TrainingMachine" value="${msg[j].az_trainingMachine}">
        </div>
        <div class="reasonsForFailure item">
          <input type="text" id="reasonsForFailure" ${editAble} class="edit changeValue" name="ReasonsForFailure" value="${msg[j].ba_reasonsForFailure}">
        </div>
        <div class="educationBackground item">
          <input type="text" id="educationBackground" readonly name="EducationBackground" value="${msg[j].bb_educationBackground}">
        </div>
        <div class="sex item">${msg[j].bc_gender}</div>
        <div class="telephone item">${msg[j].bd_telephone}</div>
      </div>`;

      // <div class="dateOfWork item">${msg[j].au_dateOfWork}</div>
      // <div class="dayOfOnJob item">${msg[j].aw_dayOfOnJob}</div>
      
      rows += row;
    }(i))
  }
  $('article').append($(rows));
  that.btnActive();
  that.pageControll(allSize);
  this.buildCalendar('.form_date')
  this.getChangeValue();
}

Init.prototype.pageControll = function (allSize) {
  var that = this;
  var allPage = Math.ceil(allSize / $('#pageSize').val());
  $('.allPage').html(allPage);

  $('.prePage')[0].onclick = function () {
    if ($('.nowPage').html() <= '1' || $('.nowPage').html() > allPage) {
      return;
    } else {
      var nowPage = $('.nowPage').html();
      $('.nowPage').html(+nowPage - 1);
      $('.nowPage').focus();
      $('.nowPage').blur();
      $('.wait').css({
        'display': 'block'
      });
      $('.formRow').remove();
      that.buildPage();
    }
  }
  
  $('.aftPage')[0].onclick = function () {

    if (Number($('.nowPage').html()) >= Number($('.allPage').html())) {
      return;
    } else {
      var nowPage = $('.nowPage').html();
      $('.nowPage').html(+nowPage + 1);
      $('.nowPage').focus();
      $('.nowPage').blur();
      $('.wait').css({
        'display': 'block'
      });
      $('.formRow').remove();
      that.buildPage();
    }
  }
}
//table 由于标题浮动导致标题与   body 宽度不同
// Init.prototype.tableWidthSame = function(){
//   var tTitle = $('.formTitle').children();
//   var tBody = $('.firstRow').children();
//   for(var i = 0; i < tBody.length; i++){
//     var ttWidth = Math.ceil(getComputedStyle(tTitle[i]).width.replace('px',''));
//     var tbWidth = Math.ceil(getComputedStyle(tBody[i]).width.replace('px',''));
//     if(+ ttWidth > + tbWidth){
//       tTitle[i].style.width = ttWidth + 'px';
//       tBody[i].style.width = ttWidth + 'px';
//     }else{
//       var w = getComputedStyle(tBody[i]).width;
//       tTitle[i].style.width = tbWidth + 'px';
//       tBody[i].style.width = tbWidth + 'px';

//     }
//   }
// }
// 初始化日历
Init.prototype.buildCalendar = function (tarClass) {
  $(tarClass).datetimepicker({
    language: 'fr',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0
  })
}
// 获取条件json
Init.prototype.getSearchValue = function () {
  var that = this,
    inps = $('nav').find('input'),
    seles = $('nav').find('select');
  that.searchValue = {};
  for (var i = 0; i < inps.length; i++) {
    if (inps[i].value && inps[i].getAttribute('name')) {
      that.searchValue[inps[i].getAttribute('name')] = $(inps[i]).val();
    }
  }
  for (var i = 0; i < seles.length; i++) {
    if (seles[i].value && seles[i].getAttribute('name')) {
      that.searchValue[seles[i].getAttribute('name')] = $(seles[i]).val();
    }
  }
}
Init.prototype.fillEmployee = function (className) {
  // setInterval(() => {
  //   $(className).html(this.allEmployee).chosen();
  // }, 1000);
  return "";
}

// Init.prototype.selectEmployee = function(empId,className){
//   setInterval(() => {
//     allEmployee.
//     $(className).html(this.allEmployee).val(empId).chosen();
//   }, 1000);
//   return "";
// }

//change 生成json
Init.prototype.getChangeValue = function () {
  var json = {},
    that = this,
    Employee_FK = null,
    name = null,
    value = null;
  $('article').find('.changeValue').change(function (e) {
    Employee_FK = $(e.target).parent().siblings().filter('.emoloyee_FK').text();
    name = $(e.target).attr('name');
    value = $(e.target).val();
    $(e.target).css({
      'background': 'pink'
    })
    if (typeof that.changeValue[Employee_FK] === 'undefined') {
      that.changeValue[Employee_FK] = {};
      that.changeValue[Employee_FK][name] = value;
    } else {
      that.changeValue[Employee_FK][name] = value;
    }
  })
  var changeDates = $('article').find('.changeDate')
  for (var i = 0; i < changeDates.length; i++) {
    (function (j) {
      $(changeDates[j]).on('changeDate', function (e) {
        Employee_FK = $(e.target).parent().siblings().filter('.emoloyee_FK').text();
        name = $(e.target).find('input').attr('name');
        value = $(e.target).find('input').val();
        $(e.target).find('input').css({
          'background': 'pink'
        });
        $(e.target).find('span').css({
          'background': 'pink'
        });
        if (typeof that.changeValue[Employee_FK] === 'undefined') {
          that.changeValue[Employee_FK] = {};
          that.changeValue[Employee_FK][name] = value;
        } else {
          that.changeValue[Employee_FK][name] = value;
        }
      })
    }(i))
  }
  $('article').find('.selectValue').focus(function () {
    $(this).html(that.allEmployeeOptions);
    $(this).chosen({allow_single_deselect: true});
    $(this).change(function (e) {

      Employee_FK = $(e.target).parent().siblings().filter('.emoloyee_FK').text();
      name = $(e.target).attr('name');
      value = $(e.target).val();
      if(value == ""){
        return
      }
      // $(e.target).find('input').css({'background':'pink'});
      // $(e.target).find('span').css({'background':'pink'});
      if (typeof that.changeValue[Employee_FK] === 'undefined') {
        that.changeValue[Employee_FK] = {};
        that.changeValue[Employee_FK][name] = value;
      } else {
        that.changeValue[Employee_FK][name] = value;
      }
    })
  })
  // for(var i = 0; i < changeSelect.length; i++){
  //   (function(j){

  //   }(i))
  // }
}
// function(e){
//   e = event || window.event;
//   var employee_FK = null;
//   if($(e.target).is('.form-control')){
//     employee_FK = $(e.target).parent().parent().siblings().filter('.emoloyee_FK').text();
//   } else {
//     employee_FK = $(e.target).parent().siblings().filter('.emoloyee_FK').text();
//   }

//   var name = $(e.target).attr('name');
//   var value = $(e.target).val();
//   if(typeof that.changeValue[employee_FK] === 'undefined'){
//     that.changeValue[employee_FK] = {};
//     that.changeValue[employee_FK][name] = value;
//   } else {
//     that.changeValue[employee_FK][name] = value;
//   }
// }

//按钮翻页 失效 遮罩
Init.prototype.btnDisable = function(){
  $('.refresh').unbind('click');
  $('.search').unbind('click');
  $('.save').unbind('click');
  $('.export').unbind('click');
  $('.aftPage')[0].onclick = null;
  $('.prePage')[0].onclick = null;

  $('.wait').css({
    'display': 'block'
  });
}

//按钮翻页 生效 去遮罩
Init.prototype.btnActive = function () {
  var that = this;

  $('.refresh').unbind('click');
  $('.refresh').click(function () {
    that.btnDisable();
    $('.formRow').remove();
    that.buildPage();
  })

  $('.search').unbind('click');
  $('.search').click(function () {
    $('.nowPage').html('1');
    that.getSearchValue();
    that.btnDisable();
    $('.formRow').remove();
    that.buildPage();
  })

  $('.save').unbind('click');
  $('.save').click(function () {
    that.btnDisable();
    ajaxUtil.saveValue(JSON.stringify(that.changeValue));
    that.btnActive();
    $('.refresh').click();
  })

  $('.export').unbind('click');
  $('.export').click(function () {
    that.btnDisable();
    that.getSearchValue();
    that.buildPage('export');
  })

  $('.wait').css({
    'display': 'none'
  });
}

Init.prototype.parseObj = function (msg) {
  var res = {},
    len = msg.length;
  for (var i = 0; i < len; i++) {
    res[msg[i].oid] = msg[i].oname;
  }
  return res;
}

//
Init.prototype.buildOption = function (data) {
  if (data === undefined) {
    return null;
  }
  var inner = '';
  inner += '<option value=""></option>';
  for (var i = 0; i < data.length; i++) {
    inner += '<option value="' + data[i].oid + '">' + data[i].oname + '</option>'
  }
  return inner;
}

Init.prototype.fillSelect = function (data, tar) {
  if (!data) {
    $(tar).empty();
    return;
  } else if(!tar){
    return;
  }
  var a = $(tar);
  $(tar).empty();
  var inner = '';
  inner += '<option value=""></option>';
  for (var i = 0; i < data.length; i++) {
    inner += '<option value="' + data[i].oid + '">' + data[i].oname + '</option>'
  }
  $(tar).html(inner);
}

//双击可编辑
// Init.prototype.canEdit = function () {
//   $('.edit').dblclick((e) => {
//     e.target.setAttribute('contenteditable', true)
//   })
// }
//兼容IE8的 获取 元素 滚动条距离
Init.prototype.getScrollOffset = function (ele) {
  if (window.pageYOffset != undefined) {
    return {
      x: $(ele)[0].pageXOffset,
      y: $(ele)[0].pageYOffset
    }
  } else {
    return {
      x: document.body.scrollTop + document.documentElement.scrollTop,
      y: document.body.scrollLeft + document.documentElement.scrollLeft
    }
  }
}