var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var db = require('./lib/db.js');
var topic = require('./lib/topic.js');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    console.log(url.parse(_url, true));

    if(pathname === '/'){
      if(queryData.id === undefined)
        topic.home(request, response);
      else
        topic.page(request, response, queryData);
    } 
    else if(pathname === '/create')
      topic.create(request, response);
    else if(pathname === '/create_process')
      topic.create_process(request, response);
    else if(pathname === '/update')
      topic.update(request, response, queryData);
    else if(pathname === '/update_process')
      topic.update_process(request, response);
    else if(pathname === '/delete_process')
      topic.delete_process(request, response);
    else if(pathname === '/author'){
      //author.home();
      db.query('SELECT * FROM author', function(error, authors){
        console.log(authors);

        var body = template.authorTable(authors);
        var html = template.authorHTML(body, '<a href="/author_create">create</a>');

        response.writeHead(200);
        response.end(html);
      });
    }
    else if(pathname === '/author_create'){
      var body = `
            <form action="/author_create_process" method="post">
              <p><input type="text" name="name" placeholder="name"></p>
              <p>
                <textarea name="profile" placeholder="profile"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `;

      var html = template.authorHTML(body, '<a href="/author_create">create</a>');

      response.writeHead(200);
      response.end(html);
    }
    else if(pathname === '/author_create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          
          db.query(`
              INSERT INTO author (name, profile) 
              VALUES(?, ?)`, [post.name, post.profile],
            function(error, result){

              if(error){throw error;}

              response.writeHead(302, {Location: `/author`});
              response.end();
            });
      });      
    }

    else if(pathname === '/author_update'){
      db.query('SELECT * FROM author WHERE id = ?', [queryData.id], function(error, author){
        if(error){throw error;}

        var name = author[0].name;
        var profile = author[0].profile;
        var authorID = author[0].id;
        var body = `
          <form action="/author_update_process" method="POST">
            <input type="hidden" name="authorID" value="${authorID}">
            <p><input type="text" name="name" placeholder="name" value="${name}"></p>
            <p>
              <textarea name="profile" placeholder="profile">${profile}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `;
        var html = template.authorHTML(body, '<a href="/author_create">create</a>');

        response.writeHead(200);
        response.end(html);
      });        
    }

    else if(pathname === '/author_update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);

          db.query(`
              UPDATE author
              SET name = ?,
                  profile = ?
              WHERE id = ?;
              `, [post.name, post.profile, post.authorID],
            function(error, result){

            if(error){throw error;}

            response.writeHead(302, {Location: '/author'});
            response.end();
          });
      });      
    }

    else if(pathname === '/author_delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          
          db.query(`
              DELETE FROM author
              WHERE id = ?;
              `, [post.authorID],
            function(error, result){

              if(error){throw error;}

              response.writeHead(302, {Location: `/author`});
              response.end();
            });
      });            
    }

    else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
