export type ButtonType = "confirm-tourist" | "confirm-admin" | "cancel";

export interface BaseButtonProps {
  children?: React.ReactNode;
  /** ชนิดสไตล์ของปุ่ม */
  type?: ButtonType;
  /** ชนิดปุ่มของ HTML: submit | reset | button */
  htmlType?: "button" | "submit" | "reset";
  onClick?: () => void;
}
