var lastData;                   //set JSON var
var prepareToSend = {};              //set POST var
var opTypeToSend = 1;           //int {1,2,3} insert mod del
var eventOP = false;            //bool
var dataToSend;                 //string
var msgRxed;


var currView = 0;               //int

var user;                       //optional(string)
var whatToken;                  //optional(string)

var currMonth;                  //int
var currYear;                   //int
var currDay;                    //int
var currEventEvId;

var dayForselector = [];        //[int]



//initialize
function initCalendar() {                       //call only at the very begining
    user = null;
    prepareToSend.user = null;
    whatToken = null;
    loadMyUserName();
    if (typeof user === 'string') {
        if(user.length <= 3){
            user = null;
        }
        else {
            genMsgBox();
        }
    }
    else {
        user = null;
    }
    lastData = null;
    dataToSend = null;
    msgRxed = null;
    prepareToSend.unlogin = null;
    prepareToSend.pwlogin = null;
    prepareToSend.trylogin = 0;
    prepareToSend.trysignup = 0;
    prepareToSend.wantlogout = 0;
    prepareToSend.view = null;
    prepareToSend.year = null;
    prepareToSend.month = null;
    prepareToSend.day = null;
    prepareToSend.user = null;
    prepareToSend.operation = null;
    prepareToSend.eventid = null;
    prepareToSend.title = null;
    prepareToSend.description = null;
    prepareToSend.eventday = null;
    prepareToSend.eventmonth = null;
    prepareToSend.eventyear = null;
    prepareToSend.stHr = null;
    prepareToSend.stMin = null;
    prepareToSend.edHr = null;
    prepareToSend.edMin = null;
    prepareToSend.duration = null;
    prepareToSend.QTH = null;
    currMonth = null;                  //int
    currYear = null;                   //int
    currDay = null;                    //int
    currEventEvId = null;
    eventOP = false;
    opTypeToSend = 1;
    dayForselector = [];
    currView = 0;
    getTodayInfo();
    updateView();
    startEventEditorAction();
    clearEventEditor();
    startEventFieldChk();
    genUserCtrlAlpha();
    genMsgBox();
}

//gen user ctrl
function genUserCtrlAlpha() {//CALL AT INIT AND CLEANUSER
    if (!user){
        var whatString = '<div class="rightnotice">&nbsp;</div><form method="post"><input type="text" class="smlogin" id="unlogin" placeholder="User Name..." /><input type="password" class="smlogin" id="pwlogin" placeholder="Password..." /></form><div class="changefield"></div><div class="ewrtclickbox" id="uclogin">Login</div><br /><div class="ewrtclickbox" id="ucsignup">Sign Up</div>';
        setTimeout(function(){
            if (lastData.loggedin) {
        if(lastData.loggedin === 1){
            genUserCtrlBravo();
            return;
        }
        }
            $(".userctrl").html(whatString);
        $("#uclogin").click(function(){
            if ($("#unlogin").val() && $("#pwlogin").val()) {
                if ($("#unlogin").val().length > 5 && $("#pwlogin").val().length > 5) {
                    if (/^[a-zA-Z0-9]+$/.test($("#unlogin").val())) {
                        prepareToSend.unlogin = $("#unlogin").val();
                        prepareToSend.pwlogin = $("#pwlogin").val();
                        prepareToSend.trylogin = 1;
                        updateView();
                    }
                    else{
                        $(".rightnotice").text("Login info not valid");
                    }
                }
                else {
                    $(".rightnotice").text("Login info not valid");
                }
            }
            else {
                $(".rightnotice").text("Missing login info");
            }
        });
        $("#ucsignup").click(function(){
            var pwagain = $("#pwsuagain");
            if (pwagain.length) {
                if (pwagain.val() && $("#unlogin").val() && $("#pwlogin").val()) {
                    if ($("#unlogin").val().length > 5 && $("#pwlogin").val().length > 5 && (/^[a-zA-Z0-9]+$/.test($("#unlogin").val()))) {
                        if ($("#pwlogin").val() === pwagain.val()) {
                            prepareToSend.unlogin = $("#unlogin").val();
                            prepareToSend.pwlogin = $("#pwlogin").val();
                            prepareToSend.trysignup = 1;
                            updateView();
                        }
                        else {
                            $(".rightnotice").text("Passwords are different");
                        }
                    }
                    else {
                        $(".rightnotice").text("All field should be alphanumeric and longer than 5");
                    }
                }
                else {
                    $(".rightnotice").text("Missing field");
                }
            }
            else {
                $(".changefield").html('<form method="post"><input type="password" class="smlogin" id="pwsuagain" placeholder="ReEnter Password..."/><br /><label class="eventeditorlable" id="smrtnote">All fields need to be alphanumeric and longer than 5 bits.</label></form>');
            }
        });
        },1000);
    }
    else {
        if (lastData.loggedin) {
        if(lastData.loggedin === 1){
            genUserCtrlBravo();
            return;
        }
        }
    }
}

function genUserCtrlBravo() {//CALL AT SETUSER
    var whatstring = '<div class="rightnotice"></div><div class="ewrtclickbox" id="uclogout">Log Out</div>';
    $(".userctrl").html(whatstring);
    whatstring = "Hello, "+lastData.user+"!";
    $(".rightnotice").text(whatstring);
    $("#uclogout").click(function(){
        prepareToSend.wantlogout = 1;
        updateView();
    });
}

