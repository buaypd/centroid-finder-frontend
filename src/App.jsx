import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

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
      <header className="app-header">
        <button
          type="button"
          className="brand"
          onClick={() => navigate("/videos")}
          title="Back to library"
        >
          <span className="brand-mark" aria-hidden="true">
            ◎
          </span>
          Centroid Finder
        </button>

        {selected && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <button
              type="button"
              className="link"
              onClick={() => navigate("/videos")}
            >
              Library
            </button>

            <span aria-hidden="true">/</span>

            <span className="crumb-current">{selected}</span>
          </nav>
        )}
      </header>

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
