var fs = require('fs');

module.exports = {
	// control : create 와 update가 나타나게 할지 말지 결정 
	HTML : function(title, list, body, control){
			return `<!doctype html>
					<html>
					<head>
					  <title>WEB1 - ${title}</title>
					  <meta charset="utf-8">
					</head>
					<body>
					  <h1><a href="/">WEB</a></h1>
					  ${list}
					  ${control}
					  ${body}
					</body>
					</html>`;
			},
	
	// Takes array of file names (String) in the data directory and format HTML list out of them
	list : function(){
			var ordered_files = "";
			var files = fs.readdirSync("./data");
			files.forEach(file => {
				ordered_files = ordered_files.concat(`<li><a href="/?id=${file}">${file}</a></li>`);
			});

			return "<ol>"+ordered_files+"</ol>";
		}		
}
