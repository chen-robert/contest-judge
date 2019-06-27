const getPopups = session => {
  const error = session.error;
  const message = session.message;

  session.error = undefined;
  session.message = undefined;

  return { error, message };
};

const renderWithPopups = (req, res, view, data = {}) => {
  const { error, message } = getPopups(req.session);

  res.render(view, { ...data, error, message });
};

module.exports = { getPopups, renderWithPopups };