function genEventEditor() {
    var whatstring;
    if (lastData.loggedin === 1) {
        genUserCtrlBravo();
            whatstring = '<form id="editorform" method="POST"><input type="hidden" id="editoreventid" name="editoreventid" value="">'+
'<input type="text" class="eventeditortitle eventeditorrequired" id="editoreventtitle" name="editoreventtitle" placeholder="Event Title"><br>'+
'<div class="eventeditordatetimebg">'+
'<label class="eventeditorlable" for="editoreventmonth">On &nbsp;Month&nbsp;&nbsp;</label>'+
'<input type="number" class="eventeditordateinfo eventeditorrequired" id="editoreventmonth" min="1" max="12" step="1" value="">'+
'<label class="eventeditorlable" for="editoreventday">  Day&nbsp;</label>'+
'<input type="number" class="eventeditordateinfo eventeditorrequired" id="editoreventday" min="1" max="31" step="1" value="">'+
'<label class="eventeditorlable" for="editoreventyear">  Year&nbsp;</label>'+
'<input type="number" class="eventeditordateinfo eventeditorrequired" id="editoreventyear" min="0" step="1" value=""><br></div>'+
'<div class="eventeditordatetimebg">'+
'<label class="eventeditorlable" for="editortimeselectorsthr">Event&nbsp;time </label>'+
'<select class="eventeditordateSelector eventeditorrequired" id="editortimeselectorsthr"><option value="" disabled="">Hour</option><option value="0" id="optionsthr0">00</option><option value="1" id="optionsthr1">01</option><option value="2" id="optionsthr2">02</option><option value="3" id="optionsthr3">03</option><option value="4" id="optionsthr4">04</option><option value="5" id="optionsthr5">05</option><option value="6" id="optionsthr6">06</option><option value="7" id="optionsthr7">07</option><option value="8" id="optionsthr8">08</option><option value="9" id="optionsthr9">09</option><option value="10" id="optionsthr10">10</option><option value="11" id="optionsthr11">11</option><option value="12" id="optionsthr12">12</option><option value="13" id="optionsthr13">13</option><option value="14" id="optionsthr14">14</option><option value="15" id="optionsthr15">15</option><option value="16" id="optionsthr16">16</option><option value="17" id="optionsthr17">17</option><option value="18" id="optionsthr18">18</option><option value="19" id="optionsthr19">19</option><option value="20" id="optionsthr20">20</option><option value="21" id="optionsthr21">21</option><option value="22" id="optionsthr22">22</option><option value="23" id="optionsthr23">23</option></select><label class="eventeditorlable" for="editortimeselectorstmin">:</label>'+
'<select class="eventeditordateSelector eventeditorrequired" id="editortimeselectorstmin"><option value="" disabled="">Minute</option><option value="0" id="optionstmin0">00</option><option value="1" id="optionstmin1">01</option><option value="2" id="optionstmin2">02</option><option value="3" id="optionstmin3">03</option><option value="4" id="optionstmin4">04</option><option value="5" id="optionstmin5">05</option><option value="6" id="optionstmin6">06</option><option value="7" id="optionstmin7">07</option><option value="8" id="optionstmin8">08</option><option value="9" id="optionstmin9">09</option><option value="10" id="optionstmin10">10</option><option value="11" id="optionstmin11">11</option><option value="12" id="optionstmin12">12</option><option value="13" id="optionstmin13">13</option><option value="14" id="optionstmin14">14</option><option value="15" id="optionstmin15">15</option><option value="16" id="optionstmin16">16</option><option value="17" id="optionstmin17">17</option><option value="18" id="optionstmin18">18</option><option value="19" id="optionstmin19">19</option><option value="20" id="optionstmin20">20</option><option value="21" id="optionstmin21">21</option><option value="22" id="optionstmin22">22</option><option value="23" id="optionstmin23">23</option><option value="24" id="optionstmin24">24</option><option value="25" id="optionstmin25">25</option><option value="26" id="optionstmin26">26</option><option value="27" id="optionstmin27">27</option><option value="28" id="optionstmin28">28</option><option value="29" id="optionstmin29">29</option><option value="30" id="optionstmin30">30</option><option value="31" id="optionstmin31">31</option><option value="32" id="optionstmin32">32</option><option value="33" id="optionstmin33">33</option><option value="34" id="optionstmin34">34</option><option value="35" id="optionstmin35">35</option><option value="36" id="optionstmin36">36</option><option value="37" id="optionstmin37">37</option><option value="38" id="optionstmin38">38</option><option value="39" id="optionstmin39">39</option><option value="40" id="optionstmin40">40</option><option value="41" id="optionstmin41">41</option><option value="42" id="optionstmin42">42</option><option value="43" id="optionstmin43">43</option><option value="44" id="optionstmin44">44</option><option value="45" id="optionstmin45">45</option><option value="46" id="optionstmin46">46</option><option value="47" id="optionstmin47">47</option><option value="48" id="optionstmin48">48</option><option value="49" id="optionstmin49">49</option><option value="50" id="optionstmin50">50</option><option value="51" id="optionstmin51">51</option><option value="52" id="optionstmin52">52</option><option value="53" id="optionstmin53">53</option><option value="54" id="optionstmin54">54</option><option value="55" id="optionstmin55">55</option><option value="56" id="optionstmin56">56</option><option value="57" id="optionstmin57">57</option><option value="58" id="optionstmin58">58</option><option value="59" id="optionstmin59">59</option></select>'+
'<label class="eventeditorlable" for="editortimeselectoredhr"> To </label>'+
'<select class="eventeditordateSelector eventeditorrequired" id="editortimeselectoredhr"><option value="" disabled="">Hour</option><option value="0" id="optionedhr0">00</option><option value="1" id="optionedhr1">01</option><option value="2" id="optionedhr2">02</option><option value="3" id="optionedhr3">03</option><option value="4" id="optionedhr4">04</option><option value="5" id="optionedhr5">05</option><option value="6" id="optionedhr6">06</option><option value="7" id="optionedhr7">07</option><option value="8" id="optionedhr8">08</option><option value="9" id="optionedhr9">09</option><option value="10" id="optionedhr10">10</option><option value="11" id="optionedhr11">11</option><option value="12" id="optionedhr12">12</option><option value="13" id="optionedhr13">13</option><option value="14" id="optionedhr14">14</option><option value="15" id="optionedhr15">15</option><option value="16" id="optionedhr16">16</option><option value="17" id="optionedhr17">17</option><option value="18" id="optionedhr18">18</option><option value="19" id="optionedhr19">19</option><option value="20" id="optionedhr20">20</option><option value="21" id="optionedhr21">21</option><option value="22" id="optionedhr22">22</option><option value="23" id="optionedhr23">23</option></select><label class="eventeditorlable" for="editortimeselectoredmin">:</label>'+
'<select class="eventeditordateSelector eventeditorrequired" id="editortimeselectoredmin"><option value="" disabled="">Minute</option><option value="0" id="optionedmin0">00</option><option value="1" id="optionedmin1">01</option><option value="2" id="optionedmin2">02</option><option value="3" id="optionedmin3">03</option><option value="4" id="optionedmin4">04</option><option value="5" id="optionedmin5">05</option><option value="6" id="optionedmin6">06</option><option value="7" id="optionedmin7">07</option><option value="8" id="optionedmin8">08</option><option value="9" id="optionedmin9">09</option><option value="10" id="optionedmin10">10</option><option value="11" id="optionedmin11">11</option><option value="12" id="optionedmin12">12</option><option value="13" id="optionedmin13">13</option><option value="14" id="optionedmin14">14</option><option value="15" id="optionedmin15">15</option><option value="16" id="optionedmin16">16</option><option value="17" id="optionedmin17">17</option><option value="18" id="optionedmin18">18</option><option value="19" id="optionedmin19">19</option><option value="20" id="optionedmin20">20</option><option value="21" id="optionedmin21">21</option><option value="22" id="optionedmin22">22</option><option value="23" id="optionedmin23">23</option><option value="24" id="optionedmin24">24</option><option value="25" id="optionedmin25">25</option><option value="26" id="optionedmin26">26</option><option value="27" id="optionedmin27">27</option><option value="28" id="optionedmin28">28</option><option value="29" id="optionedmin29">29</option><option value="30" id="optionedmin30">30</option><option value="31" id="optionedmin31">31</option><option value="32" id="optionedmin32">32</option><option value="33" id="optionedmin33">33</option><option value="34" id="optionedmin34">34</option><option value="35" id="optionedmin35">35</option><option value="36" id="optionedmin36">36</option><option value="37" id="optionedmin37">37</option><option value="38" id="optionedmin38">38</option><option value="39" id="optionedmin39">39</option><option value="40" id="optionedmin40">40</option><option value="41" id="optionedmin41">41</option><option value="42" id="optionedmin42">42</option><option value="43" id="optionedmin43">43</option><option value="44" id="optionedmin44">44</option><option value="45" id="optionedmin45">45</option><option value="46" id="optionedmin46">46</option><option value="47" id="optionedmin47">47</option><option value="48" id="optionedmin48">48</option><option value="49" id="optionedmin49">49</option><option value="50" id="optionedmin50">50</option><option value="51" id="optionedmin51">51</option><option value="52" id="optionedmin52">52</option><option value="53" id="optionedmin53">53</option><option value="54" id="optionedmin54">54</option><option value="55" id="optionedmin55">55</option><option value="56" id="optionedmin56">56</option><option value="57" id="optionedmin57">57</option><option value="58" id="optionedmin58">58</option><option value="59" id="optionedmin59">59</option></select></div>'+
'<textarea class="eventeditordescription" id="editoreventdescription" placeholder="Description..."></textarea>'+
'<div class="eventeditordatetimebg">'+
'<label class="eventeditorlable">Location </label><div class="listclickbox" id="openmap">Open Map</div>'+
'<input type="hidden" id="editoreventqthinfo" name="editoreventqthinfo" value="">'+
'<div class="eventeditorqth" id="editoreventqth"></div><br>'+
'<div class="editorgooglemap" id="googlemapeditorbox" style="display: none; position: relative; overflow: hidden;"></div><br>'+
'</div>&nbsp;</form>'+
'<button class="editorgoto" id="editorsubmit" disabled="disabled">SUBMIT</button>'+
'<button class="editorgoto" id="editorcancel">CANCEL</button>';
        $(".eventeditor").html(whatstring);
        startEventEditorAction();
        clearEventEditor();
        startEventFieldChk();
        genMsgBox();
    }
    else {
        clearUser();
        clearToken();
    }
}

//populate
function populateMonthView(jsonData) {
    var offset = jsonData.startDayOfWeek;
    var cardDay = jsonData.cardDay;
    var endDateLastMonth = jsonData.endDateLastMonth;
    var days = jsonData.days;
    var thisMonthAlready = false;
    var d = 0;
    var i = 0;
    var w = 0;
    var cardWeek = Math.floor((cardDay + offset) / 7);
    if ((cardDay + offset) / 7 > cardWeek){
        cardWeek+= 1;
    }
    if(offset === 0){
        thisMonthAlready = true;
    }
    //populate                          BACK END MUST PROVIDE JSON WITH COMPLETE DAY FORMAT WHETHER LOGIN OR NOT ; SHOULD ALWAYS REPLY cardDay, cardDay of the startDate
    var add2Html = "<strong>";
    switch (jsonData.month) {
        case 1:
            add2Html += "January";
            break;
        case 2:
            add2Html += "February";
            break;
        case 3:
            add2Html += "March";
            break;
        case 4:
            add2Html += "April";
            break;
        case 5:
            add2Html += "May";
            break;
        case 6:
            add2Html += "June";
            break;
        case 7:
            add2Html += "July";
            break;
        case 8:
            add2Html += "August";
            break;
        case 9:
            add2Html += "September";
            break;
        case 10:
            add2Html += "October";
            break;
        case 11:
            add2Html += "November";
            break;
        case 12:
            add2Html += "December";
            break;
        default:
            break;
    }
    add2Html += "&emsp;"+jsonData.year;
    add2Html += "</strong><br />";
    add2Html += "<table class=\"calendarmonthviewtable\"><tr class=\"weekRow\"><td class=\"dayNameCell\">Sun</td><td class=\"dayNameCell\">Mon</td><td class=\"dayNameCell\">Tue</td><td class=\"dayNameCell\">Wed</td><td class=\"dayNameCell\">Thu</td><td class=\"dayNameCell\">Fri</td><td class=\"dayNameCell\">Sat</td></tr>";
    var weekStartWithDayIdx =  0;
    var firstWk1Day = endDateLastMonth - offset + 1;
    var nextM1Day = 1;
    for(w=0; w < cardWeek; w+= 1){
        add2Html += "<tr class=\"weekRow\">";        //weekRow
        if(thisMonthAlready){
            for(d=weekStartWithDayIdx; d < weekStartWithDayIdx+7; d+= 1){
                add2Html += "<td class=\"dayCell\">";        //dayCell
                if(d < cardDay){       //data covered
                    add2Html += "<div class=\"dayHead\"> <span class=\"dayNum\">" + String(Number(d)+1) + "</span>";       //container
                    if(days[d].cardEvent>0){
                        for(i=0; i<days[d].cardEvent; i+= 1){
                            add2Html += "<div class=\"eventHead\"><span class=\"eventTitle\" id=\"ev"+days[d].events[i].id+"\">"+days[d].events[i].title+"</span></div><div class=\"eventContent\"><ul class=\"eventDetailUl\">";
                            if(days[d].events[i].stHr === 0 && days[d].events[i].stMin === 0 && days[d].events[i].edHr === 0 && days[d].events[i].edMin === 0){
                                add2Html += "<li class=\"eventDetail\">All day Event</li>";
                            }
                            else{
                                add2Html += "<li class=\"eventDetail\">Time: " + giveMeTimeString(days[d].events[i].stHr) + ":" + giveMeTimeString(days[d].events[i].stMin);
                                if(days[d].events[i].edHr > days[d].events[i].stHr){
                                    add2Html += " to " + giveMeTimeString(days[d].events[i].edHr) + ":" + giveMeTimeString(days[d].events[i].edMin);
                                }
                                add2Html += "</li>";
                            }
                            if(days[d].events[i].QTH){
                                add2Html += "<li class=\"eventDetail\"><a class=\"gotoGE\" href=\"https://www.google.com/maps?&z=15&q=loc:" + days[d].events[i].QTH + "\" target=\"_blank\">Location</a></li>";
                            }
                            if (days[d].events[i].description) {
                                add2Html += "<li class=\"eventDetail\">" + days[d].events[i].description + "</li>";
                            }
                            add2Html += "<li class=\"eventDetail\"><div class=\"editevent listclickbox\" id=\"editevent"+days[d].events[i].id+"\">Edit</div><div class=\"delevent listclickbox\" id=\"delevent"+days[d].events[i].id+"\">Delete</div></li></ul></div>";
                        }
                    }
                    add2Html += "</div>";
                }
                else{       //out of data coverage
                    add2Html += "<div class=\"dayHead\"><span class=\"dayNum\">" + nextM1Day + "</span></div>";      //nextMonth
                    nextM1Day+= 1;
                }
                add2Html += "</td>";
            }
            weekStartWithDayIdx += 7;
        }
        else{
            for(d = firstWk1Day; d <= endDateLastMonth; d+= 1){
                    add2Html += "<td class=\"dayCell\">";        //dayCell
                    add2Html += "<div class=\"dayHead\"><span class=\"dayNum\">" + d + "</span>";           //preMonth
                    add2Html += "</div></td>";
                }
                thisMonthAlready = true;        //enter this month
                for(d=weekStartWithDayIdx; d < 7-offset; d+= 1){
                    add2Html += "<td class=\"dayCell\">";        //dayCell
                    add2Html += "<div class=\"dayHead\"> <span class=\"dayNum\">" + String(Number(d)+1) + "</span>";       //container
                    if(days[d].cardEvent>0){
                        for(i=0; i<days[d].cardEvent; i+= 1){
                            add2Html += "<div class=\"eventHead\"><span class=\"eventTitle\" id=\"ev"+days[d].events[i].id+"\">"+days[d].events[i].title+"</span></div><div class=\"eventContent\"><ul class=\"eventDetailUl\">";
                            if(days[d].events[i].stHr === 0 && days[d].events[i].stMin === 0 && days[d].events[i].edHr === 0 && days[d].events[i].edMin === 0){
                                add2Html += "<li class=\"eventDetail\">All day Event</li>";
                            }
                            else{
                                add2Html += "<li class=\"eventDetail\">Time: " + giveMeTimeString(days[d].events[i].stHr) + ":" + giveMeTimeString(days[d].events[i].stMin);
                                if(days[d].events[i].edHr > days[d].events[i].stHr){
                                    add2Html += " to " + giveMeTimeString(days[d].events[i].edHr) + ":" + giveMeTimeString(days[d].events[i].edMin);
                                }
                                add2Html += "</li>";
                            }
                            if(days[d].events[i].QTH){
                                add2Html += "<li class=\"eventDetail\"><a class=\"gotoGE\" href=\"https://www.google.com/maps?&z=15&q=loc:" + days[d].events[i].QTH + "\" target=\"_blank\">Location</a></li>";
                            }
                            if (days[d].events[i].description) {
                                add2Html += "<li class=\"eventDetail\">" + days[d].events[i].description + "</li>";
                            }
                            add2Html += "<li class=\"eventDetail\"><div class=\"editevent listclickbox\" id=\"editevent"+days[d].events[i].id+"\">Edit</div><div class=\"delevent listclickbox\" id=\"delevent"+days[d].events[i].id+"\">Delete</div></li></ul></div>";           
                        }
                    }
                    add2Html += "</div></td>";
                }
                weekStartWithDayIdx = 7 - offset;
        }
        add2Html += "</tr>";
    }
    add2Html += "</table>";
    $(".calendar").html(add2Html);
    $(".eventHead").click(function () {
        var currEventEvId;
        var $title = $(this);
        var $detail = $title.next();
        $detail.slideToggle(500);
        currEventEvId = $title.find(".eventTitle").attr('id');
    });
    $(".editevent").click(function () {
        var eventEvId;
        clearEventEditor();
        eventEvId = $(this).attr('id');
        fillEventEditor(eventEvId);
        $(window).scrollTop($('#editorform').position().top);
    });
    $(".delevent").click(function () {
        var eventEvId;
        eventEvId = $(this).attr('id');
        deleteEvent(eventEvId);
    });
}

