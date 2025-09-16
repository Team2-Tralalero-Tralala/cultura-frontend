import { useState } from "react";
import { Combobox } from "./Components/ComboBox";

function App() {
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const languages = [
        { value: "th", label: "ภาษาไทย" },
        { value: "en", label: "English" },
    ];
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="m-auto p-4 border rounded-xl shadow-lg items-center justify-center w-fit">
                <div>
                  ภาษาที่เลือก: {selectedLanguage ? languages.find(lang => lang.value === selectedLanguage)?.label : "ยังไม่ได้เลือก"}
                </div>
                <Combobox title="ภาษา" value={selectedLanguage} items={languages} onChange={setSelectedLanguage} />
            </div>
        </div>
    );
}

export default App;
