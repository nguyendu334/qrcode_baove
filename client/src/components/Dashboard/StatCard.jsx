import {
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

export function StatCard({ title, value, icon, color = "primary", subtext }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3.5,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start" // Đổi thành flex-start để Icon luôn ở góc trên bên PHẢI
          spacing={1.5}
        >
          {/* Cột chữ bên TRÁI */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>

            <Typography
              variant="h3"
              fontWeight={800}
              sx={{ my: 0.5, lineHeight: 1.2 }}
            >
              {value}
            </Typography>

            {subtext && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {subtext}
              </Typography>
            )}
          </Box>

          {/* Icon cố định góc trên bên PHẢI */}
          <Avatar
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
              color: `${color}.main`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
