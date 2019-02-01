// Using Node.js modules called 'http', 'fs', ...
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring')

// control : create 와 update가 나타나게 할지 말지 결정 
function templateHTML(title, list, body, control){
	return `<!doctype html>
			<html>
			<head>
			  <title>WEB1 - ${title}</title>
			  <meta charset="utf-8">
			</head>
			<body>
			  <h1><a href="/">WEB</a></h1>
			  <ol>
			  ${list}
			  </ol>
			  ${control}
			  ${body}
			</body>
			</html>`;
		}

// request : 요청할 때 웹 브라우저가 보내는 정보들
// response : 응답할 때 우리가 웹 브라우저에게 전송할 정보들
var app = http.createServer(function(request,response){
    var _url = request.url;
    //console.log("url : " + _url);	

    var queryData = url.parse(_url, true).query;
    console.log("queryData : ");
    console.log(url.parse(_url, true));

    var pathName = url.parse(_url, true).pathname;
    var title = queryData.id;

	// Reading files in the 'data' directory and writing the names in the list
	var ordered_files = "";
	var files = fs.readdirSync("./data");
	files.forEach(file => {
		ordered_files = ordered_files.concat(`<li><a href="/?id=${file}">${file}</a></li>`);	  	
	  	//console.log(ordered_files);
	});

	if(pathName === '/'){
    	if(queryData.id === undefined){
    		var title = "Main page";
    		var description = "Hello~! Welcome!";

			var template = templateHTML(title, ordered_files, `<h2>${title}</h2><p>${description}</p>`, '<a href="/create">create</a>');
			
			response.writeHead(200); // HTTP status code
		    response.end(template);
		}else{
	    	fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
		    	var template = templateHTML(title, ordered_files, `<h2>${title}</h2><p>${description}</p>`,
		    		`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
				
				response.writeHead(200); // HTTP status code
			    response.end(template);
	    	})
    	}

    // 사용자의 글 작성 기능
	}else if(pathName === '/create'){
		var title = "Create"
		var template = templateHTML(title, ordered_files, 
			`<form action = "/create_process" method = "POST">
			<p><input type="text" name="title" placeholder = "title"></p>
			<p><textarea name="description" placeholder = "description"></textarea></p>
			<p><input type="submit" value="확인"></p>
			</form>`, '');
			
		response.writeHead(200); 
	    response.end(template);

	// 사용자가 작성한 글 POST 정보 받아서 파일생성 및 리다이렉트
	}else if(pathName === '/create_process'){
		var body = '';

		// 조각된 데이터를 하나씩 수신할때 마다, callback 함수의 인자로 넘겨줌
		request.on('data', function(data){
			body += data;
		});
		// 더 이상 들어올 정보가 없으면, 다음 callback 함수 실행 후 정보 수신 종료
		request.on('end', function(){
			var post = qs.parse(body); // post 변수에 POST 형태로 보낸 정보가 담겨있을 것
			var title = post.title;
			var description = post.description;

			fs.writeFile(`data/${title}`, description, 'utf8', 
				function(err){
					response.writeHead(302,
						{Location:`/?id=${title}`}); // redirection to the created page
				    response.end("success!");
				});
		});

	// 글 수정 기능
	}else if(pathName === '/update'){
		fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
				// To notify our browser what we are trying to update, use input tag type "hidden" and send 
		    	var template = templateHTML(title, ordered_files, 
		    		`<form action = "/update_process" method = "POST">
		    		<input type="hidden" name="id" value=${title}>
					<p><input type="text" name="title" value=${title}></p>
					<p><textarea name="description" placeholder="description">${description}</textarea></p>
					<p><input type="submit" value="확인"></p>
					</form>`, '');
				
				response.writeHead(200); // HTTP status code
			    response.end(template);
			});
	}else if(pathName === '/update_process'){
		var body = '';

		// 조각된 데이터를 하나씩 수신할때 마다, callback 함수의 인자로 넘겨줌
		request.on('data', function(data){
			body += data;
		});
		// 더 이상 들어올 정보가 없으면, 다음 callback 함수 실행 후 정보 수신 종료
		request.on('end', function(){
			var post = qs.parse(body); // post 변수에 POST 형태로 보낸 정보가 담겨있을 것
			var id = post.id;
			var title = post.title;
			var description = post.description;
			
			// id라는 이름을 가진 문서를 새로운 제목인 title로 이름 변경
			fs.rename(`data/${id}`, `data/${title}`, function(err){

			});

			// 내용도 변경
			fs.writeFile(`data/${title}`, description, 'utf8', 
				function(err){
					response.writeHead(302,
						{Location:`/?id=${title}`}); // redirection to the created page
				    response.end("success!");
				});

			console.log(post);
		});
	}
	else{
		response.writeHead(404); 
	    response.end("Not found");	
	}
});
app.listen(3000);