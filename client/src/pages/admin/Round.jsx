/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Tooltip,
} from "@mui/material";
import { Edit, AccessTimeRounded, AddRounded } from "@mui/icons-material";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";

import api from "../../services/api";

export default function RoundManagement() {
  const { t } = useTranslation();

  const [rounds, setRounds] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingRound, setEditingRound] = useState(null); // null: Thêm mới, object: Chỉnh sửa
  const [formData, setFormData] = useState({
    round_name: "",
    start_time: "08:00:00",
    end_time: "09:00:00",
    is_active: true,
  });

  useEffect(() => {
    loadRounds();
  }, []);

  const loadRounds = async () => {
    try {
      const response = await api.get("/rounds");
      setRounds(response.data.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách vòng tuần tra");
    }
  };

  // Mở modal Thêm mới
  const handleOpenAdd = () => {
    setEditingRound(null);
    setFormData({
      round_name: "",
      start_time: "08:00:00",
      end_time: "09:00:00",
      is_active: true,
    });
    setOpenModal(true);
  };

  // Mở modal Sửa vòng
  const handleOpenEdit = (round) => {
    setEditingRound(round);
    setFormData({
      round_name: round.round_name || "",
      start_time: round.start_time || "",
      end_time: round.end_time || "",
      is_active: round.is_active ?? true,
    });
    setOpenModal(true);
  };

  // Bật/tắt trạng thái
  const handleToggleActive = async (round) => {
    try {
      const updatedActive = !round.is_active;
      await api.put(`/rounds/${round.id}`, { is_active: updatedActive });
      setRounds((prev) =>
        prev.map((r) =>
          r.id === round.id ? { ...r, is_active: updatedActive } : r,
        ),
      );
      toast.success(
        `Đã ${updatedActive ? "bật" : "tắt"} "${round.round_name}"`,
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái",
      );
    }
  };

  // Lưu thông tin (Tự động phân biệt Thêm mới hoặc Cập nhật)
  const handleSave = async () => {
    if (!formData.round_name || !formData.start_time || !formData.end_time) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      if (editingRound) {
        // Cập nhật
        const response = await api.put(`/rounds/${editingRound.id}`, formData);
        if (response.data.success) {
          toast.success(t("round_management.update_success"));
        }
      } else {
        // Thêm mới
        const response = await api.post("/rounds", formData);
        if (response.data.success) {
          toast.success(t("round_management.add_success"));
        }
      }
      setOpenModal(false);
      loadRounds();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER & NÚT THÊM */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="#0f172a">
            {t("round_management.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("round_management.subtitle")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddRounded />}
          onClick={handleOpenAdd}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 2.5,
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
          }}
        >
          {t("round_management.add_button")}
        </Button>
      </Box>

      {/* DANH SÁCH BẢNG */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "10%",
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "25%",
                    }}
                  >
                    {t("round_management.round_name")}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "20%",
                    }}
                  >
                    {t("round_management.start_time")}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "20%",
                    }}
                  >
                    {t("round_management.end_time")}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "15%",
                    }}
                  >
                    {t("round_management.status")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      width: "10%",
                    }}
                  >
                    {t("round_management.action")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rounds.map((row, index) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {index + 1}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="#0f172a"
                      >
                        {t(`round_management.${row.round_name}`)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        icon={
                          <AccessTimeRounded
                            sx={{ fontSize: "14px !important" }}
                          />
                        }
                        label={row.start_time}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        icon={
                          <AccessTimeRounded
                            sx={{ fontSize: "14px !important" }}
                          />
                        }
                        label={row.end_time}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Switch
                        checked={Boolean(row.is_active)}
                        onChange={() => handleToggleActive(row)}
                        color="success"
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(row)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* DIALOG THÊM / CHỈNH SỬA VÒNG */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>
          {editingRound ? t("round_management.modal_edit_title") : t("round_management.modal_add_title")}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label={t("round_management.round_name")}
              placeholder="VD: Vòng 19"
              fullWidth
              size="small"
              value={formData.round_name}
              onChange={(e) =>
                setFormData({ ...formData, round_name: e.target.value })
              }
            />

            <TextField
              label={t("round_management.start_time")}
              type="time"
              fullWidth
              size="small"
              inputProps={{ step: 1 }}
              InputLabelProps={{ shrink: true }}
              value={formData.start_time}
              onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
              }
            />

            <TextField
              label={t("round_management.end_time")}
              type="time"
              fullWidth
              size="small"
              inputProps={{ step: 1 }}
              InputLabelProps={{ shrink: true }}
              value={formData.end_time}
              onChange={(e) =>
                setFormData({ ...formData, end_time: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            {t("round_management.cancel")}
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingRound ? t("round_management.save") : t("round_management.add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
