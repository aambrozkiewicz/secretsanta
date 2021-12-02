import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../api";

function Wishlist() {
  const { hash } = useParams();
  const [wish, setWish] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function data() {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/wishlist/${hash}`);
      const jsonResponse = await response.json();

      setLoading(false);
      setWish(jsonResponse.wish);
      setNotes(jsonResponse.notes);
    }

    data();
  }, [hash]);

  async function saveNotes() {
    setLoading(true);

    await fetch(`${API_BASE_URL}/${hash}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    setLoading(false);
    setSaved(true);
  }

  return (
    <>
      {wish && (
        <section className="panel text-center">
          <div>Osoba, dla której przygotowujesz prezent, daje Ci wskazówki</div>
          <div className="wish mt-1">{wish}</div>
        </section>
      )}

      <section className="panel text-center">
        <div>Poniżej możesz wpisać swoje wskazówki dla swojego Mikołaja</div>
        <div className="mt-1">
          <textarea
            rows="5"
            style={{ width: "100%" }}
            placeholder="Marzy mi się ..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </section>
      <div className="flex-column-center">
        <button className="btn" onClick={saveNotes} disabled={loading}>
          Zapisz i powiadom Mikołaja
        </button>
        {!loading && saved && (
          <div className="mt-1">
            Wskazówki zostały zapisane i przekazane Mikołajowi
          </div>
        )}
        {loading && <div className="loader mt-1"></div>}
      </div>
    </>
  );
}

export default Wishlist;
