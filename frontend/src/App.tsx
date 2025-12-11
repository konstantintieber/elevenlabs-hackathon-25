import "./App.css";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./components/ui/table.tsx";
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area.tsx";
import { useNavigate } from "react-router-dom";

type AgentItem = {
  id: string;
  name: string;
};

function App() {
  const navigate = useNavigate();
  const [data, setData] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const API_BASE =
      (import.meta as any).env?.VITE_API_BASE; // TODO: add live backend URL like: || https://eleven-aimigos.onrender.com;
    fetch(`${API_BASE}/agents`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load mock data: ${res.status}`);
        return res.json();
      })
      .then((json: AgentItem[]) => {
        console.log(json);

        setData(json);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
        setError(err.message || "Failed to load data");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-24">
      <h1 className="text-6xl font-semibold">Your Agents</h1>
      <div className="h-full w-full">
        <ScrollArea className="h-[550px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead className="w-56 text-center font-bold text-2xl">
                  Name
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="w-full">
              {loading && (
                <TableRow>
                  <TableCell colSpan={3}>Loading…</TableCell>
                </TableRow>
              )}
              {error && !loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                !error &&
                data.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer h-14"
                    onClick={() => navigate(`/${item.id}`)}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/${item.id}`);
                      }
                    }}
                  >
                    <TableCell>{item.name}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}

export default App;
