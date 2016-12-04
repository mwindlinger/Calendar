<?php
ini_set("session.cookie_httponly", 1);
header("Content-Type: application/json");
require 'calendardatabaselogin.php';
date_default_timezone_set('America/Chicago');
session_start();

$username = (string) @$_SESSION['username'];
$token = (string) @$_SESSION['token'];

$prepareToSend = new ReplyMsg;

$rOP = (string) @$_POST['operation'];
            
$rView = (int) @$_POST['view'];
$rYear = (int) @$_POST['year'];
$rMonth = (int) @$_POST['month'];
$rDay = (int) @$_POST['day'];

$rUser = (string) @$_POST['user'];
$rToken = (string) @$_POST['token'];

$rTrylogin = (int) @$_POST['trylogin'];
$rTrysignup = (int) @$_POST['trysignup'];
$rWantlogout = (int) @$_POST['wantlogout'];

$rUnlogin = (string) @$_POST['unlogin'];
$rPwlogin = (string) @$_POST['pwlogin'];

$goodAction = false;
$tempo = null;

$prepareToSend->triedlogin = $rTrylogin;
$prepareToSend->triedsignup = $rTrysignup;

if ($rTrylogin == 1 && $rTrysignup == 0 && $rWantlogout == 0) {
    if (isset($rUnlogin) && isset($rPwlogin) && empty($username)){
        
        //escape sql code
        $userinput = $mysqli->real_escape_string($rUnlogin);
        $userinputpw = $mysqli->real_escape_string($rPwlogin);
        
        //check if user exist
        $querystr = "select username, password from userdata where username='".$userinput."'";
        if ($resultcounter = $mysqli->query($querystr)) {
        $result_cnt = $resultcounter->num_rows;
        $resultcounter->close();
        }
        
        //fetch user data
        if($result_cnt > 0){
            $userexistchk = $mysqli->prepare("select username, password from userdata where username=?");
            if(!$userexistchk){
                printf("Query Prep Failed: %s\n", $mysqli->error);
                exit;
            }
            $userexistchk->bind_param('s', $userinput);
            $userexistchk->execute();
            $userexistchk->bind_result($username_db, $userpw_db);
            for ($idx = 0; $idx < $result_cnt; $idx++){		//this loop is not necessary in here, i wrote it for ref
                $userexistchk->fetch();
                $db_username[$idx] = $username_db;
                $db_userpw[$idx] = $userpw_db;
            }
            $userexistchk->close();
            if (hash_equals($db_userpw[0], crypt($userinputpw, $db_userpw[0]))) {
                $_SESSION['username'] = $userinput;
                $tempo = substr(md5(rand()), 0, 10); // generate a 10-character random string
                $_SESSION['token'] = $tempo;
                $rUser = $rUnlogin;
                $rToken = $tempo;
                $goodAction = true;
            }
            else{
                $goodAction = false;
            }
        }	
        else{
            $goodAction = false;
        }
    }
    if ($goodAction) {
        $prepareToSend->loggedin = 1;
    }
    else {
        $prepareToSend->loggedin = 0;
    }
}

