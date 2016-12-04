<!DOCTYPE html>
<html lang="en">
<head>
    <title>Index</title>
	<link rel="stylesheet" type="text/css" href="stylesheet.css" />
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB0xTRJ1a0aBWD2wfUBLWLncH-Kxxsk42g"></script>
	<script type="text/javascript" src="functions.js"></script>
</head>
<body class="common">
<script type="text/javascript">
	$( document ).ready(function () {
	initCalendar();
	});
</script>
<div id="msgSpace"></div>
<?php
//visual head//////////////////////////////////////////////////////////////////////
echo '
  <div class="headtitle">&nbsp;&nbsp; INDEX</div>
  <div class="headstrip"></div>';
  
//search bar
echo '  <div class="noticetool">
    <div class="calendarctrl">
	</div>
  </div>';
//block start//////////////////////////////////////////////////////////////////////
echo '  <div class="bodyblock">
    <div class="bodybox">';


//mainbox start//////////////////////////////////////////////////////////////////////
echo '<div class="mainbox">';
echo '<div class="calendar"></div>';
	echo '<div class="eventeditor"></div>';
echo '</div>';
//mainbox end//////////////////////////////////////////////////////////////////////

//right box start//////////////////////////////////////////////////////////////////////
echo '      <div class="rightbox">
        <br />';
////display login / user control
    echo '<div class="userctrl"></div>';
	echo '<form method="POST"><input class="hiddenbox" type="hidden" id="token" name="calendartoken" value="" />';//////////////simplify these
	echo '<input class="hiddenbox" type="hidden" id="username" name="calendarusername" value="" /></form>';
echo '</div>';
//right box end//////////////////////////////////////////////////////////////////////


echo '    </div>
    <br/><br/><br/><br/>
  </div>';
//block end//////////////////////////////////////////////////////////////////////

?>
</body>
</html>
