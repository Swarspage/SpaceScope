import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Lightbulb, Info } from 'lucide-react';

const LightPollutionMap = () => {
    // NASA GIBS VIIRS Earth at Night 2012
    const TILE_URL = "https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/2012-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpg";

    // Center on Korean Peninsula for high contrast example
    const CENTER = [38.00, 127.50];

    return (
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            <MapContainer
                center={CENTER}
                zoom={6}
                style={{ height: "100%", width: "100%", background: '#000000' }}
                zoomControl={false}
                minZoom={3}
                maxZoom={8}
            >
                <TileLayer
                    url={TILE_URL}
                    attribution="NASA Earth Observatory"
                    maxZoom={8}
                />
            </MapContainer>

            {/* UI Overlay */}
            <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl max-w-xs pointer-events-auto">
                    <div className="flex items-center gap-3 mb-2 text-[#facc15]">
                        <Lightbulb size={20} className="drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                        <h3 className="font-bold text-white text-sm tracking-wide">Nighttime Lights (VIIRS)</h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        Bright areas indicate high urbanization or energy usage.
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-mono border-t border-white/10 pt-2">
                        <Info size={10} />
                        <span>Satellite: Suomi NPP</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LightPollutionMap;
