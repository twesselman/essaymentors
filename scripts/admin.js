
$(document).ready(function() {
    $('#getStudents').click(readStudents);    
    $('#getCurrentUser').click(alertCurrentUser);
    $('#emInput').html(returnCurrentUser());
});
