"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type DocumentFile = {
  id: string;
  file_name: string;
  storage_path: string;
  file_size: number | null;
  created_at: string;
};

export default function DocumentsPage() {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadDocuments() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please log in to continue.");
      setFiles([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Failed to load documents: " + error.message);
    } else {
      setFiles((data ?? []) as DocumentFile[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function uploadDocument() {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please log in to continue.");
      setUploading(false);
      return;
    }

    const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${Date.now()}-${safeName}`;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

if (selectedFile.type !== "application/pdf") {
  alert("Only PDF files are allowed.");
  return;
}

if (selectedFile.size > MAX_FILE_SIZE) {
  alert("File size must not exceed 10 MB.");
  return;
}

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, selectedFile);

    if (uploadError) {
      setMessage("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from("documents").insert({
      user_id: user.id,
      file_name: selectedFile.name,
      storage_path: filePath,
      file_size: selectedFile.size,
    });

    if (dbError) {
      setMessage(
        "The file was uploaded, but saving its record failed: " +
          dbError.message
      );
    } else {
      setMessage("File uploaded successfully!");
      setSelectedFile(null);
      await loadDocuments();
    }

    setUploading(false);
  }

  async function openDocument(path: string) {
    setMessage("");

    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      setMessage("Could not open file: " + (error?.message ?? "Unknown error"));
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function handleDeleteDocument(file: DocumentFile) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.file_name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(file.id);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("Please log in to delete this document.");
      setDeletingId(null);
      return;
    }

    const { data: ownedDocument, error: checkError } = await supabase
      .from("documents")
      .select("id, storage_path")
      .eq("id", file.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError || !ownedDocument) {
      setMessage(
        "Could not find your document: " +
          (checkError?.message ?? "Document not found.")
      );
      setDeletingId(null);
      return;
    }

    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([ownedDocument.storage_path]);

    if (storageError) {
      setMessage("File deletion failed: " + storageError.message);
      setDeletingId(null);
      return;
    }

    const { data: deletedRows, error: databaseError } = await supabase
      .from("documents")
      .delete()
      .eq("id", ownedDocument.id)
      .eq("user_id", user.id)
      .select("id");

    if (databaseError || !deletedRows?.length) {
      setMessage(
        "The file was removed from storage, but its database record could not be deleted. " +
          (databaseError?.message ?? "Check your database DELETE policy.")
      );
      setDeletingId(null);
      await loadDocuments();
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.filter((item) => item.id !== file.id)
    );
    setMessage("Document deleted successfully!");
    setDeletingId(null);
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-3xl font-bold">My Documents</h1>
      <p className="mb-6 text-gray-600">
        Upload and securely access your documents.
      </p>

      <section className="mb-8 rounded-xl border p-5">
        <h2 className="mb-4 text-xl font-semibold">Upload Document</h2>

        <input
          type="file"
          onChange={(event) =>
            setSelectedFile(event.target.files?.[0] ?? null)
          }
          className="mb-4 block w-full"
          disabled={uploading}
        />

        <button
          type="button"
          onClick={uploadDocument}
          disabled={uploading || !selectedFile}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>

        {message && (
          <p className="mt-4 break-words text-sm" role="status">
            {message}
          </p>
        )}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="mb-4 text-xl font-semibold">My Files</h2>

        {loading ? (
          <p>Loading documents...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-600">No documents uploaded yet.</p>
        ) : (
          <ul className="space-y-3">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="break-words font-medium">{file.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleString("en-US")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {file.file_size == null
                      ? "Size unavailable"
                      : `${(file.file_size / 1024).toFixed(1)} KB`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openDocument(file.storage_path)}
                    disabled={deletingId === file.id}
                    className="rounded-lg border px-4 py-2 disabled:opacity-50"
                  >
                    View / Download
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(file)}
                    disabled={deletingId !== null || uploading}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === file.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}