function populateWeekView(jsonData) {
    genWeekViewTable(jsonData);
    if (typeof user === 'string') {
        if(user.length > 3){
            addWeekViewEvent(jsonData);
        }
    }
}

function genWeekViewTable(jsonData) {
    var startdate = jsonData.startDate;
    var cardday = jsonData.cardDay;
    var eDLM = jsonData.endDateLastMonth;
    var add2html = "<strong>"+jsonData.year+"</strong><br />";
    add2html += "<table class=\"calendarweekviewtable\">";
    var halfHr;
    var dayOfWeek;
    var i;
    var dateOfWeek = [];
    var monthOfDay = [];
    if (startdate > currDay) {
        for (i=0;i<(eDLM-startdate+1);i++) {
            if (Number(jsonData.month) - 1 === 0){
                monthOfDay.push(12);
            }
            else {
                monthOfDay.push((Number(jsonData.month) - 1));
            }
            dateOfWeek.push((Number(startdate) + i));
        }
        for (i=0;i<(6-eDLM+startdate);i++) {
            monthOfDay.push(Number(jsonData.month));
            dateOfWeek.push(1 + i);
        }
        
    }
    else if (startdate === cardday && cardday === currDay) {
        monthOfDay.push(jsonData.month);
        dateOfWeek.push(startdate);
        for (i=0;i<6;i++) {
            if (Number(jsonData.month) + 1 > 12) {
                monthOfDay.push(1);
            }
            else {
                monthOfDay.push((Number(jsonData.month) + 1));
            }
            dateOfWeek.push(1 + i);
        }
    }
    else if (startdate + 7 > cardday) {
        for (i=0;i<=cardday-startdate;i++) {
            monthOfDay.push((Number(jsonData.month)));
            dateOfWeek.push(startdate+i);
        }
        for (i=1;i<=6-cardday+startdate;i++) {
            if (Number(jsonData.month) + 1 > 12) {
                monthOfDay.push(1);
            }
            else {
                monthOfDay.push((Number(jsonData.month) + 1));
            }
            dateOfWeek.push(i);
        }
    }
    else {
        for (i=startdate;i<startdate+7;i++) {
            monthOfDay.push((Number(jsonData.month)));
            dateOfWeek.push(i);
        }
    }
    add2html += "<tr class\"calendarweekviewdayhead\">"; //use tr.calendarweekviewdayhead for day head row
    add2html += "<td class=\"calendarweekviewtimemarkcell\" ></td>";
    for (dayOfWeek = 0;dayOfWeek<7;dayOfWeek++) {
        add2html += "<td class=\"calendarweekviewdaynum\" >";
        switch (dayOfWeek) {
            case 0:
                add2html += "Sun&nbsp;";
                break;
            case 1:
                add2html += "Mon&nbsp;";
                break;
            case 2:
                add2html += "Tue&nbsp;";
                break;
            case 3:
                add2html += "Wed&nbsp;";
                break;
            case 4:
                add2html += "Thu&nbsp;";
                break;
            case 5:
                add2html += "Fri&nbsp;";
                break;
            case 6:
                add2html += "Sat&nbsp;";
                break;
            default:
                break;
        }
        add2html += monthOfDay[dayOfWeek]+"/"+dateOfWeek[dayOfWeek]+"</td>";   //use td.calendarweekviewdaynum for each day num cell/////////////////////////edge month number/////////////////
    }
    add2html += "</tr><tr class\"calendarweekviewalldayeventhead\">";   //use tr.calendarweekviewalldayeventhead for day head row
    add2html += "<td class=\"calendarweekviewtimemarkcell\" ></td>";
    for (dayOfWeek = 0;dayOfWeek<7;dayOfWeek++) {
        add2html += "<td class=\"calendarweekviewalldayeventcell\" id=\"alld"+dayOfWeek+"\" ></td>";   //use td.calendarweekviewalldayeventcell for each all day cell; ID:alld0~6
    }
    for (halfHr=0;halfHr<48;halfHr++) {                 //NOTICE t use half an hour as unit
        add2html += "<tr class\"calendarweekviewrow\">"; //use tr.calendarweekviewrow for each row
        if (halfHr % 2 === 0) {
            add2html += "<td class=\"calendarweekviewtimemarkcell\" >"+String(halfHr / 2)+":00</td>";
        }
        else {
            add2html += "<td class=\"calendarweekviewtimemarkcell\" ></td>";
        }
        for (dayOfWeek = 0;dayOfWeek<7;dayOfWeek++) {
            add2html += "<td class=\"calendarweekviewcell\" id=\"d"+dayOfWeek+"t"+halfHr+"\" ></td>";   //use td.calendarweekviewcell for each cell
        }
        add2html += "</tr>";
    }
    add2html += "</table>";
    $(".calendar").html(add2html);
}

