import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { Typography } from "@mui/material";

import NavBar from "./components/NavBar.jsx";
import VideoLibrary from "./components/VideoLibrary.jsx";
import Workspace from "./components/Workspace.jsx";

// Displays the available videos, filtered by the nav bar's search (?q=).
function VideoChooserPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  function handleSelect(filename) {
    navigate(`/preview/${encodeURIComponent(filename)}`);
  }

  return (
    <>
      <Typography variant="h4" component="h1">
        Videos
      </Typography>
      <Typography color="text.secondary" mb={2.5}>
        Pick a video, click the object you want to follow, and tune the threshold until only it lights up.
      </Typography>
      <VideoLibrary onSelect={handleSelect} query={searchParams.get("q") ?? ""} />
    </>
  );
}

// Displays the selected video's workspace.
function PreviewPage() {
  const { filename } = useParams();

  return <Workspace key={filename} filename={filename} />;
}

// Shared layout containing the header and page routes.
function AppLayout() {
  return (
    <div className="app">
      <NavBar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/videos" replace />} />

          <Route path="/videos" element={<VideoChooserPage />} />

          <Route path="/preview/:filename" element={<PreviewPage />} />

          <Route path="*" element={<Navigate to="/videos" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Root component that enables React Router.
export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
