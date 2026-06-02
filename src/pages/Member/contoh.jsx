// File: src/pages/TemplateKosong.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function NamaHalamanIni() { // <-- GANTI NAMA FUNCTION INI
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bagian API Axios (Ganti URL-nya nanti) buat masukin api manggilnya entah gimana
  useEffect(() => {
    axios.get("https://fakestoreapi.com/products?limit=10")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-5">Biji</h1>
      tambahin /contohadmin buat liat dasboard admin, <br /> /contohmember buat liat dashboard member 
      <br />
      (di linknya)
    </main>
  );
}