import { useNavigate } from "react-router-dom";

export default function CounsellorSpecializations() {
  const navigate = useNavigate();

  const specializations = [
    "Academic Stress",
    "Emotional Health",
    "Social Wellbeing",
    "Sleep & Lifestyle",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow w-[400px]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Select Specialization
        </h2>

        <div className="space-y-4">
          {specializations.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate("/dashboard/counsellor")}
              className="w-full p-3 bg-blue-500 text-white rounded-lg"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
