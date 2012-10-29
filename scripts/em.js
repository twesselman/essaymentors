$(document).ready(function() {
	$('#getStudents').click(readStudents);
	$('#signUp').click(signUp);
	$('#signIn').click(signIn);
});

$('#createform2').submit(function() {
    alert('hi');
});

function onCreateStudent()
{
	var xmlHttp = null;
	sUrl = "/createstudent";
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", sUrl, false );
    xmlHttp.send( null );
}

function signUp() {
	alert('signUp');
}

function signIn() {
	alert('signIn');
}

function createStudent() {
	// no longer used
    var firstname = document.getElementById("firstname").value;
	var lastname = document.getElementById("lastname").value;
	var xmlHttp = null;
	sUrl = "/createstudent?firstname=" + firstname + "&lastname=" + lastname;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", sUrl, false );
    xmlHttp.send( null );
    document.getElementById("results").value=xmlHttp.responseText;
}

function readStudents() {
	var xmlHttp = null;
	sUrl = "/students";
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", sUrl, false );
    xmlHttp.send( null );
    var resultsStudents="";
    var students=xmlHttp.responseText;
    alert(students);
    var arrayStudents = JSON.parse(students);

    var r = new Array();
    var j = -1;
    
    r[++j] = '<tr>';
    r[++j] = '<th>First</th>';
    r[++j] = '<th>Last</th>';
    r[++j] = '<tr>';
    
 	for (index in arrayStudents){
     r[++j] ='<tr><td>';
     r[++j] = arrayStudents[index].firstname;
     r[++j] = '</td><td>';
     r[++j] = arrayStudents[index].lastname;
     r[++j] = '</td></tr>';
 	}
console.log(r.join(''));
$('#tableResults').html(r.join('')); 
}

