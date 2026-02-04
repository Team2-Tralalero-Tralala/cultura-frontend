/*
 * คำอธิบาย : Component สำหรับสร้าง Switch ที่สามารถปรับแต่ง Label ได้
 * โดยรองรับการกำหนดข้อความเมื่อเปิด (On) และปิด (Off)
 */

import Switch, { type SwitchProps } from "@mui/material/Switch";
import { styled } from "@mui/material/styles";

interface CustomSwitchProps extends SwitchProps {
  labelOn?: string;
  labelOff?: string;
}

const StyledSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: "var(--width)",
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 3,
    transitionDuration: "300ms",
    color: "#002f1a",
    "&.Mui-checked": {
      transform: "translateX(calc(var(--width) - 26px))",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#002f1a",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 20,
    height: 20,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#fff",
    opacity: 1,
    border: "1px solid #E9E9EA",
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    position: "relative",
    "&:before": {
      content: "var(--label-off)",
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 14,
      color: "#002f1a",
      fontWeight: "bold",
    },
    "&:after": {
      content: "var(--label-on)",
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 14,
      color: "#fff",
      fontWeight: "bold",
      display: "none",
    },
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    "&:before": {
      display: "none",
    },
    "&:after": {
      display: "block",
    },
  },
}));

/*
 * คำอธิบาย : ฟังก์ชัน Component สำหรับเรนเดอร์ Switch ที่มี Label อยู่ภายใน Track
 * Input : CustomSwitchProps (labelOn, labelOff, sx, ...props)
 * Output : <Switch> element ที่มีการปรับแต่งสไตล์
 */
const CustomSwitch = ({ labelOn = "เปิด", labelOff = "ปิด", sx, ...props }: CustomSwitchProps) => {
  const dynamicWidth = Math.max(labelOn.length, labelOff.length) * 5 + 50;

  return (
    <StyledSwitch
      sx={{
        "--width": `${dynamicWidth}px`,
        "--label-on": `"${labelOn}"`,
        "--label-off": `"${labelOff}"`,
        ...sx,
      }}
      {...props}
    />
  );
};

export default CustomSwitch;
