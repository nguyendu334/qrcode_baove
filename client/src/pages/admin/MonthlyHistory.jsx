/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Avatar,
  Stack,
  alpha,
} from "@mui/material";

import {
  CheckCircleRounded,
  CalendarMonthRounded,
  ShowChartRounded,
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

/* =========================================================
   STAT CARD COMPONENT
========================================================= */
function MonthlyStatCard({ title, value, icon, color = "primary" }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ mt: 0.5, color: "#0f172a" }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function MonthlyHistory() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const loadData = async () => {
    try {
      const response = await api.get("/patrol/history/month", {
        params: { month },
      });
      setData(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const totalChecks = data.reduce(
    (sum, item) => sum + Number(item.total_checks),
    0
  );

  const activeDays = data.filter(
    (item) => Number(item.total_checks) > 0
  ).length;

  const average = activeDays > 0 ? (totalChecks / activeDays).toFixed(1) : 0;

  const chartData = data.map((item) => ({
    date: new Date(item.patrol_date).getDate(),
    checks: Number(item.total_checks),
    guards: Number(item.total_guards),
    points: Number(item.total_points),
  }));

  return (
    <Box sx={{ width: "100%", pb: 4, bgcolor: "#f8fafc", p: { xs: 2, md: 3 } }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          width: "100%",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="#0f172a">
            {t("monthly_stats.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("monthly_stats.subtitle")}
          </Typography>
        </Box>

        <TextField
          size="small"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            bgcolor: "#ffffff",
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      {/* STATS CARDS GRID */}
      <Grid container spacing={2} sx={{ mb: 3, width: "100%" }}>
        <Grid item xs={12} sm={4} md={4}>
          <MonthlyStatCard
            title={t("monthly_stats.total_patrols")}
            value={totalChecks}
            icon={<CheckCircleRounded />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <MonthlyStatCard
            title={t("monthly_stats.active_days")}
            value={activeDays}
            icon={<CalendarMonthRounded />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <MonthlyStatCard
            title={t("monthly_stats.daily_average")}
            value={average}
            icon={<ShowChartRounded />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* CHART CARD */}
      <Card
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700} color="#0f172a" mb={3}>
            {t("monthly_stats.daily_chart_title")}
          </Typography>

          <Box sx={{ width: "100%", height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#cbd5e1" }}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "13px",
                  }}
                  labelStyle={{ color: "#94a3b8", fontWeight: 600 }}
                  formatter={(value) => [`${value} lượt`, "Lượt tuần tra"]}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Bar
                  dataKey="checks"
                  name="Lượt tuần tra"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}