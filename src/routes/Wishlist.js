import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../api";

function Wishlist() {
  const { hash } = useParams();
  const [wish, setWish] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function data() {
      const response = await fetch(`${API_BASE_URL}/wishlist/${hash}`);
      const jsonResponse = await response.json();
      setWish(jsonResponse.wish);
      setNotes(jsonResponse.notes);
    }

    data();
  }, [hash]);

  async function saveNotes() {
    await fetch(`${API_BASE_URL}/${hash}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
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
      <div className="text-center">
        <button className="btn" onClick={saveNotes}>
          Zapisz i powiadom Mikołaja
        </button>
      </div>
    </>
  );
}

export default Wishlist;
