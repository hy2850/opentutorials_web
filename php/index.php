<?php
  function print_title(){
    if(isset($_GET["id"])){
      echo $_GET["id"];
    }
    else{
      echo "Welcome";
    }
  }

  function print_description(){
    if(isset($_GET["id"])){
      echo file_get_contents("./data/".$_GET["id"]);
    }
    else{
      echo "Nice to meet you!";
    }
  }

  function print_list(){
    // Making list of topics in the 'data' folder
    $files = array_slice(scandir("./data", 0), 2); //'scandir' function includes two redundant addresses, '.' and '..'
    $list = "<ol>";

    $i=0;
    while($i<count($files)){
      $list .= "<li><a href=\"index.php?id=$files[$i]\">$files[$i]</a></li>\n";

      // Alternatives : 
      // "<li><a href='index.php?id=$files[$i]'>$files[$i]</a></li>\n"
      // '<li><a href="index.php?id='.$files[$i].'">'.$files[$i].'</a></li>';

      $i += 1;
    }
    $list .= "</ol>";

    echo $list;
  }
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>
      <?php
        print_title();
      ?>
    </title>
  </head>
  <body>
    <h1><a href="index.php">WEB</a></h1>

    <?php
      print_list();
    ?>

    <h2>
      <?php
        print_title();
      ?>
    </h2>

    <?php 
      print_description();
    ?>
  </body>
</html>