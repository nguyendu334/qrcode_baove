const pool = require("../config/db");

// =====================================================
// GET ALL POINTS
// GET /api/points
// =====================================================
exports.getPoints = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        point_code,
        point_name,
        area,
        description,
        qr_token,
        is_active,
        created_at,
        updated_at
      FROM patrol_points
      ORDER BY point_code ASC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("getPoints:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách điểm tuần tra",
    });
  }
};

// =====================================================
// GET POINT BY QR TOKEN
// GET /api/points/qr/:token
// =====================================================
exports.getPointByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        point_code,
        point_name,
        area
      FROM patrol_points
      WHERE qr_token = $1
        AND is_active = true
      `,
      [token],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "QR Code không hợp lệ hoặc điểm đã bị khóa",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("getPointByToken:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin điểm tuần tra",
    });
  }
};

// =====================================================
// CREATE POINT
// POST /api/points
// =====================================================
exports.createPoint = async (req, res) => {
  try {
    const { point_code, point_name, area, description } = req.body;

    if (!point_code || !point_name) {
      return res.status(400).json({
        success: false,
        message: "Mã điểm và tên điểm là bắt buộc",
      });
    }

    const exists = await pool.query(
      `
      SELECT id
      FROM patrol_points
      WHERE point_code = $1
      `,
      [point_code.trim()],
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mã điểm đã tồn tại",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO patrol_points
      (
        point_code,
        point_name,
        area,
        description
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        point_code,
        point_name,
        area,
        description,
        qr_token,
        is_active,
        created_at
      `,
      [
        point_code.trim(),
        point_name.trim(),
        area?.trim() || null,
        description?.trim() || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Thêm điểm tuần tra thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("createPoint:", error);

    res.status(500).json({
      success: false,
      message: "Không thể thêm điểm tuần tra",
    });
  }
};

// =====================================================
// UPDATE POINT
// PUT /api/points/:id
// =====================================================
exports.updatePoint = async (req, res) => {
  try {
    const { id } = req.params;

    const { point_code, point_name, area, description, is_active } = req.body;

    if (!point_code || !point_name) {
      return res.status(400).json({
        success: false,
        message: "Mã điểm và tên điểm là bắt buộc",
      });
    }

    const exists = await pool.query(
      `
      SELECT id
      FROM patrol_points
      WHERE point_code = $1
        AND id <> $2
      `,
      [point_code.trim(), id],
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mã điểm đã tồn tại",
      });
    }

    const result = await pool.query(
      `
      UPDATE patrol_points
      SET
        point_code = $1,
        point_name = $2,
        area = $3,
        description = $4,
        is_active = COALESCE($5, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING
        id,
        point_code,
        point_name,
        area,
        description,
        qr_token,
        is_active,
        updated_at
      `,
      [
        point_code.trim(),
        point_name.trim(),
        area?.trim() || null,
        description?.trim() || null,
        is_active,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy điểm tuần tra",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật điểm tuần tra thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("updatePoint:", error);

    res.status(500).json({
      success: false,
      message: "Không thể cập nhật điểm tuần tra",
    });
  }
};

// =====================================================
// DELETE POINT
// DELETE /api/points/:id
// =====================================================
exports.deletePoint = async (req, res) => {
  try {
    const { id } = req.params;

    // Không xóa cứng vì patrol_logs đang tham chiếu tới điểm
    const result = await pool.query(
      `
      UPDATE patrol_points
      SET
        is_active = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy điểm tuần tra",
      });
    }

    res.json({
      success: true,
      message: "Đã khóa điểm tuần tra",
    });
  } catch (error) {
    console.error("deletePoint:", error);

    res.status(500).json({
      success: false,
      message: "Không thể xóa điểm tuần tra",
    });
  }
};