if ($rTrylogin == 0 && $rTrysignup == 1 && $rWantlogout == 0) {
    if (preg_match('/^[A-Za-z0-9]+$/', $rUnlogin)){			//throw any input with special chars, allow only A-Z, a-z, 0-9
        if(strlen($rUnlogin) > 5 && strlen($rUnlogin) < 16 && strlen($rPwlogin) > 5  && strlen($rPwlogin) < 31){			//chk length
            if(!empty($rUnlogin)){							//throw case (if any) that may mess up the security chk
                if(!preg_match('/^[0]+$/', $rUnlogin)){				//throw all zero cases coz i dont like 'em
                    $userinput = $mysqli->real_escape_string($rUnlogin);
                    if($userinput == $rUnlogin){
                        //check dupe username
                        $querystr = "select username from userdata where username='".$userinput."'";
                        if ($resultcounter = $mysqli->query($querystr)) {
                            $result_cnt = $resultcounter->num_rows;
                            $resultcounter->close();
                        }
                        if($result_cnt > 0){
                            $goodAction = false;
                        }
                        else{
                            $rPwlogin = password_hash($rPwlogin, PASSWORD_DEFAULT);
                            
                            $putuser = $mysqli->prepare("insert into userdata (username, password) values (?, ?)");
                            if(!$putuser){
                                printf("Query Prep Failed: %s\n", $mysqli->error);
                                exit;
                            }
                            $putuser->bind_param('ss', $rUnlogin, $rPwlogin);
                            $putuser->execute();
                            $putuser->close();
                            
                            $create_cnt = 0;
                            $querystr = "select username from userdata where username='".$userinput."'";
                            if ($createchk = $mysqli->query($querystr)) {
                                $create_cnt = $createchk->num_rows;
                                $createchk->close();
                            }
                            if($create_cnt == 1){
                                $_SESSION['username'] = $rUnlogin;
                                $tempo = substr(md5(rand()), 0, 10); // generate a 10-character random string
                                $_SESSION['token'] = $tempo;
                                $rUser = $rUnlogin;
                                $rToken = $tempo;
                                $goodAction = true;
                            }
                            else{
                                $goodAction = false;
                            }
                        }
                    }
                    else{$goodAction = false;}
                }
                else{$goodAction = false;}
            }
            else{$goodAction = false;}
        }
        else{$goodAction = false;}
    }
    else{$goodAction = false;}
    if ($goodAction) {
        $prepareToSend->loggedin = 1;
    }
    else {
        $prepareToSend->loggedin = 0;
    }
}

if ($rTrylogin == 0 && $rTrysignup == 0 && $rWantlogout == 1) {
    session_destroy();
    session_start();    
    $rUser = null;
    $rToken = null;
    $prepareToSend->loggedin = 0;
}

$username = (string) @$_SESSION['username'];
$token = (string) @$_SESSION['token'];

if (!empty($username) && !empty($token) && empty($rUser) && empty($rToken)) {
    $rUser = $username;
    $rToken = $token;
}


if (isset($_POST['view'])) {
    if (!empty($rToken) && !empty($rUser)) {
        if ((string) $rToken == $token && (string) $rUser == $username && !empty($token) && !empty($username)) {//good login
            $prepareToSend->loggedin = 1;
            
            if (empty((string)$rYear) || empty($rMonth) || empty($rDay) || ($rView != 0 && $rView != 1) || $rYear<0 || $rMonth<0 || $rDay<0) {
                die("Corrupted Request. Check vars.");
            }
            if (empty($rOP)) {
                viewDidChange($rView, $rYear, $rMonth, $rDay, $rUser, $rToken);
                $prepareToSend->msg = null;
                $prepareToSend->OPstatus = null;
                $prepareToSend->OPtype = null;
                dataWillTx();
                exit;
            }
            elseif ($rOP == 'insert') {
                $event = new EventPck;
                $event->id = null;
                $event->date[2] = (int) @$_POST['eventyear'];
                $event->date[1] = (int) @$_POST['eventmonth'];
                $event->date[0] = (int) @$_POST['eventday'];
                $event->title = (string) @$_POST['title'];
                $event->stHr = (int) @$_POST['stHr'];
                $event->stMin = (int) @$_POST['stMin'];
                $event->edHr = (int) @$_POST['edHr'];
                $event->edMin = (int) @$_POST['edMin'];
                $event->duration = (int) @$_POST['duration'];
                $event->description = (string) @$_POST['description'];
                $event->QTH = (string) @$_POST['QTH'];
                eventDidInsert($event, $rUser);
                viewDidChange($rView, $rYear, $rMonth, $rDay, $rUser, $rToken);
                dataWillTx();
                exit;
            }
            elseif ($rOP == 'mod') {
                $event = new EventPck;
                $event->id = (int) @$_POST['eventid'];
                $event->date[2] = (int) @$_POST['eventyear'];
                $event->date[1] = (int) @$_POST['eventmonth'];
                $event->date[0] = (int) @$_POST['eventday'];
                $event->title = (string) @$_POST['title'];
                $event->stHr = (int) @$_POST['stHr'];
                $event->stMin = (int) @$_POST['stMin'];
                $event->edHr = (int) @$_POST['edHr'];
                $event->edMin = (int) @$_POST['edMin'];
                $event->duration = (int) @$_POST['duration'];
                $event->description = (string) @$_POST['description'];
                $event->QTH = (string) @$_POST['QTH'];
                eventDidChange($event, $rUser);
                viewDidChange($rView, $rYear, $rMonth, $rDay, $rUser, $rToken);
                dataWillTx();
                exit;
            }
            elseif ($rOP == 'del') {
                $event = new EventPck;
                $event->id = (int) @$_POST['eventid'];
                $event->date[2] = null;
                $event->date[1] = null;
                $event->date[0] = null;
                $event->title = null;
                $event->stHr = null;
                $event->stMin = null;
                $event->edHr = null;
                $event->edMin = null;
                $event->duration = null;
                $event->description = null;
                $event->QTH = null;
                eventDidDelete($event, $rUser);
                viewDidChange($rView, $rYear, $rMonth, $rDay, $rUser, $rToken);
                dataWillTx();
                exit;
            }
            else {
                die("Corrupted OP Request");
            }
        }
        else {
            die("CSRF Detected");
        }
    }
    else {
        $rView = (int) @$_POST['view'];
        $rYear = (int) @$_POST['year'];
        $rMonth = (int) @$_POST['month'];
        $rDay = (int) @$_POST['day'];
        viewDidChange($rView, $rYear, $rMonth, $rDay, null, null);
        $prepareToSend->msg = null;
        $prepareToSend->OPstatus = null;
        $prepareToSend->OPtype = null;
        dataWillTx();
        exit;
    }
}
else {
    die("Corrupted Request");
}

