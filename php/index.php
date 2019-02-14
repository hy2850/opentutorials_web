<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    <h1><a href="index.php">WEB</a></h1>

    <?php
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
    ?>

    <h2>
    	<?php 
        if(isset($_GET["id"])){
          echo $_GET["id"];
        }
        else{
          echo "Welcome";
        }
    	?>
    </h2>

    <?php 
      if(isset($_GET["id"])){
        echo file_get_contents("./data/".$_GET["id"]);
      }
      else{
        echo "Nice to meet you!";
      }
    ?>
  </body>
</html>