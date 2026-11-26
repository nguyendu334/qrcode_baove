import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
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
  Close,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "../../services/api";
import PointDialog from "../../components/PointDialog";
import QRDialog from "../../components/QRDialog";

import patrolMapImg from "../../assets/map1.png";
import patrolMapImg2 from "../../assets/map2.png";

export default function PatrolPoints() {
  const [points, setPoints] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [qrPoint, setQrPoint] = useState(null);

  const [selectedMapImg, setSelectedMapImg] = useState(null);

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

    if (!confirmDelete) return;

    try {
      await api.delete(`/points/${point.id}`);

      // Cập nhật State xóa điểm đó khỏi danh sách hiển thị lập tức
      setPoints((prevPoints) => prevPoints.filter((p) => p.id !== point.id));

      // Đồng bộ lại dữ liệu từ Server
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

      {/* CARD SƠ ĐỒ MẶT BẰNG ĐÃ CĂN CHỈNH KHOẢNG CÁCH THẨM MỸ */}
      <Card
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          mt: 3, // Khoảng cách giữa Bảng và Card sơ đồ
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 3 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0f172a">
              {t("point_management.map_title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t("point_management.map_subtitle")}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ px: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                Tầng 1
              </Typography>
              
            </Box>
          </Box>

          <Box
            sx={{
              width: "100%",
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              py: 2, 
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#3b82f6",
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.1)",
              },
            }}
          >
            <Box
              component="img"
              src={patrolMapImg}
              onClick={() => setSelectedMapImg(patrolMapImg)}
              alt="Sơ đồ bảo vệ tuần tra"
              sx={{
                maxWidth: "100%",
                maxHeight: 500,
                width: "auto",
                height: "auto",
                display: "block",
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
          </Box>
        </CardContent>

        <CardContent sx={{ px: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0f172a">
                Tầng 2
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: "100%",
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              py: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#3b82f6",
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.1)",
              },
            }}
          >
            <Box
              component="img"
              src={patrolMapImg2}
              onClick={() => setSelectedMapImg(patrolMapImg2)}
              alt="Sơ đồ bảo vệ tuần tra"
              sx={{
                maxWidth: "100%",
                maxHeight: 500,
                width: "auto",
                height: "auto",
                display: "block",
                objectFit: "contain",
                borderRadius: 1,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* DIALOG POPUP PHÓNG TO SƠ ĐỒ KHI BẤM VÀO ẢNH */}
      <Dialog
        open={Boolean(selectedMapImg)}
        onClose={() => setSelectedMapImg(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: "#ffffff",
            p: 1,
            position: "relative",
          },
        }}
      >
        <IconButton
          onClick={() => setSelectedMapImg(null)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "#ffffff",
            zIndex: 10,
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <Close />
        </IconButton>

        <Box
          component="img"
          src={selectedMapImg}
          alt="Sơ đồ phóng to"
          sx={{
            width: "100%",
            height: "auto",
            maxHeight: "85vh",
            objectFit: "contain",
            borderRadius: 2,
          }}
        />
      </Dialog>

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
