
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DocumentFile = {
  name: string;
};

export default function DocumentsPage() {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function initialize() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        window.location.href = "/login";
        return;
      }

      setUserId(data.user.id);
      await loadFiles(data.user.id);
    }

    initialize();
  }, []);

  async function loadFiles(id: string) {
    setLoading(true);

    const { data, error } = await supabase.storage
      .from("documents")
      .list(id);

    if (error) {
      setMessage("Unable to load documents: " + error.message);
    } else {
      setFiles(data ?? []);
    }

    setLoading(false);
  }

  async function uploadFile() {
    if (!selectedFile || !userId || busy) return;

    setBusy(true);
    setMessage("");

    try {
      const safeName = selectedFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const filePath = `${userId}/${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from("documents")
        .upload(filePath, selectedFile);

      if (error) {
        setMessage("Upload failed: " + error.message);
        return;
      }

      setMessage("Document uploaded successfully.");
      setSelectedFile(null);

      const input = document.getElementById(
        "document-file"
      ) as HTMLInputElement | null;

      if (input) input.value = "";

      await loadFiles(userId);
    } finally {
      setBusy(false);
    }
  }

  async function downloadFile(fileName: string) {
    const { data, error } = await supabase.storage
      .from("documents")
      .download(`${userId}/${fileName}`);

    if (error) {
      setMessage("Download failed: " + error.message);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  async function deleteFile(fileName: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase.storage
      .from("documents")
      .remove([`${userId}/${fileName}`]);

    if (error) {
      setMessage("Delete failed: " + error.message);
      return;
    }

    setMessage("Document deleted successfully.");
    await loadFiles(userId);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-3xl">
        <a href="/dashboard" className="text-blue-400">
          Back to Dashboard
        </a>

        <h1 className="mt-6 text-3xl font-bold">
          My Documents
        </h1>

        <p className="mt-2 text-slate-300">
          Upload and manage your documents securely.
        </p>

        <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold">
            Upload Document
          </h2>

          <input
            id="document-file"
            className="mt-4 block w-full text-sm"
            type="file"
            onChange={(event) =>
              setSelectedFile(event.target.files?.[0] ?? null)
            }
          />

          <button
            onClick={uploadFile}
            disabled={!selectedFile || busy}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 font-semibold disabled:opacity-50"
          >
            {busy ? "Uploading..." : "Upload"}
          </button>
        </section>

        {message && (
          <p className="mt-4 break-words rounded-lg bg-slate-800 p-3">
            {message}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Uploaded Documents
          </h2>

          {loading ? (
            <p className="mt-4 text-slate-300">Loading...</p>
          ) : files.length === 0 ? (
            <p className="mt-4 text-slate-300">
              No documents uploaded yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {files
                .filter((file) => file.name)
                .map((file) => (
                  <li
                    key={file.name}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700 p-4"
                  >
                    <span className="break-all">
                      {file.name}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadFile(file.name)}
                        className="rounded bg-emerald-700 px-3 py-2"
                      >
                        Download
                      </button>

                      <button
                        onClick={() => deleteFile(file.name)}
                        className="rounded bg-red-700 px-3 py-2"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
