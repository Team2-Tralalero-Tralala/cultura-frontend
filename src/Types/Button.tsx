export enum ButtonType {
  ConfirmTourist = "confirm-tourist",
  ConfirmAdmin = "confirm-admin",
  Cancel = "cancel",
}

export type BaseButtonProps = {
  children?: React.ReactNode;
  /** ชนิดสไตล์ของปุ่ม */
  type?: ButtonType;
  /** ชนิดปุ่มของ HTML: submit | reset | button */
  htmlType?: "button" | "submit" | "reset";
  onClick?: () => void;
};
