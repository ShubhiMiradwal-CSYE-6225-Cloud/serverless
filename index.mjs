import { Storage } from '@google-cloud/storage';
import axios from 'axios';
import Mailgun from 'mailgun.js';
import FormData from 'form-data';
const mailgun = new Mailgun(FormData);

const mailgunApiKey = process.env.MAILGUN_API_KEY;
const mailgunDomain = process.env.MAILGUN_DOMAIN;
const senderEmailId = "miradwal.s@northeastern.edu";
const mg = mailgun.client({ username: "api", key: mailgunApiKey });


const storage = new Storage({
    credentials: JSON.parse(process.env.GCS_CREDS),
});

export const handler = async (event) => {
    if (event.Records && event.Records.length > 0 && event.Records[0].Sns) {
        const snsMessage = JSON.parse(event.Records[0].Sns.Message);
        const fileName = snsMessage.submission_url.substring(snsMessage.submission_url.lastIndexOf('/') + 1);
        const fileloc = "Assignment - " + snsMessage.assignment_id + " / " + snsMessage.email + " / " + snsMessage.submissionlength + " / " + fileName;
        const gcsBucket = process.env.GCS_BUCKET;
        const url = snsMessage.submission_url;
        const bucketObj = storage.bucket(gcsBucket)
        const file = bucketObj.file(fileloc);
        const fileCon = await downloadFile(url);
        await file.save(fileCon, {
            metadata: {
                contentType: 'application/javascript',
            },

    });
    count=count-1;
    const client = mailgun.client({ username: 'api', key: mailgunApiKey });
    let messageData;
    messageData = {
        from: "Shubhi Miradwal <webapp@shubhimiradwal.me>",
        to: [snsMessage.email],
        subject: "Assignment submission success by",
        text: "Your submission was successful.",
    };

    try {
        const response = await client.messages.create(mailgunDomain, messageData);
        console.log("Email sent successfully:", response);

        return {
            statusCode: 200,
            body: JSON.stringify('Lambda function successful'),
        };
    } catch (error) {
        console.error("Error sending email:", error);

        return {
            statusCode: 500,
            body: JSON.stringify('Lambda function failed to send email'),
        };
    }
   }
   else {
    
    let messageData;
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);

    const client = mailgun.client({ username: 'api', key: mailgunApiKey });
    messageData = {
        from: "Shubhi Miradwal <webapp@shubhimiradwal.me>",
        to: [snsMessage.email],
        subject: "Assignment submission unsuccess",
        text: "Your submission was unsuccessful.",
    };

    try {
        const response = await client.messages.create(mailgunDomain, messageData);
        console.log("Email sent successfully:", response);

        return {
            statusCode: 400,
            body: JSON.stringify('Lambda function unsuccessful'),
        };
    } catch (error) {
        console.error("Error sending email:", error);

        return {
            statusCode: 500,
            body: JSON.stringify('Lambda function failed to send email'),
        };
    }
    }


};
async function downloadFile(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
}