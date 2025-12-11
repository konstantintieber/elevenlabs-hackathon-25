import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

// Keep Item type consistent with App.tsx
type Item = {
  id: string;
  name: string;
  prompt: string;
  documents: unknown;
};

export default function Agent() {
  const { agentId } = useParams<{ agentId: string }>();

  const [agent, setAgent] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const API_BASE =
      (import.meta as any).env?.VITE_API_BASE || "https://libra-track.onrender.com";

    fetch(`${API_BASE}/agent/${agentId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load agent data: ${res.status}`);
        return res.json();
      })
      .then((item: Item) => {
        setAgent(item);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message || "Failed to load agent");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [agentId]);

  const handleSubmit = async () => {
    if (!agentId) return;
    setSubmitError(null);
    setSubmitMessage(null);
    setSubmitLoading(true);
    try {
      const API_BASE =
        (import.meta as any).env?.VITE_API_BASE || 'https://elevenlabs-hackathon-25.onrender.com';
      const res = await fetch(`${API_BASE}/agent/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // TODO: send actual updated agent
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with ${res.status}`);
      }
      const result = await res.json().catch(() => ({}));
      setSubmitMessage("Submitted successfully.");
      // Update item locally
      setAgent(result);
    } catch (e: any) {
      setSubmitError(e?.message || "Failed to submit");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      <Link
        className="underline absolute left-0 pl-12 text-2xl text-white "
        to="/"
      >
        &larr;
      </Link>
      <div className="flex flex-col justify-center h-full w-full gap-6 px-56">
        <h1 className="text-4xl font-semibold">Agent {agent?.name}</h1>
        {/*<div className="text-lg">*/}
        {/*  Agent ID: <span className="font-mono font-medium">{agentId}</span>*/}
        {/*</div>*/}

        {loading && <div>Loading…</div>}
        {error && !loading && <div className="text-red-600">{error}</div>}

        {!loading && !error && agent && (
          <div>
            <div className="flex flex-col items-start gap-x-6 gap-y-2">
              <div className="flex gap-3">
                <span className="font-bold text-xl text-right">Prompt:</span>
                <span className="text-xl">{agent.prompt}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-12 px-56">
        <div className="flex items-center gap-0">
          <button
            onClick={handleSubmit}
            disabled={submitLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/60 text-white font-medium px-4 py-2 rounded shadow"
          >
            {submitLoading ? "Saving…" : "Save"}
          </button>
          {submitMessage && (
            <span className="text-green-600">{submitMessage}</span>
          )}
          {submitError && <span className="text-red-600">{submitError}</span>}
        </div>
      </div>
    </div>
  );
}
