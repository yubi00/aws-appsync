const aws = require('aws-sdk');
const db = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  console.log('#######EVENT######', JSON.stringify(event, null, 2));

  const date = new Date();
  const { userTodosTodoId } = event.arguments.input;
  const id = event.identity.claims.sub;
  const username = event.identity.claims['cognito:username'];

  if (id) {
    const params = {
      TableName: process.env.USERTABLE,
      FilterExpression: 'username = :_username',
      ExpressionAttributeValues: { ':_username': username },
    };

    try {
      const user = await db.scan(params).promise();

      //save data to the usertodostable

      await db
        .put({
          Item: {
            id,
            userTodosTodoId,
            userTodosUserId: user.Items[0].id,
            createdAt: date.toISOString(),
            updatedAt: date.toISOString(),
          },
          TableName: process.env.USERTODO_TABLE,
        })
        .promise();

      console.log('success query');
      return {
        id,
      };
    } catch (error) {
      console.log('Error: ', error);
    }

    context.done(null, event);
  } else {
    console.log('Error: Nothing was written to DynamoDB');
    context.done(null, event);
  }
};
