


$(document).ready(function() {
    $('#getStudents').click(readStudents);    
    $('#getCurrentUser').click(alertCurrentUser);
    $('#signUp').click(signUp);
    $('#signIn').click(signIn);
    $('#emInput').html(returnCurrentUser());
});

