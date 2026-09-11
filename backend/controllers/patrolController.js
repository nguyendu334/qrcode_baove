const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

// =====================================================
// CHECK PATROL
// POST /api/patrol/check
// =====================================================
exports.checkPatrol = async (req, res) => {
  const client = await pool.connect();

  // Hàm hỗ trợ dọn dẹp file ảnh nếu request thất bại hoặc bị hủy
  const removeUploadedFile = () => {
    if (req.file) {
      const filePath = path.join(__dirname, "..", req.file.path);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Lỗi khi xóa file ảnh rác:", err);
        }
      }
    }
  };

  try {
    const { guard_id, patrol_point_id, note } = req.body;

    // Lấy đường dẫn tĩnh phục vụ lưu trữ CSDL
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!guard_id || !patrol_point_id) {
      removeUploadedFile();
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bảo vệ hoặc điểm tuần tra",
      });
    }

    /*
     * =====================================================
     * THÔNG TIN THIẾT BỊ
     * =====================================================
     */
    const deviceInfo = req.headers["user-agent"] || "Unknown";

    let ipAddress =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      req.ip ||
      null;

    if (ipAddress && ipAddress.includes(",")) {
      ipAddress = ipAddress.split(",")[0].trim();
    }

    if (ipAddress === "::1") {
      ipAddress = "127.0.0.1";
    }

    if (ipAddress?.startsWith("::ffff:")) {
      ipAddress = ipAddress.replace("::ffff:", "");
    }

    await client.query("BEGIN");

    /*
     * =====================================================
     * 1. KIỂM TRA BẢO VỆ
     * =====================================================
     */
    const guardResult = await client.query(
      `
        SELECT
          id,
          guard_code,
          full_name
        FROM guards
        WHERE id = $1
          AND is_active = TRUE
      `,
      [guard_id],
    );

    if (guardResult.rows.length === 0) {
      await client.query("ROLLBACK");
      removeUploadedFile();
      return res.status(404).json({
        success: false,
        message: "Bảo vệ không tồn tại hoặc đã bị khóa",
      });
    }

    /*
     * =====================================================
     * 2. KIỂM TRA ĐIỂM
     * =====================================================
     */
    const pointResult = await client.query(
      `
        SELECT
          id,
          point_code,
          point_name,
          area
        FROM patrol_points
        WHERE id = $1
          AND is_active = TRUE
      `,
      [patrol_point_id],
    );

    if (pointResult.rows.length === 0) {
      await client.query("ROLLBACK");
      removeUploadedFile();
      return res.status(404).json({
        success: false,
        message: "Điểm tuần tra không tồn tại",
      });
    }

    /*
     * =====================================================
     * 3. XÁC ĐỊNH VÒNG HIỆN TẠI
     * =====================================================
     */
    const roundResult = await client.query(`
      SELECT
        id,
        round_name,
        start_time,
        end_time
      FROM patrol_rounds
      WHERE is_active = TRUE
        AND CURRENT_TIME >= start_time
        AND CURRENT_TIME <= end_time
      ORDER BY start_time
      LIMIT 1
    `);

    if (roundResult.rows.length === 0) {
      await client.query("ROLLBACK");
      removeUploadedFile();
      return res.status(400).json({
        success: false,
        message: "Hiện tại không nằm trong thời gian tuần tra",
      });
    }

    const round = roundResult.rows[0];

    /*
     * =====================================================
     * 4. KIỂM TRA ĐÃ CHECK TRONG VÒNG NÀY CHƯA
     * =====================================================
     */
    const duplicateResult = await client.query(
      `
        SELECT
          pl.id,
          pl.checked_at,
          pl.guard_id,
          g.guard_code,
          g.full_name AS guard_name
        FROM patrol_logs pl

        INNER JOIN guards g
          ON g.id = pl.guard_id

        WHERE pl.patrol_point_id = $1
          AND pl.round_id = $2
          AND pl.checked_at::date = CURRENT_DATE

        LIMIT 1
      `,
      [patrol_point_id, round.id],
    );

    if (duplicateResult.rows.length > 0) {
      await client.query("ROLLBACK");
      removeUploadedFile(); // Xóa ảnh rác lập tức khi phát hiện bị trùng lượt check

      const existing = duplicateResult.rows[0];

      return res.status(409).json({
        success: false,
        message: "Điểm này đã được xác nhận trong vòng tuần tra hiện tại",
        data: {
          checked_at: existing.checked_at,
          guard_id: existing.guard_id,
          guard_code: existing.guard_code,
          guard_name: existing.guard_name,
          round_name: round.round_name,
        },
      });
    }

    /*
     * =====================================================
     * 5. GHI NHẬN TUẦN TRA (NẾU HỢP LỆ MỚI GIỮ ẢNH)
     * =====================================================
     */
    const insertResult = await client.query(
      `
        INSERT INTO patrol_logs
        (
          guard_id,
          patrol_point_id,
          round_id,
          checked_at,
          device_info,
          ip_address,
          note,
          photo_url
        )
        VALUES
        (
          $1,
          $2,
          $3,
          CURRENT_TIMESTAMP,
          $4,
          $5,
          $6,
          $7
        )
        RETURNING *
      `,
      [
        guard_id,
        patrol_point_id,
        round.id,
        deviceInfo,
        ipAddress,
        note?.trim() || null,
        photo_url,
      ],
    );

    await client.query("COMMIT");

    /*
     * =====================================================
     * 6. RESPONSE
     * =====================================================
     */
    res.json({
      success: true,
      message: "Xác nhận tuần tra thành công",
      data: {
        log: insertResult.rows[0],
        guard: guardResult.rows[0],
        point: pointResult.rows[0],
        round,
        device_info: deviceInfo,
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    removeUploadedFile(); // Xóa ảnh rác nếu gặp sự cố hệ thống/CSDL

    console.error("checkPatrol error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể xác nhận tuần tra",
    });
  } finally {
    client.release();
  }
};

