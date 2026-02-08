"use client";

import dynamic from "next/dynamic";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

const Viewer = dynamic(
  () => import("@toast-ui/react-editor").then((mod) => mod.Viewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-20 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md" />
    ),
  },
);

interface PostViewerProps {
  content: string;
}

export default function PostViewer({ content }: PostViewerProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <Viewer initialValue={content} />
    </div>
  );
}
