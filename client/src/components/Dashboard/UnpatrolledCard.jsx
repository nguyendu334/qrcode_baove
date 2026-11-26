import {
  AccessTimeRounded,
  CheckCircleRounded,
  InfoOutlined,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export function UnpatrolledCard({ data }) {
  const { t } = useTranslation();

  // Kiểm tra xem có ca/vòng tuần tra nào đang hoạt động hay không
  const isRoundActive = Boolean(data?.currentRound);

  // Lấy danh sách điểm chưa tuần tra trong ca hiện tại
  const unpatrolledPoints = (data?.points || []).filter((p) => !p.checked);

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
        {/* Header section: Tiêu đề + Số lượng điểm */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h6" fontWeight={800}>
            {t("dashboard.unpatrolled_points")} (
            {isRoundActive ? unpatrolledPoints.length : 0}{" "}
            {t("dashboard.point")})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
            {t("dashboard.unpatrolled_points_desc")}
          </Typography>
        </Box>

        {/* 1. KHI NGOÀI GIỜ TUẦN TRA: Hiển thị thông báo "Chưa đến giờ tuần tra" */}
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
        ) : unpatrolledPoints.length === 0 ? (
          /* 2. KHI ĐANG TRONG CA VÀ ĐÃ HOÀN THÀNH TẤT CẢ ĐIỂM */
          <Box
            sx={{
              py: 4,
              textAlign: "center",
            }}
          >
            <CheckCircleRounded
              color="success"
              sx={{
                fontSize: 52,
              }}
            />

            <Typography fontWeight={800} variant="h6" sx={{ mt: 1 }}>
              Hoàn thành tất cả điểm!
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Không còn điểm nào chưa tuần tra trong vòng này.
            </Typography>
          </Box>
        ) : (
          /* 3. KHI ĐANG TRONG CA VÀ CÓ ĐIỂM CHƯA TUẦN TRA */
          <Grid container spacing={2}>
            {unpatrolledPoints.map((point) => (
              <Grid item xs={12} sm={6} md={4} key={point.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: alpha("#ed6c02", 0.25),
                    bgcolor: alpha("#ed6c02", 0.03),
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#ed6c02",
                      bgcolor: "#ffffff",
                      boxShadow: "0 4px 12px rgba(237, 108, 2, 0.08)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: alpha("#ed6c02", 0.12),
                        color: "#ed6c02",
                        flexShrink: 0,
                      }}
                    >
                      <AccessTimeRounded />
                    </Avatar>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        fontWeight={800}
                        variant="body2"
                        noWrap
                        title={`${point.point_code} - ${point.point_name}`}
                        sx={{ color: "text.primary", lineHeight: 1.3 }}
                      >
                        {point.point_code} - {point.point_name}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        display="block"
                        sx={{ mt: 0.4 }}
                      >
                        {t("dashboard.area")}:{" "}
                        <strong>{point.area || "Chưa xác định"}</strong>
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
