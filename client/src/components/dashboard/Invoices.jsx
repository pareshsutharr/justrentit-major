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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Records</h1>
          <p className="text-base font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] text-xs">Audit & Transact Rental Settlements</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-100">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-0.5">Global Volume</p>
            <p className="text-sm font-black text-white">{formatCurrency(invoices.reduce((acc, inv) => acc + (inv.payment?.amount || 0), 0))}</p>
          </div>
        </div>
      </div>

      {error && <div className="p-6 rounded-[2rem] bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest border border-red-100 shadow-xl">{error}</div>}

      {!error && invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 px-8 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-400 mb-6 shadow-inner">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          <p className="text-xl font-black text-slate-900 tracking-tight">Financial Slate Clear</p>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest text-center max-w-sm">No transaction records detected in the audit logs.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {invoices.map((invoice) => {
          const isRequester = String(invoice.requester?._id || "") === String(currentUserId);
          return (
            <div key={invoice._id} className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500 overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* Ledger Identity */}
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">{invoice.invoiceNumber}</h2>
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                          Settled
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{invoice.product?.name || "Unknown Asset"}</p>
                    </div>
                  </div>

                  {/* Dynamic Value */}
                  <div className="flex flex-col lg:items-end gap-1">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Transaction Volume</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {formatCurrency(invoice.payment?.amount)}
                    </p>
                  </div>
                </div>

                {/* Audit Grid */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account (User)</p>
                    <p className="text-xs font-black text-slate-900">{invoice.requester?.name || "System Record"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Oracle (Owner)</p>
                    <p className="text-xs font-black text-slate-900">{invoice.owner?.name || "System Record"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                    <p className="text-xs font-black text-slate-900">
                      {new Date(invoice.payment?.paidAt || invoice.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50 pt-8">
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Window: {new Date(invoice.startDate).toLocaleDateString()} - {new Date(invoice.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadInvoice(invoice, isRequester)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-white border border-slate-200 px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:border-indigo-600 hover:text-indigo-600 hover:shadow-xl transition-all active:scale-95"
                  >
                    <Download size={14} />
                    Generate Audit Log (.TXT)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
