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
} from "@mui/icons-material";

import { useTranslation } from "react-i18next";
import api from "../../services/api";

const API_BASE_URL = `${window.location.protocol}//` + `${window.location.hostname}:3000`;

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
      setHistory(response.data?.data || []);
      setPage(0);
    } catch (error) {
      console.error("loadHistory:", error);
      setHistory([]);
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
              label={`${history.length} lượt`}
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
                  "Hình ảnh",
                  t("patrol_history.guard"),
                  t("patrol_history.point"),
                  t("patrol_history.area"),
                  t("patrol_history.note"),
                  t("round"),
                  t("patrol_history.status"),
                  t("patrol_history.device"),
                ].map((head, index) => (
                  <TableCell
                    key={index}
                    align={index >= 6 ? "center" : "left"}
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

                      <TableCell>
                        <Typography variant="body2" color="#334155">
                          {item.note || "-"}
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
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          icon={
                            <CheckCircleRounded style={{ color: "white" }} />
                          }
                          label="Đã xác nhận"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1.5,
                            bgcolor: "#22c55e",
                            color: "white",
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip
                          title={`IP: ${item.ip_address || "Chưa xác định"}`}
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

      {/* DIALOG POPUP PHÓNG TO ẢNH TRỰC TIẾP TRÊN TRANG */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
            position: "relative",
          },
        }}
      >
        <IconButton
          onClick={() => setSelectedImage(null)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(0,0,0,0.6)",
            color: "#ffffff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
          }}
        >
          <CloseRounded />
        </IconButton>
        {selectedImage && (
          <Box
            component="img"
            src={selectedImage}
            alt="Ảnh phóng to"
            sx={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 3,
              bgcolor: "#000000",
            }}
          />
        )}
      </Dialog>
    </Box>
  );
}
