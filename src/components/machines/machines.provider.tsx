import { Machine, Page } from "@/lib/models";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useFetchWrapper } from "../use-fetch-wrapper";

type MachinesContextProps = {
  machines: Machine[];
  nextPage: () => Promise<Machine[]> | Machine[];
  clear: () => void;
};

const MachinesContext = createContext<MachinesContextProps | null>(null);

export const MachinesProvider = ({ children }: { children: ReactNode }) => {
  const { fetch } = useFetchWrapper();

  const [currentPage, setCurrentPage] = useState(0);
  const [machines, setMachines] = useState<Machine[]>([]);

  async function fetchPage(page?: number) {
    const resp = await fetch(
      `https://labs.hackthebox.com/api/v5/machines?per_page=15&page=${page}`,
    );

    const newPage = (await resp.json()) as Page<Machine>;

    setMachines((prev) => [...prev, ...newPage.data]);
    setCurrentPage(newPage.meta.current_page);

    return newPage.data;
  }

  function clear() {
    setMachines([]);
  }

  useEffect(() => {
    fetchPage(currentPage + 1);
  }, []);

  return (
    <MachinesContext.Provider
      value={{
        machines,
        clear,
        nextPage: async () => {
          return await fetchPage(currentPage + 1);
        },
      }}
    >
      {children}
    </MachinesContext.Provider>
  );
};

export const useMachines = () => {
  const ctx = useContext(MachinesContext);

  if (!ctx) {
    throw new Error("useMachines can only be used within a MachinesProvider");
  }

  return ctx;
};
