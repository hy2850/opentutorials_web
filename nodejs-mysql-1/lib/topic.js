var qs = require('querystring');

// Below two modules are in the SAME folder
var template = require('./template.js');
var db = require('./db.js');

// Module function is passed with req, res arguments from main.js
// exports.function_name = function(){...} to pass multiple functions from one file module
exports.home = function(request, response){
	db.query('SELECT * FROM topic', function(error, topics){
	  console.log(topics);

	  var title = 'Welcome';
	  var description = 'Hello, Node.js';
	  var list = template.list(topics);
	  var html = template.HTML(title, list,
	    `<h2>${title}</h2>${description}`,
	    `<a href="/create">create</a>`
	  );
	  response.writeHead(200);
	  response.end(html);
	});
};

exports.page = function(request, response, queryData){
	db.query('SELECT * FROM topic', function(error, topics){
	  if(error){throw error;}

	  // `id = ${queryData.id}` 라고 쓰면 URL을 통한 공격에 취약해지므로, '?' 를 이용한 변수 대입 이용
	  // https://stackoverflow.com/questions/44266248/escape-question-mark-characters-as-placeholders-for-mysql-query-in-nodejs?rq=1
	  db.query(`SELECT topic.*, author.name, author.profile FROM topic
	            LEFT JOIN author
	            ON topic.author_id = author.id
	            WHERE topic.id = ?;`, [queryData.id], function(error2, topic){
	    if(error2){throw error2;}

	    console.log("Specific topic : ");
	    console.log(topic);

	    var title = topic[0].title;
	    var description = topic[0].description;
	    var author_name = topic[0].name;
	    var id = topic[0].id;
	    var list = template.list(topics);
	    var html = template.HTML(title, list,
	      `<h2>${title}</h2>${description}
	      <p>written by ${author_name}</p>`,
	      ` <a href="/create">create</a>
	        <a href="/update?id=${id}">update</a>
	        <form action="delete_process" method="post">
	          <input type="hidden" name="id" value="${id}">
	          <input type="submit" value="delete">
	        </form>`
	    );
	    response.writeHead(200);
	    response.end(html);
	  });
	});
};

exports.create = function(request, response){
	db.query('SELECT * FROM topic', function(error, topics){
        if(error){throw error;}

        db.query('SELECT * FROM author', function(error2, authors){
          if(error2){throw error2;}

          var title = 'WEB - create';
          var list = template.list(topics);
          var html = template.HTML(title, list, `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                ${template.authorSelect(authors)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `, '');
          response.writeHead(200);
          response.end(html);
        });
  	});
};

exports.create_process = function(request, response){
	  var body = '';
	  request.on('data', function(data){
	      body = body + data;
	  });
	  request.on('end', function(){
	      var post = qs.parse(body);
	      
	      db.query(`
	          INSERT INTO topic (title, description, created, author_id) 
	          VALUES(?, ?, NOW(), ?)`, [post.title, post.description, post.author],
	        function(error, result){

	        if(error){throw error;}

	        // Getting MySQL Node.js insert id
	        response.writeHead(302, {Location: `/?id=${result.insertId}`});
	        response.end();
      	});
  	});
};

exports.update = function(request, response, queryData){
      db.query('SELECT * FROM topic', function(error, topics){
          if(error){throw error;}

          db.query(`SELECT * FROM topic WHERE id = ?`, [queryData.id], function(error2, topic){
            if(error2){throw error2;}

            db.query('SELECT * FROM author', function(error3, authors){
              if(error3){throw error3;}

              var title = topic[0].title;
              var description = topic[0].description;
              var id = topic[0].id;
              var selected_author = topic[0].author_id; // Implementing already selected attribute for <select> tag
              var list = template.list(topics);
              var html = template.HTML(title, list,
                `
                <form action="/update_process" method="POST">
                  <input type="hidden" name="id" value="${id}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p>
                    <textarea name="description" placeholder="description">${description}</textarea>
                  </p>
                  <p>
                    ${template.authorSelect(authors, selected_author)}
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${id}">update</a>`
              );
              response.writeHead(200);
              response.end(html);
          	});
        });
  	});
};

exports.update_process = function(request, response){
	  var body = '';
	  request.on('data', function(data){
	      body = body + data;
	  });
	  request.on('end', function(){
	      var post = qs.parse(body);

	      db.query(`
	          UPDATE topic
	          SET title = ?,
	              description = ?,
	              author_id = ?
	          WHERE id = ?;
	          `, [post.title, post.description, post.author, post.id],
	        function(error, result){

	        if(error){throw error;}

	        response.writeHead(302, {Location: `/?id=${post.id}`});
	        response.end();
	      });
	  });
};

exports.delete_process = function(request, response){
	var body = '';
      	request.on('data', function(data){
          body = body + data;
      	});
      	request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;

          db.query(`
              DELETE FROM topic
              WHERE id = ?;
              `, [id],
            function(error, result){

            if(error){throw error;}

            response.writeHead(302, {Location: `/`});
            response.end();
  		});
	});
};