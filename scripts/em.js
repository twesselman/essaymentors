$(document).ready(function() {
    $('.em_logo').click(function() {window.location.href = "admin.html";});  
});

function onCreateStudent() {
    // no longer used
	var xmlHttp = null;
	var sUrl = "/createstudent";
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", sUrl, false );
    xmlHttp.send( null );
}

function createStudent() {
	// no longer used
    var firstname = document.getElementById("firstname").value;
	var lastname = document.getElementById("lastname").value;
	var xmlHttp = null;
	var sUrl = "/createstudent?firstname=" + firstname + "&lastname=" + lastname;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", sUrl, false );
    xmlHttp.send( null );
    document.getElementById("results").value=xmlHttp.responseText;
}

function returnCurrentUser() {
    var xmlHttp = null;
    var sUrl = "/currentuser";
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", sUrl, false );
    xmlHttp.send ( null );
    return xmlHttp.responseText;
}

function alertCurrentUser() {
    alert(returnCurrentUser());
}

function readStudents() {
	var xmlHttp = null;
	var sUrl = "/students";
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", sUrl, false );
    xmlHttp.send( null );
    var students=xmlHttp.responseText;
    var arrayStudents = JSON.parse(students);

    var r = new Array();
    var j = -1;
    
    r[++j] = '<tr>';
    r[++j] = '<th>First</th>';
    r[++j] = '<th>Last</th>';
    r[++j] = '<tr>';
    
    for (var index in arrayStudents) {
     r[++j] ='<tr><td>';
     r[++j] = arrayStudents[index].firstname;
     r[++j] = '</td><td>';
     r[++j] = arrayStudents[index].lastname;
     r[++j] = '</td></tr>';
    }
    console.log(r.join(''));
    $('#tableResults').html(r.join('')); 
}

