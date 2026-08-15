import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { Close, ContentCopy, Print } from "@mui/icons-material";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export default function QRDialog({ open, point, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!point) {
    return null;
  }

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const url = `${baseUrl}/patrol?point=${point.qr_token}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
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
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 600,
          fontSize: "1.1rem",
        }}
      >
        MÃ QR TUẦN TRA
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2, borderBottom: "none" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Khung chứa QR code - Căn giữa tuyệt đối */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#ffffff",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2,
            }}
          >
            <QRCodeSVG value={url} size={200} />
          </Box>

          {/* Mã & Tên điểm - Căn giữa đồng bộ với QR */}
          <Typography
            variant="h6"
            fontWeight={800}
            color="primary.main"
            sx={{ width: "100%", textAlign: "center", lineHeight: 1.2 }}
          >
            {point.point_code}
          </Typography>

          <Typography
            variant="body2"
            fontWeight={600}
            color="text.secondary"
            sx={{ width: "100%", textAlign: "center", mt: 0.5, mb: 2 }}
          >
            {point.point_name}
          </Typography>

          {/* Box đường dẫn - Căn lề trái & Ép font sans-serif */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: "#f8fafc",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2.5,
              width: "100%",
              boxSizing: "border-box",
              textAlign: "left",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              fontWeight={700}
              sx={{ mb: 0.5, fontFamily: "sans-serif, system-ui, Roboto" }}
            >
              Đường dẫn quét QR:
            </Typography>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  wordBreak: "break-all",
                  color: "primary.main",
                  fontWeight: 500,
                  fontSize: "0.78rem",
                  textDecoration: "underline",
                  fontFamily: "sans-serif, system-ui, Roboto !important", // Ép font không chân chuẩn UI
                  "&:hover": {
                    color: "primary.dark",
                  },
                }}
              >
                {url}
              </Typography>

              <Tooltip title={copied ? "Đã sao chép!" : "Sao chép đường dẫn"}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  color={copied ? "success" : "default"}
                  sx={{ flexShrink: 0 }}
                >
                  <ContentCopy sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      {/* Nút In QR */}
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrint}
          fullWidth
          size="large"
          sx={{
            borderRadius: 2.5,
            py: 1.2,
            fontWeight: 700,
            boxShadow: "none",
            fontSize: "0.9rem",
          }}
        >
          In QR
        </Button>
      </DialogActions>
    </Dialog>
  );
}