function addWeekViewEvent(jsonData) {
    var eventTime = [];             //event time cell
    var eventDay = [];
    var timeOffset = [];            //offset of event time cell
    var cardEvent;
    var collideEvent = 1;
    var collideIdx = 0;
    var otherEvent;
    var dayCellWidth;
    var dayCellHeight;
    var whatString;
    var whatObject;
    var whattime;
    var grandEvent = [];        //2D Array
    var events = [];
    var k;
    var j;
    var i;
    for (j=0;j<7;j++) {         //visit each day
        cardEvent = jsonData.days[j].cardEvent;
        eventDay[j] = j;
        whatString = null;
        eventTime = [];
        timeOffset = [];
        dayCellWidth = null;
        dayCellHeight = null;
        collideEvent = 1;
        collideIdx = 0;
        if (cardEvent > 0) {
            events = jsonData.days[j].events;
        }
        else {
            events = [];
        }
        grandEvent[j] = events;
        for(i=0;i<cardEvent;i++){
            collideEvent = 1;
            whatObject = {};
            if (events[i].stHr === 0 && events[i].stMin === 0 && events[i].edHr === 0 && events[i].edMin === 0) {
                whatString = "#alld"+j;
                eventTime[i] = $(whatString);
                timeOffset[i] = eventTime[i].offset();
                timeOffset[i].left+=1;          //single border width
                timeOffset[i].top+=1;           //single border width
                dayCellWidth = eventTime[i].width()+3;      //single border width
                dayCellHeight = eventTime[i].height()+3;    //double border width
                whatString = '<div class="weekviewevent" id="ev'+events[i].id+'">'+events[i].title+'</div>';         //EVENT DIV USE weekviewevent CLASS
                $(".calendar").append(whatString);                  //append to .calendar class div
                whatString = '#ev'+events[i].id;
                if (cardEvent>1){
                    for(k=0;k<cardEvent;k++) {
                        if (events[k].stHr === 0 && events[k].stMin === 0 && events[k].edHr === 0 && events[k].edMin === 0) {
                            collideEvent += 1;
                            collideIdx += 1;
                        }
                    }
                }
                else {
                    collideEvent = 1;                           //with self
                }
                whatObject = {
                    left: timeOffset[i].left+(collideIdx-1)*(collideEvent - 1)*(dayCellWidth / collideEvent),
                    top: timeOffset[i].top,
                    width: dayCellWidth,
                    height: dayCellHeight
                };
                $(whatString).css(whatObject);
            }
            else {
                whattime = events[i].stHr * 2 + Math.floor(events[i].stMin / 30);
                if ((events[i].stMin % 30) > 15){
                    whattime += 1;
                }
                whatString = "#d"+j+"t"+whattime;
                eventTime[i] = $(whatString);
                timeOffset[i] = eventTime[i].offset();
                timeOffset[i].left+=1;          //single border width
                timeOffset[i].top+=1;           //single border width
                dayCellWidth = eventTime[i].width()+3;
                dayCellHeight = eventTime[i].height()+3;    //double border width
                whatString = '<div class="weekviewevent" id="ev'+events[i].id+'">'+events[i].title+'</div>';         //EVENT DIV USE weekviewevent CLASS
                $(".calendar").append(whatString);                  //append to .calendar class div
                if (cardEvent>1){
                    for(k=0;k<cardEvent;k++) {
                        otherEvent = giveMeTimeCoordinate(events[k]);
                        if ((whattime>otherEvent[0] && whattime<otherEvent[1])||((whattime+events[i].duration)>otherEvent[0] && otherEvent[1]>(whattime+events[i].duration))||(whattime<otherEvent[0] && (whattime+events[i].duration)>otherEvent[1])) {
                            collideEvent += 1;
                            collideIdx += 1;
                        }
                    }
                }
                else {
                    collideEvent = 1;                           //with self
                }
                whatString = '#ev'+events[i].id;
                whatObject = {
                    left:timeOffset[i].left+(collideIdx-1)*(collideEvent - 1)*(dayCellWidth / collideEvent),
                    top:timeOffset[i].top,
                    width:(dayCellWidth / collideEvent),
                    height:(events[i].duration * (dayCellHeight+1))-1
                };
                $(whatString).css(whatObject);
            }
        }
    }
    $(".weekviewevent").click(function(event) {
            var whichEvent;
            var whichEventData;
            var firedEventId;
            whatString = "";
            whichEvent = $(this);
            $("#msgBox").fadeOut(200,function(){
                firedEventId = String(whichEvent.attr('id'));
                firedEventId = Number(firedEventId.replace("ev",""));
                whatObject = {
                    left:whichEvent.offset().left - 20,                 //msgBox placing offset
                    top:whichEvent.offset().top+whichEvent.height() + 20
                };
                $("#msgBox").css(whatObject);
                whichEventData = searchEventWithId(firedEventId);
                $("#msgBox").children("#msgBoxEventTitle").text(whichEventData.title);      //add other info     PREEXIST CHILDREN msgBoxEventTitle...
                if (whichEventData.description) {
                    $("#msgBox").children("#msgBoxEventDescription").text(whichEventData.description);
                }
                else {
                    $("#msgBox").children("#msgBoxEventDescription").text("");
                }
                if(whichEventData.stHr === 0 && whichEventData.stMin === 0 && whichEventData.edHr === 0 && whichEventData.edMin === 0){
                    whatString += "All day Event";
                }
                else{
                    whatString += "Time: " + giveMeTimeString(whichEventData.stHr) + ":" + giveMeTimeString(whichEventData.stMin);
                    if(whichEventData.edHr > whichEventData.stHr){
                        whatString += " to " + giveMeTimeString(whichEventData.edHr) + ":" + giveMeTimeString(whichEventData.edMin);
                    }
                }
                $("#msgBox").children("#msgBoxEventTime").text(whatString);
                if (whichEventData.QTH) {
                    $("#msgBox").children("#msgBoxEventLocation").html("<a class=\"gotoGE\" href=\"https://www.google.com/maps?&z=15&q=loc:" + whichEventData.QTH + "\" target=\"_blank\">Location</a>");
                }
                else {
                    $("#msgBox").children("#msgBoxEventLocation").html("");
                }
                $("#msgBox").children("#msgBoxEventEdit").html("<div class=\"editevent listclickbox\" id=\"editevent"+firedEventId+"\">Edit</div><div class=\"delevent listclickbox\" id=\"delevent"+firedEventId+"\">Delete</div>");
                $(".editevent").click(function () {
                    var eventEvId;
                    clearEventEditor();
                    eventEvId = $(this).attr('id');
                    fillEventEditor(eventEvId);
                    $(window).scrollTop($('#editorform').position().top);
                });
                $(".delevent").click(function () {
                    var eventEvId;
                    eventEvId = $(this).attr('id');
                    deleteEvent(eventEvId);
                });
                $("#msgBox").fadeIn(200);
            });
            event.stopPropagation();
        });
    
    $("#msgBoxClose").click(function(event) {
        $("#msgBox").fadeOut();
        event.stopPropagation();
    });
    
    $("html").click(function() {
        $("#msgBox").fadeOut();
    });

    $("#msgBox").click(function(event) {
        event.stopPropagation();
    });
}

//comm
function prepareReq() {
    if (eventOP) {
        switch (opTypeToSend) {
            case 1:
                prepareToSend.operation = "insert";
                break;
            case 2:
                prepareToSend.operation = "mod";
                break;
            case 3:
                prepareToSend.operation = "del";
                break;
            default:
                prepareToSend.operation = null;
                eventOP = false;
                opTypeToSend = 1;
                break;
        }
    }
    else {
        prepareToSend.operation = null;
        prepareToSend.eventid = null;
        prepareToSend.title = null;
        prepareToSend.description = null;
        prepareToSend.eventday = null;
        prepareToSend.eventmonth = null;
        prepareToSend.eventyear = null;
        prepareToSend.stHr = null;
        prepareToSend.stMin = null;
        prepareToSend.edHr = null;
        prepareToSend.edMin = null;
        prepareToSend.duration = null;
        prepareToSend.QTH = null;
    }
    if (typeof user === 'string') {
        if(user.length > 3){
            prepareToSend.user = user;
        }
        else {
            prepareToSend.user = null;
            prepareToSend.operation = null;
            prepareToSend.eventid = null;
            prepareToSend.title = null;
            prepareToSend.description = null;
            prepareToSend.eventday = null;
            prepareToSend.eventmonth = null;
            prepareToSend.eventyear = null;
            prepareToSend.stHr = null;
            prepareToSend.stMin = null;
            prepareToSend.edHr = null;
            prepareToSend.edMin = null;
            prepareToSend.duration = null;
            prepareToSend.QTH = null;
        }
    }
    else {
        prepareToSend.user = null;
        prepareToSend.operation = null;
        prepareToSend.eventid = null;
        prepareToSend.title = null;
        prepareToSend.description = null;
        prepareToSend.eventday = null;
        prepareToSend.eventmonth = null;
        prepareToSend.eventyear = null;
        prepareToSend.stHr = null;
        prepareToSend.stMin = null;
        prepareToSend.edHr = null;
        prepareToSend.edMin = null;
        prepareToSend.duration = null;
        prepareToSend.QTH = null;
    }
    prepareToSend.token = null;
    whatToken = null;
    loadMyToken();
    whatToken = readMyToken();
    prepareToSend.view = currView;
    prepareToSend.year = currYear;
    prepareToSend.month = currMonth;
    prepareToSend.day = currDay;
    dataToSend = "view="+encodeURIComponent(prepareToSend.view);
    dataToSend += "&year="+encodeURIComponent(prepareToSend.year);
    dataToSend += "&month="+encodeURIComponent(prepareToSend.month);
    dataToSend += "&day="+encodeURIComponent(prepareToSend.day);
    if (prepareToSend.unlogin) {
        dataToSend += "&unlogin="+encodeURIComponent(prepareToSend.unlogin);
    }
    else {
        dataToSend += "&unlogin=";
    }
    if (prepareToSend.pwlogin) {
        dataToSend += "&pwlogin="+encodeURIComponent(prepareToSend.pwlogin);
    }
    else {
        dataToSend += "&pwlogin=";
    }
    if (prepareToSend.trylogin || prepareToSend.trylogin === 0) {
        dataToSend += "&trylogin="+encodeURIComponent(prepareToSend.trylogin);
    }
    else {
        dataToSend += "&trylogin=";
    }
    if (prepareToSend.trysignup || prepareToSend.trysignup === 0) {
        dataToSend += "&trysignup="+encodeURIComponent(prepareToSend.trysignup);
    }
    else {
        dataToSend += "&trysignup=";
    }
    if (prepareToSend.wantlogout || prepareToSend.wantlogout === 0) {
        dataToSend += "&wantlogout="+encodeURIComponent(prepareToSend.wantlogout);
    }
    else {
        dataToSend += "&wantlogout=";
    }
    if (prepareToSend.user) {                                              //so yeah, encodeURIComponent return string null for null...this is a dirty way to solve it, i guess i can write ternary but im just so tired
        dataToSend += "&user="+encodeURIComponent(prepareToSend.user);
    }
    else {
        dataToSend += "&user=";
    }
    if (prepareToSend.token) {
        dataToSend += "&token="+encodeURIComponent(prepareToSend.token);
    }
    else {
        dataToSend += "&token=";
    }
    if (prepareToSend.operation) {
        dataToSend += "&operation="+encodeURIComponent(prepareToSend.operation);
    }
    else {
        dataToSend += "&operation=";
    }
    if (prepareToSend.eventid) {
        dataToSend += "&eventid="+encodeURIComponent(prepareToSend.eventid);
    }
    else {
        dataToSend += "&eventid=";
    }
    if (prepareToSend.title) {
        dataToSend += "&title="+encodeURIComponent(prepareToSend.title);
    }
    else {
        dataToSend += "&title=";
    }
    if (prepareToSend.description) {
        dataToSend += "&description="+encodeURIComponent(prepareToSend.description);
    }
    else {
        dataToSend += "&description=";
    }
    if (prepareToSend.eventday) {
        dataToSend += "&eventday="+encodeURIComponent(prepareToSend.eventday);
    }
    else {
        dataToSend += "&eventday=";
    }
    if (prepareToSend.eventmonth) {
        dataToSend += "&eventmonth="+encodeURIComponent(prepareToSend.eventmonth);
    }
    else {
        dataToSend += "&eventmonth=";
    }
    if (prepareToSend.eventyear) {
        dataToSend += "&eventyear="+encodeURIComponent(prepareToSend.eventyear);
    }
    else {
        dataToSend += "&eventyear=";
    }
    if (prepareToSend.stHr || prepareToSend.stHr === 0) {
        dataToSend += "&stHr="+encodeURIComponent(prepareToSend.stHr);
    }
    else {
        dataToSend += "&stHr=";
    }
    if (prepareToSend.stMin || prepareToSend.stMin === 0) {
        dataToSend += "&stMin="+encodeURIComponent(prepareToSend.stMin);
    }
    else {
        dataToSend += "&stMin=";
    }
    if (prepareToSend.edHr || prepareToSend.edHr === 0) {
        dataToSend += "&edHr="+encodeURIComponent(prepareToSend.edHr);
    }
    else {
        dataToSend += "&edHr=";
    }
    if (prepareToSend.edMin || prepareToSend.edMin === 0) {
        dataToSend += "&edMin="+encodeURIComponent(prepareToSend.edMin);
    }
    else {
        dataToSend += "&edMin=";
    }
    if (prepareToSend.duration) {
        dataToSend += "&duration="+encodeURIComponent(prepareToSend.duration);
    }
    else {
        dataToSend += "&duration=";
    }
    if (prepareToSend.QTH) {
        dataToSend += "&QTH="+encodeURIComponent(prepareToSend.QTH);
    }
    else {
        dataToSend += "&QTH=";
    }
    prepareToSend.token = null;
    prepareToSend.operation = null;
    prepareToSend.eventid = null;
    prepareToSend.title = null;
    prepareToSend.description = null;
    prepareToSend.eventday = null;
    prepareToSend.eventmonth = null;
    prepareToSend.eventyear = null;
    prepareToSend.stHr = null;
    prepareToSend.stMin = null;
    prepareToSend.edHr = null;
    prepareToSend.edMin = null;
    prepareToSend.duration = null;
    prepareToSend.QTH = null;
    prepareToSend.unlogin = null;
    prepareToSend.pwlogin = null;
    prepareToSend.trylogin = 0;
    prepareToSend.trysignup = 0;
    prepareToSend.wantlogout = 0;
    eventOP = false;
    opTypeToSend = 1;
}

