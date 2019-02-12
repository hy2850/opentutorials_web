module.exports = {
  HTML:function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <a href="/author">Authors</a>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list:function(topics){
    var list = '<ul>';
    var i = 0;
    while(i < topics.length){
      list = list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },
  authorSelect:function(authors, selected){
    // Forming author name tags
    var tag = '';
    for(var i=0; i<authors.length; i++){
      var author_id = authors[i].id;

      // Including process that selects the author who wrote the article
      if(author_id === selected)
        tag += `<option value = ${author_id} selected>${authors[i].name}</option>`;        
      else
        tag += `<option value = ${author_id}>${authors[i].name}</option>`;
    }

    return `
          <select name = "author">
            ${tag}
          </select>`;
  },
  authorHTML:function(body, control){
    return `
          <!doctype html>
            <html>
              <head>
                <title>WEB1 - Authors</title>
                <meta charset="utf-8">

                <style>
                  table, th, td {
                    border: 1px solid black;
                  }
                </style>
              </head>

              <body>
                <h1><a href="/">WEB</a></h1>
                <a href="/author">Authors</a><br>
                
                <p>
                  ${control}
                  ${body}
                </p>
              </body>
            </html>
            `;
  },
  authorTable:function(authors){
    var list = `
                <table>
                  <tr>
                    <th>Name</th>
                    <th>Profile</th>
                    <th></th>
                    <th></th>
                  </tr>`;
    var i = 0;
    while(i < authors.length){
      temp = '<tr>';
      temp += `<td>${authors[i].name}</td>
               <td>${authors[i].profile}</td>`;
      list += (temp+`
                    <td>
                      <a href="/author_update?id=${authors[i].id}"><input type="button" value="Update"></a>
                    </td>
                    <td>
                      <form action="author_delete_process" method="post">
                          <input type="hidden" name="authorID" value="${authors[i].id}">
                          <input type="submit" value="Delete">
                      </form>
                    </td>
                  </tr>`);
      i = i + 1;
    }
    return (list+'</table>');    
    // 저렇게 버튼으로 update, delete구현하면, onclick으로 페이지 리다이렉트 구현할꺼?
    // -> link tag 내부에 버튼 위치 or form 활용

    /* Example)
    <tr>
      <td>Jill</td>
      <td>Smith</td>
      <td>
        <input type = "button" name = "update" value = "Update">
      </td>
      <td>
        <input type = "button" name = "delete" value = "Delete">
      </td>
    </tr>
    */
  }
};
