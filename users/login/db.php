<?php
    $servername='localhost';
    $username='megapers_mytools3';
    $password='megapers_mytools3';
    $dbname = "megapers_mytools3";
    $conn=mysqli_connect($servername,$username,$password,"$dbname");
      if(!$conn){
          die('Could not Connect MySql Server:' .mysql_error());
        }
?>