function txData() {
 	var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
	xmlHttp.open("POST", "mod5backend.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
	xmlHttp.addEventListener("load", function(event){rxData(event);}, false); // Bind the callback to the load event
	xmlHttp.send(dataToSend); // Send the data
    msgRxed = false;
}

function rxData(event) {
    var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
    msgRxed = false;
    if(typeof jsonData.year !== 'undefined'){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
        lastData = jsonData;        //success
        cleanseJsonData();
        if (lastData.triedlogin === 1) {
            if (lastData.loggedin === 1) {
                setUser();
                loadMyUserName();
                setToken();
            }
            else {
                $(".rightnotice").text("No user match found");
            }
        }
        else {
            if (lastData.loggedin === 1) {
                setUser();
                loadMyUserName();
                setToken();
            }
            else {
                clearUser();
                clearToken();
                if (lastData.triedsignup === 1){
                    $(".rightnotice").text("User already exists");
                }
            }
        }
        if(lastData.OPstatus === 1){
            opSuccessMsg(lastData.OPtype);
        }
        else if(lastData.OPstatus === 0){                               //IF NO OP THEN JSON RETURN NULL ////////////////
            opFailMsg(lastData.OPtype, lastData.msg);
        }
        msgRxed = true;
    }else{
        alert("Communication failure");
        msgRxed = false;
    }
}

function updateView() {
    prepareReq();
    txData();
    eventOP = false;
    opTypeToSend = 1;
    clearEventEditor();
    setTimeout(function(){
        if(msgRxed){
            try {
                if(lastData.triedlogin !== 1 && lastData.triedsignup !== 1 && lastData.loggedin === 1 && whatToken){
                    if(lastData.token !== whatToken)  throw "CSRF";
                }
                genEventEditor();
                if(lastData.viewType === 0) {
                    genCalendarCtrl();
                    populateMonthView(lastData);
                    setDateSelectorToCurrView();
                }
                else if (lastData.viewType === 1) {
                    genCalendarCtrl();
                    populateWeekView(lastData);
                    setDateSelectorToCurrView();
                }
            }
            catch(err) {
                alert(err+": Cross-Site Request Forgery");
            }
            whatToken = null;
        }
        else {
            $(".calendar").html("<p><strong>COMM FAILURE</strong></p>");
        }
    },500);         //estimated comm and computing time for php portal
}

//date manipulation         NEED TO UPDATE VIEW AFTER ANY currDATE CHANGES /////////////////////
function getTodayInfo() {
    var today = new Date();
    var d = Number(today.getDate());
    var m = Number(today.getMonth()) + 1;
    var y = Number(today.getFullYear());
    currDay = d;
    currMonth = m;
    currYear = y;
}

function nextMonth(thismonth) {
    var next = thismonth + 1;
    if (next > 12) {
        next = 1;
        nextYear(currYear);
    }
    currMonth = next;
}

function prevMonth(thismonth) {
    var prev = thismonth - 1;
    if(prev < 1){
        prev = 12;
        prevYear(currYear);
    }
    currMonth = prev;
}

function nextYear(thisyear) {
    currYear = thisyear + 1;
}

function prevYear(thisyear) {
    currYear = thisyear - 1;
}

function thisDayNextWeek(thisday, cardday) {
    var next = thisday + 7;
    if (next > cardday) {
        next = next - cardday;
        nextMonth(currMonth);
    }
    currDay = next;
}

function thisDayLastWeek(thisday, enddatelastmonth) {
    var prev = thisday - 7;
    if (prev < 1) {
        prev = enddatelastmonth + prev;
        prevMonth(currMonth);
    }
    currDay = prev;
}

function getDayInAMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

function getDayforSelector(month, year) {
    var numDay = Number(getDayInAMonth(year, month));
    var daysArray = [];
    var i;
    for (i=1;i<=numDay;i++) {
        daysArray[i-1] = i;
    }
    dayForselector = daysArray;             //i know this is useless i write it for further dev
    genViewDateSelector();
}

function setDateSelectorToCurrView() {           //call this after every update view
    var whatDay = "";
    var whatMonth = "";
    var whatYear = "";
    if (currView === 0) {
        whatMonth = "#dateSelectorMonthSelectorM option:eq("+currMonth+")";         //remeber there should be a placeholder at top so index equals to actual date
        whatYear = "#dateSelectorYearSelectorM option[value=\""+currYear+"\"]";
        $(whatMonth).attr("selected", "selected");
        $(whatYear).attr("selected", "selected");
    }
    else if (currView === 1) {
        whatDay = "#dateSelectorDaySelectorW option:eq("+currDay+")";
        whatMonth = "#dateSelectorMonthSelectorW option:eq("+currMonth+")";         //remeber there should be a placeholder at top so index equals to actual date
        whatYear = "#dateSelectorYearSelectorW option[value=\""+currYear+"\"]";
        $(whatDay).attr("selected", "selected");
        $(whatMonth).attr("selected", "selected");
        $(whatYear).attr("selected", "selected");
    }
    else {
        alert("There is no such view as view "+currView+".");
        $(".dateSelector").find("option:selected").removeAttr("selected");          //all date selector should be under .dateSelector class
    }
}

function genCalendarCtrl() {                                //CALL after each population
    var htmlString;
    var i;
    if (currView === 0) {
        htmlString = "<div class=\"calendarctrl\">"+
            "<div class=\"clickbox\" id=\"lastmonthbutton\"><div class=\"revarrow\"></div></div>"+
            "<div class=\"clickbox\" id=\"nextmonthbutton\"><div class=\"fwdarrow\"></div></div>&emsp;"+
            "<div class=\"clickbox\" id=\"todaybutton\">Today</div>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"+
            "<form method=\"POST\"><select class=\"dateSelector\" id=\"dateSelectorMonthSelectorM\" name=\"selectormonth\">"+
            "<option value=\"\" disabled selected>Month</option>"+
            "<option value=\"1\">January</option>"+
            "<option value=\"2\">February</option>"+
            "<option value=\"3\">March</option>"+
            "<option value=\"4\">April</option>"+
            "<option value=\"5\">May</option>"+
            "<option value=\"6\">June</option>"+
            "<option value=\"7\">July</option>"+
            "<option value=\"8\">August</option>"+
            "<option value=\"9\">September</option>"+
            "<option value=\"10\">October</option>"+
            "<option value=\"11\">November</option>"+
            "<option value=\"12\">December</option></select>"+
            "<select class=\"dateSelector\" id=\"dateSelectorYearSelectorM\">"+
            "<option value=\"\" disabled selected>Year</option>";
        for (i = 1950; i <= 2050; i ++) {
            htmlString += "<option value=\""+i+"\">"+i+"</option>";
        }
        htmlString += "</select></form>&emsp;"+
        "<div class=\"clickbox\" id=\"weekbutton\">Week</div>"+
        "<div class=\"clickbox\" id=\"monthbutton\">Month</div></div>";
        $(".noticetool").html(htmlString);
        $("#lastmonthbutton").click(function(){
            prevMonth(currMonth);
            updateView();
        });
        $("#nextmonthbutton").click(function(){
            nextMonth(currMonth);
            updateView();
        });
        $("#todaybutton").click(function(){
            getTodayInfo();
            updateView();
        });
        $("#monthbutton").click(function(){
            currView = 0;
            updateView();
        });
        $("#weekbutton").click(function(){
            currView = 1;
            updateView();
        });
        $( ".dateSelector" ).change(function() {
            takeMeToSelectorMonth();
        }).trigger( "change" );
    }
    else if (currView === 1) {
        htmlString = "<div class=\"calendarctrl\">"+
            "<div class=\"clickbox\" id=\"lastweekbutton\"><div class=\"revarrow\"></div></div>"+
            "<div class=\"clickbox\" id=\"nextweekbutton\"><div class=\"fwdarrow\"></div></div>&emsp;"+
            "<div class=\"clickbox\" id=\"todaybutton\">Today</div>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"+
            "<form method=\"POST\"><select class=\"dateSelector\" id=\"dateSelectorMonthSelectorW\" name=\"selectormonth\">"+
            "<option value=\"\" disabled selected>Month</option>"+
            "<option value=\"1\">January</option>"+
            "<option value=\"2\">February</option>"+
            "<option value=\"3\">March</option>"+
            "<option value=\"4\">April</option>"+
            "<option value=\"5\">May</option>"+
            "<option value=\"6\">June</option>"+
            "<option value=\"7\">July</option>"+
            "<option value=\"8\">August</option>"+
            "<option value=\"9\">September</option>"+
            "<option value=\"10\">October</option>"+
            "<option value=\"11\">November</option>"+
            "<option value=\"12\">December</option></select>"+
            "<select class=\"dateSelector\" id=\"dateSelectorDaySelectorW\"></select>"+
            "<select class=\"dateSelector\" id=\"dateSelectorYearSelectorW\">"+
            "<option value=\"\" disabled selected>Year</option>";
        for (i = 1950; i <= 2050; i ++) {
            htmlString += "<option value=\""+i+"\">"+i+"</option>";
        }
        htmlString += "</select></form>&emsp;"+
        "<div class=\"clickbox\" id=\"weekbutton\">Week</div>"+
        "<div class=\"clickbox\" id=\"monthbutton\">Month</div></div>";
        $(".noticetool").html(htmlString);
        getDayforSelector(currMonth, currYear);
        $("#lastweekbutton").click(function(){
            thisDayLastWeek(currDay, lastData.endDateLastMonth);
            updateView();
        });
        $("#nextweekbutton").click(function(){
            thisDayNextWeek(currDay, lastData.cardDay);
            updateView();
        });
        $("#todaybutton").click(function(){
            getTodayInfo();
            currView = 1;
            updateView();
        });
        $("#monthbutton").click(function(){
            currView = 0;
            updateView();
        });
        $("#weekbutton").click(function(){
            currView = 1;
            updateView();
        });
        $( ".dateSelector" ).change(function() {
            takeMeToSelectorWeek();
        }).trigger( "change" );
    }
    else {
        htmlString = "In Error View State";
        $(".noticetool").html(htmlString);
    }
    
}

function genViewDateSelector() {
    var selectorHtmlString = "<option value=\"\" disabled selected>Day</option>";           //the place holder should never appear in default
    var i = 1;
    var dayArray = dayForselector;
    for (i=1;i<=dayArray.length;i++) {          //foreach does not show not in komodo autocomplete so i did not use it
        selectorHtmlString += ("<option value=\""+dayArray[i-1]+"\" >"+dayArray[i-1]+"</option>");
    }
    $("#dateSelectorDaySelectorW").html(selectorHtmlString);       //replace everything inside that selector tag notice W is for week view
}

function takeMeToSelectorWeek() {           //call this when anything in week view date selector CHANGES
    var selectorEmpty = true;               //chk field
    //if($('#dateSelectorDaySelectorW').val() !== null && $('#dateSelectorMonthSelectorW').val() !== null && $('#dateSelectorYearSelectorW').val() !== null){                        //selector id
    if($('#dateSelectorDaySelectorW').val() && $('#dateSelectorMonthSelectorW').val() && $('#dateSelectorYearSelectorW').val() !== null){                        //selector id
            selectorEmpty = false;
    }
    if (!selectorEmpty) {
            currDay = Number($('#dateSelectorDaySelectorW').val());     //write value
            currMonth = Number($('#dateSelectorMonthSelectorW').val());
            currYear = Number($('#dateSelectorYearSelectorW').val());
            currView = 1;
            updateView();       //req update
    }
}

function takeMeToSelectorMonth() {           //call this when anything in month view date selector CHANGES
    var selectorEmpty = true;               //chk field
    //if($('#dateSelectorMonthSelectorM').val() !== null && $('#dateSelectorYearSelectorM').val() !== null){                        //selector id
    if($('#dateSelectorMonthSelectorM').val() && $('#dateSelectorYearSelectorM').val() !== null){                        //selector id
            selectorEmpty = false;
    }
    if (!selectorEmpty) {
            currMonth = Number($('#dateSelectorMonthSelectorM').val());
            currYear = Number($('#dateSelectorYearSelectorM').val());
            currView = 0;
            updateView();       //req update
    }
}

//editor
function fillEventEditor(elementid) {
    var eventid;
    var i;
    var j;
    var flag = false;
    var idx = [];
    var cardday;
    var cardevent;
    var originalevent;
    var sthrid, stminid, edhrid, edminid;
    sthrid = "#optionsthr";     //all single digit
    stminid = "#optionstmin";
    edhrid = "#optionedhr";
    edminid = "#optionedmin";
    if (typeof elementid === 'string') {
        eventid = Number(elementid.replace(/\D/g,''));
    }
    else if (typeof elementid !== 'number') {
        return null;
    }
    else if (elementid !== 0) {
        eventid = elementid;
    }
    if (lastData.view === 1){
        cardday = 7;
    }
    else {
        cardday = lastData.cardDay;
    }
    for (i=0;i<cardday;i++){
        if(lastData.days[i].cardEvent > 0){
            cardevent = lastData.days[i].cardEvent;
            for (j=0;j<cardevent;j++) {
                if(Number(lastData.days[i].events[j].id) === eventid){
                    idx[0] = i;
                    idx[1] = j;
                    flag = true;
                    break;
                }
            }
        }
        if(flag){break;}
    }

    if(flag) {
        originalevent = lastData.days[idx[0]].events[idx[1]];
        if(originalevent.stHr > 0){
            sthrid += originalevent.stHr;       //single digit
        }
        else{
            sthrid += 0;
        }
        if(originalevent.stMin > 0){
            stminid += originalevent.stMin;       //single digit
        }
        else{
            stminid += 0;
        }
        if(originalevent.edHr > 0){
            edhrid += originalevent.edHr;       //single digit
        }
        else{
            edhrid += 0;
        }
        if(originalevent.edMin > 0){
            edminid += originalevent.edMin;       //single digit
        }
        else{
            edminid += 0;
        }
        $("#editoreventid").val(originalevent.id);        //hidden
        $("#editoreventtitle").val(originalevent.title);
        $("#editoreventmonth").val(originalevent.date[1]);
        $("#editoreventday").val(originalevent.date[0]);
        $("#editoreventyear").val(originalevent.date[2]);
        if (originalevent.description) {
            $("#editoreventdescription").val(originalevent.description);    //textarea
        }
        else {
            $("#editoreventdescription").val("");
        }
        $(sthrid).attr('selected','selected');
        $(stminid).attr('selected','selected');
        $(edhrid).attr('selected','selected');
        $(edminid).attr('selected','selected');
        if (originalevent.QTH) {
            giveMeAddr(String(originalevent.QTH));    //uilabel
            $("#editoreventqthinfo").val(originalevent.QTH);   //hidden     for map loading
        }
        opTypeToSend = 2;
    }
}

function clearEventEditor() {
    var editorSelect = $("#editortimeselectorsthr");               //select
    $("#editoreventid").val("");
    $("#editoreventtitle").val("");
    $("#editoreventmonth").val("");
    $("#editoreventday").val("");
    $("#editoreventyear").val("");
    $("#editoreventdescription").val("");
    editorSelect.find("option").removeAttr("selected");
    editorSelect = $("#editortimeselectorstmin");                  //select
    editorSelect.find("option").removeAttr("selected");
    editorSelect = $("#editortimeselectoredhr");                   //select
    editorSelect.find("option").removeAttr("selected");
    editorSelect = $("#editortimeselectoredmin");                  //select
    editorSelect.find("option").removeAttr("selected");
    destroyMap();
    $("#googlemapeditorbox").fadeOut();
    $("#editoreventqth").empty();
    $("#editoreventqthinfo").val("");
    eventOP = false;
    opTypeToSend = 1;
}

function startEventFieldChk() {                                                          //CALL ONLY ONCE
    $('#editorform').keyup(function() {                        // id; required field class
        var fieldEmpty = false;
        var selectorEmpty = true;
        var chkOK = false;
        var dayPatt = new RegExp(/^(0?[1-9]|[12]\d|3[01])$/g);
        var monthPatt = new RegExp(/^(0?[1-9]|1[012])$/g);
        var yearPatt = new RegExp(/^(\d{4})$/g);
        var chkingVar;
        var eMonth = 0;
        var eYear = -1;
        var dateMessUp = false;
        eventOP = false;
        $('#editorform .eventeditorrequired').each(function() {             //SET REQUIRED FIELD TO eventeditorrequired CLASS, USE ID TO LOCATE CSS
            if (!$(this).val()) {
                fieldEmpty = true;
            }
            else if($(this).attr('id') === "editoreventmonth"){
                chkingVar = $(this).val();
                if (monthPatt.test(chkingVar)) {
                    eMonth = Number(chkingVar);
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
            else if($(this).attr('id') === "editoreventyear"){
                chkingVar = $(this).val();
                if (yearPatt.test(chkingVar)) {
                    eYear = Number(chkingVar);
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
            else if($(this).attr('id') === "editoreventday"){
                chkingVar = $(this).val();
                if (dayPatt.test(chkingVar)) {
                    if (eMonth !== 0) {
                        switch (eMonth) {
                            case 1:
                            case 3:
                            case 5:
                            case 7:
                            case 8:
                            case 10:
                            case 12:
                                if(Number(chkingVar)>31 || Number(chkingVar)<0){
                                    fieldEmpty = true;
                                    dateMessUp = true;
                                }
                                break;
                            case 4:
                            case 6:
                            case 9:
                            case 11:
                                if(Number(chkingVar)>30 || Number(chkingVar)<0){
                                    fieldEmpty = true;
                                    dateMessUp = true;
                                }
                                break;
                            case 2:
                                if (eYear !== -1) {
                                    if (((eYear % 4 === 0) && (eYear % 100 !== 0)) || (eYear % 400 === 0)) {
                                        if(Number(chkingVar)>29 || Number(chkingVar)<0){
                                            fieldEmpty = true;
                                            dateMessUp = true;
                                        }
                                    }
                                    else {
                                        if(Number(chkingVar)>28 || Number(chkingVar)<0){
                                            fieldEmpty = true;
                                            dateMessUp = true;
                                        }
                                    }
                                }
                                break;
                            default:
                                fieldEmpty = true;
                                dateMessUp = true;
                                break;
                        }
                    }
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
            
        });
        if($('#editortimeselectorsthr').val() !== null && $('#editortimeselectorstmin').val() !== null && $('#editortimeselectoredhr').val() !== null && $('#editortimeselectoredmin').val() !== null){                        //selector id
                selectorEmpty = false;
        }
        if (fieldEmpty || selectorEmpty) {
            $('#editorsubmit').attr('disabled', 'disabled');        //editor submit button id
            chkOK = true;           //no need to use
        } else {
            $('#editorsubmit').removeAttr('disabled');
            chkOK = false;
        }
    });
    
    $("#openmap").click(function() {
        var fieldEmpty = false;
        var selectorEmpty = true;
        var chkOK = false;
        var dayPatt = new RegExp(/^(0?[1-9]|[12]\d|3[01])$/g);
        var monthPatt = new RegExp(/^(0?[1-9]|1[012])$/g);
        var yearPatt = new RegExp(/^(\d{4})$/g);
        var chkingVar;
        var eMonth = 0;
        var eYear = -1;
        var dateMessUp = false;
        eventOP = false;
        $('#editorform .eventeditorrequired').each(function() {
            if (!$(this).val()) {
                fieldEmpty = true;
            }
            else if($(this).attr('id') === "editoreventmonth"){
                chkingVar = $(this).val();
                if (monthPatt.test(chkingVar)) {
                    eMonth = Number(chkingVar);
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
            else if($(this).attr('id') === "editoreventyear"){
                chkingVar = $(this).val();
                if (yearPatt.test(chkingVar)) {
                    eYear = Number(chkingVar);
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
            else if($(this).attr('id') === "editoreventday"){
                chkingVar = $(this).val();
                if (dayPatt.test(chkingVar)) {
                    if (eMonth !== 0) {
                        switch (eMonth) {
                            case 1:
                            case 3:
                            case 5:
                            case 7:
                            case 8:
                            case 10:
                            case 12:
                                if(Number(chkingVar)>31 || Number(chkingVar)<0){
                                    fieldEmpty = true;
                                    dateMessUp = true;
                                }
                                break;
                            case 4:
                            case 6:
                            case 9:
                            case 11:
                                if(Number(chkingVar)>30 || Number(chkingVar)<0){
                                    fieldEmpty = true;
                                    dateMessUp = true;
                                }
                                break;
                            case 2:
                                if (eYear !== -1) {
                                    if (((eYear % 4 === 0) && (eYear % 100 !== 0)) || (eYear % 400 === 0)) {
                                        if(Number(chkingVar)>29 || Number(chkingVar)<0){
                                            fieldEmpty = true;
                                            dateMessUp = true;
                                        }
                                    }
                                    else {
                                        if(Number(chkingVar)>28 || Number(chkingVar)<0){
                                            fieldEmpty = true;
                                            dateMessUp = true;
                                        }
                                    }
                                }
                                break;
                            default:
                                fieldEmpty = true;
                                dateMessUp = true;
                                break;
                        }
                    }
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
        });
        if($('#editortimeselectorsthr').val() !== null && $('#editortimeselectorstmin').val() !== null && $('#editortimeselectoredhr').val() !== null && $('#editortimeselectoredmin').val() !== null){                        //selector id
                selectorEmpty = false;
        }
        if (fieldEmpty || selectorEmpty) {
            $('#editorsubmit').attr('disabled', 'disabled');        //editor submit button id;button should be a button not input.type."submit"
            chkOK = true;
        } else {
            $('#editorsubmit').removeAttr('disabled');
            chkOK = false;
        }
    });
    
    $( "#editorform select" ).change(function() {
        var fieldEmpty = false;
        var selectorEmpty = true;
        var chkOK = false;
        var dayPatt = new RegExp(/^(0?[1-9]|[12]\d|3[01])$/g);
        var monthPatt = new RegExp(/^(0?[1-9]|1[012])$/g);
        var yearPatt = new RegExp(/^(\d{4})$/g);
        var chkingVar;
        var eMonth = 0;
        var eYear = -1;
        var dateMessUp = false;
        eventOP = false;
        $('#editorform .eventeditorrequired').each(function() {
            if (!$(this).val()) {
                fieldEmpty = true;
            }
            else if($(this).attr('id') === "editoreventmonth"){
                chkingVar = $(this).val();
                if (monthPatt.test(chkingVar)) {
                    eMonth = Number(chkingVar);
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
            else if($(this).attr('id') === "editoreventyear"){
                chkingVar = $(this).val();
                if (yearPatt.test(chkingVar)) {
                    eYear = Number(chkingVar);
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
            else if($(this).attr('id') === "editoreventday"){
                chkingVar = $(this).val();
                if (dayPatt.test(chkingVar)) {
                    if (eMonth !== 0) {
                        switch (eMonth) {
                            case 1:
                            case 3:
                            case 5:
                            case 7:
                            case 8:
                            case 10:
                            case 12:
                                if(Number(chkingVar)>31 || Number(chkingVar)<0){
                                    fieldEmpty = true;
                                    dateMessUp = true;
                                }
                                break;
                            case 4:
                            case 6:
                            case 9:
                            case 11:
                                if(Number(chkingVar)>30 || Number(chkingVar)<0){
                                    fieldEmpty = true;
                                    dateMessUp = true;
                                }
                                break;
                            case 2:
                                if (eYear !== -1) {
                                    if (((eYear % 4 === 0) && (eYear % 100 !== 0)) || (eYear % 400 === 0)) {
                                        if(Number(chkingVar)>29 || Number(chkingVar)<0){
                                            fieldEmpty = true;
                                            dateMessUp = true;
                                        }
                                    }
                                    else {
                                        if(Number(chkingVar)>28 || Number(chkingVar)<0){
                                            fieldEmpty = true;
                                            dateMessUp = true;
                                        }
                                    }
                                }
                                break;
                            default:
                                fieldEmpty = true;
                                dateMessUp = true;
                                break;
                        }
                    }
                }
                else {
                    fieldEmpty = true;
                    dateMessUp = true;
                }
            }
        });
        if($('#editortimeselectorsthr').val() !== null && $('#editortimeselectorstmin').val() !== null && $('#editortimeselectoredhr').val() !== null && $('#editortimeselectoredmin').val() !== null){                        //selector id
                selectorEmpty = false;
        }
        if (fieldEmpty || selectorEmpty) {
            $('#editorsubmit').attr('disabled', 'disabled');        //editor submit button id;button should be a button not input.type."submit"
            chkOK = true;
        } else {
            $('#editorsubmit').removeAttr('disabled');
            chkOK = false;
        }
    }).trigger( "change" );
                                                                //form handled only by js
    $(window).keydown(function(event){          //disable all regular form submit function
        if((event.keyCode == 13)) {
          event.preventDefault();
        }
    });
}

function txEventOP() {                                          //call when submit pressed
    if (!$("#editorsubmit").is(":disabled")) {////////////////////////////////////////////////
        eventOP = true;
        compileEventData();
    }
}

function compileEventData() {
    var endTime = [];
    prepareToSend.eventid = Number(cleanseVar($("#editoreventid").val(), 3));        //hidden
    prepareToSend.title = cleanseVar($("#editoreventtitle").val(), 3);
    prepareToSend.description = cleanseVar($("#editoreventdescription").val(), 3);
    prepareToSend.eventday = Number(cleanseVar($('#editoreventday').val(), 3));
    prepareToSend.eventmonth = Number(cleanseVar($('#editoreventmonth').val(), 3));
    prepareToSend.eventyear = Number(cleanseVar($('#editoreventyear').val(), 3));
    prepareToSend.stHr = Number(cleanseVar($('#editortimeselectorsthr').val(), 3));
    prepareToSend.stMin = Number(cleanseVar($('#editortimeselectorstmin').val(), 3));
    endTime = fixEndTime(prepareToSend.stHr, prepareToSend.stMin, Number(cleanseVar($('#editortimeselectoredhr').val(), 3)), Number(cleanseVar($('#editortimeselectoredmin').val(), 3)));
    prepareToSend.edHr = endTime[0];
    prepareToSend.edMin = endTime[1];
    prepareToSend.duration = calDuration(prepareToSend.stHr, prepareToSend.stMin, prepareToSend.edHr, prepareToSend.edMin);
    prepareToSend.QTH = cleanseVar($("#editoreventqthinfo").val(), 3);
    updateView();
    clearEventEditor();
}

function deleteEvent(elementid) {
    var eventid2send = giveMeIdNumber(elementid);
    opTypeToSend = 3;
    eventOP = true;
    prepareToSend.eventid = eventid2send;
    updateView();
}

function startEventEditorAction(){
    $("#openmap").click(function(){
        var $what = $(this);
        $("#googlemapeditorbox").slideToggle(500, function(){
            if ($("#googlemapeditorbox").is(":visible")) {
                if ($("#editoreventqthinfo").val().trim().length) {
                genGoogleMap($("#editoreventqthinfo").val());
                }
                else {
                    genGoogleMap(null);
                }
            }
            else {
                destroyMap();
            }
            $what.text(function () {
            return $("#googlemapeditorbox").is(":visible") ? "Close Map" : "Open Map";
            });
        });
        
    });
    $("#editorsubmit").click(function() {
        txEventOP();
        $(this).prop("disabled",true);
    });
    $("#editorcancel").click(function() {
        clearEventEditor();
    });
}

//code adapted from http://stackoverflow.com/questions/18640181/how-to-display-latitude-longitude-of-google-maps-api-marker-in-html-text-box
function genGoogleMap(pos) {
    var mapCanvas = document.getElementById("googlemapeditorbox");
    var whereWasEvent = [];
    var eventHadQth = false;
    var posArray = [38.6421376,-90.2901827];
    var waitForClickToSetUpNewMarker;
    if (typeof pos === 'string' && pos.length > 3) {
        whereWasEvent = pos.split(",", 2);
        posArray[0] = parseFloat(whereWasEvent[0]);
        posArray[1] = parseFloat(whereWasEvent[1]);
        eventHadQth = true;
    }
    var myCenter = new google.maps.LatLng(posArray[0],posArray[1]);
    var mapOptions = {center: myCenter, zoom: 15};
    var map = new google.maps.Map(mapCanvas, mapOptions);
    if (eventHadQth) {
        placeMarker(map, myCenter);
    }
    else {
        waitForClickToSetUpNewMarker = google.maps.event.addListener(map, 'click', function addm(event) {
            placeMarker(map, event.latLng);
            google.maps.event.removeListener(waitForClickToSetUpNewMarker);
        });
    }
}
//code adapted from http://stackoverflow.com/questions/18640181/how-to-display-latitude-longitude-of-google-maps-api-marker-in-html-text-box
function placeMarker(map, location) {
    var marker = new google.maps.Marker({
            map:map,
            draggable:true,
            animation: google.maps.Animation.DROP,
            position: location
        });
    geocodePosition(marker.getPosition());
    $("#editoreventqthinfo").val(marker.position.toUrlValue());
    google.maps.event.addListener(marker, 'dragend', function() 
    {
        geocodePosition(marker.getPosition());
        $("#editoreventqthinfo").val(marker.position.toUrlValue());
    });
}

function geocodePosition(pos) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({latLng: pos}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) 
        {
            $("#editoreventqth").text(results[0].formatted_address);
        }
        else 
        {
            $("#editoreventqth").text('Cannot determine address at this location. '+status);
        }
    });
}

function destroyMap() {
    $("#googlemapeditorbox").empty();
}

function giveMeAddr(qthinfo) {
    var where;
    var locationinfo;
    var posArray = [];
    if (typeof qthinfo === 'string' && qthinfo.length > 3) {
        locationinfo = qthinfo.split(",", 2);
        posArray[0] = parseFloat(locationinfo[0]);
        posArray[1] = parseFloat(locationinfo[1]);
        where = new google.maps.LatLng(posArray[0],posArray[1]);
        geocodePosition(where);
    }
}

function genMsgBox() {                                      //CALL ONLY AT INTI WITH USER LOGGED IN     CSS display: none
    var whatstring;
    whatstring = "<div class=\"layer5box\" id=\"msgBox\">"+
        "<div class=\"exitbutton\" id=\"msgBoxClose\">&#10006;</div>"+
        "<div class=\"notetitle\" id=\"msgBoxEventTitle\"></div>"+
        "<div class=\"notedetail\" id=\"msgBoxEventDescription\"></div>"+
        "<div class=\"notedetail\" id=\"msgBoxEventTime\"></div>"+
        "<div class=\"notedetail\" id=\"msgBoxEventLocation\"></div><div class=\"notedetail\" id=\"msgBoxEventEdit\"></div></div>";
    $("#msgSpace").html(whatstring);
    $("#msgBox").css("display", "none");                //hide msgBox first
}

function fixEndTime(sth, stm, edh, edm) {
    var endTimeArray = [];
    var eh = 0;
    var em = 0;
    if ((edh * 60 + edm) > (sth * 60 + stm)) {
        eh = edh;
        em = edm;
    }
    else {
        eh = sth;
        em = stm;
    }
    endTimeArray[0] = eh;
    endTimeArray[1] = em;
    return endTimeArray;
}

function calDuration(sth, stm, edh, edm) {
    var duration = 0;
    duration = Math.floor((edh * 60 + edm - sth * 60 - stm) / 30);
    if (((edh * 60 + edm - sth * 60 - stm) % 30) > 0) {
        duration += 1;
    }
    if (duration <= 0) {
        duration = 1;
    }
    return duration;
}

function cleanseVar(vartocleanse, expectedtype) {         //expected type 1 pos number 2 string 3 both
    var varReady = false;
    var testVar = vartocleanse;
    switch (expectedtype) {
        case 1:
            if(typeof testVar === 'number'){
                if(testVar > 0){
                    varReady = true;
                }
            }
            break;
        case 2:
            if(typeof testVar === 'string'){
                if(testVar.length > 0){
                    varReady = true;
                }
            }
            break;
        case 3:
            if(typeof testVar === 'number'){
                if(testVar > 0){
                    varReady = true;
                }
            }
            else if (typeof testVar === 'string'){
                if(testVar.length > 0){
                    varReady = true;
                }
            }
            break;
        default:
            if(typeof testVar === 'number'){
                if(testVar > 0){
                    varReady = true;
                }
            }
            else if (typeof testVar === 'string'){
                if(testVar.length > 0){
                    varReady = true;
                }
            }
            break;
    }
    if (!varReady){
        testVar = null;
    }
    return testVar;
}

function searchEventWithId(eventid) {
    var i;
    var j;
    var idx = [];
    var flag = false;
    var found = null;
    var cardevent;
    var whatid;
    if (typeof eventid === 'string') {
        whatid = Number(eventid.replace(/\D/g,''));
    }
    else if (typeof eventid !== 'number') {
        return null;
    }
    else {
        whatid = eventid;
    }
    for (i=0;i<7;i++){
        if(lastData.days[i].cardEvent > 0){
            cardevent = lastData.days[i].cardEvent;
            for (j=0;j<cardevent;j++) {
                if(Number(lastData.days[i].events[j].id) === whatid){
                    idx[0] = i;
                    idx[1] = j;
                    flag = true;
                    found = lastData.days[i].events[j];
                    break;
                }
            }
        }
        if(flag){break;}
    }
    return found;
}

function opSuccessMsg(optype) {
    return optype;//cat related add new cat
}

function opFailMsg(optype, opmsg) {
    return optype, opmsg;//cat related add new cat
}

function giveMeTimeString( num ) {
    var temp;
    num = Number(num);
    if ( num < 10 ) {
        temp = "0" + String(num);
    }
    else {
        temp = String(num);
    }
    return temp;
}

function giveMeTimeCoordinate(toARuEvent) {
    var whatStTime;
    var whatEdTime;
    var result = [];
    whatStTime = toARuEvent.stHr * 2 + Math.floor(toARuEvent.stMin / 30);
    if ((toARuEvent.stMin % 30) > 15){
        whatStTime += 1;
    }
    whatEdTime = whatStTime + toARuEvent.duration;
    result[0] = whatStTime;
    result[1] = whatEdTime;
    return result;
}

function giveMeIdNumber(eventid) {
    if (typeof eventid === 'string') {
        return Number(eventid.replace(/\D/g,''));
    }
    else if (typeof eventid !== 'number') {
        return null;
    }
}

function clearUser() {
    user = null;
    $("#username.hiddenbox").val("");
    $(".eventeditor").html("");
    genUserCtrlAlpha();
}

function readMyUserName() {
    var myusername;
    myusername = $("#username.hiddenbox").val();
    myusername = cleanseVar(myusername, 2);
    return myusername;
}

function setUser() {
    if (lastData.loggedin === 1) {
        $("#username.hiddenbox").val(lastData.user);
        genUserCtrlBravo();
    }
    else {
        return false;
    }
    return true;
}

function loadMyUserName() {
    var myusername;
    myusername = readMyUserName();
    if (typeof myusername !== 'string' || myusername.length <= 3){
        myusername = null;
    }
    user = myusername;
    prepareToSend.user = myusername;
}

function clearToken() {
    $("#token.hiddenbox").val("");
}

function readMyToken() {
    var token;
    token = $("#token.hiddenbox").val();
    token = cleanseVar(token, 2);
    return token;
}

function setToken() {
    if (lastData.loggedin === 1) {
        $("#token.hiddenbox").val(lastData.token);
    }
    else {
        return false;
    }
    return true;
}

function loadMyToken() {
    var token;
    token = readMyToken();
    prepareToSend.token = token;
}

function cleanseJsonData() {
    var i;
    var j;
    lastData.triedlogin = Number(lastData.triedlogin);
    lastData.triedsignup = Number(lastData.triedsignup);
    lastData.loggedin = Number(lastData.loggedin);
    lastData.user = htmlEntities(lastData.user);
    lastData.token = htmlEntities(lastData.token);
    lastData.OPstatus = Number(lastData.OPstatus);
    lastData.OPtype = htmlEntities(lastData.OPtype);
    lastData.msg = htmlEntities(lastData.msg);
    lastData.viewType = Number(lastData.viewType);
    lastData.year = Number(lastData.year);
    lastData.month = Number(lastData.month);
    lastData.startDate = Number(lastData.startDate);
    lastData.endDateLastMonth = Number(lastData.endDateLastMonth);
    lastData.cardDay = Number(lastData.cardDay);
    lastData.startDayOfWeek = Number(lastData.startDayOfWeek);
    if (lastData.viewType === 0){
        for (i=0; i<lastData.cardDay; i++){
            if (Number(lastData.days[i].cardEvent) > 0){
                lastData.days[i].cardEvent = Number(lastData.days[i].cardEvent);
                for (j=0; j<lastData.days[i].cardEvent; j++){
                    if(lastData.days[i].events[j]) {
                        lastData.days[i].events[j].id = Number(lastData.days[i].events[j].id);
                        if(lastData.days[i].events[j].date){
                            lastData.days[i].events[j].date[0] = Number(lastData.days[i].events[j].date[0]);
                            lastData.days[i].events[j].date[1] = Number(lastData.days[i].events[j].date[1]);
                            lastData.days[i].events[j].date[2] = Number(lastData.days[i].events[j].date[2]);
                        }
                        lastData.days[i].events[j].title = htmlEntities(lastData.days[i].events[j].title);
                        lastData.days[i].events[j].description = htmlEntities(lastData.days[i].events[j].description);
                        lastData.days[i].events[j].stHr = Number(lastData.days[i].events[j].stHr);
                        lastData.days[i].events[j].stMin = Number(lastData.days[i].events[j].stMin);
                        lastData.days[i].events[j].edHr = Number(lastData.days[i].events[j].edHr);
                        lastData.days[i].events[j].edMin = Number(lastData.days[i].events[j].edMin);
                        lastData.days[i].events[j].duration = Number(lastData.days[i].events[j].duration);
                        lastData.days[i].events[j].QTH = htmlEntities(lastData.days[i].events[j].QTH);
                    }
                    else {
                        lastData.days[i].events[j] = null;
                    }
                }
            }
            else {
                lastData.days[i].cardEvent = 0;
            }
        }
    }
    else if (lastData.viewType === 1){
        for (i=0; i<7; i++){
            if (Number(lastData.days[i].cardEvent) > 0){
                lastData.days[i].cardEvent = Number(lastData.days[i].cardEvent);
                for (j=0; j<lastData.days[i].cardEvent; j++){
                    if(lastData.days[i].events[j]) {
                        lastData.days[i].events[j].id = Number(lastData.days[i].events[j].id);
                        if(lastData.days[i].events[j].date){
                            lastData.days[i].events[j].date[0] = Number(lastData.days[i].events[j].date[0]);
                            lastData.days[i].events[j].date[1] = Number(lastData.days[i].events[j].date[1]);
                            lastData.days[i].events[j].date[2] = Number(lastData.days[i].events[j].date[2]);
                        }
                        lastData.days[i].events[j].title = htmlEntities(lastData.days[i].events[j].title);
                        lastData.days[i].events[j].description = htmlEntities(lastData.days[i].events[j].description);
                        lastData.days[i].events[j].stHr = Number(lastData.days[i].events[j].stHr);
                        lastData.days[i].events[j].stMin = Number(lastData.days[i].events[j].stMin);
                        lastData.days[i].events[j].edHr = Number(lastData.days[i].events[j].edHr);
                        lastData.days[i].events[j].edMin = Number(lastData.days[i].events[j].edMin);
                        lastData.days[i].events[j].duration = Number(lastData.days[i].events[j].duration);
                        lastData.days[i].events[j].QTH = htmlEntities(lastData.days[i].events[j].QTH);
                    }
                    else {
                        lastData.days[i].events[j] = null;
                    }
                }
            }
            else {
                lastData.days[i].cardEvent = 0;
            }
        }
    }
}

function htmlEntities(stringToCleanse) {
    if (stringToCleanse){
        return String(stringToCleanse).replace(/'/g, '&#039;').replace(/"/g, '&quot;').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    else {
        return null;
    }
}
