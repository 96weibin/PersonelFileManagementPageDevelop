// 日期函数 构造

function DateParse (){
}
// 毫秒数 转 yyyy-mm-dd
DateParse.prototype.getFormatDate = function(time){
  var date = new Date();
  date.setTime(time);
  var year =  date.getFullYear(); 
  var month = date.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  var day = date.getDate();
  if(day < 10){
    day = '0' + day;
  }
  return year + '-' + month + '-' + day;
}
//获取三个月后的第一天
DateParse.prototype.getPositiveDate = function(time){
  var date = this.toDate(time);

  var month = date.getMonth() + 1;

  if(month > 9){
    var year =  date.getFullYear() + 1;
    month = month - 12 + 3;
  } else {
    var year =  date.getFullYear(); 
    month = month + 3;
  }
  if (month < 10) {
    month = '0' + month;
  }
  var day = '01';
  return year + '-' + month + '-' + day;
}
//计算实际培训周期
DateParse.prototype.getTrainingCycle = function(start,finish){
  if(!start || !finish){
    return '';
  }
  else{
    return Math.ceil((this.toDate(finish).getTime() - this.toDate(start).getTime()) / 1000 / 60 / 60 / 24  + 1);
  }
}

//计算一次通过
DateParse.prototype.getOneTimesPass = function(start, finish, standardCycle){
  if(!start || !finish || !standardCycle){
    return '';
  } else {
    if(Math.ceil((this.toDate(finish).getTime() - this.toDate(start).getTime()) / 1000 / 60 / 60 / 24 ) > standardCycle){
      return '<span style="color:red">否</span>'
    } else {
      return '<span style="color:green">是</span>'
    }
  }
}
//获取下线日期
DateParse.prototype.getDateOfWork = function(finish){
  if(!finish){
    return '';
  } else {
    return this.getFormatDate(this.toDate(finish).getTime() + 1000 * 60 * 60 * 24);
  }
}

//日期字符串 转 Date
DateParse.prototype.toDate = function toDate(dateString){
  var DATE_REGEXP = new RegExp("(\\d{4})-(\\d{2})-(\\d{2})([T\\s](\\d{2}):(\\d{2}):(\\d{2})(\\.(\\d{3}))?)?.*");
    if(DATE_REGEXP.test(dateString)){
        var timestamp = dateString.replace(DATE_REGEXP, function($all,$year,$month,$day,$part1,$hour,$minute,$second,$part2,$milliscond){
            var date = new Date($year, $month - 1,$day, $hour||"00", $minute||"00", $second||"00", $milliscond||"00");
            return date.getTime();
        });
        var date = new Date();
        date.setTime(timestamp);
        return date;
    }
    return null;
}


//获取入职天数
DateParse.prototype.getOnJobDay = function(register, resign){

  if(!register){
    return '';
  } else {
    register = this.toDate(register);
  }
  var end = null;
  if (resign){
    end = this.toDate(resign);
  } else {
    end =  new Date().getTime();
  }
  return Math.ceil((end - register) /1000 / 60 / 60 /24) + '天';
}

//在岗年资
DateParse.prototype.getOnJobYear = function(register, resign){
  if(!register){
    return '';
  } else {
    register = this.toDate(register);
  }
  var end = null;
  if (resign){
    end = this.toDate(resign);
  } else {
    end =  new Date().getTime();
  }
  return  ((end - register) /1000 / 60 / 60 /24 / 365 ).toFixed(1) + '年';
}
DateParse.prototype.getAbolish = function(register, resign){
  if(!resign){
    return '<span style="color:green">否</span>';
  } else if( ((new Date(resign).getTime() - new Date(register).getTime()) /1000 / 60 / 60 /24) <= 3){
    return '<span style="color:red">是</span>';
  } else {
    return '<span style="color:green">否</span>'
  }
}

var dateParse = new DateParse();


function AjaxUtil(){

  this.getAllEmployee();
}
//获取管理员名单。
AjaxUtil.prototype.getManager = function(){
  var managers = null;
  $.ajax('/FHR/personFileManage.do?m=getManager',{
    type:'POST',
    async:false,
    data:{
      'msg':'getManager'
    },
    success:function(res){
      if(res.code == '0')  {
        managers = res.managers;
      } else {
        managers = []
        alert('获取文员信息出错');
      }
    },
  })
  return managers
}

AjaxUtil.prototype.saveValue = function(msg){
  // msg = JSON.stringify(msg);
  $.ajax('/FHR/personFileManage.do?m=saveValue',{
    type:'post',
    async:false,
    data:{
      'msg':msg
    },
    success:function(res){
    }
  })
}
//获取 岗位
AjaxUtil.prototype.getOperationPosition = function(operation){
  var data = {};
  $.ajax('/FHR/personFileManage.do?m=getOperationPosition',{
    type:'post',
    async:false,
    data:{
      msg:'getOperationPosition',
      operation:operation
    },
    success:function(res){
      if(res.code == 0){
        data = res.data;
      }
    }
  })
  return data
}



//获取职称
AjaxUtil.prototype.getJobTitle = function(jobType){
  var data = {};
  $.ajax('/FHR/personFileManage.do?m=getJobTitle',{
    type:'post',
    async:false,
    data : {
      msg:'getJobTitle',
      jobType : jobType
    },
    success:function(res){
      if(res.code == 0){
        data = res.data;
      }
    }
  })
  return data;
}

//查询 姓名/工号：工号
AjaxUtil.prototype.getAllEmployee =  function(scope){
  var data = {};
  $.ajax('/FHR/personFileManage.do?m=getAllEmployee',{
    type:'post',
    async:false,
    data : {
      msg:'getAllEmployee',
      scope : scope
    },
    success:function(res){
      if(res.code == 0){
        data = res.data;
      }
    }
  })
  return data;
}

//获取LCM 的站点
// AjaxUtil.prototype.getOperation = function(scope){
//   var data = {};
//   $.ajax('/FHR/personFileManage.do?m=getOperation',{
//     type:'post',
//     async:false,
//     data : {
//       msg:'getOperation',
//       scope : scope
//     },
//     success:function(res){
//       if(res.code == 0){
//         data = res.data;
//       }
//     }
//   })
//   return data;
// }
//选择厂别 获取部门
AjaxUtil.prototype.getDept = function(scope){
  if(!scope){
    return null;
  } else {
    var data = {};
    $.ajax('/FHR/personFileManage.do?m=getDept',{
      type:'post',
      async:false,
      data : {
        msg:'getDept',
        scope : scope
      },
      success:function(res){
        if(res.code == 0){
          data = res.data;
        }
      }
    })
    return data;
  }
}
AjaxUtil.prototype.getOperation = function(dept){
  var data = {};
  $.ajax('/FHR/personFileManage.do?m=getOperation',{
    type:'post',
    async:false,
    data : {
      msg:'getOperation',
      dept : dept
    },
    success:function(res){
      if(res.code == 0){
        data = res.data;
      }
    }
  })
  console.log(data)
  return data;
}
  //获取来源
AjaxUtil.prototype.getAllSource = function(){
  var data = [];  
  $.ajax('/FHR/personFileManage.do?m=getAllSource',{
    type:'POST',
    async:false,
    data:{
      msg:'getAllSource',
    },
    success:function(res){
      if(res.code == 0){
        var allSource = res.sources;
        
        for(var i in allSource){
          if(allSource[i]){
            var obj = {};
            obj.oid = allSource[i];
            obj.oname = allSource[i];
            data.push(obj);
          }
        }
      }
    }
  })
  return data;
}

var ajaxUtil = new AjaxUtil();