function viewDidChange($tView, $tYear, $tMonth, $tDay, $tUser, $tToken) {
    require 'calendardatabaselogin.php';
    $loginFlag = false;
    if (!empty($tUser) && !empty($tToken)) {
        $loginFlag = true;
    }
    if ($tView == 0) {
        if ($loginFlag) {
            $GLOBALS['prepareToSend']->user = htmlentities($tUser);
            $GLOBALS['prepareToSend']->token = htmlentities($tToken);
            $GLOBALS['prepareToSend']->viewType = $tView;
            $GLOBALS['prepareToSend']->year = $tYear;
            $GLOBALS['prepareToSend']->month = $tMonth;
            $GLOBALS['prepareToSend']->startDate = null;
            //$GLOBALS['prepareToSend']->
            if ($tMonth-1 == 0) {
                $GLOBALS['prepareToSend']->endDateLastMonth = 31;
            }
            else {
                $GLOBALS['prepareToSend']->endDateLastMonth = (int) cal_days_in_month(CAL_GREGORIAN, $tMonth-1, $tYear);
            }
            $numday = (int) cal_days_in_month(CAL_GREGORIAN, $tMonth, $tYear);
            $GLOBALS['prepareToSend']->cardDay = $numday;
            $GLOBALS['prepareToSend']->startDayOfWeek = (int) date("w", strtotime("$tYear-$tMonth-01"));
            
            $dayarray = [];
            
            for ($i = 0 ; $i < $numday ; $i++) {
                $dayarray[$i] = new DayPck;
                $userinput = $mysqli->real_escape_string($tUser);
                $temp = $i + 1;
                $querystr = "SELECT id FROM events WHERE user='".$userinput."' AND year='".$tYear."' AND month='".$tMonth."' AND day='".$temp."'";
                if ($eventcounter = $mysqli->query($querystr)) {
                    $eventcount = $eventcounter->num_rows;
                    $eventcounter->close();
                }
                else {
                    $eventcount = 0;
                    $eventcounter->close();
                }
                if ($eventcount > 0) {
                    $evidarray = [];
                    
                    $getlist = $mysqli->prepare("SELECT id FROM events WHERE user=? AND year=? AND month=? AND day=? order by sthr ASC");
                    if(!$getlist){
                        $GLOBALS['prepareToSend']->msg = htmlentities("Query Prep Failed:".(string) $mysqli->error);
                        $dayarray = [];
                        for ($k = 0 ; $k < $numday ; $k++) {
                            $dayarray[$k] = new DayPck;
                            $dayarray[$k]->cardEvent = 0;
                            $dayarray[$k]->events = [];
                        }
                        $GLOBALS['prepareToSend']->days = $dayarray;
                        $mysqli->close();
                        return false;
                    }
                    $getlist->bind_param('siii', $tUser, $tYear, $tMonth, $temp);
                    $getlist->execute();
                    $getlist->bind_result($id_db);
                    for ($idx = 0; $idx < $eventcount; $idx++){		//may remove unnecessary items
                        $getlist->fetch();
                        $evidarray[$idx] = $id_db;
                    }
                    $getlist->close();
                    
                    for ($j = 0 ; $j < $eventcount ; $j++) {
                        $dayarray[$i]->events[$j] = new EventPck;
                        
                        $getevent = $mysqli->prepare("SELECT id, year, month, day, title, sthr, stmin, edhr, edmin, duration, description, qth FROM events WHERE id=?");
                        if(!$getevent){
                            $GLOBALS['prepareToSend']->msg = htmlentities("Query Prep Failed:".(string) $mysqli->error);
                            $dayarray = [];
                            for ($k = 0 ; $k < $numday ; $k++) {
                                $dayarray[$k] = new DayPck;
                                $dayarray[$k]->cardEvent = 0;
                                $dayarray[$k]->events = [];
                            }
                            $GLOBALS['prepareToSend']->days = $dayarray;
                            $mysqli->close();
                            return false;
                        }
                        $getevent->bind_param('i', $evidarray[$j]);
                        $getevent->execute();
                        $getevent->bind_result($id_db, $year_db, $month_db, $day_db, $title_db, $sthr_db, $stmin_db, $edhr_db, $edmin_db, $duration_db, $description_db, $qth_db);
                        $getevent->fetch();
                        $dayarray[$i]->events[$j]->id = (int) $id_db;
                        $dayarray[$i]->events[$j]->date[0] = (int) $day_db;
                        $dayarray[$i]->events[$j]->date[1] = (int) $month_db;
                        $dayarray[$i]->events[$j]->date[2] = (int) $year_db;
                        $dayarray[$i]->events[$j]->title = htmlentities($title_db);
                        $dayarray[$i]->events[$j]->description = (empty($description_db) ? null : htmlentities($description_db));
                        $dayarray[$i]->events[$j]->stHr = (int) $sthr_db;
                        $dayarray[$i]->events[$j]->stMin = (int) $stmin_db;
                        $dayarray[$i]->events[$j]->edHr = (int) $edhr_db;
                        $dayarray[$i]->events[$j]->edMin = (int) $edmin_db;
                        $dayarray[$i]->events[$j]->duration = (int) $duration_db;
                        $dayarray[$i]->events[$j]->QTH = (empty($qth_db) ? null : htmlentities($qth_db));
                        $getevent->close();
                    }
                    $dayarray[$i]->cardEvent = $eventcount;
                }
                else {
                    $dayarray[$i]->cardEvent = 0;
                    $dayarray[$i]->events = [];
                }
            }
            $GLOBALS['prepareToSend']->days = $dayarray;
        }
        else {
            $GLOBALS['prepareToSend']->user = null;
            $GLOBALS['prepareToSend']->token = null;
            $GLOBALS['prepareToSend']->viewType = $tView;
            $GLOBALS['prepareToSend']->year = $tYear;
            $GLOBALS['prepareToSend']->month = $tMonth;
            $GLOBALS['prepareToSend']->startDate = null;
            if ($tMonth-1 == 0) {
                $GLOBALS['prepareToSend']->endDateLastMonth = 31;
            }
            else {
                $GLOBALS['prepareToSend']->endDateLastMonth = (int) cal_days_in_month(CAL_GREGORIAN, $tMonth-1, $tYear);
            }
            $numday = (int) cal_days_in_month(CAL_GREGORIAN, $tMonth, $tYear);
            $GLOBALS['prepareToSend']->cardDay = $numday;
            $GLOBALS['prepareToSend']->startDayOfWeek = (int) date("w", strtotime("$tYear-$tMonth-01"));
            
            $dayarray = [];
            
            for ($i = 0 ; $i < $numday ; $i++) {
                $dayarray[$i] = new DayPck;
                $dayarray[$i]->cardEvent = 0;
                $dayarray[$i]->events = [];
            }
            $GLOBALS['prepareToSend']->days = $dayarray;
        }
    }
    elseif ($tView == 1) {
        if ($loginFlag) {
            $GLOBALS['prepareToSend']->user = htmlentities($tUser);
            $GLOBALS['prepareToSend']->token = htmlentities($tToken);
            $GLOBALS['prepareToSend']->viewType = $tView;
            $GLOBALS['prepareToSend']->year = $tYear;
            $GLOBALS['prepareToSend']->month = $tMonth;
            
            $whenist = "$tYear-$tMonth-$tDay";
            $whenistt = new DateTime($whenist);
            $whenisit = explode("-", $whenistt->format("o-W-w"));
            $cYear = $whenisit[0];
            $cWeek = $whenisit[1];
            $cDayOW = $whenisit[2];
            $whenisit = [];
            $whenistt = null;
            if($cDayOW == 0) {
                $whenistt = date('Y-m-d',strtotime("$tYear-$tMonth-$tDay"));
                $whenisit = explode("-", $whenistt);
                
                $fY = (int) $whenisit[0];
                $fM = (int) $whenisit[1];
                $fD = (int) $whenisit[2];
            }
            else {
                $whenistt = date('Y-m-d',strtotime("-1 day",strtotime("$cYear-W$cWeek")));
                $whenisit = explode("-", $whenistt);
                
                $fY = (int) $whenisit[0];
                $fM = (int) $whenisit[1];
                $fD = (int) $whenisit[2];
            }
            $whenisit = [];
            $GLOBALS['prepareToSend']->startDate = $fD;
            if ($tMonth-1 == 0) {
                $GLOBALS['prepareToSend']->endDateLastMonth = 31;
            }
            else {
                $GLOBALS['prepareToSend']->endDateLastMonth = (int) cal_days_in_month(CAL_GREGORIAN, $tMonth-1, $tYear);
            }
            $GLOBALS['prepareToSend']->cardDay = (int) cal_days_in_month(CAL_GREGORIAN, $tMonth, $tYear);
            $GLOBALS['prepareToSend']->startDayOfWeek = null;
            $numday = 7;
            for ($i = 0 ; $i < $numday ; $i++) {
                $dayarray[$i] = new DayPck;
                $whenisit = [];
                $schY = null;
                $schM = null;
                $schD = null;
                $whenisit = explode("-", date("Y-m-d", strtotime("+$i day", strtotime("$fY-$fM-$fD"))));
                $schY  = (int) $whenisit[0];
                $schM = (int) $whenisit[1];
                $schD = (int) $whenisit[2];
                
                $userinput = $mysqli->real_escape_string($tUser);
                $querystr = "SELECT id FROM events WHERE user='".$userinput."' AND year='".$schY."' AND month='".$schM."' AND day='".$schD."'";
                if ($eventcounter = $mysqli->query($querystr)) {
                    $eventcount = $eventcounter->num_rows;
                    $eventcounter->close();
                }
                else {
                    $eventcount = 0;
                    $eventcounter->close();
                }
                if ($eventcount > 0) {
                    $evidarray = [];
                    
                    $getlist = $mysqli->prepare("SELECT id FROM events WHERE user=? AND year=? AND month=? AND day=? order by sthr ASC");
                    if(!$getlist){
                        $GLOBALS['prepareToSend']->msg = htmlentities("Query Prep Failed:".(string) $mysqli->error);
                        $dayarray = [];
                        for ($k = 0 ; $k < $numday ; $k++) {
                            $dayarray[$k] = new DayPck;
                            $dayarray[$k]->cardEvent = 0;
                            $dayarray[$k]->events = [];
                        }
                        $GLOBALS['prepareToSend']->days = $dayarray;
                        $mysqli->close();
                        return false;
                    }
                    $getlist->bind_param('siii', $tUser, $schY, $schM, $schD);
                    $getlist->execute();
                    $getlist->bind_result($id_db);
                    for ($idx = 0; $idx < $eventcount; $idx++){		//may remove unnecessary items
                        $getlist->fetch();
                        $evidarray[$idx] = $id_db;
                    }
                    $getlist->close();
                    
                    for ($j = 0 ; $j < $eventcount ; $j++) {
                        $dayarray[$i]->events[$j] = new EventPck;
                        
                        $getevent = $mysqli->prepare("SELECT id, year, month, day, title, sthr, stmin, edhr, edmin, duration, description, qth FROM events WHERE id=?");
                        if(!$getevent){
                            $GLOBALS['prepareToSend']->msg = htmlentities("Query Prep Failed:".(string) $mysqli->error);
                            $dayarray = [];
                            for ($k = 0 ; $k < $numday ; $k++) {
                                $dayarray[$k] = new DayPck;
                                $dayarray[$k]->cardEvent = 0;
                                $dayarray[$k]->events = [];
                            }
                            $GLOBALS['prepareToSend']->days = $dayarray;
                            $mysqli->close();
                            return false;
                        }
                        $getevent->bind_param('i', $evidarray[$j]);
                        $getevent->execute();
                        $getevent->bind_result($id_db, $year_db, $month_db, $day_db, $title_db, $sthr_db, $stmin_db, $edhr_db, $edmin_db, $duration_db, $description_db, $qth_db);
                        $getevent->fetch();
                        $dayarray[$i]->events[$j]->id = (int) $id_db;
                        $dayarray[$i]->events[$j]->date[0] = (int) $day_db;
                        $dayarray[$i]->events[$j]->date[1] = (int) $month_db;
                        $dayarray[$i]->events[$j]->date[2] = (int) $year_db;
                        $dayarray[$i]->events[$j]->title = htmlentities($title_db);
                        $dayarray[$i]->events[$j]->description = (empty($description_db) ? null : htmlentities($description_db));
                        $dayarray[$i]->events[$j]->stHr = (int) $sthr_db;
                        $dayarray[$i]->events[$j]->stMin = (int) $stmin_db;
                        $dayarray[$i]->events[$j]->edHr = (int) $edhr_db;
                        $dayarray[$i]->events[$j]->edMin = (int) $edmin_db;
                        $dayarray[$i]->events[$j]->duration = (int) $duration_db;
                        $dayarray[$i]->events[$j]->QTH = (empty($qth_db) ? null : htmlentities($qth_db));
                        $getevent->close();
                    }
                    $dayarray[$i]->cardEvent = $eventcount;
                }
                else {
                    $dayarray[$i]->cardEvent = 0;
                    $dayarray[$i]->events = [];
                }
            }
            $GLOBALS['prepareToSend']->days = $dayarray;
            
        }
        else {
            $GLOBALS['prepareToSend']->user = null;
            $GLOBALS['prepareToSend']->token = null;
            $GLOBALS['prepareToSend']->viewType = $tView;
            $GLOBALS['prepareToSend']->year = $tYear;
            $GLOBALS['prepareToSend']->month = $tMonth;
            
            $whenist = "$tYear-$tMonth-$tDay";
            $whenistt = new DateTime($whenist);
            $whenisit = explode("-", $whenistt->format("o-W-w"));
            $cYear = $whenisit[0];
            $cWeek = $whenisit[1];
            $cDayOW = $whenisit[2];
            $whenisit = [];
            $whenistt = null;
            if($cDayOW == 0) {
                $whenistt = date('Y-m-d',strtotime("$tYear-$tMonth-$tDay"));
                $whenisit = explode("-", $whenistt);
                
                $fY = (int) $whenisit[0];
                $fM = (int) $whenisit[1];
                $fD = (int) $whenisit[2];
            }
            else {
                $whenistt = date('Y-m-d',strtotime("-1 day",strtotime("$cYear-W$cWeek")));
                $whenisit = explode("-", $whenistt);
                
                $fY = (int) $whenisit[0];
                $fM = (int) $whenisit[1];
                $fD = (int) $whenisit[2];
            }
            $whenisit = [];
            $GLOBALS['prepareToSend']->startDate = $fD;
            if ($tMonth-1 == 0) {
                $GLOBALS['prepareToSend']->endDateLastMonth = 31;
            }
            else {
                $GLOBALS['prepareToSend']->endDateLastMonth = (int) cal_days_in_month(CAL_GREGORIAN, $tMonth-1, $tYear);
            }
            $GLOBALS['prepareToSend']->cardDay = (int) cal_days_in_month(CAL_GREGORIAN, $tMonth, $tYear);
            $GLOBALS['prepareToSend']->startDayOfWeek = null;
            $numday = 7;
            for ($i = 0 ; $i < $numday ; $i++) {
                $dayarray[$i] = new DayPck;
                $dayarray[$i]->cardEvent = 0;
                $dayarray[$i]->events = [];
            }
            $GLOBALS['prepareToSend']->days = $dayarray;
        }
    }
    else {
        $mysqli->close();
        return false;
    }
    $mysqli->close();
        return true;
}

