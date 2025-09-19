/*
 * คำอธิบาย : Component สำหรับเลือกตำแหน่งบนแผนที่ (MapPicker)
 * ใช้ React Leaflet ในการแสดงแผนที่, Marker และ Popup
 * รองรับการค้นหาพิกัดด้วย OpenStreetMapProvider
 * Input: props (startingPosition?, startingZoom?, onChange?)
 * Output: UI Map Picker ที่เลือกตำแหน่งและคืนค่า lat/lng ผ่าน onChange
 */

import React from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover";
import type { Map as LeafletMap } from "leaflet";
import { Icon } from "@iconify/react";

/*
 * คำอธิบาย : Component ย่อยสำหรับเปลี่ยนมุมมองแผนที่ไปยัง center ใหม่
 * Input : center (tuple [lat, lng])
 * Output : null (อัปเดต view ของ Leaflet map)
 */
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}

/*
 * คำอธิบาย : Component ย่อยสำหรับให้ผู้ใช้คลิกบนแผนที่เพื่อเลือกตำแหน่งใหม่
 * Input : onPick (callback รับ lat,lng)
 * Output : null (เรียก onPick เมื่อผู้ใช้คลิก)
 */
function ClickToMoveMarker({
    onPick,
}: {
    onPick: (latlng: [number, number]) => void;
}) {
    const map = useMap();
    React.useEffect(() => {
        const handle = (e: any) => {
            const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
            onPick(latlng);
        };
        map.on("click", handle);
        return () => {
            map.off("click", handle);
        };
    }, [map, onPick]);
    return null;
}

type MapPickerProps = {
    startingPosition?: [number, number];
    startingZoom?: number;
    onChange?: (latlng: [number, number]) => void;
};

/*
 * คำอธิบาย : Component หลัก MapPicker
 * - แสดง input lat/lng
 * - รองรับการค้นหาชื่อสถานที่ด้วย OpenStreetMap
 * - แสดงผลลัพธ์ใน Popover
 * - ผู้ใช้สามารถปักหมุดโดยคลิกหรือย้ายแผนที่
 * Input : startingPosition, startingZoom, onChange
 * Output : UI Map Picker พร้อมค่าพิกัด lat/lng
 */
