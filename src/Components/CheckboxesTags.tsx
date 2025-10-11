//ลองทำยังไม่ได้ใช้
// import * as React from "react";
// import Autocomplete from "@mui/material/Autocomplete";
// import Checkbox from "@mui/material/Checkbox";
// import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
// import CheckBoxIcon from "@mui/icons-material/CheckBox";
// import Popper from "@mui/material/Popper";

// const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
// const checkedIcon = <CheckBoxIcon fontSize="small" />;

// const top100Films = [
//   { title: "The Shawshank Redemption" },
//   { title: "The Godfather" },
//   { title: "The Godfather: Part II" },
//   { title: "12 Angry Men" },
// ];

// function CustomPopper(props: any) {
//   return (
//     <Popper
//       {...props}
//       placement="bottom-start"
//       modifiers={[
//         { name: "flip", enabled: false },
//         { name: "preventOverflow", enabled: true },
//       ]}
//       style={{ zIndex: 1300 }}
//     />
//   );
// }

// export default function CheckboxAutocomplete({
//   onSelect,
// }: {
//   onSelect: (values: string[]) => void;
// }) {
//   const [selected, setSelected] = React.useState<{ title: string }[]>([]);
//   const handleChange = (_: any, newValue: { title: string }[]) => {
//     setSelected(newValue);
//     onSelect(newValue.map((v) => v.title)); // 👈 ส่งเฉพาะชื่อกลับ
//   };

//   return (
//     <div>
//       <Autocomplete
//         multiple
//         disablePortal
//         disableCloseOnSelect
//         PopperComponent={CustomPopper}
//         id="checkboxes-tags-demo"
//         options={top100Films}
//         getOptionLabel={(option) => option.title}
//         value={selected}
//         onChange={handleChange}
//         renderTags={() => null}
//         renderOption={(props, option, { selected }) => {
//           // Destructure 'key' for proper DOM keying in React (recommended)
//           const { key, ...optionProps } = props;
//           return (
//             <li key={key} {...optionProps}>
//               <Checkbox
//                 icon={icon}
//                 checkedIcon={checkedIcon}
//                 className="mr-2"
//                 checked={selected}
//               />
//               {option.title}
//             </li>
//           );
//         }}
//         renderInput={(params) => {
//           // Destructure props carefully
//           const { InputProps, inputProps } = params;
//           const { ref: InputRef, ...InputPropsRest } = InputProps;
//           const { ref: InputElementRef, ...inputPropsRest } = inputProps;

//           return (
//             <div
//               // Pass event handlers and wrapper-ref from InputProps to the outer div
//               {...InputPropsRest}
//               ref={InputRef}
//               className="w-full"
//             >
//               <label className="block text-base font-semibold text-gray-800 mb-1.5">
//                 สมาชิก
//               </label>
//               <div className="relative">
//                 <input
//                   // Pass native input props to the actual input element
//                   {...inputPropsRest}
//                   // Pass the actual input element ref here
//                   ref={InputElementRef}
//                   id="custom-autocomplete"
//                   type="text"
//                   placeholder="เลือกภาพยนตร์"
//                   className="block w-full rounded-form border-1
//                   border-gray-400 focus:ring-gray-400 focus:border-gray-500
//                   bg-white px-5 py-2 text-base text-gray-900 placeholder:text-gray-500
//                   leading-relaxed placeholder:leading-relaxed
//                   focus:outline-none focus:ring-1 transition-shadow"
//                 />
//               </div>
//             </div>
//           );
//         }}
//       />

//       <div className="mt-4">
//         <div className="font-semibold mb-1">สมาชิก:</div>
//         {selected.length === 0 ? (
//           <div className="text-gray-500">ยังไม่ได้เลือก</div>
//         ) : (
//           <ul className="list-disc pl-6 text-gray-800">
//             {selected.map((item) => (
//               <li key={item.title}>{item.title}</li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }
