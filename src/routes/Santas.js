import { useArray } from "../hooks";
import { useState } from "react";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";

function Santas() {
  const navigate = useNavigate();
  const { items: santas, add, remove } = useArray();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function postSantas() {
    setLoading(true);

    try {
      await fetch(`${API_BASE_URL}/santas`, {
        method: "POST",
        body: JSON.stringify({ emails: santas }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      navigate("/thankyou");
    } finally {
      setLoading(false);
    }
  }

  function addEmail() {
    if (email.includes("@")) {
      add(email);
      setEmail("");
    }
  }

  return (
    <>
      <section className="panel">
        <div className="flex-between-center">
          Uczestnicy
          <div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mr-1"
              placeholder="Adres e-mail"
            />
            <button className="btn" onClick={addEmail}>
              Dodaj
            </button>
          </div>
        </div>
        <ul>
          {santas.length === 0 && <li>Jeszcze nikogo nie ma </li>}
          {santas.map((member, i) => (
            <li key={i}>
              {member} &mdash;{" "}
              <span onClick={() => remove(i)} style={{ cursor: "pointer" }}>
                Usuń
              </span>
            </li>
          ))}
        </ul>
      </section>
      <div className="flex-column-center">
        <button
          className="btn"
          onClick={postSantas}
          disabled={santas.length === 0 || loading}
        >
          Gotowe, losuj i wyślij e-maile
        </button>
        {loading && <div className="loader mt-1"></div>}
      </div>
    </>
  );
}

export default Santas;