// =====================================================
// GET HISTORY
//
// GET /api/patrol/history
//
// ?date=2026-08-12
// ?guard_id=1
// ?point_id=uuid
// ?search=nguyen
// =====================================================
exports.getHistory = async (req, res) => {
  try {
    const { date, guard_id, point_id, search } = req.query;

    const conditions = [];
    const values = [];

    let index = 1;

    /*
     * =====================================================
     * DATE
     * =====================================================
     */

    if (date) {
      conditions.push(`
        pl.checked_at >= $${index}::date
        AND pl.checked_at < ($${index}::date + INTERVAL '1 day')
      `);

      values.push(date);
      index++;
    }

    /*
     * =====================================================
     * GUARD
     * =====================================================
     */

    if (guard_id) {
      conditions.push(`pl.guard_id = $${index}`);

      values.push(guard_id);
      index++;
    }

    /*
     * =====================================================
     * POINT
     * =====================================================
     */

    if (point_id) {
      conditions.push(`pl.patrol_point_id = $${index}`);

      values.push(point_id);
      index++;
    }

    /*
     * =====================================================
     * SEARCH
     * =====================================================
     */

    if (search) {
      conditions.push(`
        (
          LOWER(g.full_name) LIKE LOWER($${index})
          OR LOWER(g.guard_code) LIKE LOWER($${index})
          OR LOWER(pp.point_name) LIKE LOWER($${index})
          OR LOWER(pp.point_code) LIKE LOWER($${index})
          OR LOWER(pp.area) LIKE LOWER($${index})
        )
      `);

      values.push(`%${search}%`);
      index++;
    }

    /*
     * =====================================================
     * WHERE
     * =====================================================
     */

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    /*
     * =====================================================
     * QUERY
     * =====================================================
     */

    const query = `
      SELECT
        pl.id,
        pl.checked_at,

        g.id AS guard_id,
        g.guard_code,
        g.full_name AS guard_name,

        pp.id AS point_id,
        pp.point_code,
        pp.point_name,
        pp.area,

        pl.device_info,
        pl.ip_address,
        pl.note,
        pl.photo_url,

        pr.id AS round_id,
        pr.round_name,
        pr.start_time,
        pr.end_time

      FROM patrol_logs pl

      INNER JOIN guards g
        ON g.id = pl.guard_id

      INNER JOIN patrol_points pp
        ON pp.id = pl.patrol_point_id

      LEFT JOIN patrol_rounds pr
        ON pr.id = pl.round_id

      ${whereClause}

      ORDER BY pl.checked_at DESC

      LIMIT 500
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("getHistory:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy lịch sử tuần tra",
    });
  }
};

// =====================================================
// MONTHLY HISTORY
//
// GET /api/patrol/history/month?month=2026-08
// =====================================================
exports.getMonthlyHistory = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tháng",
      });
    }

    const result = await pool.query(
      `
        WITH days AS
        (
          SELECT
            generate_series(
              $1::date,
              (
                $1::date
                + INTERVAL '1 month'
                - INTERVAL '1 day'
              )::date,
              INTERVAL '1 day'
            )::date AS patrol_date
        ),

        daily AS
        (
          SELECT

            DATE(pl.checked_at)
              AS patrol_date,

            COUNT(pl.id)
              AS total_checks,

            COUNT(
              DISTINCT pl.guard_id
            ) AS total_guards,

            COUNT(
              DISTINCT pl.patrol_point_id
            ) AS total_points

          FROM patrol_logs pl

          WHERE

            pl.checked_at >= $1::date

            AND

            pl.checked_at <
            (
              $1::date
              + INTERVAL '1 month'
            )

          GROUP BY
            DATE(pl.checked_at)
        )

        SELECT

          days.patrol_date,

          COALESCE(
            daily.total_checks,
            0
          ) AS total_checks,

          COALESCE(
            daily.total_guards,
            0
          ) AS total_guards,

          COALESCE(
            daily.total_points,
            0
          ) AS total_points

        FROM days

        LEFT JOIN daily
          ON daily.patrol_date =
             days.patrol_date

        ORDER BY
          days.patrol_date
        `,
      [`${month}-01`],
    );

    res.json({
      success: true,

      data: result.rows,
    });
  } catch (error) {
    console.error("getMonthlyHistory:", error);

    res.status(500).json({
      success: false,

      message: "Không thể lấy thống kê tháng",
    });
  }
};

// =====================================================
// DASHBOARD
//
// GET /api/patrol/dashboard?date=2026-08-12
// =====================================================
exports.getDashboard = async (req, res) => {
  try {
    /*
     * =====================================================
     * 1. THÔNG TIN TỔNG QUAN
     * =====================================================
     */

    const summaryResult = await pool.query(`
      SELECT

        (
          SELECT COUNT(*)
          FROM patrol_points
          WHERE is_active = TRUE
        ) AS total_points,

        (
          SELECT COUNT(*)
          FROM guards
          WHERE is_active = TRUE
        ) AS total_guards,

        (
          SELECT COUNT(*)
          FROM patrol_logs
          WHERE checked_at::date = CURRENT_DATE
        ) AS today_checks
    `);

    const summary = summaryResult.rows[0];

    const totalPoints = Number(summary.total_points) || 0;

    const totalGuards = Number(summary.total_guards) || 0;

    const todayChecks = Number(summary.today_checks) || 0;

    /*
     * =====================================================
     * 2. XÁC ĐỊNH VÒNG TUẦN TRA HIỆN TẠI
     * =====================================================
     */

    const roundResult = await pool.query(`
      SELECT
        id,
        round_name,
        start_time,
        end_time

      FROM patrol_rounds

      WHERE is_active = TRUE

        AND (
          (
            start_time <= end_time
            AND CURRENT_TIME BETWEEN start_time AND end_time
          )

          OR

          (
            start_time > end_time
            AND (
              CURRENT_TIME >= start_time
              OR CURRENT_TIME <= end_time
            )
          )
        )

      ORDER BY start_time

      LIMIT 1
    `);

    const currentRound = roundResult.rows[0] || null;

    /*
     * =====================================================
     * 3. TRẠNG THÁI CÁC ĐIỂM
     *
     * Nếu đang trong vòng:
     * -> kiểm tra theo round_id
     *
     * Nếu không có vòng:
     * -> kiểm tra theo ngày
     * =====================================================
     */

    let pointsQuery;
    let pointsParams = [];

    if (currentRound) {
      pointsQuery = `
        SELECT
          pp.id,
          pp.point_code,
          pp.point_name,
          pp.area,

          pl.checked_at,

          g.full_name AS guard_name,
          g.guard_code,

          CASE
            WHEN pl.id IS NOT NULL
            THEN TRUE
            ELSE FALSE
          END AS checked

        FROM patrol_points pp

        LEFT JOIN LATERAL (

          SELECT
            pl.id,
            pl.checked_at,
            pl.guard_id

          FROM patrol_logs pl

          WHERE
            pl.patrol_point_id = pp.id

            AND pl.round_id = $1

            AND pl.checked_at::date =
                CURRENT_DATE

          ORDER BY
            pl.checked_at DESC

          LIMIT 1

        ) pl ON TRUE

        LEFT JOIN guards g
          ON g.id = pl.guard_id

        WHERE
          pp.is_active = TRUE

        ORDER BY
          pp.point_code
      `;

      pointsParams = [currentRound.id];
    } else {
      pointsQuery = `
        SELECT
          pp.id,
          pp.point_code,
          pp.point_name,
          pp.area,

          pl.checked_at,

          g.full_name AS guard_name,
          g.guard_code,

          CASE
            WHEN pl.id IS NOT NULL
            THEN TRUE
            ELSE FALSE
          END AS checked

        FROM patrol_points pp

        LEFT JOIN LATERAL (

          SELECT
            pl.id,
            pl.checked_at,
            pl.guard_id

          FROM patrol_logs pl

          WHERE
            pl.patrol_point_id = pp.id

            AND pl.checked_at::date =
                CURRENT_DATE

          ORDER BY
            pl.checked_at DESC

          LIMIT 1

        ) pl ON TRUE

        LEFT JOIN guards g
          ON g.id = pl.guard_id

        WHERE
          pp.is_active = TRUE

        ORDER BY
          pp.point_code
      `;
    }

    const pointsResult = await pool.query(pointsQuery, pointsParams);

    const points = pointsResult.rows;

    /*
     * =====================================================
     * 4. TỶ LỆ HOÀN THÀNH
     * =====================================================
     */

    const completedPoints = points.filter((point) => point.checked).length;

    const completionRate =
      totalPoints > 0
        ? Number((completedPoints / totalPoints) * 100).toFixed(1)
        : 0;

    /*
     * =====================================================
     * 5. THỐNG KÊ THEO GIỜ
     * =====================================================
     */

    const hourlyResult = await pool.query(`
        SELECT

          EXTRACT(
            HOUR FROM checked_at
          )::integer AS hour,

          COUNT(*)::integer AS total

        FROM patrol_logs

        WHERE
          checked_at::date =
          CURRENT_DATE

        GROUP BY
          EXTRACT(
            HOUR FROM checked_at
          )

        ORDER BY
          hour
      `);

    /*
     * =====================================================
     * 6. THỐNG KÊ BẢO VỆ
     * =====================================================
     */

    const guardsResult = await pool.query(`
        SELECT

          g.id,
          g.guard_code,
          g.full_name,

          COUNT(pl.id)::integer
            AS total_checks,

          MAX(pl.checked_at)
            AS last_checked_at

        FROM guards g

        LEFT JOIN patrol_logs pl
          ON pl.guard_id = g.id

          AND pl.checked_at::date =
              CURRENT_DATE

        WHERE
          g.is_active = TRUE

        GROUP BY
          g.id,
          g.guard_code,
          g.full_name

        ORDER BY
          total_checks DESC,
          g.full_name
      `);

    /*
     * =====================================================
     * 7. TIẾN ĐỘ THEO VÒNG
     * =====================================================
     */

    const roundsResult = await pool.query(`
        SELECT

          pr.id,
          pr.round_name,
          pr.start_time,
          pr.end_time,

          COUNT(
            DISTINCT pl.patrol_point_id
          )::integer AS completed_points

        FROM patrol_rounds pr

        LEFT JOIN patrol_logs pl
          ON pl.round_id = pr.id

          AND pl.checked_at::date =
              CURRENT_DATE

        WHERE
          pr.is_active = TRUE

        GROUP BY
          pr.id,
          pr.round_name,
          pr.start_time,
          pr.end_time

        ORDER BY
          pr.start_time
      `);

    const rounds = roundsResult.rows.map((round) => {
      const completed = Number(round.completed_points);

      const rate =
        totalPoints > 0
          ? Number((completed / totalPoints) * 100).toFixed(1)
          : 0;

      return {
        ...round,

        completed_points: completed,

        completion_rate: rate,
      };
    });

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    res.json({
      success: true,

      data: {
        totalPoints,

        totalGuards,

        todayChecks,

        completedPoints,

        completionRate,

        currentRound,

        points,

        hourly: hourlyResult.rows,

        guards: guardsResult.rows,

        rounds,
      },
    });
  } catch (error) {
    console.error("getDashboard:", error);

    res.status(500).json({
      success: false,

      message: "Không thể lấy dữ liệu dashboard",
    });
  }
};