function MapPicker({
    startingPosition = [13.7563, 100.5018], // Bangkok
    startingZoom = 13,
    onChange = () => {},
}: MapPickerProps) {
    const mapRef = React.useRef<LeafletMap | null>(null);
    const searchInputRef = React.useRef<HTMLInputElement | null>(null);

    // State หลักเก็บพิกัด, lat, lng, และข้อความค้นหา
    const [position, setPosition] = React.useState<[number, number]>(startingPosition);
    const [lat, setLat] = React.useState<number>(startingPosition[0]);
    const [lng, setLng] = React.useState<number>(startingPosition[1]);
    const [search, setSearch] = React.useState<string>("");

    // แจ้ง parent เมื่อ position เปลี่ยน
    React.useEffect(() => {
        onChange(position);
    }, [position, onChange]);

    const [_popOverOpen, _setPopOverOpen] = React.useState(false);

    // Provider สำหรับค้นหาสถานที่ จำกัดในประเทศไทย
    const providerRef = React.useRef(
        new OpenStreetMapProvider({
            params: {
                countrycodes: "th",
                "accept-language": "th",
                bounded: 1,
                limit: 5,
                addressdetails: 1,
            },
        })
    );

    // sync lat/lng กับตำแหน่ง marker
    React.useEffect(() => {
        setLat(position[0]);
        setLng(position[1]);
    }, [position]);

    // อัปเดตตำแหน่งเมื่อแก้ไขค่า lat/lng ใน input
    const handleLatChange = (v: string) => {
        const n = Number(v);
        setLat(n);
        if (!Number.isNaN(n)) setPosition([n, position[1]]);
    };
    const handleLngChange = (v: string) => {
        const n = Number(v);
        setLng(n);
        if (!Number.isNaN(n)) setPosition([position[0], n]);
    };

    const [results, setResults] = React.useState<any[]>([]); // เก็บผลลัพธ์ค้นหา

    /*
     * ฟังก์ชันค้นหาสถานที่ (GeoSearch)
     * Input : query string
     * Output : อัปเดตผลลัพธ์และเปิด Popover
     */
    const doSearch = React.useCallback(async (q: string) => {
        if (!q.trim()) return;
        try {
            const results = await providerRef.current.search({ query: q.trim() });
            if (results.length > 0) {
                _setPopOverOpen(true);
                setResults(results);
            }
        } catch (e) {
            console.error("Geosearch error:", e);
        }
    }, []);

    // debounce 500ms ก่อนค้นหา
    React.useEffect(() => {
        if (!search.trim()) return;
        const t = setTimeout(() => doSearch(search), 500);
        return () => clearTimeout(t);
    }, [search, doSearch]);

    // กด Enter เพื่อค้นหาทันที
    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            doSearch(search);
        }
    };

    // เลือกผลลัพธ์ -> ปิด popover และอัปเดต marker
    const handlePick = (item: any) => {
        const { x, y } = item;
        if (typeof x === "number" && typeof y === "number") {
            setPosition([y, x]);
        }
        _setPopOverOpen(false);
    };
    return (
        <div className="flex flex-col gap-2">
            {/* Lat/Lng fields */}
            <div className="flex flex-1 gap-4">
                <div className="flex flex-1 flex-col">
                    <label className="block text-sm font-bold mb-1">
                        ละติจูด <span className="text-[#E10000]">*</span>
                    </label>
                    <input
                        type="number"
                        value={lat}
                        onChange={(e) => handleLatChange(e.target.value)}
                        className="border rounded px-2 py-1"
                        name="latitude"
                        placeholder="ป้อนละติจูดของที่ตั้งวิสาหกิจชุมชน"
                    />
                </div>
                <div className="flex flex-1 flex-col">
                    <label className="block text-sm font-bold mb-1">
                        ลองจิจูด <span className="text-[#E10000]">*</span>
                    </label>
                    <input
                        type="number"
                        value={lng}
                        onChange={(e) => handleLngChange(e.target.value)}
                        className="border rounded px-2 py-1"
                        name="longitude"
                        placeholder="ป้อนลองจิจูดของที่ตั้งวิสาหกิจชุมชน"
                    />
                </div>
            </div>

            <span className="text-xs">
                หากคุณไม่ทราบละติจูดและลองจิจูดของวิสาหกิจชุมชน
                โปรดค้นหาวิสาหกิจชุมชนและปักหมุด
            </span>
            {/* Search box + strictly controlled popover */}
            <Popover
                open={_popOverOpen}
                onOpenChange={(v) => _setPopOverOpen(v)}
            >
                {/* Non-interactive trigger (won't toggle on click) */}
                <PopoverTrigger asChild>
                    <span
                        aria-hidden
                        className="block h-0 w-0 overflow-hidden pointer-events-none"
                        tabIndex={-1}
                    />
                </PopoverTrigger>

                {/* Anchor the popover to the real search container */}
                <PopoverAnchor asChild>
                    <div className="flex flex-1 flex-col">
                        <label className="block text-sm font-bold mb-1">
                            ค้นหาวิสาหกิจชุมชน
                        </label>
                        <div
                            className="flex gap-2 border px-2 py-1 rounded"
                            data-popover-anchor
                            onClick={() => {
                                // Focus input when clicking anywhere on the search box
                                if (searchInputRef.current) {
                                    searchInputRef.current.focus();
                                }
                            }}
                        >
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                ref={searchInputRef}
                                onKeyDown={onSearchKeyDown}
                                placeholder="ป้อนชื่อวิสาหกิจชุมชนหรือสถานที่ใกล้เคียงเพื่อปักหมุด"
                                className="w-full outline-none focus:ring-0 focus:border-transparent"
                                // ⬇️ make sure focusing/clicking input never toggles popover
                                onFocus={() => {
                                    /* no-op: we do not auto-open */
                                }}
                                onClick={() => {
                                    /* no-op */
                                }}
                            />
                            {/* <button
                                onClick={() => doSearch(search)}
                                className="bg-green-700 text-white px-4 rounded"
                                type="button"
                            >
                                ค้นหา
                            </button> */}
                            <Icon
                                icon="mingcute:search-line"
                                width="24"
                                height="24"
                            />
                        </div>
                        {/* <p className="text-xs text-gray-500 mt-1">
                            จะค้นหาอัตโนมัติหลังหยุดพิมพ์ 500 มิลลิวินาที
                        </p> */}
                    </div>
                </PopoverAnchor>

                {/* Popover matches the anchor width */}
                <PopoverContent
                    className="z-[99999] p-0 w-[var(--radix-popover-trigger-width)]"
                    sideOffset={6}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    {/* Results list */}
                    <div className="max-h-72 overflow-auto">
                        {results.length === 0 ? (
                            <div className="p-3 text-sm text-gray-500">
                                ไม่พบผลลัพธ์
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {results.map((r, idx) => (
                                    <li
                                        key={idx}
                                        className="p-3 hover:bg-green-50 cursor-pointer"
                                        onClick={() => handlePick(r)}
                                    >
                                        <div className="text-sm font-medium">
                                            {r.label ||
                                                r?.raw?.display_name ||
                                                "ไม่ทราบชื่อสถานที่"}
                                        </div>
                                        {typeof r.y === "number" &&
                                            typeof r.x === "number" && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    lat: {r.y.toFixed(6)} · lng:{" "}
                                                    {r.x.toFixed(6)}
                                                </div>
                                            )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            {/* Map */}
            <div className="w-full h-[400px]">
                <MapContainer
                    center={position}
                    zoom={startingZoom ?? 13}
                    scrollWheelZoom={false}
                    style={{ height: "100%" }}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Click anywhere on the map to move the main marker */}
                    <ClickToMoveMarker
                        onPick={(latlng) => {
                            setPosition(latlng); // move marker
                            _setPopOverOpen(false); // optional: close results popover
                        }}
                    />

                    <Marker position={position}>
                        <Popup>ตำแหน่งที่เลือก</Popup>
                    </Marker>
                    <ChangeView center={position} />
                </MapContainer>
            </div>
            <div className="flex items-end justify-between mt-2">
                <div className="text-xs">
                    <span>หากคุณหาวิสาหกิจชุมชนไม่เจอ โปรดทำตามคำแนะนำ</span>
                    <ol className="list-decimal ml-4">
                        <li>ค้นหาสถานที่ใกล้เคียงวิสาหกิจชุมชน</li>
                        <li>เลื่อนแผนที่ไปยังบริเวณวิสาหกิจชุมชนของคุณ</li>
                        <li>คลิกตำแหน่งวิสาหกิจชุมชนบนแผนที่เพื่อปักหมุด</li>
                        <li>กดปุ่มปักหมุด</li>
                    </ol>
                </div>
                <div
                    className="bg-[#055035] rounded py-2 px-8 text-white"
                    onClick={() => {
                        const map = mapRef.current;
                        if (!map) return;
                        const c = map.getCenter();
                        setPosition([c.lat, c.lng]); // move main marker to current center
                        _setPopOverOpen(false); // optional
                    }}
                >
                    ปักหมุด
                </div>
            </div>
        </div>
    );
}

export default MapPicker;
