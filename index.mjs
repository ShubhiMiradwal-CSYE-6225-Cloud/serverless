import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
import AWS from 'aws-sdk';
const mailgun = new Mailgun(FormData);
const mailgunApiKey = process.env.MAILGUN_API_KEY;
const mailgunDomain = process.env.MAILGUN_DOMAIN;
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoDBTable= process.env.DYNAMODB_TABLE_NAME;

const storage = new Storage({
    credentials: JSON.parse(process.env.GCS_CREDS),
});

export const handler = async (event) => {
    
        const snsMessage = JSON.parse(event.Records[0].Sns.Message);
        const fileName = snsMessage.submission_url.substring(snsMessage.submission_url.lastIndexOf('/') + 1);
        const fileloc = "Assignment - " + snsMessage.assignment_id + " / " + snsMessage.email + " / " + snsMessage.submissionlength + " / " + fileName;
        const gcsBucket = process.env.GCS_BUCKET;
        const url = snsMessage.submission_url;
        try{
            const bucketObj = storage.bucket(gcsBucket)
            const file = bucketObj.file(fileloc);
            const fileCon = await downloadFile(url);
            const txt="Email sent successfully to the location"
            await file.save(fileCon);
            const result = await sendMail(snsMessage.email, "Assignment Submission Successfull", `Your assignment: ${snsMessage.assignment_name} has been successfully updated to GCP location: ${fileloc}`,snsMessage,fileloc,txt);
        }
        catch(err){
            console.log(err)
            const txt="Email not sent successfully to the location because of invaild URL"
            const result = await sendMail(snsMessage.email, "Assignment Submission is UnSuccessfull", `Your assignment: ${snsMessage.assignment_name} has been not updated to GCP location: ${fileloc}`,snsMessage,fileloc, txt);
        }



async function downloadFile(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
}

async function sendMail(to, subject, text,snsMessage,fileloc,txt){
    const client = mailgun.client({ username: 'api', key: mailgunApiKey });
    const messageData = {
        from: "Shubhi Miradwal <webapp@shubhimiradwal.me>",
        to: [to],
        subject: subject,
        text: text,
    };
    try{
        const response = await client.messages.create(mailgunDomain, messageData);
        await sendToDynamoDB(snsMessage,fileloc,txt);
        return response;
    }
    catch(err){
        console.log(err)
    }  
}

async function sendToDynamoDB(snsMessage,fileloc,txt)
{
    let dynamoDBParams = {
        TableName: dynamoDBTable,
        Item: {
            id: Math.floor(Math.random()*100000),
            assignment_id: snsMessage.assignment_id,
            email: snsMessage.email,
            num_attempts:snsMessage.submissionlength,
            file_location: fileloc,
            timestamp: new Date().toISOString(),
            Failure_Reason:txt
        },
    };
    await dynamoDB.put(dynamoDBParams).promise();        
};
}
