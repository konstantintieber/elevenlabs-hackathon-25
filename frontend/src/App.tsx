import "./App.css";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type AgentItem = {
  id: string;
  name: string;
};

function App() {
  // onst [agents, setAgents] = useState<AgentItem[]>([{ id: '123', name: 'John'}]);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const API_BASE =
    import.meta.env?.VITE_API_BASE ||
    "https://elevenlabs-hackathon-25.onrender.com";

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/agents`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok)
          throw new Error(`Failed to load agent data: ${res.status}`);
        return res.json();
      })
      .then((json: AgentItem[]) => {
        console.log(json);
        setAgents(json);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message || "Failed to load data");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [API_BASE]);

  const handleInvite = async (agent: AgentItem) => {
    if (!meetingUrl.trim()) return;

    setInviteLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agent/${agent.id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingUrl }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with ${res.status}`);
      }

      toast.success(`Agent ${agent.name} is on their way to your meeting`);
      setOpenPopoverId(null);
      setMeetingUrl("");
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to invite agent");
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Agents</h1>

      {loading && <div className="text-lg">Loading agents...</div>}
      {error && !loading && <div className="text-red-600 text-lg">{error}</div>}

      {!loading && !error && agents.length === 0 && (
        <div className="text-lg text-gray-500">No agents available</div>
      )}

      {!loading && !error && agents.length > 0 && (
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex flex-col">
                  <h2 className="text-xl font-semibold">{agent.name}</h2>
                  <p className="text-sm text-gray-500">ID: {agent.id}</p>
                </div>

                <Popover
                  open={openPopoverId === agent.id}
                  onOpenChange={(open: boolean) => {
                    setOpenPopoverId(open ? agent.id : null);
                    if (!open) {
                      setMeetingUrl("");
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button>Invite to meeting</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="meeting-url"
                          className="text-sm font-medium"
                        >
                          Meeting URL
                        </label>
                        <Input
                          id="meeting-url"
                          placeholder="Enter meeting URL"
                          value={meetingUrl}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setMeetingUrl(e.target.value)
                          }
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter" && meetingUrl.trim()) {
                              handleInvite(agent);
                            }
                          }}
                        />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleInvite(agent)}
                        disabled={!meetingUrl.trim() || inviteLoading}
                      >
                        {inviteLoading ? "Inviting..." : "Invite"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
