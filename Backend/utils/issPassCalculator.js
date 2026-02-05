import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const calculateISSPasses = async (latitude, longitude) => {
    try {
        // Using n2yo.com API for ISS passes
        // ID 25544 is ISS
        const response = await axios.get(`https://api.n2yo.com/rest/v1/satellite/visualpasses/25544/${latitude}/${longitude}/0/2/300/&apiKey=${process.env.N2YO_API_KEY}`);

        // Parse response and format passes
        const passes = response.data.passes || [];

        return passes.map(pass => ({
            riseTime: new Date(pass.startUTC * 1000).toLocaleString(),
            maxElevation: pass.maxEl,
            duration: Math.round(pass.duration / 60), // convert to minutes
            direction: getDirection(pass.startAz, pass.endAz),
            startTime: new Date(pass.startUTC * 1000),
            hoursUntil: Math.round((new Date(pass.startUTC * 1000) - new Date()) / (1000 * 60 * 60))
        }));
    } catch (error) {
        console.error('ISS pass calculation error:', error);
        return [];
    }
};

const getDirection = (startAz, endAz) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const start = directions[Math.round(startAz / 45) % 8];
    const end = directions[Math.round(endAz / 45) % 8];
    return `${start} → ${end}`;
};
