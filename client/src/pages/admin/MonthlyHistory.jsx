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
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";

import {
  CheckCircleRounded,
  CalendarMonthRounded,
  ReportProblemRounded,
  FileDownload,
  WarningAmberRounded,
  PersonRounded,
  PlaceRounded,
} from "@mui/icons-material";

import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
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
  const { t, i18n } = useTranslation();

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
      console.error("Lỗi lấy lịch sử tháng:", error);
    }
  };

  const totalChecks = data.reduce(
    (sum, item) => sum + Number(item.total_checks || 0),
    0,
  );

  const activeDays = data.filter(
    (item) => Number(item.total_checks || 0) > 0,
  ).length;

  const totalIncidents = data.reduce(
    (sum, item) => sum + Number(item.total_incidents || 0),
    0,
  );

  // XỬ LÝ XUẤT EXCEL
  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      alert("No data available!");
      return;
    }

    const excelRows = data.map((item, index) => {
      let incidentDetailText = t("monthly_stats.safe_status");

      if (item.incident_points && item.incident_points.length > 0) {
        incidentDetailText = item.incident_points
          .map((pt) => {
            const incNames = Array.isArray(pt.incidents)
              ? pt.incidents.map((i) => t(`incidents.${i}`, i)).join(", ")
              : "";
            const noteText = pt.other_description
              ? ` (${pt.other_description})`
              : "";
            return `[${pt.point_code} - ${pt.point_name}]: ${incNames}${noteText}`;
          })
          .join(" | ");
      }

      return {
        STT: index + 1,
        [t("monthly_stats.patrol_date")]: item.patrol_date
          ? new Date(item.patrol_date).toLocaleDateString(i18n.language)
          : "--",
        [t("monthly_stats.patrol_rounds")]: Number(item.total_checks || 0),
        [t("monthly_stats.reporting_guard")]: item.incident_guards || "--",
        [t("monthly_stats.total_incidents")]: Number(item.total_incidents || 0),
        [t("monthly_stats.point_and_incidents")]: incidentDetailText,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 16 },
      { wch: 18 },
      { wch: 26 },
      { wch: 14 },
      { wch: 50 },
    ];

    XLSX.writeFile(workbook, `Patrol_Report_${month}.xlsx`);
  };

  return (
    <Box sx={{ width: "100%", pb: 4, bgcolor: "#f8fafc", p: { xs: 2, md: 3 } }}>
      {/* HEADER TỔNG */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
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

        {/* LỌC THÁNG & NÚT XUẤT EXCEL */}
        <Stack direction="row" spacing={1.5} alignItems="center">
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

          <Button
            variant="contained"
            color="success"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 2,
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
            }}
          >
            {t("monthly_stats.export_excel")}
          </Button>
        </Stack>
      </Box>

      {/* THỐNG KÊ CARDS */}
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
            value={`${activeDays}`}
            icon={<CalendarMonthRounded />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} sm={4} md={4}>
          <MonthlyStatCard
            title={t("monthly_stats.total_incidents")}
            value={`${totalIncidents}`}
            icon={<ReportProblemRounded />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* BẢNG TỔNG HỢP */}
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
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700} color="#0f172a">
              {t("monthly_stats.table_title")} ({month})
            </Typography>
            <Chip
              label={`${t("monthly_stats.total_incidents")}: ${totalIncidents}`}
              size="small"
              color={totalIncidents > 0 ? "error" : "default"}
              sx={{ fontWeight: 700, my: 1.5 }}
            />
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "5%",
                    }}
                  >
                    STT
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "15%",
                    }}
                  >
                    {t("monthly_stats.patrol_date")}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "10%",
                    }}
                  >
                    {t("monthly_stats.patrol_rounds")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "18%",
                    }}
                  >
                    {t("monthly_stats.reporting_guard")}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "52%",
                    }}
                  >
                    {t("monthly_stats.point_and_incidents")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {data.length > 0 ? (
                  data.map((row, index) => {
                    const checksCount = Number(row.total_checks || 0);
                    const incidentCount = Number(row.total_incidents || 0);
                    const incidentPoints = Array.isArray(row.incident_points)
                      ? row.incident_points
                      : [];

                    return (
                      <TableRow
                        key={index}
                        hover
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {index + 1}
                          </Typography>
                        </TableCell>

                        {/* NGÀY TUẦN TRA */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="#0f172a"
                          >
                            {row.patrol_date
                              ? new Date(row.patrol_date).toLocaleDateString(
                                  i18n.language,
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  },
                                )
                              : "--"}
                          </Typography>
                        </TableCell>

                        {/* LƯỢT TUẦN TRA */}
                        <TableCell align="center">
                          <Chip
                            label={`${checksCount}`}
                            size="small"
                            color={checksCount > 0 ? "success" : "default"}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>

                        {/* BẢO VỆ PHÁT HIỆN SỰ CỐ */}
                        <TableCell>
                          {incidentCount > 0 && row.incident_guards ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <PersonRounded
                                sx={{ fontSize: 18, color: "#2563eb" }}
                              />
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="#1e293b"
                              >
                                {row.incident_guards}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>

                        {/* ĐIỂM TUẦN TRA & CÁC SỰ CỐ GẶP PHẢI */}
                        <TableCell sx={{ py: 1.5 }}>
                          {incidentCount > 0 && incidentPoints.length > 0 ? (
                            <Stack spacing={1.5}>
                              {incidentPoints.map((pt, pIdx) => (
                                <Box
                                  key={pIdx}
                                  sx={{
                                    p: 1.2,
                                    bgcolor: "rgba(239, 68, 68, 0.04)",
                                    border: "1px solid rgba(239, 68, 68, 0.18)",
                                    borderRadius: 2,
                                  }}
                                >
                                  {/* Mã + Tên điểm */}
                                  <Stack
                                    direction="row"
                                    spacing={0.8}
                                    alignItems="center"
                                    sx={{ mb: 1}}
                                  >
                                    <PlaceRounded
                                      sx={{ fontSize: 16, color: "#ef4444" }}
                                    />
                                    <Typography
                                      variant="caption"
                                      fontWeight={700}
                                      sx={{
                                        color: "#dc2626",
                                        fontSize: "0.8rem",
                                      }}
                                    >
                                      {pt.point_code} - {pt.point_name}
                                    </Typography>
                                  </Stack>

                                  {/* Grid 3 cột / dòng cho thẻ sự cố */}
                                  {Array.isArray(pt.incidents) &&
                                    pt.incidents.length > 0 && (
                                      <Grid container spacing={0.8}>
                                        {pt.incidents.map((incKey, iIdx) => (
                                          <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            key={iIdx}
                                          >
                                            <Chip
                                              icon={
                                                <WarningAmberRounded
                                                  sx={{
                                                    fontSize: "13px !important",
                                                  }}
                                                />
                                              }
                                              label={t(
                                                `patrol.${incKey}`,
                                                incKey,
                                              )}
                                              size="small"
                                              color="error"
                                              variant="outlined"
                                              sx={{
                                                width: "100%",
                                                justifyContent: "flex-start",
                                                fontSize: "0.72rem",
                                                height: 32,
                                                fontWeight: 600,
                                                px: 1,
                                                "& .MuiChip-label": {
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                  whiteSpace: "nowrap",
                                                },
                                              }}
                                            />
                                          </Grid>
                                        ))}
                                      </Grid>
                                    )}

                                  {pt.other_description && (
                                    <Typography
                                      variant="caption"
                                      color="error"
                                      fontWeight={600}
                                      sx={{ display: "block", mt: 1, pl: 0.5 }}
                                    >
                                      • {t("monthly_stats.note")}:{" "}
                                      {pt.other_description}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#16a34a",
                                bgcolor: "rgba(34, 197, 94, 0.1)",
                                px: 1.2,
                                py: 0.4,
                                borderRadius: 1.5,
                                fontWeight: 600,
                              }}
                            >
                              {t("monthly_stats.safe_status")}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        --
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
