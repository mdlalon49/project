<?php 
$server = "localhost";
$user = "megapers_babu";
$pass = "megapers_babu";
$database = "megapers_babu";

$conn = mysqli_connect($server, $user, $pass, $database);

if (!$conn) {
    die("<script>alert('Connection Failed.')</script>");
}else{

	//echo"Connection Success";
}

?>