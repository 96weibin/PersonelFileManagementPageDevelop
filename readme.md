# 人员档案管理 页面开发

## 技术栈

* 前端
  1. 采用webpack 打包过多的js、css  --- 经尝试感觉不适合现在这个公司使用,未对源码进行管理。
  2. 尝试使用sass？
  3. bootStrap日历插件
  4. 写一个树？
  5. ajax请求阶段  改变 cursor  以及 防多次点击遮罩  透明
  6. 使用节流函数  --  冰山工作是
  7. rem 布局、float
  8. .enEdit 提供可编辑 公用样式
* 后端
  1. spring、springBoot、hibernate？

## 功能分析

1. 报表显示全部人员
   * 根据所有条件进行筛选、分页显示
   * 一排应该放不下  长tr？ 还是
   * 关联数据过多应先通过定时器 计算后的插入单个表
   * 双击  edit  change 提交 ？
   * 权限问题   谁可以修改  谁可以看 ？