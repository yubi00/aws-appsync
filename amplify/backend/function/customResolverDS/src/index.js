const aws = require('aws-sdk');
const { randomUUID } = require('crypto');
const db = new aws.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  console.log('#######EVENT######', JSON.stringify(event, null, 2));

  const date = new Date();
  const { userTodosTodoId } = event.arguments.input;
  const id = randomUUID();
  const username = event.identity.claims['cognito:username'];

  if (event.identity.claims.sub) {
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
      const resolvedFields = {
        id,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      };
      let todoFields = {};
      let userFields = {};

      //check is user is present in the nested fields ( selectionsetlist )
      if (event.selectionSetList.find((listItem) => listItem === 'user')) {
        userFields = {
          ...user.Items[0],
        };
      }

      //check is todo is present in the nested fields ( selectionsetlist )

      if (event.selectionSetList.find((listItem) => listItem === 'todo')) {
        const todo = await await db
          .get({
            Key: {
              id: userTodosTodoId,
            },
            TableName: process.env.TODO_TABLE,
          })
          .promise();

        todoFields = {
          ...todo.Item,
        };
      }

      return {
        ...resolvedFields,
        user: { ...userFields },
        todo: { ...todoFields },
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
