import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import { useEffect, useState } from "react";

import api from "../services/api";

export default function GuardDialog({ open, onClose, guard, onSaved }) {
  const [form, setForm] = useState({
    guard_code: "",
    full_name: "",
    phone: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (guard) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        guard_code: guard.guard_code || "",

        full_name: guard.full_name || "",

        phone: guard.phone || "",
      });
    } else {
      setForm({
        guard_code: "",
        full_name: "",
        phone: "",
      });
    }
  }, [guard, open]);

  const change = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const save = async () => {
    if (!form.guard_code || !form.full_name) {
      alert("Vui lòng nhập mã và họ tên");

      return;
    }

    setSaving(true);

    try {
      if (guard) {
        await api.put(`/guards/${guard.id}`, form);
      } else {
        await api.post("/guards", form);
      }

      onSaved();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu bảo vệ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{guard ? "Chỉnh sửa bảo vệ" : "Thêm bảo vệ"}</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Mã bảo vệ"
          margin="normal"
          value={form.guard_code}
          onChange={change("guard_code")}
        />

        <TextField
          fullWidth
          label="Họ và tên"
          margin="normal"
          value={form.full_name}
          onChange={change("full_name")}
        />

        <TextField
          fullWidth
          label="Số điện thoại"
          margin="normal"
          value={form.phone}
          onChange={change("phone")}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>

        <Button variant="contained" onClick={save} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
