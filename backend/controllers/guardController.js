const pool = require("../config/db");

// GET
exports.getGuards = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        guard_code,
        full_name,
        phone,
        is_active,
        created_at
      FROM guards
      ORDER BY full_name DESC
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách bảo vệ",
    });
  }
};

// CREATE
exports.createGuard = async (req, res) => {
  try {
    const { guard_code, full_name, phone } = req.body;

    if (!guard_code || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Mã bảo vệ và họ tên là bắt buộc",
      });
    }

    const exists = await pool.query(
      `
      SELECT id
      FROM guards
      WHERE guard_code = $1
      `,
      [guard_code.trim()],
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Mã bảo vệ đã tồn tại",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO guards
      (
        guard_code,
        full_name,
        phone
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [guard_code.trim(), full_name.trim(), phone?.trim() || null],
    );

    res.status(201).json({
      success: true,
      message: "Thêm bảo vệ thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Không thể thêm bảo vệ",
    });
  }
};

// UPDATE
exports.updateGuard = async (req, res) => {
  try {
    const { id } = req.params;

    const { guard_code, full_name, phone, is_active } = req.body;

    if (!guard_code || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Mã bảo vệ và họ tên là bắt buộc",
      });
    }

    const result = await pool.query(
      `
      UPDATE guards
      SET
        guard_code = $1,
        full_name = $2,
        phone = $3,
        is_active = COALESCE($4, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
      `,
      [
        guard_code.trim(),
        full_name.trim(),
        phone?.trim() || null,
        is_active,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bảo vệ",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật bảo vệ thành công",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Không thể cập nhật bảo vệ",
    });
  }
};

// DELETE / LOCK
exports.deleteGuard = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE guards
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
        message: "Không tìm thấy bảo vệ",
      });
    }

    res.json({
      success: true,
      message: "Đã khóa bảo vệ",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Không thể khóa bảo vệ",
    });
  }
};
