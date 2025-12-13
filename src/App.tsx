import { Route, Routes } from "react-router";
import { LayoutPage } from "./components/pages/layout.page";
import { MachinesPage } from "./components/pages/machines.page";

function App() {
  return (
    <Routes>
      <Route element={<LayoutPage />}>
        <Route index element={<MachinesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
