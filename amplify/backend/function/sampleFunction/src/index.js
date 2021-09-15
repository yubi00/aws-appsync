const { randomUUID } = require('crypto');

exports.handler = async (event) => {
  const { username, email } = event.arguments.input;
  return {
    id: randomUUID(),
    username: `sample ${username}`,
    email: `sample ${email}`,
  };
};
