import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Cloud, Info } from 'lucide-react';

const CloudCoverMap = () => {
    // NASA GIBS MODIS Terra Corrected Reflectance (True Color)
    // Using a recent static date to ensure tile availability
    const TILE_URL = "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-06-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg";

    return (
        <div className="relative w-full h-full bg-[#0a0e17] rounded-xl overflow-hidden">
            <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%", background: '#0a0e17' }}
                zoomControl={false}
                minZoom={2}
                maxZoom={9}
            >
                {/* 
                    NASA GIBS layers act as base layers.
                */}
                <TileLayer
                    url={TILE_URL}
                    attribution="NASA Earth Observatory"
                    maxZoom={9}
                />
            </MapContainer>

            {/* UI Overlay */}
            <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl max-w-xs pointer-events-auto">
                    <div className="flex items-center gap-3 mb-2 text-white">
                        <Cloud size={20} className="text-white" />
                        <h3 className="font-bold text-sm tracking-wide">Cloud Cover (MODIS)</h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        True-color satellite imagery showing global cloud formations.
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-mono border-t border-white/10 pt-2">
                        <Info size={10} />
                        <span>Source: NASA GIBS (Terra)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CloudCoverMap;
