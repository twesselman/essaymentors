$(document).ready(function() {
    $('#getStudents').click(readStudents);    
    $('#getCurrentUser').click(readCurrentUser);
    $('#signUp').click(signUp);
	$('#signIn').click(signIn);
    
    $('#emInput').html(returnCurrentUser());
});

$('#createform2').submit(function() {
    alert('hi');
});
