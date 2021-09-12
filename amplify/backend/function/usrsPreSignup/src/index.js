const { DynamoDB } = require('aws-sdk');
const { randomUUID } = require('crypto');
const ddb = new DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  console.log('EVENT###', JSON.stringify(event, null, 2));

  let date = new Date();
  if (event.request.userAttributes.email) {
    let params = {
      Item: {
        id: randomUUID(),
        username: event.userName,
        email: event.request.userAttributes.email,
        email_verified: event.response.autoVerifyEmail,
        status: event.response.autoConfirmUser,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      },
      TableName: process.env.USERTABLE,
    };

    try {
      await ddb.put(params).promise();
      console.log('Success');
    } catch (err) {
      console.log('Error', err);
    }
    context.done(null, event);
  } else {
    console.log('Error: Nothing was written to DynamoDB');
    context.done(null, event);
  }
};
