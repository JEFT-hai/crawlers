    var http=require("http");
/*cheerio模块，用来解析html的，绝对路径取得，此处代码可变*/
var cheerio=require("cheerio");
var url="http://www.imooc.com/learn/348";

/*过滤html*/
function filterChapters(html){
	var $=cheerio.load(html);
	var chapters=$(".chapter");
	/*章节内容*/
	var  courseData=[];
	chapters.each(function(item){
		var chapter=$(this);
		var chapterTitle=chapter.find("strong").text();
		var videos=chapter.find(".video").children("li");

		/*章节数据*/
		var chapterData={
			chapterTitle:chapterTitle,
			videos:[]
		};
		/*video 数据*/
		videos.each(function(item){
			var video=$(this).find(".J-media-item");
			var videoTitle=video.text();
			/*split分割字符串函数,指定分隔符，分割成多个子字串，
			将结果放到一个数组中["video/",2334]*/
			var id=video.attr("href").split("video/")[1];
			chapterData.videos.push({
				title:videoTitle,
				id:id
			});
		});
		courseData.push(chapterData);
	});
	return courseData;//课程数据对象返回出去
}
/*循环遍历打印*/
function printCourseInfo(courses){
	courses.forEach(function(item){
		var chapterTitle=item.chapterTitle;
		console.log(chapterTitle+"\n");
		item.videos.forEach(function(video){
			console.log("【"+video.id+"】"+"【"+video.title+"】\n");
		});
	});
}
/*get请求*/
http.get(url,function(res){
	var html='';
	res.on("data",function(data){
		html += data;
	});
	res.on("end",function(){
		var courseData=filterChapters(html);
		printCourseInfo(courseData);
	});
}).on("error",function(){
	console.log("获取课程数据出错");
});