function eventDidInsert($tEvent, $tUser) {
    require 'calendardatabaselogin.php';
    if (!empty($tUser)) {
        $u2i = $mysqli->real_escape_string($tUser);
        $putevent = $mysqli->prepare("INSERT INTO events (user, year, month, day, title, sthr, stmin, edhr, edmin, duration, description, qth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        if(!$putevent){
            $GLOBALS['prepareToSend']->msg = htmlentities("Query Prep Failed:".(string) $mysqli->error);
            $GLOBALS['prepareToSend']->OPstatus = 0;
            $GLOBALS['prepareToSend']->OPtype = "insert";
            $mysqli->close();
            return false;
        }
        $putevent->bind_param('siiisiiiiiss', $u2i, $tEvent->date[2], $tEvent->date[1], $tEvent->date[0], $tEvent->title, $tEvent->stHr, $tEvent->stMin, $tEvent->edHr, $tEvent->edMin, $tEvent->duration, $tEvent->description, $tEvent->QTH);
        $putevent->execute();
        if (!empty((int)$putevent->errno)) {
            $GLOBALS['prepareToSend']->msg = htmlentities("Insert failed:".(string) $putevent->errno);
            $GLOBALS['prepareToSend']->OPstatus = 0;
            $GLOBALS['prepareToSend']->OPtype = "insert";
            $putevent->close();
            $mysqli->close();
            return false;
        }
        else {
            $GLOBALS['prepareToSend']->msg = "Success";
            $GLOBALS['prepareToSend']->OPstatus = 1;
            $GLOBALS['prepareToSend']->OPtype = "insert";
        }
        $putevent->close();
    }
    else {
        $mysqli->close();
        return false;
    }
    $mysqli->close();
    return true;
}

