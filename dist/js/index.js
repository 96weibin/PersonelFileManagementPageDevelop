"use strict";

window.onload = function () {
  console.log(1);
  new Init();
};

function Init() {
  /**
   * nav scroll 保持在原地 
   * 
   * table 标题 scroll固定、 且要求  宽度与 table 相同
   * init 需要  search 显示页面
   * 
   * pageControl
   * 判断权限
   * dblclick  edit 提交即可
   **/
  this.tableTitleScroll(); // this.tableWidthSame();

  this.buildCalendar('oDate');
  this.canEdit();
} //表单标题  固定


Init.prototype.tableTitleScroll = function () {
  var that = this;

  $('article')[0].onscroll = function (e) {
    var event = e || window.event;
    var y = $(event.target).scrollTop();
    $('.formTitle').css({
      'top': y
    });
  }; // window.onresize = ()=>{
  //   location.reload();
  // } 

}; //table 由于标题浮动导致标题与   body 宽度不同
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
  $('.' + tarClass).datetimepicker({
    language: 'fr',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0
  });
}; //双击可编辑


Init.prototype.canEdit = function () {
  $('.edit').dblclick(function (e) {
    e.target.setAttribute('contenteditable', true);
  });
}; //兼容IE8的 获取 元素 滚动条距离


Init.prototype.getScrollOffset = function (ele) {
  if (window.pageYOffset != undefined) {
    return {
      x: $(ele)[0].pageXOffset,
      y: $(ele)[0].pageYOffset
    };
  } else {
    return {
      x: document.body.scrollTop + document.documentElement.scrollTop,
      y: document.body.scrollLeft + document.documentElement.scrollLeft
    };
  }
};