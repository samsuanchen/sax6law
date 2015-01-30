var sax = require("sax"),
  strict = true, // set to false for html-mode
  parser = sax.parser(strict);

parser.onerror = function (e) {
  // an error happened.
};
parser.ontext = function (t) {
  // got some text.  t is the string of text.
};
var output={};
parser.onopentag = function (node) {
	if (node.name=="Relationship") {
		output[node.attributes.Id]=node.attributes.Target;
	}
  // opened a tag.  node has "name" and "attributes"
};
parser.onattribute = function (attr) {
  // an attribute.  attr has "name" and "value"
};
parser.onend = function () {
  // parser stream is done, and ready to have more stuff written to it.
};
var rels=require("fs").readFileSync("rels.xml","utf8");
var parsed=parser.write(rels).close();
module.exports=output;
