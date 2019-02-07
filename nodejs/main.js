// Using Node.js modules called 'http', 'fs', ...
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
//var alert = require('alert-node');

// 모듈화 (하위폴더 lib에 저장)
var template = require('./lib/template.js')

// 보안
var path = require('path');
var sanitizeHtml = require('sanitize-html');

// request : 웹브라우저로 들어온 요청에 대한 여러 정보 담고 있음
// response : 사용자에게 필요한 정보를(아래 코드를 통해 설정) 전달해주는 매개체 같은 것
var app = http.createServer(function(request,response){
    var _url = request.url;
    //console.log("url : " + _url);	

    var queryData = url.parse(_url, true).query;
    console.log("queryData : ");
    console.log(url.parse(_url, true));

    var pathName = url.parse(_url, true).pathname;
    var title = queryData.id;
    console.log("title : ", title);

    // (보안) 사용자가 URL을 통해 우리 컴퓨터의 디렉토리에 접근하는 것을 방지
	if (queryData.id != null)
		var filteredId = path.parse(queryData.id).base; // Main page does not have query string, so string assignment is needed to prevent null argument error happening below.

	// Reading files in the 'data' directory and writing the names in the list
	var ordered_files = template.list();

	if(pathName === '/'){
    	if(queryData.id === undefined){
    		var title = "Main page";
    		var description = "Hello~! Welcome!";

			var page = template.HTML(title, ordered_files, `<h2>${title}</h2><p>${description}</p>`, '<a href="/create">create</a>');
			
			response.writeHead(200); // HTTP status code
		    response.end(page);
		}else{
	    	fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
	    		var sanitizedTitle = sanitizeHtml(title);
	    		var sanitizedDescription = sanitizeHtml(description);

		    	var page = template.HTML(sanitizedTitle, ordered_files, `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
		    		`<a href="/create">create</a> <a href="/update?id=${sanitizedTitle}">update</a>
		    		<form action="delete_process" method="POST" onsubmit="return confirm_delete()">
		    			<input type="hidden" name="id" value="${sanitizedTitle}">
		    			<input type="submit" value="delete">
		    		</form>
		    		<script>
					function confirm_delete(){
						var result = confirm("Sure you want to delete?");
						return result;
					}
					</script>`);
				
				response.writeHead(200); // HTTP status code
			    response.end(page);
	    	})
    	}

    // 사용자의 글 작성 기능
	}else if(pathName === '/create'){
		var title = "Create"
		var page = template.HTML(title, ordered_files, 
			`<form action = "/create_process" method = "POST">
				<p><input type="text" name="title" placeholder = "title"></p>
				<p><textarea name="description" placeholder = "description"></textarea></p>
				<p><input type="submit" value="확인"></p>
			</form>`, '');
			
		response.writeHead(200); 
	    response.end(page);

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
		fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
				// To notify our browser what we are trying to update, use input tag type "hidden" and send 
		    	var page = template.HTML(title, ordered_files, 
		    		`<form action = "/update_process" method = "POST">
			    		<input type="hidden" name="id" value="${title}">
						<p><input type="text" name="title" value="${title}"></p>
						<p><textarea name="description" placeholder="description">${description}</textarea></p>
						<p><input type="submit" value="확인"></p>
					</form>`, '');
				
				response.writeHead(200); // HTTP status code
			    response.end(page);
			});
	}else if(pathName === '/update_process'){
		var body = '';

		request.on('data', function(data){
			body += data;
		});
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

	//글 삭제 기능
	else if(pathName === '/delete_process'){
		var body = '';

		request.on('data', function(data){
			body += data;
		});

		request.on('end', function(){
			var post = qs.parse(body); // post 변수에 POST 형태로 보낸 정보가 담겨있을 것
			var id = post.id;

			// (보안) 사용자가 URL을 통해 우리 디렉토리에 접근하는 것 방지
			var filteredID = path.parse(id).base;
			fs.unlink(`data/${filteredID}`, function(err){
				/*
				alert("Deletion successful"); // 작동 X. 행동 후에 Browser에 alert popup이 뜨게 할 수는 없을까?
	
				response.writeHead(302,
						{Location:`/`}); // redirection to the created page
				*/

				// Instead of trying to create pop-up in the browser from the server-side, pass the order to the front-end.
				// https://groups.google.com/forum/#!topic/comp.lang.javascript/_3_BCYaE1ZA
			    response.end(`<!doctype html>
								<html>
								<head>
								  <title>Deletion Successful</title>
								  <meta charset="utf-8">
								</head>
								<body>
								  <script>
								  	alert("Deletion successful");
								  	window.location.href = '/';
								  </script>
								</body>
								</html>`);
			});
		});

	}else{
		response.writeHead(404); 
	    response.end("Not found");	
	}
});
app.listen(3000);