# NodeJsRepo

# Task2: NodeJsTask2 folder

# Task 2: (2022-07-27)

a) localhost:3003 should display a page.

    Enter Valid Email: Text Box
    Subject: Text Box
    Message: Text Area
    Submit Button (Send Email)

b) Endpoint :  localhost:3003/sendmail
    email format validation, all fields are required.
    Send Email using your gmail credentials.

c) If email sent successfully, redirect to localhost:3003/success & show some success message.
    other wise redirect to localhost:3003/failed & show an error message.

Add home button in both success & failed pages.


# Endpoint: localhost:3003 to get home page to send email with require parameters
# post email as post method with endpoint localhost:3003/sendmail
# send Mail from nodemailer with required transporter 
# If email is send then get localhost:3003/success page other wise redirect to localhost:3003/failed page 