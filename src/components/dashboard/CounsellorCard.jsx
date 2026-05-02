import { motion as Motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MessageSquare } from "lucide-react";
import { auth } from "../../firebase";
import { createAppointment } from "../../services/firebase/appointments";
import BookingModal from "../booking/BookingModal";

function readableConcern(value) {
  if (!value) return "General support";
  return String(value).replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export default function CounsellorCard({ data }) {
  const navigate = useNavigate();
  const assignedCounsellor = data?.assignedCounsellor;
  const specialization = data?.recommendedCounsellorSpecialization;
  const concern = readableConcern(data?.primaryConcern);
  const [booking, setBooking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    counsellorId: assignedCounsellor?.id || "",
    date: "",
    time: "",
    message: "",
  });
  const counsellorOptions = useMemo(
    () => (assignedCounsellor ? [assignedCounsellor] : []),
    [assignedCounsellor]
  );

  const handleBook = async (event) => {
    event.preventDefault();
    const selectedCounsellor = counsellorOptions.find((item) => item.id === bookingForm.counsellorId) || assignedCounsellor;
    
    if (!auth.currentUser?.uid) {
      toast.error("Please log in to book a session");
      return;
    }
    
    if (!selectedCounsellor?.id || !bookingForm.date || !bookingForm.time) {
      toast.error("Please select a date and time");
      return;
    }
    
    setBooking(true);
    try {
      await createAppointment({
        studentId: auth.currentUser.uid,
        counsellorId: selectedCounsellor.id,
        studentName: data?.name || "Student",
        counsellorName: selectedCounsellor.name || "Counsellor",
        message: bookingForm.message.trim() || concern,
        date: bookingForm.date,
        time: bookingForm.time,
      });

      toast.success("Session booked successfully! Check your appointments.");
      setShowForm(false);
      setBookingForm({
        counsellorId: assignedCounsellor?.id || "",
        date: "",
        time: "",
        message: "",
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book session. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="surface-card rounded-[2rem] p-6 space-y-4">
      <h3 className="text-lg font-semibold text-[color:var(--text-main)]">Assigned Counsellor</h3>

      {assignedCounsellor ? (
        <Motion.div whileHover={{ scale: 1.01 }} className="space-y-3">
          <div>
            <p className="font-medium text-[color:var(--text-main)]">{assignedCounsellor.name}</p>
            <p className="readable-muted text-sm">
              {assignedCounsellor.specialization || specialization}
            </p>
            {assignedCounsellor.experience ? (
              <p className="readable-muted text-xs mt-1">Experience: {assignedCounsellor.experience}</p>
            ) : null}
            {assignedCounsellor.bio ? (
              <p className="readable-muted text-xs mt-1 line-clamp-2">{assignedCounsellor.bio}</p>
            ) : null}
          </div>

          <div className="space-y-1 text-sm text-[color:var(--text-main)]">
            <p>
              <span className="readable-label font-medium">Primary concern:</span> {concern}
            </p>
            <p>
              <span className="readable-label font-medium">Availability:</span>{" "}
              {assignedCounsellor.availability || "Schedule to confirm"}
            </p>
            <p>
              <span className="readable-label font-medium">Contact:</span>{" "}
              {assignedCounsellor.phone || "Not available"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {assignedCounsellor.phone && assignedCounsellor.phone !== "Not available" ? (
              <a
                href={`tel:${assignedCounsellor.phone}`}
                className="interactive-surface rounded-full px-3 py-2 text-sm font-medium text-[color:var(--text-main)]"
              >
                Call
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className="interactive-surface inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[color:var(--text-main)]"
            >
              <MessageSquare className="h-4 w-4" />
              Messages
            </button>
            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              disabled={booking}
              className="animated-gradient rounded-full bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#8b5cf6_100%)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {booking ? "Booking..." : "Book Session"}
            </button>
          </div>
        </Motion.div>
      ) : (
        <div className="space-y-2 text-sm text-[color:var(--text-muted)]">
          <p>No counsellor assigned yet.</p>
          <p>
            Based on your current concern: <span className="font-medium text-[color:var(--text-main)]">{concern}</span>
          </p>
        </div>
      )}

      <BookingModal
        open={showForm}
        counsellors={counsellorOptions}
        form={bookingForm}
        booking={booking}
        onClose={() => setShowForm(false)}
        onChange={(event) => {
          const { name, value } = event.target;
          setBookingForm((prev) => ({ ...prev, [name]: value }));
        }}
        onSubmit={handleBook}
      />
    </div>
  );
}
