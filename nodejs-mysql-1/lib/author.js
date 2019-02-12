var qs = require('querystring');
var template = require('./template.js');
var db = require('./db.js');

exports.home = function(request, response){
  db.query('SELECT * FROM author', function(error, authors){
    console.log(authors);

    var body = template.authorTable(authors);
    var html = template.authorHTML(body, '<a href="/author_create">create</a>');

    response.writeHead(200);
    response.end(html);
  });	
};

exports.create = function(request, response){
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
};

exports.create_process = function(request, response){
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
};

exports.update = function(request, response, queryData){
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
};

exports.update_process = function(request, response){
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
};

exports.delete_process = function(request, response){
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
};