import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";

import api from "../../services/api";

export default function MonthlyHistory() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [month, setMonth] = useState(currentMonth);

  const [data, setData] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const loadData = async () => {
    try {
      const response = await api.get("/patrol/history/month", {
        params: {
          month,
        },
      });

      setData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const totalChecks = data.reduce(
    (sum, item) => sum + Number(item.total_checks),
    0,
  );

  const activeDays = data.filter(
    (item) => Number(item.total_checks) > 0,
  ).length;

  const average = activeDays > 0 ? (totalChecks / activeDays).toFixed(1) : 0;

  const chartData = data.map((item) => ({
    date: new Date(item.patrol_date).getDate(),

    checks: Number(item.total_checks),

    guards: Number(item.total_guards),

    points: Number(item.total_points),
  }));

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Thống kê theo tháng
          </Typography>

          <Typography color="text.secondary">
            Tổng hợp hoạt động tuần tra
          </Typography>
        </Box>

        <TextField
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
            }}
          >
            <CardContent>
              <Typography color="text.secondary">Tổng lượt tuần tra</Typography>

              <Typography variant="h3" fontWeight={800}>
                {totalChecks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
            }}
          >
            <CardContent>
              <Typography color="text.secondary">Ngày có tuần tra</Typography>

              <Typography variant="h3" fontWeight={800}>
                {activeDays}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
            }}
          >
            <CardContent>
              <Typography color="text.secondary">Trung bình / ngày</Typography>

              <Typography variant="h3" fontWeight={800}>
                {average}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card
        sx={{
          mt: 3,
          borderRadius: 4,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700} mb={3}>
            Số lượt tuần tra từng ngày
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: 400,
            }}
          >
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Bar dataKey="checks" name="Lượt tuần tra" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
