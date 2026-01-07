import { useState, useEffect } from "react";
import { getISSLocation } from "./services/api";

function TestAPI() {
  const [issData, setIssData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getISSLocation()
      .then((response) => {
        if (!isMounted) return;
        setIssData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("ISS API error:", err.response?.data ?? err.message);
        setError("Failed to fetch ISS data.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Backend Connection Test</h1>
      {issData ? (
        <div>
          <h2>ISS Location:</h2>
          <p>Latitude: {issData?.iss_position?.latitude ?? "—"}</p>
          <p>Longitude: {issData?.iss_position?.longitude ?? "—"}</p>
          <p>
            Timestamp:{" "}
            {issData?.timestamp
              ? new Date(issData.timestamp * 1000).toLocaleString()
              : "—"}
          </p>
        </div>
      ) : (
        <div>No data returned from backend.</div>
      )}
    </div>
  );
}

export default TestAPI;
