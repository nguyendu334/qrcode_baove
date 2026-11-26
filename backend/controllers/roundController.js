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
      ORDER BY start_time ASC
    `);

    const rounds = result.rows;
    const now = new Date();
    const currentHour = now.getHours();
    const currentTimeStr = now.toTimeString().split(" ")[0]; // "15:09:00"

    const isDayShift = currentHour >= 6 && currentHour < 18;
    const formatTime = (t) => (t ? t.slice(0, 5) : "");

    // 1. Tìm vòng đang diễn ra ĐÚNG KHUNG GIỜ
    let currentRoundIndex = rounds.findIndex((r) => {
      const start = r.start_time;
      const end = r.end_time;
      if (start > end) {
        return currentTimeStr >= start || currentTimeStr <= end;
      }
      return currentTimeStr >= start && currentTimeStr <= end;
    });

    let currentRoundTime = "--:--";
    let nextRoundTime = "--:--";

    if (currentRoundIndex !== -1) {
      // Đang ĐÚNG TRONG GIỜ của một vòng tuần tra
      const currentRound = rounds[currentRoundIndex];
      const nextRound = rounds[(currentRoundIndex + 1) % rounds.length];

      currentRoundTime = `${formatTime(currentRound.start_time)} - ${formatTime(currentRound.end_time)}`;
      nextRoundTime = `${formatTime(nextRound.start_time)} - ${formatTime(nextRound.end_time)}`;
    } else {
      // Đang TRONG GIỜ NGHỈ / CHỜ VÒNG TIẾP THEO
      const nextRoundIndex = rounds.findIndex(
        (r) => r.start_time > currentTimeStr,
      );
      const nextRound =
        nextRoundIndex !== -1 ? rounds[nextRoundIndex] : rounds[0];

      currentRoundTime = "--:--";
      nextRoundTime = `${formatTime(nextRound.start_time)} - ${formatTime(nextRound.end_time)}`;
    }

    res.json({
      success: true,
      data: rounds,
      currentInfo: {
        shiftText: isDayShift ? "Ca ngày" : "Ca đêm",
        shiftType: isDayShift ? "day" : "night",
        currentRoundTime,
        nextRoundTime,
      },
    });
  } catch (error) {
    console.error("getRounds error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};

exports.updatePatrolRound = async (req, res) => {
  try {
    const { id } = req.params;
    const { round_name, start_time, end_time, is_active } = req.body;

    const result = await pool.query(
      `
      UPDATE patrol_rounds
      SET 
        round_name = COALESCE($1, round_name),
        start_time = COALESCE($2, start_time),
        end_time = COALESCE($3, end_time),
        is_active = COALESCE($4, is_active)
      WHERE id = $5
      RETURNING *
      `,
      [round_name, start_time, end_time, is_active, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vòng tuần tra",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật vòng tuần tra thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("updatePatrolRound error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật vòng tuần tra",
    });
  }
};

// Thêm mới vòng tuần tra
exports.createPatrolRound = async (req, res) => {
  try {
    const { round_name, start_time, end_time, is_active } = req.body;

    if (!round_name || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên vòng và khung giờ",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO patrol_rounds (round_name, start_time, end_time, is_active)
      VALUES ($1, $2, $3, COALESCE($4, true))
      RETURNING *
      `,
      [round_name, start_time, end_time, is_active],
    );

    res.status(201).json({
      success: true,
      message: "Thêm vòng tuần tra thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("createPatrolRound error:", error);
    res.status(500).json({
      success: false,
      message: "Không thể thêm vòng tuần tra",
    });
  }
};
