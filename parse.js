var rels=require("./parse_rels");
var fs=require("fs");
//https://github.com/isaacs/sax-js
var pstyle=-1,t='';
var line="";
var id='',tx='';
var instrText='', instr=0;
var saxStream = require("sax").createStream(true)
var nodename;
var tagstack=[];
var anotherHyperLink=function(){
	var m=fld[1].match(/ HYPERLINK ( \\l )?"(.+)" /);
	if(m){
		link=m[2];
		if(m[1]) link='#'+link; // local reference
		line=fld[0]+'<a href="'+link+'">'+fld[2]+'</a>'+(fld[3]||'');
	}
}
var onP=function(node) {
	if (pstyle===2) {
		var m=line.match(/第(.+?)條(（.+?）)/)
		if(m) {
			id=m[1],tx=m[2];
			line=line.replace(m[0],'<entry n="'+id+'">第'+id+'條'+tx+'</entry>');
		}
	}
	line=line.replace(/\r?\n/,'');
	if(fld.length>2) anotherHyperLink();
	if(line) console.log(line);
	instrText=0, instrText=line="", pstyle=-1, fld=[''];
}
var onPSyle=function(node) {
	pstyle=parseInt(node.attributes["w:val"]);	
}
var replaceHyperLink=function(node){
	var link=node.attributes['w:anchor']
	link=link ? '#'+link : rels[node.attributes['r:id']];
	line=line.replace(hyperText,'<a href="'+link+'">'+hyperText+'</a>');
	hyperText="", hyperlink=0;
}
var insertHyperName=function(node){
	line+='<a name="'+node.attributes['w:name']+'"></a>';
}
saxStream.on("closetag", function (nodename) {
	var node=tagstack.pop();
	nodename=node.name;
		 if(nodename==="w:p") onP(node);
	else if(nodename==="w:pStyle") onPSyle(node);
	else if(nodename==='w:hyperlink') replaceHyperLink(node);
	else if(nodename==='w:bookmarkStart') insertHyperName(node);
});
var hyperlink=0,fld=[''];
saxStream.on("opentag", function (node) {
	nodename=node.name;
		 if(nodename==='w:t'		) t=1;
	else if(nodename==='w:pStyle'   ) pStyle=parseInt(node.attributes['w:val']);
	else if(nodename==='w:hyperlink') hyperText='', hyperlink=1;
	else if(nodename==='w:fldChar'&&node.attributes['w:fldCharType']==='begin'){
		fld.push('');
	//	console.log("node.attributes['w:fldCharType']==='begin'");
	}
	else if(nodename==='w:fldChar'&&node.attributes['w:fldCharType']==='separate'){
		fld.push('');
	//	console.log("node.attributes['w:fldCharType']==='separate'");
	}
	else if(nodename==='w:fldChar'&&node.attributes['w:fldCharType']==='end'){
		fld.push('');
	//	console.log("node.attributes['w:fldCharType']==='begin'");
	}
	tagstack.push(node);
});
saxStream.on("text",function(text){
	text=text.replace(/>/g,'&gt;');
	if (t) fld[fld.length-1]+=text, line+=text, t=0;
	if (hyperlink) hyperText+=text;
	if (nodename==='w:instrText') fld[fld.length-1]+=text;
});
fs.createReadStream("document.xml")
  .pipe(saxStream)
  .pipe(fs.createWriteStream("file-copy.xml"))