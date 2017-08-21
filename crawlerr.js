var http = require('http');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var baseUrl = 'http://www.imooc.com/learn/';
var url="http://www.imooc.com/learn/348"
var videoIds=[348,259,197,134,75];

/*解析html，提取课程有用信息*/
function filterChapers(html){
var $ = cheerio.load(html);//把html内容装载进来
var chapters = $('.chapter');//通过类名拿到所有的章节
var title = $('.course-infos .path span').text()
    var number = parseInt($($('.meta-value strong')[3]).text().trim(), 10)
console.log('title: '+title);   
/*courseData = {
title:title,//课程的名称
number:number,//学习过的人数
videos: [{
 	chapterTitle:'',//每一章的名字
 	videos:[ //每一章很多小节，即很多个视频
 	 title:'',
 	 id:''
 	]
}]
}*/

//预备的课程数组
var courseData = {
title: title,
number: number,
videos: []
};

//每一章进行遍历
chapters.each(function(item){
//这里是单独的每一章
var chapter = $(this);
var chapterTitle = chapter.find('strong').text(); //这一章的名字，如 第一章：前言
console.log(chapterTitle)
var videos = chapter.find('.video').children('li');//这一章的所有小节
//定义一个存放 章 的内容
var chapterData = {//这一章的内容对象
chapterTitle:chapterTitle,   //章的名字
videos:[]                    //这一章的所有小节
}

videos.each(function(){
var video = $(this).find('.J-media-item');
var videoTitle = video.text();
var id=video.attr("href").split("video/")[1]//拿到当前小节即这小节视频的id

chapterData.videos.push({
title : videoTitle,
id : id
})
})//这一章的所有小节内容结束了

courseData.videos.push(chapterData)//当前这一章分析后的内容添加到课程数组中
})

return courseData;
}

/*
   打印课程信息
*/
function printCourseInfo(coursesData){

coursesData.forEach(function(courseData){
console.log(courseData.number + ' 人学过 '+ courseData.title+'\n');
})

coursesData.forEach(function(courseData){

console.log('### ' + courseData.title+'\n');

courseData.videos.forEach(function(item){
var chapterTitle = item.chapterTitle;

console.log(chapterTitle + '\n');
item.videos.forEach(function(video){
console.log('【'+video.id+'】' + video.title+'\n');
})
})
})
}

// 异步爬取页面html
function getPageAsync(url){
return new Promise(function(resolve,reject){
console.log('正在爬取 '+url);

http.get(url,function (res) {
var html = '';

res.on('data',function(data){
html += data;
})

res.on('end',function(){
console.log('爬取' + url + '成功');
resolve(html);//通过resolve传递下去
})

}).on('error',function(){
reject(e);//爬虫在爬的时候出错了，返回一个错误信息
console.log('爬取失败');
})
})
}

// 爬取到的html页面集合
var fetchCourseArray = [];

// 批量爬取课程页面
videoIds.forEach(function(id){
fetchCourseArray.push(getPageAsync(baseUrl+id));
})

/*
all里面是一个个的promise对象
*/
Promise
.all(fetchCourseArray)
.then(function(pages){
var coursesData = [];

pages.forEach(function(html){
// 提取课程信息
var courses = filterChapers(html);
coursesData.push(courses);
})

coursesData.sort(function(a,b){
return a.number < b.number;//从大到小排序
})
// 打印课程信息
printCourseInfo(coursesData);
})
