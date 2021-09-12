const aws = require('aws-sdk');
const ddb = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  let date = new Date();
  if (event.request.userAttributes.sub) {
    let params = {
      TableName: process.env.USERTABLE,
      FilterExpression: 'username = :_username',
      ExpressionAttributeValues: { ':_username': event.userName },
    };

    try {
      const user = await ddb.scan(params).promise();

      await ddb
        .update({
          TableName: process.env.USERTABLE,
          Key: {
            id: user.Items[0].id,
          },
          UpdateExpression:
            'set account_status = :s, email_verified= :e, updatedAt = :u',
          ExpressionAttributeValues: {
            ':e': event.request.userAttributes.email_verified,
            ':s': event.request.userAttributes['cognito:user_status'],
            ':u': date.toISOString(),
          },
          ReturnValues: 'ALL_NEW',
        })
        .promise();
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