function eventDidChange($tEvent, $tUser) {
    require 'calendardatabaselogin.php';
    if (!empty($tUser)) {
        $userinput = $mysqli->real_escape_string($tUser);
        $querystr = "SELECT id FROM events WHERE user='".$userinput."' AND id='".$tEvent->id."'";
        if ($eventcounter = $mysqli->query($querystr)) {
            $eventcount = $eventcounter->num_rows;
            $eventcounter->close();
        }
        else {
            $eventcount = 0;
            $eventcounter->close();
        }
        if ($eventcount != 0) {
            $u2m = $mysqli->real_escape_string($tUser);
            $putevent = $mysqli->prepare("UPDATE events SET year=?, month=?, day=?, title=?, sthr=?, stmin=?, edhr=?, edmin=?, duration=?, description=?, qth=? WHERE id=? AND user=?");
            if(!$putevent){
                $GLOBALS['prepareToSend']->msg = htmlentities("Query Prep Failed:".(string) $mysqli->error);
                $GLOBALS['prepareToSend']->OPstatus = 0;
                $GLOBALS['prepareToSend']->OPtype = "mod";
                $mysqli->close();
                return false;
            }
            $putevent->bind_param('iiisiiiiissis', $tEvent->date[2], $tEvent->date[1], $tEvent->date[0], $tEvent->title, $tEvent->stHr, $tEvent->stMin, $tEvent->edHr, $tEvent->edMin, $tEvent->duration, $tEvent->description, $tEvent->QTH, $tEvent->id, $u2m);
            $putevent->execute();
            if (!empty((int)$putevent->errno)) {
                $GLOBALS['prepareToSend']->msg = htmlentities("Mod failed:".(string) $putevent->errno);
                $GLOBALS['prepareToSend']->OPstatus = 0;
                $GLOBALS['prepareToSend']->OPtype = "mod";
                $putevent->close();
                $mysqli->close();
                return false;
            }
            else {
                $GLOBALS['prepareToSend']->msg = "Success";
                $GLOBALS['prepareToSend']->OPstatus = 1;
                $GLOBALS['prepareToSend']->OPtype = "mod";
            }
            $putevent->close();
        }
        else {
            $GLOBALS['prepareToSend']->msg = "Cannot find matching entry.";
            $GLOBALS['prepareToSend']->OPstatus = 0;
            $GLOBALS['prepareToSend']->OPtype = "mod";
            $mysqli->close();
            return false;
        }
    }
    else {
        $mysqli->close();
        return false;
    }
    $mysqli->close();
    return true;
}

