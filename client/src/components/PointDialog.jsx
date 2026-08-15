import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";

import { Close } from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function PointDialog({ open, onClose, point, onSaved }) {
  const [form, setForm] = useState({
    point_code: "",
    point_name: "",
    area: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (point) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        point_code: point.point_code || "",
        point_name: point.point_name || "",
        area: point.area || "",
        description: point.description || "",
      });
    } else {
      setForm({
        point_code: "",
        point_name: "",
        area: "",
        description: "",
      });
    }
  }, [point, open]);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.point_code || !form.point_name) {
      alert("Vui lòng nhập mã và tên điểm");
      return;
    }

    setSaving(true);

    try {
      if (point) {
        await api.put(`/points/${point.id}`, form);
      } else {
        await api.post("/points", form);
      }

      onSaved();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3.5,
        },
      }}
    >
      {/* Header Modal */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
          fontSize: "1.15rem",
        }}
      >
        {point ? "CHỈNH SỬA ĐIỂM TUẦN TRA" : "THÊM ĐIỂM TUẦN TRA"}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <DialogContent dividers sx={{ px: 3, py: 2.5, borderBottom: "none" }}>
        <Stack spacing={2.5}>
          {/* Hàng 1: Mã điểm & Khu vực */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Mã điểm"
              required
              placeholder="VD: P001"
              value={form.point_code}
              onChange={handleChange("point_code")}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
              }}
            />

            <TextField
              fullWidth
              label="Khu vực"
              placeholder="VD: Khu vực A"
              value={form.area}
              onChange={handleChange("area")}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
              }}
            />
          </Stack>

          {/* Hàng 2: Tên điểm */}
          <TextField
            fullWidth
            label="Tên điểm"
            required
            placeholder="VD: Cổng chính"
            value={form.point_name}
            onChange={handleChange("point_name")}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
            }}
          />

          {/* Hàng 3: Mô tả */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Mô tả"
            placeholder="Ghi chú chi tiết vị trí hoặc hướng dẫn (không bắt buộc)..."
            value={form.description}
            onChange={handleChange("description")}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
            }}
          />
        </Stack>
      </DialogContent>

      {/* Footer Buttons */}
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5 }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 2.5,
            px: 3,
            fontWeight: 700,
            color: "text.secondary",
          }}
        >
          Hủy
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            borderRadius: 2.5,
            px: 3.5,
            py: 1,
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { boxShadow: "0 4px 12px rgba(25, 118, 210, 0.25)" },
          }}
        >
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
