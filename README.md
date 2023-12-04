# Serverless Application Readme

## Overview

This serverless application deploys a Lambda function using the Serverless Framework to process submissions triggered by SNS (Simple Notification Service). The Lambda function is designed to send email notifications about the submission, including details and the path in the Google Cloud Storage (GCS) bucket upon success or failure.

The application also utilizes DynamoDB to track email delivery for each submission.

## Prerequisites

Before deploying and testing the serverless application, make sure you have the following prerequisites:

- AWS Account
- Serverless Framework installed
- Google Cloud Storage bucket
- Valid SNS topic
- DynamoDB table

## Deployment

1. Clone this repository:
   ```bash
   git clone git@github.com:ShubhiMiradwal-CSYE-6225-Cloud/serverless.git

## Certificate Import

 application requires importing a certificate, use the following AWS CLI command:

```bash
aws ec2 create-launch-template-version --no-cli-pager \
  --launch-template-data "{\"ImageId\":\"your Image ID"}" \
  --source-version 1 --launch-template-name "your launch template name"