function eventDidDelete($tEvent, $tUser) {
    require 'calendardatabaselogin.php';
    if (!empty($tUser)) {
        $userinput = $mysqli->real_escape_string($tUser);
        $querystr = "SELECT id FROM events WHERE user='".$userinput."' AND id='".$tEvent->id."'";
        if ($eventcounter = $mysqli->query($querystr)) {
            $eventcount = $eventcounter->num_rows;
            $eventcounter->close();
        }
        else {
            $eventcount = 0;
            $eventcounter->close();
        }
        if ($eventcount != 0) {
            $u2m = $mysqli->real_escape_string($tUser);
            $putevent = $mysqli->prepare("DELETE FROM events WHERE id=? AND user=?");
            if(!$putevent){
                $GLOBALS['prepareToSend']->msg = htmlentities("Query Prep Failed:".(string) $mysqli->error);
                $GLOBALS['prepareToSend']->OPstatus = 0;
                $GLOBALS['prepareToSend']->OPtype = "del";
                $mysqli->close();
                return false;
            }
            $putevent->bind_param('is', $tEvent->id, $u2m);
            $putevent->execute();
            if (!empty((int)$putevent->errno)) {
                $GLOBALS['prepareToSend']->msg = htmlentities("Del failed:".(string) $putevent->errno);
                $GLOBALS['prepareToSend']->OPstatus = 0;
                $GLOBALS['prepareToSend']->OPtype = "del";
                $putevent->close();
                $mysqli->close();
                return false;
            }
            else {
                $GLOBALS['prepareToSend']->msg = "Success";
                $GLOBALS['prepareToSend']->OPstatus = 1;
                $GLOBALS['prepareToSend']->OPtype = "del";
            }
            $putevent->close();
        }
        else {
            $GLOBALS['prepareToSend']->msg = "Cannot find matching entry.";
            $GLOBALS['prepareToSend']->OPstatus = 0;
            $GLOBALS['prepareToSend']->OPtype = "del";
            $mysqli->close();
            return false;
        }
    }
    else {
        $mysqli->close();
        return false;
    }
    $mysqli->close();
    return true;
}

function dataWillTx() {
    echo json_encode($GLOBALS['prepareToSend']);
}

class ReplyMsg {
    public $triedlogin = null;
    public $triedsignup = null;
    public $loggedin = null;
    public $user = null;
    public $token = null;
    public $OPstatus = null;
    public $OPtype = null;
    public $msg = null;
    public $viewType = null;
    public $year = null;
    public $month = null;
    public $startDate = null;
    public $endDateLastMonth = null;
    public $cardDay = null;
    public $startDayOfWeek = null;
    public $days = [];
}

class DayPck {
    public $cardEvent = null;
    public $events = [];
}

class EventPck {
    public $id = null;
    public $date = [];
    public $title = null;
    public $description = null;
    public $stHr = null;
    public $stMin = null;
    public $edHr = null;
    public $edMin = null;
    public $duration = null;
    public $QTH = null;
}

?>
