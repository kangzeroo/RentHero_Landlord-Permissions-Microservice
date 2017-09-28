// AWS SES (Simple Email Service) for sending emails via Amazon
const AWS = require('aws-sdk')

exports.sendStaffConfirmationEmail = function({ email, temp_pass }){
	const ses = new AWS.SES({
		region: 'us-east-1'
	})
	const p = new Promise((res, rej)=>{
		if(!email){
			rej('Missing user email')
		}else{
			console.log(email, temp_pass)
			const params = createStaffConfirmationParamsConfig(email, temp_pass)
			// console.log('Sending email with attached params!')
			AWS.config.credentials.refresh(function(){
				// console.log(AWS.config.credentials)
				ses.sendEmail(params, function(err, data) {
				  if(err){
				  	 // console.log(err, err.stack); // an error occurred
				  	 rej(err)
				  }else{
				  	console.log(data);           // successful response
					res('Success! Email sent')
				  }
				})
			})
		}
	})
	return p
}


function createStaffConfirmationParamsConfig(email, temp_pass){
	const params = {
	  Destination: { /* required */
	    BccAddresses: [
	      /* emails to be sent to but hidden from view */
	      /* more items */
	    ],
	    CcAddresses: [
	      /* more items */
	    ],
	    ToAddresses: [
	      email
	      /* more items */
	    ]
	  },
	  Message: { /* required */
	    Body: { /* required */
	      Html: {
	        Data: generateStaffInviteHTMLEmail(email, temp_pass),
	        Charset: 'UTF-8'
	      },
	      // Text: {
	      //   Data: tenantInfo.tenantMessage,
	      //   Charset: 'UTF-8'
	      // }
	    },
	    Subject: { /* required */
	      Data: 'Step 2: Login to Rentburrow.com with : ' + email, /* required */
	      Charset: 'UTF-8'
	    }
	  },
	  Source: 'support@rentburrow.com', /* required */
	  // ConfigurationSetName: 'STRING_VALUE',
	  ReplyToAddresses: [
	      'support@rentburrow.com',
	    /* more items */
	  ],
	  ReturnPath: 'support@rentburrow.com',
	  // ReturnPathArn: 'STRING_VALUE',
	  // SourceArn: 'STRING_VALUE',
	  Tags: [
	    {
	      Name: 'Type', /* required */
	      Value: 'Staff-Invite' /* required */
	    },
	    /* more items */
	  ]
	}
	return params
}


function generateStaffInviteHTMLEmail(email, temp_pass) {
	return `
		<!DOCTYPE html>
		<html>
		  <head>
		    <meta charset='UTF-8' />
		    <title>title</title>
		  </head>
		  <body>
		  	<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
		    <tr>
		        <td align='center' valign='top'>
		            <table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
		                <tr style='background-color:#99ccff;'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
		                            <tr>
		                                <td align='center' valign='top' style='color:#337ab7;'>
		                                    <h3>Welcome to Rentburrow. <a href='${generateLink(process.env.NODE_ENV, email, temp_pass)}'>Click here to join</a></h3>
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		    </table>
		  </body>
		</html>
	`
}

function generateLink(NODE_ENV, email, temp_pass) {
	let link = NODE_ENV === 'production' ? `https://rentburrow.com:8080/login?email=${email}${temp_pass ? `&temp_pass=${temp_pass}` : ''}` : `https://localhost:8080/login?email=${email}${temp_pass ? `&temp_pass=${temp_pass}` : ''}`
	return link
}



// ============= GENERICS ================== //

exports.sendAWSEmail = function({ email, message }){
	const ses = new AWS.SES({
		region: 'us-east-1'
	})
	const p = new Promise((res, rej)=>{
		if(!email|| message){
			rej('Missing user email or message content')
		}else{
			const params = createGenericParamsConfig(email, message)
			// console.log('Sending email with attached params!')
			AWS.config.credentials.refresh(function(){
				// console.log(AWS.config.credentials)
				ses.sendEmail(params, function(err, data) {
				  if(err){
				  	 // console.log(err, err.stack); // an error occurred
				  	 rej(err)
				  }else{
				  	console.log(data);           // successful response
					res('Success! Email sent')
				  }
				})
			})
		}
	})
	return p
}


// setup for AWS SES config
function createGenericParamsConfig(email, message){
	const params = {
	  Destination: { /* required */
	    BccAddresses: [
	      /* emails to be sent to but hidden from view */
	      /* more items */
	    ],
	    CcAddresses: [
	      /* more items */
	    ],
	    ToAddresses: [
	      email
	      /* more items */
	    ]
	  },
	  Message: { /* required */
	    Body: { /* required */
	      Html: {
	        Data: generateHTMLEmail(email, message),
	        Charset: 'UTF-8'
	      },
	      // Text: {
	      //   Data: tenantInfo.tenantMessage,
	      //   Charset: 'UTF-8'
	      // }
	    },
	    Subject: { /* required */
	      Data: 'Staff Invite to Rentburrow: ' + email, /* required */
	      Charset: 'UTF-8'
	    }
	  },
	  Source: 'support@rentburrow.com', /* required */
	  // ConfigurationSetName: 'STRING_VALUE',
	  ReplyToAddresses: [
	      'support@rentburrow.com',
	    /* more items */
	  ],
	  ReturnPath: 'support@rentburrow.com',
	  // ReturnPathArn: 'STRING_VALUE',
	  // SourceArn: 'STRING_VALUE',
	  Tags: [
	    {
	      Name: 'Type', /* required */
	      Value: 'Staff-Invite' /* required */
	    },
	    /* more items */
	  ]
	}
	return params
}


// generate the HTML email
function generateHTMLEmail(email, message){
	return `
		<!DOCTYPE html>
		<html>
		  <head>
		    <meta charset='UTF-8' />
		    <title>title</title>
		  </head>
		  <body>
		  	<table border='0' cellpadding='0' cellspacing='0' height='100%' width='100%' id='bodyTable'>
		    <tr>
		        <td align='center' valign='top'>
		            <table border='0' cellpadding='20' cellspacing='0' width='600' id='emailContainer'>
		                <tr style='background-color:#99ccff;'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailBody'>
		                            <tr>
		                                <td align='center' valign='top' style='color:#337ab7;'>
		                                    <h3>${message}</h3>
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		                <tr style='background-color:#74a9d8;'>
		                    <td align='center' valign='top'>
		                        <table border='0' cellpadding='20' cellspacing='0' width='100%' id='emailReply'>
		                            <tr style='font-size: 1.2rem'>
		                                <td align='center' valign='top'>
		                                    <span style='color:#286090; font-weight:bold;'>Send From:</span> <br/> ${email}
		                                </td>
		                            </tr>
		                        </table>
		                    </td>
		                </tr>
		            </table>
		        </td>
		    </tr>
		    </table>
		  </body>
		</html>
	`
}
