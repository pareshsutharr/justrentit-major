import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FileText, Download, Loader2 } from "lucide-react";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const downloadInvoice = (invoice, isRequester) => {
  const total = Number(invoice?.payment?.amount || 0);
  const text = [
    "JustRentIt Invoice",
    `Invoice Number: ${invoice.invoiceNumber || "N/A"}`,
    `Issued At: ${new Date(invoice.payment?.paidAt || invoice.createdAt).toLocaleString()}`,
    `Product: ${invoice.product?.name || "Unknown Product"}`,
    `Customer: ${invoice.requester?.name || "Unknown"}`,
    `Owner: ${invoice.owner?.name || "Unknown"}`,
    `Rental Period: ${new Date(invoice.startDate).toLocaleDateString()} - ${new Date(invoice.endDate).toLocaleDateString()}`,
    `Amount Paid: ${formatCurrency(total)}`,
    `Payment Status: ${invoice.payment?.status || "N/A"}`,
    `View Role: ${isRequester ? "Requester" : "Owner"}`,
  ].join("\n");

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${invoice.invoiceNumber || "invoice"}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentUserId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")?._id || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${baseUrl}/api/invoices`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(data.invoices || []);
        setError("");
      } catch (fetchError) {
        setError("Failed to load invoices");
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <Loader2 size={18} className="animate-spin" />
        Loading invoices...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-500 mt-0.5">Test mode paid rentals with invoice details</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {!error && invoices.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No invoices available yet.
        </div>
      )}

      <div className="space-y-4">
        {invoices.map((invoice) => {
          const isRequester = String(invoice.requester?._id || "") === String(currentUserId);
          return (
            <div key={invoice._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-gray-900">
                    <FileText size={18} />
                    <h2 className="text-base font-semibold">{invoice.invoiceNumber}</h2>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">{invoice.product?.name || "Unknown Product"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(invoice.startDate).toLocaleDateString()} to {new Date(invoice.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                    Test Payment Completed
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(invoice.payment?.amount)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="font-medium text-gray-900">{invoice.requester?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Owner</p>
                  <p className="font-medium text-gray-900">{invoice.owner?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Issued</p>
                  <p className="font-medium text-gray-900">
                    {new Date(invoice.payment?.paidAt || invoice.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => downloadInvoice(invoice, isRequester)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download size={16} />
                  Download Invoice
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
