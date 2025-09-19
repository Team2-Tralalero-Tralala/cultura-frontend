// import { useState } from "react";
// import { Combobox } from "./Components/ComboBox";
import { useState } from "react";
import MapPicker from "./Components/MapPicker";

function App() {
    // const [selectedLanguage, setSelectedLanguage] = useState("");
    // const languages = Array.from({ length: 20 }, (_, i) => ({
    //     value: i % 2 === 0 ? `lang${i}` : `lang${i}`,
    //     label: i % 2 === 0 ? `Language ${i}` : `ภาษา ${i}`,
    // }));
    const startingPosition: [number, number] = [14.897192, 102.015709]; // BUU
    const startingZoom = 13;
    const [position, setPosition] = useState<[number, number]>(
        startingPosition
    );
    return (
        <div className="flex items-center justify-center min-h-screen">
            {/* <div className="m-auto p-4 border rounded-xl shadow-lg items-center justify-center w-fit">
                <div>
                    ภาษาที่เลือก:{" "}
                    {selectedLanguage
                        ? languages.find(
                              (lang) => lang.value === selectedLanguage
                          )?.label
                        : "ยังไม่ได้เลือก"}
                </div>
                <Combobox
                    title="ภาษา"
                    value={selectedLanguage}
                    items={languages}
                    onChange={setSelectedLanguage}
                />
            </div> */}
            <div className="m-auto p-4 border rounded-xl shadow-lg items-center justify-center w-fit">
                <div>
                    ตำแหน่งที่เลือก: ละติจูด {position[0].toFixed(6)} , ลองจิจูด{" "}
                    {position[1].toFixed(6)}
                </div>
            </div>
            <div className="m-auto p-4 border rounded-xl shadow-lg items-center justify-center w-fit">
                <MapPicker
                    startingPosition={startingPosition}
                    startingZoom={startingZoom}
                    onChange={setPosition}
                />
            </div>
        </div>
    );
}

export default App;
