const db = require('../persistence');

module.exports = async (req, res) => {
  try {
    await db.deleteAllItems();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
