import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";

import {
  Add,
  Edit,
  Delete,
  QrCode2,
  Search,
  LocationOffRounded,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "../../services/api";
import PointDialog from "../../components/PointDialog";
import QRDialog from "../../components/QRDialog";

export default function PatrolPoints() {
  const [points, setPoints] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [qrPoint, setQrPoint] = useState(null);

  const { t } = useTranslation();

  const loadPoints = async () => {
    try {
      const response = await api.get("/points");
      setPoints(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPoints();
  }, []);

  const handleAdd = () => {
    setEditingPoint(null);
    setOpenDialog(true);
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setOpenDialog(true);
  };

  const handleDelete = async (point) => {
    const confirmDelete = window.confirm(`Khóa điểm "${point.point_name}"?`);

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/points/${point.id}`);
      loadPoints();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể khóa điểm");
    }
  };

  const filteredPoints = points.filter((point) => {
    const keyword = search.toLowerCase();

    return (
      point.point_code.toLowerCase().includes(keyword) ||
      point.point_name.toLowerCase().includes(keyword) ||
      (point.area || "").toLowerCase().includes(keyword)
    );
  });

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Header section */}
      {/* Header section - Ép khung dàn ngang 100% */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {t("point_management.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("point_management.subtitle")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: "none",
            "&:hover": { boxShadow: "0 4px 12px rgba(25, 118, 210, 0.25)" },
          }}
        >
          {t("point_management.add_point")}
        </Button>
      </Box>

      {/* Table Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          {/* Search Bar */}
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm mã điểm, tên điểm, khu vực..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
              },
            }}
          />

          {/* Table Container */}
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    {t("point_management.point_code")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    {t("point_management.point_name")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    {t("point_management.area")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
                    {t("point_management.status")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, color: "text.secondary" }}
                  >
                    {t("point_management.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPoints.map((point) => (
                  <TableRow
                    key={point.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>
                      <Typography
                        fontWeight={700}
                        variant="body2"
                        color="primary.main"
                      >
                        {point.point_code}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {point.point_name}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {point.area || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={point.is_active ? "Hoạt động" : "Đã khóa"}
                        color={point.is_active ? "success" : "default"}
                        variant={point.is_active ? "filled" : "outlined"}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Xem mã QR">
                        <IconButton
                          size="small"
                          onClick={() => setQrPoint(point)}
                          sx={{
                            color: "primary.main",
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.08),
                            mr: 1,
                            "&:hover": {
                              bgcolor: (theme) =>
                                alpha(theme.palette.primary.main, 0.16),
                            },
                          }}
                        >
                          <QrCode2 fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(point)}
                          sx={{ mr: 1 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Khóa điểm">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(point)}
                          sx={{
                            "&:hover": {
                              bgcolor: (theme) =>
                                alpha(theme.palette.error.main, 0.08),
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Empty State */}
                {filteredPoints.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <LocationOffRounded
                        sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Không tìm thấy điểm tuần tra nào phù hợp
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <PointDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        point={editingPoint}
        onSaved={() => {
          setOpenDialog(false);
          loadPoints();
        }}
      />

      <QRDialog
        open={Boolean(qrPoint)}
        point={qrPoint}
        onClose={() => setQrPoint(null)}
      />
    </Box>
  );
}
