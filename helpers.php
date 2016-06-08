<?php
ini_set("display_errors", '1');
error_reporting(E_ALL);
//header('Content-Type: application/json');
//echo 'hi';
/* Parse the en-de file to JSON reference */
//$fh = fopen('./lang/en-de.txt', 'r');
if (!file_exists('lang/en-de.txt')) {
	echo 'no file';
}
$lines = file('lang/en-de.txt');
$ref = array();
//echo 'Found ' . count($lines) . ' lines...';
$start = 10;
$end = 300;
$prevChar = isset($_GET['getChar']) ? $_GET['getChar'] : 'a';
echo 'Start char: ' . $prevChar;
foreach ($lines as $_i => $line) {
	if ($_i <= 9) { //Skip comment lines //|| ($_i < $start || $_i > $end)
		continue;
	}
	//echo 'line ' . $line . '<br>';
	$line = str_replace("\n", '', $line);
	$words = explode("\t", $line);
	$lastChar = strtolower($words[0][0]);
	
	if ($lastChar === '#') {
		echo 'skipping line: ' . $line;
		continue;
	}
	if ($lastChar !== $prevChar) {
		//echo '<br>Done! lastChar: ' . $lastChar . ', prevChar: ' . $prevChar;
		//break;
		continue;
	}
	
	/*if (strpos($words[0], 'clich') !== false) {
		$words[0] = 'cliche';
	}*/
	//print_r($words);
	//echo '[0]"' . $words[0] . '",[1]"' . $words[1] . '"<br>';
	if (!isset($ref[$words[0]])) {
		$ref[$words[0]] = array();
	}
	$ref[$words[0]][] = utf8_encode($words[1]);
}

//echo "Final data: <hr>";
//echo json_encode($ref);
$keys = array_keys($ref);
echo "Found " . count($keys) . ' keys';
/*echo "<pre>";
print_r($ref);
echo "</pre>";*/

$data = json_encode($ref);

if (!$data) {
	echo '<br>json data failure : ' . json_last_error_msg();
	echo "<pre>";
	print_r($ref);
	echo "</pre>";
}
//echo 'json: <br>' . $data;

/*
$file = 'C:\\Bitnami\\wampstack-7.0.0RC7-0\\apache2\\htdocs\\pp\\jk2do\\lang\\en-de.json';
if (is_writable($file) && $data !== false) {
	if (!$fh = fopen($file, 'a+')) {
		echo '{"error":"Cannot open file for writing."}';
	} else {
		//$data = json_encode($ref);
		fwrite($fh, $data);
		fclose($fh);
	}
} else {
	//echo '{"error":"Cannot write to file ' . $file . '!"}';
}
*/

