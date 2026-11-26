/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Avatar,
  alpha,
  Tooltip,
  IconButton,
  Dialog,
  Paper,
} from "@mui/material";

import {
  SearchRounded,
  RefreshRounded,
  AccessTimeRounded,
  LocationOnRounded,
  CheckCircleRounded,
  RouteRounded,
  WifiRounded,
  ImageNotSupportedRounded,
  CloseRounded,
  ReportProblem,
  Image as ImageIcon,
  PhoneInTalk,
  ArrowBackIosNew,
  ArrowForwardIos,
} from "@mui/icons-material";

import { useTranslation } from "react-i18next";
import api from "../../services/api";

const API_BASE_URL =
  `${window.location.protocol}//` + `${window.location.hostname}:3000`;

function getVietnamToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
}

function formatVietnamDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatVietnamTime(value) {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function HistoryStatCard({ title, value }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ mt: 0.5, color: "#1e293b" }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function HistorySkeleton() {
  return (
    <Stack spacing={1}>
      {[1, 2, 3, 4, 5].map((item) => (
        <Skeleton
          key={item}
          variant="rounded"
          height={65}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Stack>
  );
}

export default function PatrolHistory() {
  const [date, setDate] = useState(getVietnamToday());
  const [guardId, setGuardId] = useState("");
  const [pointId, setPointId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [guards, setGuards] = useState([]);
  const [points, setPoints] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State quản lý xem phóng to ảnh
  const [selectedImage, setSelectedImage] = useState(null);

  // 1. THÊM STATE LƯU DỮ LIỆU SỰ CỐ
  const [incidentsData, setIncidentsData] = useState([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset chỉ số về 0 khi chọn mảng ảnh mới
  const handleOpenImage = (images) => {
    setSelectedImage(images);
    setCurrentImageIndex(0);
  };

  const { t } = useTranslation();

  useEffect(() => {
    loadFilters();
    loadHistory(true);
  }, []);

  useEffect(() => {
    loadHistory(false);
  }, [date, guardId, pointId, search]);

  const loadFilters = async () => {
    try {
      setFilterLoading(true);
      const [guardResponse, pointResponse] = await Promise.all([
        api.get("/guards"),
        api.get("/points"),
      ]);
      setGuards(guardResponse.data?.data || []);
      setPoints(pointResponse.data?.data || []);
    } catch (error) {
      console.error("loadFilters:", error);
    } finally {
      setFilterLoading(false);
    }
  };

  const loadHistory = async (isFirstTime = false) => {
    try {
      if (isFirstTime) setLoading(true);

      const response = await api.get("/patrol/history", {
        params: {
          date: date || undefined,
          guard_id: guardId || undefined,
          point_id: pointId || undefined,
          search: search || undefined,
        },
      });

      // Cập nhật lượt tuần tra chung
      setHistory(response.data?.data || []);

      // CẬP NHẬT STATE SỰ CỐ
      setIncidentsData(response.data?.incidents || []);

      setPage(0);
    } catch (error) {
      console.error("loadHistory:", error);
      setHistory([]);
      setIncidentsData([]); // Reset khi lỗi
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleReset = () => {
    setDate(getVietnamToday());
    setGuardId("");
    setPointId("");
    setSearchInput("");
    setSearch("");
    setPage(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleSearch();
  };

  // Hàm hỗ trợ lấy mảng URL chuẩn xác
  const getCleanImageUrls = (rawPhotos) => {
    if (!rawPhotos) return [];

    let photos = rawPhotos;

    // 1. Nếu backend trả về chuỗi JSON (ví dụ: '["/uploads/a.jpg"]') -> parse ra mảng
    if (typeof photos === "string") {
      try {
        photos = JSON.parse(photos);
      } catch (error) {
        photos = [photos];
      }
    }

    // 2. Làm phẳng mảng nếu bị lồng (ví dụ: [["/uploads/a.jpg"]])
    if (Array.isArray(photos)) {
      photos = photos.flat();
    } else {
      photos = [photos];
    }

    // 3. Chuẩn hóa tiền tố Host Server
    const backendBaseUrl =
      import.meta.env.VITE_API_URL || "http://localhost:3000";

    return photos.map((url) => {
      if (!url || typeof url !== "string") return "";
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      return `${backendBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
    });
  };

  const statistics = useMemo(() => {
    const uniqueGuards = new Set(
      history.map((item) => item.guard_id).filter(Boolean),
    ).size;
    const uniquePoints = new Set(
      history.map((item) => item.point_id).filter(Boolean),
    ).size;

    return {
      total: history.length,
      guards: uniqueGuards,
      points: uniquePoints,
    };
  }, [history]);

  const paginatedHistory = history.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Box sx={{ pb: 4, width: "100%", bgcolor: "#f8fafc" }}>
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="#0f172a">
          {t("patrol_history.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("patrol_history.subtitle")}
        </Typography>
      </Box>

      {/* STATISTICS */}
      <Grid container spacing={2} sx={{ mb: 3, width: "100%" }}>
        <Grid item xs={12} sm={4} md={4}>
          <HistoryStatCard
            title={t("patrol_history.total_patrols")}
            value={statistics.total}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <HistoryStatCard
            title={t("patrol_history.active_guards")}
            value={statistics.guards}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={4}>
          <HistoryStatCard
            title={t("patrol_history.checked_points")}
            value={statistics.points}
          />
        </Grid>
      </Grid>

      {/* FILTER CARD */}
      <Card
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 2.5 }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            >
              <SearchRounded fontSize="small" />
            </Avatar>
            <Box>
              <Typography fontWeight={600} variant="body1">
                {t("patrol_history.filter_title")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("patrol_history.filter_subtitle")}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              flexWrap: "wrap",
              gap: 2,
              width: "100%",
            }}
          >
            <Box
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" } }}
            >
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t("patrol_history.date")}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" } }}
            >
              <FormControl fullWidth size="small" disabled={filterLoading}>
                <InputLabel>{t("patrol_history.guard")}</InputLabel>
                <Select
                  value={guardId}
                  label={t("patrol_history.guard")}
                  onChange={(e) => setGuardId(e.target.value)}
                >
                  <MenuItem value="">{t("patrol_history.guard")}</MenuItem>
                  {guards.map((guard) => (
                    <MenuItem key={guard.id} value={guard.id}>
                      {guard.guard_code
                        ? `${guard.guard_code} - ${guard.full_name}`
                        : guard.full_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" } }}
            >
              <FormControl fullWidth size="small" disabled={filterLoading}>
                <InputLabel>{t("patrol_history.point")}</InputLabel>
                <Select
                  value={pointId}
                  label={t("patrol_history.point")}
                  onChange={(e) => setPointId(e.target.value)}
                >
                  <MenuItem value="">{t("patrol_history.point")}</MenuItem>
                  {points.map((point) => (
                    <MenuItem key={point.id} value={point.id}>
                      {point.point_code} - {point.point_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 45%", md: "1 1 22%" } }}
            >
              <TextField
                fullWidth
                size="small"
                label={t("patrol_history.search")}
                placeholder="Tên, mã bảo vệ, điểm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </Box>
          </Box>

          <Stack
            direction="row"
            justifyContent="flex-start"
            spacing={1.5}
            sx={{ mt: 2.5 }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={handleReset}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {t("patrol_history.reset")}
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchRounded />}
              onClick={handleSearch}
              disableElevation
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              {t("patrol_history.search")}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* CARD BẢNG SỰ CỐ */}
      <Card
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 3,
          border: "1px solid #fee2e2",
          bgcolor: "#ffffff",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          {/* HEADER TIÊU ĐỀ THẲNG HÀNG NẰM TRÊN 1 DÒNG */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ width: "100%", flexWrap: "nowrap", marginBottom: 2 }}
          >
            {/* ICON NỔI BẬT */}
            <ReportProblem
              sx={{ color: "#ef4444", fontSize: 18, flexShrink: 0 }}
            />

            {/* TIÊU ĐỀ KHÔNG BAO GIỜ RỚT DÒNG */}
            <Typography
              variant="h6"
              fontWeight={700}
              color="#991b1b"
              sx={{
                whiteSpace: "nowrap",
                fontSize: "1.1rem",
                lineHeight: 1,
              }}
            >
              {t("patrol_history.daily_incident_log")}
            </Typography>

            {/* CHIP HIỂN THỊ SỐ LƯỢNG */}
            <Chip
              label={`${incidentsData.length} sự cố`}
              color="error"
              size="small"
              sx={{
                fontWeight: 400,
                borderRadius: 1.5,
                height: 22,
                fontSize: "0.72rem",
                flexShrink: 0,
              }}
            />
          </Stack>

          {/* BẢNG SỰ CỐ TỐI ƯU LAYOUT VÀ TỰ ĐỘNG XUỐNG DÒNG */}
          {incidentsData.length === 0 ? (
            <Box
              sx={{
                py: 3,
                textAlign: "center",
                bgcolor: "#fef2f2",
                borderRadius: 2,
                border: "1px dashed #fca5a5",
              }}
            >
              <Typography variant="body2" color="#991b1b" fontWeight={500}>
                {t("patrol_history.no_incidents_reported")}
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: "1px solid #fee2e2",
                borderRadius: 2,
                maxWidth: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                size="small"
                sx={{ tableLayout: "fixed", width: "100%", minWidth: 900 }}
              >
                <TableHead sx={{ bgcolor: "#fef2f2" }}>
                  <TableRow>
                    <TableCell
                      sx={{ fontWeight: 700, color: "#991b1b", width: "110px" }}
                    >
                      {t("patrol_history.time")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, color: "#991b1b", width: "140px" }}
                    >
                      {t("patrol_history.reported_guard")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, color: "#991b1b", width: "160px" }}
                    >
                      {t("patrol_history.patrol_point")}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#991b1b" }}>
                      {t("patrol_history.incident_details")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, color: "#991b1b", width: "180px" }}
                    >
                      {t("patrol_history.contacted")}
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 700, color: "#991b1b", width: "120px" }}
                      align="center"
                    >
                      {t("patrol_history.images")}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidentsData.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ "&:hover": { bgcolor: "#fff1f2 !important" } }}
                    >
                      {/* 1. THỜI GIAN */}
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="#0f172a"
                        >
                          {new Date(row.checked_at).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(row.checked_at).toLocaleDateString("vi-VN")}
                        </Typography>
                      </TableCell>

                      {/* 2. BẢO VỆ */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {row.guard_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.guard_code}
                        </Typography>
                      </TableCell>

                      {/* 3. ĐIỂM TUẦN TRA */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {row.point_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          display="block"
                        >
                          {row.point_code} ({row.area})
                        </Typography>
                      </TableCell>

                      {/* 4. CHI TIẾT SỰ CỐ (XẾP GỌN BẰNG FLEX-WRAP) */}
                      <TableCell>
                        <Box
                          display="flex"
                          flexWrap="wrap"
                          gap={0.5}
                          mb={row.other_description ? 0.5 : 0}
                        >
                          {row.incidents &&
                            row.incidents.map((inc, idx) => (
                              <Chip
                                key={idx}
                                label={t(`patrol.${inc}`)}
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  height: 22,
                                  margin: 0.5,
                                }}
                              />
                            ))}
                        </Box>
                        {row.other_description && (
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              color: "#7f1d1d",
                              fontStyle: "italic",
                              bgcolor: "#fff5f5",
                              p: 0.5,
                              borderRadius: 1,
                              border: "1px solid #fee2e2",
                            }}
                          >
                            {t("patrol_history.other")}: {row.other_description}
                          </Typography>
                        )}
                      </TableCell>

                      {/* 5. LIÊN HỆ KHẨN CẤP */}
                      <TableCell>
                        {row.emergency_contacted ? (
                          <Chip
                            icon={
                              <PhoneInTalk
                                sx={{ fontSize: "13px !important" }}
                              />
                            }
                            label={`${row.emergency_contacted}`}
                            color="error"
                            size="small"
                            sx={{
                              borderRadius: 1.5,
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              height: 24,
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {t("patrol_history.none")}
                          </Typography>
                        )}
                      </TableCell>

                      {/* 6. HÌNH ẢNH SỰ CỐ BỔ SUNG */}
                      <TableCell align="center">
                        {row.incident_photos &&
                        row.incident_photos.length > 0 ? (
                          <Box
                            onClick={() =>
                              setSelectedImage(row.incident_photos)
                            }
                            sx={{
                              position: "relative",
                              display: "inline-flex",
                              cursor: "pointer",
                              transition: "transform 0.2s ease-in-out",
                              "&:hover": { transform: "scale(1.08)" },
                            }}
                          >
                            {/* ẢNH THU NHỎ (LẤY ẢNH ĐẦU TIÊN TRONG MẢNG) */}
                            <Box
                              component="img"
                              src={getCleanImageUrls(row.incident_photos)[0]}
                              alt="Thumbnail sự cố"
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                objectFit: "cover",
                                border: "1px solid #e2e8f0",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              }}
                            />

                            {/* CHIP NỔI BÁO SỐ LƯỢNG NẾU CÓ NHIỀU HƠN 1 ẢNH */}
                            {row.incident_photos.length > 1 && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: -5,
                                  right: -5,
                                  bgcolor: "#ef4444",
                                  color: "#ffffff",
                                  fontSize: "0.65rem",
                                  fontWeight: 800,
                                  borderRadius: "10px",
                                  px: 0.6,
                                  py: 0.1,
                                  border: "1.5px solid #ffffff",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                                  lineHeight: 1,
                                }}
                              >
                                +{row.incident_photos.length}
                              </Box>
                            )}
                          </Box>
                        ) : (
                          /* ICON TRỐNG KHI KHÔNG CÓ ẢNH */
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              bgcolor: "#f1f5f9",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#94a3b8",
                              mx: "auto",
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 20, opacity: 0.5 }} />
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* TABLE */}
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
        <CardContent sx={{ p: 2.5, pb: 2, borderBottom: "1px solid #f1f5f9" }}>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
              {t("patrol_history.list_title")}
            </Typography>
            <Chip
              icon={<CheckCircleRounded sx={{ fontSize: "16px !important" }} />}
              label={`${history.length} ${t("patrol_history.turn")}`}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 1.5,
                bgcolor: "#e0f2fe",
                color: "#0284c7",
                border: "1px solid #7dd3fc",
              }}
            />
          </Stack>
        </CardContent>

        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {[
                  t("patrol_history.time"),
                  t("patrol_history.picture"),
                  t("patrol_history.guard"),
                  t("patrol_history.point"),
                  t("patrol_history.area"),
                  t("patrol_history.round"),
                  t("patrol_history.device"),
                ].map((head, index) => (
                  <TableCell
                    key={index}
                    align={index === 5 ? "center" : "left"}
                    sx={{
                      fontWeight: 700,
                      color: "#0f172a",
                      borderBottom: "2px solid #f1f5f9",
                      whiteSpace: "nowrap",
                      py: 2,
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ p: 2 }}>
                    <HistorySkeleton />
                  </TableCell>
                </TableRow>
              ) : paginatedHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mx: "auto",
                        mb: 1.5,
                        bgcolor: "action.hover",
                        color: "text.secondary",
                      }}
                    >
                      <SearchRounded />
                    </Avatar>
                    <Typography fontWeight={600}>Không có dữ liệu</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHistory.map((item) => {
                  const imageUrl = item.photo_url
                    ? item.photo_url.startsWith("http")
                      ? item.photo_url
                      : `${API_BASE_URL}${item.photo_url.startsWith("/") ? "" : "/"}${item.photo_url}`
                    : null;

                  return (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              bgcolor: "#e0f2fe",
                              color: "#0284c7",
                            }}
                          >
                            <AccessTimeRounded sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography
                              fontWeight={600}
                              fontSize="0.875rem"
                              color="#0f172a"
                            >
                              {formatVietnamTime(item.checked_at)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              {
                                formatVietnamDateTime(item.checked_at).split(
                                  " ",
                                )[0]
                              }
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* CỘT HÌNH ẢNH: BẤM VÀO SẼ BẬT MODAL TRÊN TRANG */}
                      <TableCell>
                        {imageUrl ? (
                          <Tooltip title="Nhấn để phóng to ảnh hiện trường">
                            <Box
                              component="img"
                              src={imageUrl}
                              alt="Ảnh tuần tra"
                              onClick={() => setSelectedImage(imageUrl)}
                              sx={{
                                width: 44,
                                height: 44,
                                objectFit: "cover",
                                borderRadius: 2,
                                cursor: "pointer",
                                border: "1px solid #cbd5e1",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.1)" },
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              bgcolor: "#f1f5f9",
                              color: "#94a3b8",
                            }}
                          >
                            <ImageNotSupportedRounded fontSize="small" />
                          </Avatar>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontWeight={500}
                          fontSize="0.875rem"
                          color="#0f172a"
                        >
                          {item.guard_name || "-"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.guard_code || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              bgcolor: "#e2e8f0",
                              color: "#3b82f6",
                            }}
                          >
                            <LocationOnRounded sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography
                              fontWeight={500}
                              fontSize="0.875rem"
                              color="#0f172a"
                            >
                              {item.point_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.point_code}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="#334155">
                          {item.area || "Chưa xác định"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        {item.round_name ? (
                          <Chip
                            icon={<RouteRounded />}
                            label={item.round_name}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 1.5,
                              color: "#0284c7",
                              borderColor: "#7dd3fc",
                            }}
                          />
                        ) : (
                          "-"
                        )}
                        {item.start_time && item.end_time && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 0.3 }}
                          >
                            {item.start_time} - {item.end_time}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip
                          title={`Device info: ${item.device_info} - IP: ${item.ip_address || "Chưa xác định"}`}
                        >
                          <IconButton
                            size="small"
                            sx={{ bgcolor: "#f1f5f9", color: "#64748b" }}
                          >
                            <WifiRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!loading && history.length > 0 && (
          <TablePagination
            component="div"
            count={history.length}
            page={page}
            onPageChange={(e, n) => setPage(n)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Số dòng:"
          />
        )}
      </Card>

      {/* MODAL XEM ẢNH TRÀN MÀN HÌNH DÙNG CHUNG */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth={false}
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.85)"
          },
          "& .MuiDialog-paper": {
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "visible",
            margin: 0,
            maxWidth: "none",
          },
        }}
      >
        {selectedImage &&
          (() => {
            const imagesList = getCleanImageUrls(selectedImage);
            const totalImages = imagesList.length;

            const handlePrev = () => {
              setCurrentImageIndex((prev) =>
                prev > 0 ? prev - 1 : totalImages - 1,
              );
            };

            const handleNext = () => {
              setCurrentImageIndex((prev) =>
                prev < totalImages - 1 ? prev + 1 : 0,
              );
            };

            return (
              <Box
                sx={{
                  position: "relative",
                  bgcolor: "#ffffff",
                  p: { xs: 1.5, md: 2.5 },
                  borderRadius: 4,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: { xs: "90vw", sm: "500px" },
                }}
              >
                {/* NÚT TẮT NỔI Ở GÓC TRÊN BÊN PHẢI */}
                <IconButton
                  onClick={() => setSelectedImage(null)}
                  sx={{
                    position: "absolute",
                    top: -14,
                    right: -14,
                    bgcolor: "#ef4444",
                    color: "#ffffff",
                    border: "2px solid #ffffff",
                    zIndex: 999,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                    "&:hover": { bgcolor: "#dc2626" },
                  }}
                >
                  <CloseRounded sx={{ fontSize: 18 }} />
                </IconButton>

                {/* BỘ ĐẾM SỐ LƯỢNG ÁNH (1 / 4) */}
                {totalImages > 1 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#020b18",
                      fontWeight: 700,
                      mb: 1.5,
                      bgcolor: "rgba(255,255,255,0.08)",
                      px: 1.5,
                      py: 0.4,
                      borderRadius: 3,
                    }}
                  >
                    Ảnh {currentImageIndex + 1} / {totalImages}
                  </Typography>
                )}

                {/* KHUNG CHỨA ÁNH VÀ 2 MŨI TÊN CHUYỂN ÁNH */}
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    maxWidth: "85vw",
                    maxHeight: "75vh",
                  }}
                >
                  {/* MŨI TÊN SANG TRÁI */}
                  {totalImages > 1 && (
                    <IconButton
                      onClick={handlePrev}
                      sx={{
                        position: "absolute",
                        left: { xs: 4, md: -20 },
                        zIndex: 10,
                        bgcolor: "rgba(15, 23, 42, 0.75)",
                        color: "#ffffff",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(4px)",
                        "&:hover": { bgcolor: "#ef4444" },
                      }}
                    >
                      <ArrowBackIosNew sx={{ fontSize: { xs: 16, md: 22 } }} />
                    </IconButton>
                  )}

                  {/* ẢNH CHÍNH TẠI VỊ TRÍ HIỆN TẠI */}
                  <Box
                    component="img"
                    src={imagesList[currentImageIndex]}
                    alt={`Ảnh phóng to ${currentImageIndex + 1}`}
                    sx={{
                      maxHeight: "75vh",
                      maxWidth: "80vw",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: 2,
                      display: "block",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                      transition: "all 0.2s ease-in-out",
                    }}
                  />

                  {/* MŨI TÊN SANG PHẢI */}
                  {totalImages > 1 && (
                    <IconButton
                      onClick={handleNext}
                      sx={{
                        position: "absolute",
                        right: { xs: 4, md: -20 },
                        zIndex: 10,
                        bgcolor: "rgba(15, 23, 42, 0.75)",
                        color: "#ffffff",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(4px)",
                        "&:hover": { bgcolor: "#ef4444" },
                      }}
                    >
                      <ArrowForwardIos sx={{ fontSize: { xs: 16, md: 22 } }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })()}
      </Dialog>
    </Box>
  );
}
