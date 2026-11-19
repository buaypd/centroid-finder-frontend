import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import { AppBar, Box, Breadcrumbs, Button, Link, Toolbar, Typography } from "@mui/material";

import VideoLibrary from "./components/VideoLibrary.jsx";
import Workspace from "./components/Workspace.jsx";

// Displays the available videos.
function VideoChooserPage() {
  const navigate = useNavigate();

  function handleSelect(filename) {
    navigate(`/preview/${encodeURIComponent(filename)}`);
  }

  return <VideoLibrary onSelect={handleSelect} />;
}

// Displays the selected video's workspace.
function PreviewPage() {
  const { filename } = useParams();

  return <Workspace key={filename} filename={filename} />;
}

// Shared layout containing the header and page routes.
function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which video is selected from the URL.
  const match = location.pathname.match(/^\/preview\/([^/]+)$/);

  const selected = match ? decodeURIComponent(match[1]) : null;

  return (
    <div className="app">
      <AppBar>
        <Toolbar sx={{ gap: 2.5 }}>
          <Button
            color="inherit"
            onClick={() => navigate("/videos")}
            title="Back to library"
            startIcon={
              <Box component="span" aria-hidden="true" sx={{ color: "secondary.main", fontSize: "1.3rem" }}>
                ◎
              </Box>
            }
            sx={{ fontWeight: 700, fontSize: "1.05rem" }}
          >
            Centroid Finder
          </Button>

          {selected && (
            <Breadcrumbs aria-label="Breadcrumb" sx={{ minWidth: 0 }}>
              <Link component="button" type="button" underline="hover" onClick={() => navigate("/videos")}>
                Library
              </Link>
              <Typography color="text.primary" noWrap>
                {selected}
              </Typography>
            </Breadcrumbs>
          )}
        </Toolbar>
      </AppBar>

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
