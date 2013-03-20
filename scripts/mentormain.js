$(document).ready(function() {
    $('#getStudents').click(readStudents);  
        
    appendCurrentUser();
});

function appendCurrentUser() {
     var jqxhr = $.getJSON( "/currentuser" )
        .fail(function() { alert("error"); })
        .always(function() { });
 
    // Set another completion function for the request above
    jqxhr.done(function(data) { 
        $('#emCurrentUser').append(data.firstname + ' ' + data.lastname);
    });
};
