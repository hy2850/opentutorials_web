var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var db = require('./lib/db.js');
var topic = require('./lib/topic.js');
var author = require('./lib/author.js');

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
    else if(pathname === '/author')
      author.home(request, response);
    else if(pathname === '/author_create')
      author.create(request, response);
    else if(pathname === '/author_create_process')
      author.create_process(request, response);
    else if(pathname === '/author_update')
      author.update(request, response, queryData);
    else if(pathname === '/author_update_process')
      author.update_process(request, response);
    else if(pathname === '/author_delete_process')
      author.delete_process(request, response);
    else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
