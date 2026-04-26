import { useState } from "react";
import { TrainerPage } from "./pages/TrainerPage";
import { LibraryPage } from "./pages/LibraryPage";
import { DebugPage } from "./pages/DebugPage";

type Tab = "trainer" | "library" | "debug";

export function App() {
  const [tab, setTab] = useState<Tab>("trainer");
  return (
    <div className="app">
      <header className="topbar">
        <h1>Chord Progression Trainer</h1>
        <nav className="tabs">
          <button
            className={tab === "trainer" ? "active" : ""}
            onClick={() => setTab("trainer")}
          >
            Trainer
          </button>
          <button
            className={tab === "library" ? "active" : ""}
            onClick={() => setTab("library")}
          >
            Library
          </button>
          <button
            className={tab === "debug" ? "active" : ""}
            onClick={() => setTab("debug")}
          >
            Debug
          </button>
        </nav>
      </header>
      <main className="page">
        {tab === "trainer" && <TrainerPage />}
        {tab === "library" && <LibraryPage />}
        {tab === "debug" && <DebugPage />}
      </main>
    </div>
  );
}
