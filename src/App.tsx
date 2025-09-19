import { useState } from "react";
import { Combobox } from "./Components/ComboBox";

function App() {
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const languages = Array.from({ length: 20 }, (_, i) => ({
        value: i % 2 === 0 ? `lang${i}` : `lang${i}`,
        label: i % 2 === 0 ? `Language ${i}` : `ภาษา ${i}`,
    }));
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
