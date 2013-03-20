$(document).ready(function() {
    $('#getStudents').click(readStudents);    
    $('#getCurrentUser').click(alertCurrentUser);
});

function alertCurrentUser()
{
     var jqxhr = $.getJSON( "/currentuser" )
        .fail(function() { alert("error"); })
        .always(function() { });
 
    // Set another completion function for the request above
    jqxhr.done(function(data) { 
        alert(data.firstname)
    });

    // perform other work here ...
};

 
