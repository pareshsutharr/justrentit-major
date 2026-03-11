import React from "react";
import { toast } from "react-toastify";
import { Calendar, CreditCard, ShieldCheck, Info, MessageSquare, Trash2, CheckCircle, Clock, Truck, PlayCircle, RotateCcw, CheckCircle2 } from "lucide-react";
import useRentalRequest from "./hooks/useRentalRequest";
import PriceBreakdown from "./PriceBreakdown";
import LoadingPage from "../../../loadingpages/LoadingForLocation";

const statusLabel = {
  pending: { label: "Pending Review", color: "amber", icon: Clock },
  approved: { label: "Approved", color: "emerald", icon: CheckCircle2 },
  in_transit: { label: "In Transit", color: "indigo", icon: Truck },
  delivered: { label: "Delivered", color: "emerald", icon: CheckCircle2 },
  in_use: { label: "Actively Rented", color: "indigo", icon: PlayCircle },
  return_in_transit: { label: "Returning", color: "amber", icon: RotateCcw },
  returned: { label: "Returned", color: "slate", icon: CheckCircle },
  completed: { label: "Booking Finished", color: "slate", icon: CheckCircle },
  rejected: { label: "Request Denied", color: "red", icon: Info },
};

const InfoPill = ({ label, value }) => (
  <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm group hover:border-indigo-100 transition-colors">
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">{label}</p>
    <p className="text-sm text-slate-900 font-bold tracking-tight">{value}</p>
  </div>
);

const BookingNotice = ({ title, body, variant = "indigo" }) => {
  const styles = {
    indigo: "bg-indigo-50 border-indigo-100 text-indigo-900",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-900",
    amber: "bg-amber-50 border-amber-100 text-amber-900",
    red: "bg-red-50 border-red-100 text-red-900",
  };

  return (
    <div className={`p-5 rounded-[2rem] border ${styles[variant]} flex gap-4 items-start`}>
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
        <Info size={18} className={variant === 'red' ? 'text-red-500' : 'text-indigo-500'} />
      </div>
      <div>
        <p className="text-sm font-bold tracking-tight mb-1">{title}</p>
        <p className="text-xs font-medium opacity-80 leading-relaxed">{body}</p>
      </div>
    </div>
  );
};

const RentalRequestForm = ({ selectedProduct }) => {
  const {
    requestDates,
    setRequestDates,
    totalPrice,
    payableAmount,
    error,
    isSubmitting,
    isOwner,
    isAuthenticated,
    existingRequest,
    hasPaidRequest,
    handleRequest,
    handleDelete,
  } = useRentalRequest(selectedProduct);

  const handleSubmit = async () => {
    try {
      await handleRequest();
      toast.success("Payment secured. Request is now active.");
    } catch {
      toast.error("Transactional failed. Please retry.");
    }
  };

  if (!selectedProduct) return null;

  if (isOwner) {
    return (
      <BookingNotice
        title="Owner Restriction"
        body="You are the architect of this listing. Creators cannot rent their own assets."
        variant="amber"
      />
    );
  }

  if (!selectedProduct.available && !existingRequest) {
    return (
      <BookingNotice
        title="Listing Busy"
        body="This asset is currently in use by another member. Subscribe to notifications to know when it returns."
        variant="amber"
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {!isAuthenticated && (
        <BookingNotice
          title="Identity Required"
          body="You must be authenticated to initiate a reservation. Secure your session to proceed."
          variant="amber"
        />
      )}

      {existingRequest ? (
        <div className="space-y-8">
          <BookingNotice
            title={hasPaidRequest ? "Transaction Verified" : "Reservation Sequence Active"}
            body={
              hasPaidRequest
                ? `Subscription confirmed. Invoice ${existingRequest.invoiceNumber || "generating"} and lifecycle tracking are available in your console.`
                : "You have an active intent for this listing. Finalize payment or adjust your requirements below."
            }
            variant={hasPaidRequest ? "emerald" : "indigo"}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoPill
              label="Initiation Date"
              value={existingRequest?.startDate ? new Date(existingRequest.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
            />
            <InfoPill
              label="Termination Date"
              value={existingRequest?.endDate ? new Date(existingRequest.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
            />
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-${statusLabel[existingRequest?.status]?.color || 'indigo'}-50 flex items-center justify-center`}>
                {React.createElement(statusLabel[existingRequest?.status]?.icon || Clock, { size: 18, className: `text-${statusLabel[existingRequest?.status]?.color || 'indigo'}-600` })}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">State</p>
                <p className="text-sm text-slate-900 font-bold tracking-tight">{statusLabel[existingRequest?.status]?.label || "Active"}</p>
              </div>
            </div>
          </div>

          {existingRequest?.message && (
            <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={14} className="text-indigo-600" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Communication Log</p>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{existingRequest.message}"</p>
            </div>
          )}

          {existingRequest?.payment?.amount > 0 && (
            <div className="p-6 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-70">Secured Amount</p>
                <p className="text-2xl font-bold tracking-tight">₹{existingRequest.payment.amount.toLocaleString('en-IN')}</p>
              </div>
              {existingRequest?.invoiceNumber && (
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Invoice ID</p>
                  <p className="text-sm font-bold">{existingRequest.invoiceNumber}</p>
                </div>
              )}
            </div>
          )}

          {!hasPaidRequest && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-100 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
              >
                <Trash2 size={14} /> Terminate Request
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Commencement</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="date"
                  value={requestDates.start || ""}
                  onChange={(e) => setRequestDates({ ...requestDates, start: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Termination</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="date"
                  value={requestDates.end || ""}
                  onChange={(e) => setRequestDates({ ...requestDates, end: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all"
                  min={requestDates.start || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Communication Notes</label>
            <div className="relative group">
              <MessageSquare className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
              <textarea
                value={requestDates.message || ""}
                onChange={(e) => setRequestDates({ ...requestDates, message: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 transition-all resize-none"
                placeholder="Coordinate pickup or delivery specifics..."
                rows="4"
              />
            </div>
          </div>

          {error && (
            <BookingNotice title="Configuration Error" body={error} variant="red" />
          )}

          <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-8">
            <PriceBreakdown
              totalPrice={totalPrice}
              securityDeposit={selectedProduct.securityDeposit}
            />

            <div className="p-6 rounded-[2rem] bg-white border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-slate-900">Encrypted Transaction</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Test Gateway Enabled</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Payable Now</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{payableAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !!error || !isAuthenticated}
            className="w-full py-5 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-4 group"
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 rounded-full border-4 border-white/30 border-t-white animate-spin" />
                <span>Securing Transaction…</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard size={20} />
                </div>
                <span>Verify & Initiate Reservation</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RentalRequestForm;
