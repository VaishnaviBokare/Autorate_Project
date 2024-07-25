$(document).ready(function() {
    // Fetch companies data from Flask backend
    $.get('/get_companies', function(data) {
        var companyDropdown = $('#company');
        data.forEach(function(company) {
            companyDropdown.append($('<option>').text(company).attr('value', company));
        });
    });
});
