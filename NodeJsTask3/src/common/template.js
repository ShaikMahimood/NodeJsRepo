function getHtmlContent(){
    const html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Puppeteer PDF Generation Using Handlebars Template</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
    </head>
    
    <body>

    
        <div class="container">
        <br>
        <img src="{{image}}" width=20%/>
            <h1 class="text-center">
                PATIENT REPORT
            </h1>
            <br/>
        <br>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Prepared For</th>
                        <th>Requested By</th>
                        <th>Generated On</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{officeName}}</td>
                        <td>Mahimood</td>
                        <td>{{dateCreated}}</td>
                    </tr>
                </tbody>
            </table>
            <br>
            <table class="table table-bordered">
                <tr>
                    <th colspan="2" >Patient Info</th>
                </tr>
                <tbody>
                    <tr>
                        <td style="padding-left: 5px;
                     padding-bottom: 3px;">
                            <strong style="font-size: 20px;">{{firstname}} {{lastname}}</strong><br />
                            DOB: {{dob}} (Age: {{age}}) yrs, {{gender}} <br>
                            Mobile: {{phone}}
                        </td>
                        <td>Email: {{email}}
                            <br>
                            Address: {{address.line1}}, {{address.line2}}, {{address.city}}, {{address.state}},
                            {{address.zip}}
    
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
    
    </html>`;
    return html;
}

module.exports = { getHtmlContent };