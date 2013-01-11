$(document).ready(function() {
    $('#getStudents').click(readStudents);  
        
    $('#emCurrentUser').append(returnCurrentUser());
});

function returnCurrentUser() {
    var xmlHttp = null;
    sUrl = "/currentuser";
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", sUrl, false );
    xmlHttp.send ( null );
    return xmlHttp.responseText;
};