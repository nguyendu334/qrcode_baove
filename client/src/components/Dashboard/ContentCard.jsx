import {
  AccessTimeRounded,
  CheckCircleRounded,
  InfoOutlined,
  ShieldRounded,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import { useTranslation } from "react-i18next";

function formatVietnamTime(value) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function ContentCard({ data }) {
  const { t } = useTranslation();

  // Kiểm tra xem hiện tại có ca/vòng tuần tra nào đang hoạt động không
  const isRoundActive = Boolean(data?.currentRound);

  const completedCount = data.points.filter((point) => point.checked).length;

  return (
    <Card
      elevation={0}
      sx={{
        mt: 3,
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h6" fontWeight={800}>
            {t("dashboard.patrolled_points")} ({completedCount}/
            {data.points.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            {t("dashboard.patrolled_points_desc")}
          </Typography>
        </Box>

        {/* THỜI ĐIỂM NGOÀI GIỜ TUẦN TRA: Hiển thị thông báo màu xanh nhạt */}
        {!isRoundActive ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
              border: "1px dashed",
              borderColor: (theme) => alpha(theme.palette.info.main, 0.3),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                color: "info.main",
              }}
            >
              <InfoOutlined />
            </Avatar>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {t("dashboard.not_in_patrol_time_title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.not_in_patrol_time_desc")}
            </Typography>
          </Paper>
        ) : completedCount === 0 ? (
          /* ĐANG TRONG CA NHƯNG CHƯA CHECK ĐIỂM NÀO */
          <Paper
            elevation={0}
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "#f8fafc",
              border: "1px dashed #cbd5e1",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {t("dashboard.no_patrolled_points_in_round")}
            </Typography>
          </Paper>
        ) : (
          /* ĐANG TRONG CA VÀ ĐÃ CÓ ĐIỂM ĐƯỢC CHECK */
          <Grid container spacing={2}>
            {data.points.map((point) => {
              const checked = Boolean(point.checked);

              return checked ? (
                <Grid item xs={12} sm={6} lg={3} key={point.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: checked
                        ? alpha("#2e7d32", 0.35)
                        : alpha("#ed6c02", 0.35),
                      bgcolor: checked
                        ? alpha("#2e7d32", 0.025)
                        : alpha("#ed6c02", 0.025),
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minHeight: 100,
                      boxSizing: "border-box",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: checked ? "success.main" : "warning.main",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.06)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    {/* ICON */}
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        flexShrink: 0,
                        bgcolor: checked
                          ? alpha("#2e7d32", 0.12)
                          : alpha("#757575", 0.08),
                        color: checked ? "success.main" : "text.disabled",
                      }}
                    >
                      {checked ? (
                        <ShieldRounded sx={{ fontSize: 20 }} />
                      ) : (
                        <AccessTimeRounded sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>

                    {/* THÔNG TIN */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      {/* TÊN ĐIỂM */}
                      <Typography
                        fontWeight={700}
                        variant="body2"
                        noWrap
                        title={`${point.point_code} - ${point.point_name}`}
                        sx={{ fontSize: "0.84rem", lineHeight: 1.3 }}
                      >
                        {point.point_code} - {point.point_name}
                      </Typography>

                      {/* KHU VỰC */}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        display="block"
                        sx={{ fontSize: "0.72rem", mt: 0.3, lineHeight: 1.2 }}
                      >
                        {t("dashboard.area")}:{" "}
                        <strong>{point.area || "Chưa xác định"}</strong>
                      </Typography>

                      {/* BẢO VỆ + THỜI GIAN */}
                      {checked && point.guard_name && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.8,
                            mt: 0.45,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="success.main"
                            noWrap
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            ✓ {point.guard_name}
                          </Typography>

                          {point.checked_at && (
                            <>
                              <Typography
                                variant="caption"
                                color="text.disabled"
                              >
                                •
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  flexShrink: 0,
                                }}
                              >
                                {formatVietnamTime(point.checked_at)}
                              </Typography>
                            </>
                          )}
                        </Box>
                      )}
                    </Box>

                    {/* TRẠNG THÁI */}
                    <Chip
                      size="small"
                      label={
                        checked
                          ? t("dashboard.patrolled")
                          : t("dashboard.unpatrolled")
                      }
                      color={checked ? "success" : "warning"}
                      variant={checked ? "filled" : "outlined"}
                      icon={
                        checked ? <CheckCircleRounded /> : <AccessTimeRounded />
                      }
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        height: 24,
                        flexShrink: 0,
                        "& .MuiChip-icon": { fontSize: 14 },
                      }}
                    />
                  </Paper>
                </Grid>
              ) : null;
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
