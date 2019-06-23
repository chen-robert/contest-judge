const getPopups = session => {
  const error = session.error;
  const message = session.message;

  session.error = undefined;
  session.message = undefined;

  return { error, message };
};

module.exports = { getPopups };
