import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
  Skeleton,
  Stack,
  Avatar,
  alpha,
  Paper,
} from "@mui/material";

import {
  LocationOnRounded,
  GroupsRounded,
  FactCheckRounded,
  CheckCircleRounded,
  AccessTimeRounded,
  AutorenewRounded,
  ScheduleRounded,
} from "@mui/icons-material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useTranslation } from "react-i18next";

import api from "../../services/api";
import { StatCard } from "../../components/Dashboard/StatCard";
import { ContentCard } from "../../components/Dashboard/ContentCard";

// 2. Component Dashboard Chính
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { t } = useTranslation();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadDashboard();

    // const interval = setInterval(() => {
    //   loadDashboard();
    // }, 30000);

    // return () => {
    //   clearInterval(interval);
    // };
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("/patrol/dashboard");

      setData(response.data.data);

      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const completedCount = data?.points?.filter((p) => p.checked_at).length || 0;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Trang */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {t("dashboard.title")}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("dashboard.subtitle")}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<ScheduleRounded sx={{ fontSize: 18 }} />}
            label={
              data.currentRound
                ? `${data.currentRound.round_name} • ${data.currentRound.start_time.slice(
                    0,
                    5,
                  )} - ${data.currentRound.end_time.slice(0, 5)}`
                : t("dashboard.no_active_round")
            }
            color={data.currentRound ? "primary" : "default"}
            sx={{
              fontWeight: 700,
            }}
          />

          <Chip
            icon={<AutorenewRounded sx={{ fontSize: 18 }} />}
            label={`${t("dashboard.refresh")} ${lastUpdated.toLocaleTimeString("vi-VN")}`}
            variant="outlined"
            sx={{
              fontWeight: 600,
            }}
          />
        </Stack>
      </Box>

      {/* 4 Thẻ Thống Kê */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2.5,
          width: "100%",
          mt: 3,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard
            title={t("dashboard.patrol_points")}
            value={data.totalPoints}
            icon={<LocationOnRounded />}
            color="primary"
            subtext={t("dashboard.patrol_points_desc")}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard
            title={t("dashboard.active_guards")}
            value={data.totalGuards}
            icon={<GroupsRounded />}
            color="info"
            subtext={t("dashboard.active_guards_desc")}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard
            title={t("dashboard.scans_count")}
            value={data.todayChecks}
            icon={<FactCheckRounded />}
            color="warning"
            subtext={t("dashboard.scans_count_desc")}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <StatCard
            title={t("dashboard.completion_rate")}
            value={`${data.completionRate}%`}
            icon={<CheckCircleRounded />}
            color={data.completionRate === 100 ? "success" : "secondary"}
            subtext={`${completedCount}/${data.totalPoints} ${t("dashboard.completed_points_format")}`}
          />
        </Box>
      </Box>

      {data.currentRound && (
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                {t("dashboard.current_patrol_round")}
              </Typography>

              <Typography variant="h6" fontWeight={800}>
                {data.currentRound.round_name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {data.currentRound.start_time.slice(0, 5)}
                {" - "}
                {data.currentRound.end_time.slice(0, 5)}
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 260,
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" fontWeight={700}>
                  {t("dashboard.round_progress")}{" "}
                  {data.points.filter((p) => p.checked).length}/
                  {data.totalPoints}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={
                  data.totalPoints > 0
                    ? (data.points.filter((p) => p.checked).length /
                        data.totalPoints) *
                      100
                    : 0
                }
                sx={{
                  height: 9,
                  borderRadius: 5,
                }}
              />
            </Box>
          </Stack>
        </Paper>
      )}

      <ContentCard data={data} />

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
          {/* Header section: Tiêu đề + Chip số lượng */}
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h6" fontWeight={800}>
              {t("dashboard.unpatrolled_points")} (
              {data.points.filter((p) => !p.checked).length}{" "}
              {t("dashboard.point")})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              {t("dashboard.unpatrolled_points_desc")}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {data.points
              .filter((point) => !point.checked)
              .map((point) => (
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

          {/* Trạng thái Hoàn Thành Tất Cả */}
          {data.points.filter((p) => !p.checked).length === 0 && (
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
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mt: 3, width: "100%" }}>
        <Grid item xs={4} lg={2}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={800}>
                  {t("dashboard.hourly_patrols")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.3 }}
                >
                  {t("dashboard.hourly_patrols_desc")}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  height: 320,
                  mt: "auto",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.hourly.map((item) => ({
                      hour: `${String(item.hour).padStart(2, "0")}:00`,
                      total: Number(item.total),
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />

                    <XAxis
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />

                    <Tooltip
                      cursor={{ fill: "rgba(25, 118, 210, 0.04)" }}
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />

                    <Bar
                      dataKey="total"
                      name="Lượt tuần tra"
                      fill="#1976d2"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cột phản: Danh sách Bảo vệ (Chiếm 4/12 cột) */}
        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="h6" fontWeight={800}>
                  {t("dashboard.today_guards")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.3 }}
                >
                  {t("dashboard.scans_label")}
                </Typography>
              </Box>

              <Stack spacing={2}>
                {data.guards.slice(0, 6).map((guard, index) => (
                  <Paper
                    key={guard.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "#fafafa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#ffffff",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ minWidth: 0, flex: 1 }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          fontSize: 14,
                          fontWeight: 800,
                          bgcolor:
                            index === 0 ? "primary.main" : "action.selected",
                          color: index === 0 ? "#ffffff" : "text.primary",
                          flexShrink: 0,
                        }}
                      >
                        {guard.full_name?.charAt(0).toUpperCase()}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {guard.full_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {t("dashboard.code")}:{" "}
                          <strong>{guard.guard_code}</strong>
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      size="small"
                      label={`${guard.total_checks} lượt`}
                      color={
                        index === 0 && guard.total_checks > 0
                          ? "primary"
                          : "default"
                      }
                      variant={guard.total_checks > 0 ? "filled" : "outlined"}
                      sx={{
                        fontWeight: 700,
                        flexShrink: 0,
                        ml: 1,
                      }}
                    />
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* <Card
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={800}>
            Tiến độ các vòng tuần tra
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Theo dõi mức độ hoàn thành từng vòng trong ngày
          </Typography>

          <Stack spacing={2.5}>
            {data.rounds.map((round) => (
              <Box key={round.id}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={0.7}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={800}>
                      {round.round_name}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {round.start_time.slice(0, 5)}
                      {" - "}
                      {round.end_time.slice(0, 5)}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    fontWeight={800}
                    color={
                      Number(round.completion_rate) === 100
                        ? "success.main"
                        : "text.primary"
                    }
                  >
                    {round.completed_points}/{data.totalPoints} (
                    {round.completion_rate}
                    %)
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={Number(round.completion_rate) || 0}
                  color={
                    Number(round.completion_rate) === 100
                      ? "success"
                      : "primary"
                  }
                  sx={{
                    height: 9,
                    borderRadius: 5,
                  }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card> */}
    </Box>
  );
}

// 3. Component Skeleton khi đang Tải Dữ Liệu
function DashboardSkeleton() {
  return (
    <Box sx={{ pb: 4 }}>
      <Skeleton width={200} height={40} />
      <Skeleton width={300} height={20} sx={{ mb: 3 }} />

      <Grid container spacing={2.5}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton
              variant="rounded"
              height={110}
              sx={{ borderRadius: 3.5 }}
            />
          </Grid>
        ))}
      </Grid>

      <Skeleton
        variant="rounded"
        height={80}
        sx={{ mt: 3, borderRadius: 3.5 }}
      />
      <Skeleton
        variant="rounded"
        height={300}
        sx={{ mt: 3, borderRadius: 3.5 }}
      />
    </Box>
  );
}
