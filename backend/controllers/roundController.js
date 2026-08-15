const pool = require("../config/db");

exports.getRounds = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        round_name,
        start_time,
        end_time,
        is_active
      FROM patrol_rounds
      ORDER BY start_time
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("getRounds:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách vòng tuần tra",
    });
  }
};
